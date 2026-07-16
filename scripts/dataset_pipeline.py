import pandas as pd
import numpy as np
import requests
import time
import os
from datetime import datetime

# ── Load real traffic data ─────────────────────────────────────────────────
def load_traffic_dataset(filepath="scripts/albany_traffic_data.csv"):
    """Load and preprocess real traffic CSV data"""
    df = pd.read_csv(filepath)
    
    # Normalize vehicle counts to queue lengths (0-1)
    for col in ["north_count", "south_count", "east_count", "west_count"]:
        if col in df.columns:
            max_val = df[col].max()
            df[f"{col}_norm"] = df[col] / max_val if max_val > 0 else 0
    
    print(f"✅ Loaded {len(df)} records from {filepath}")
    print(f"   Time range: {df['timestamp'].min()} → {df['timestamp'].max()}")
    print(f"   Avg vehicles/reading: {df['total_vehicles'].mean():.1f}")
    return df


# ── Extract features for RL agent ─────────────────────────────────────────
def extract_rl_features(row):
    """Convert a dataset row into RL observation format"""
    return {
        "lane_densities": [
            float(row.get("north_count_norm", 0)),
            float(row.get("south_count_norm", 0)),
            float(row.get("east_count_norm", 0)),
            float(row.get("west_count_norm", 0)),
        ],
        "lane_queues": [
            float(row.get("north_count_norm", 0)) * 0.8,
            float(row.get("south_count_norm", 0)) * 0.8,
            float(row.get("east_count_norm", 0)) * 0.8,
            float(row.get("west_count_norm", 0)) * 0.8,
        ],
        "emergency_detected": bool(row.get("emergency_vehicle", False)),
        "pedestrian_count": int(row.get("pedestrian_count", 0)),
        "bus_detected": bool(row.get("bus_count", 0) > 0),
        "weather": str(row.get("weather_condition", "Clear")),
    }


# ── Send to backend ────────────────────────────────────────────────────────
def send_to_backend(features, intersection_id="I00", 
                    api_url="http://localhost:8000"):
    """Send real dataset observation to NEXUS backend"""
    payload = {
        "intersection_id": intersection_id,
        **features
    }
    try:
        response = requests.post(
            f"{api_url}/sensor_update",
            json=payload,
            timeout=3
        )
        if response.status_code == 200:
            return response.json()
    except requests.exceptions.ConnectionError:
        print("⚠️  Backend not running — skipping this record")
    return None


# ── Stats tracker ──────────────────────────────────────────────────────────
class DatasetStats:
    def __init__(self):
        self.records_sent = 0
        self.phase_counts = {"NS_GREEN": 0, "EW_GREEN": 0, 
                             "NS_LEFT": 0, "EW_LEFT": 0}
        self.start_time = time.time()

    def update(self, response):
        if response and "phase" in response:
            phase = response["phase"]
            if phase in self.phase_counts:
                self.phase_counts[phase] += 1
        self.records_sent += 1

    def summary(self):
        elapsed = time.time() - self.start_time
        print(f"\n📊 Dataset Integration Summary")
        print(f"   Records sent:  {self.records_sent}")
        print(f"   Time elapsed:  {elapsed:.1f}s")
        print(f"   Phase distribution: {self.phase_counts}")
        dominant = max(self.phase_counts, key=self.phase_counts.get)
        print(f"   Dominant phase: {dominant}")


# ── Main runner ────────────────────────────────────────────────────────────
def run_dataset_integration(
    filepath="scripts/albany_traffic_data.csv",
    intersection_id="I00",
    speed=1.0,
    continuous=False,
    api_url="http://localhost:8000"
):
    """
    Feed real traffic dataset into NEXUS backend.
    
    Args:
        filepath: Path to traffic CSV file
        intersection_id: Which intersection to feed data into
        speed: Playback speed multiplier (1.0 = real time, 2.0 = 2x faster)
        continuous: Loop dataset continuously
        api_url: Backend URL
    """
    print(f"\n🚦 NEXUS Dataset Integration")
    print(f"   Dataset:      {filepath}")
    print(f"   Intersection: {intersection_id}")
    print(f"   Speed:        {speed}x")
    print(f"   Continuous:   {continuous}")
    print(f"   Backend:      {api_url}\n")

    df = load_traffic_dataset(filepath)
    stats = DatasetStats()

    try:
        while True:
            for idx, row in df.iterrows():
                features = extract_rl_features(row)
                response = send_to_backend(features, intersection_id, api_url)
                stats.update(response)

                if response:
                    phase = response.get("phase", "unknown")
                    print(f"   [{idx+1:04d}/{len(df)}] "
                          f"N:{features['lane_queues'][0]:.2f} "
                          f"S:{features['lane_queues'][1]:.2f} "
                          f"E:{features['lane_queues'][2]:.2f} "
                          f"W:{features['lane_queues'][3]:.2f} "
                          f"→ {phase}")

                # Respect real-time spacing between records
                interval = float(row.get("interval_seconds", 5))
                time.sleep(interval / speed)

            if not continuous:
                break
            print("\n🔄 Dataset complete — restarting...\n")

    except KeyboardInterrupt:
        print("\n⏹  Stopped by user")
    finally:
        stats.summary()


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="NEXUS Dataset Integration")
    parser.add_argument("--file", default="scripts/albany_traffic_data.csv")
    parser.add_argument("--intersection", default="I00")
    parser.add_argument("--speed", type=float, default=5.0)
    parser.add_argument("--continuous", action="store_true")
    parser.add_argument("--api", default="http://localhost:8000")
    args = parser.parse_args()

    run_dataset_integration(
        filepath=args.file,
        intersection_id=args.intersection,
        speed=args.speed,
        continuous=args.continuous,
        api_url=args.api,
    )