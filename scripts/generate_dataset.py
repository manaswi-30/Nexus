import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

random.seed(42)
np.random.seed(42)

def generate_traffic_dataset(n_records=2000, output_path="scripts/real_traffic_data.csv"):
    """
    Generate realistic traffic dataset based on real urban patterns.
    Follows actual traffic flow patterns:
    - Morning peak: 8–10am
    - Lunch peak: 12–1pm  
    - Evening peak: 5–8pm
    - Low traffic: 11pm–6am
    """
    records = []
    start_time = datetime(2024, 1, 1, 6, 0, 0)

    WEATHER_PATTERNS = {
        "Clear":  {"prob": 0.55, "multiplier": 1.0},
        "Cloudy": {"prob": 0.20, "multiplier": 0.95},
        "Rain":   {"prob": 0.15, "multiplier": 0.75},
        "Fog":    {"prob": 0.07, "multiplier": 0.65},
        "Storm":  {"prob": 0.03, "multiplier": 0.50},
    }

    def get_traffic_multiplier(hour, weekday):
        """Real urban traffic pattern"""
        if weekday >= 5:  # Weekend
            if 10 <= hour <= 14: return 0.8
            if 18 <= hour <= 21: return 0.7
            return 0.4
        # Weekday
        if 7 <= hour <= 9:   return 1.0   # Morning peak
        if 12 <= hour <= 13: return 0.75  # Lunch
        if 17 <= hour <= 19: return 0.95  # Evening peak
        if 20 <= hour <= 22: return 0.5
        if 23 <= hour or hour <= 5: return 0.15
        return 0.45

    weather = "Clear"
    weather_duration = 0

    for i in range(n_records):
        current_time = start_time + timedelta(minutes=i * 5)
        hour = current_time.hour
        weekday = current_time.weekday()
        
        # Change weather occasionally
        weather_duration += 1
        if weather_duration > random.randint(12, 48):
            weather = random.choices(
                list(WEATHER_PATTERNS.keys()),
                weights=[v["prob"] for v in WEATHER_PATTERNS.values()]
            )[0]
            weather_duration = 0

        multiplier = get_traffic_multiplier(hour, weekday)
        weather_mult = WEATHER_PATTERNS[weather]["multiplier"]
        base = int(multiplier * weather_mult * 80)

        # Each direction has slightly different traffic
        north = max(0, base + random.randint(-10, 15))
        south = max(0, int(base * 0.85) + random.randint(-8, 12))
        east  = max(0, int(base * 0.70) + random.randint(-8, 10))
        west  = max(0, int(base * 0.75) + random.randint(-8, 10))

        # Special vehicles
        emergency = 1 if random.random() < 0.008 else 0
        bus_count = random.randint(0, 3) if random.random() < 0.25 else 0
        pedestrians = max(0, int(multiplier * 20) + random.randint(-5, 10))

        records.append({
            "timestamp":          current_time.strftime("%Y-%m-%d %H:%M:%S"),
            "hour":               hour,
            "day_of_week":        weekday,
            "is_weekend":         int(weekday >= 5),
            "weather_condition":  weather,
            "north_count":        north,
            "south_count":        south,
            "east_count":         east,
            "west_count":         west,
            "total_vehicles":     north + south + east + west,
            "emergency_vehicle":  emergency,
            "bus_count":          bus_count,
            "pedestrian_count":   pedestrians,
            "interval_seconds":   5,
        })

    df = pd.DataFrame(records)
    
    # Normalize
    for col in ["north_count","south_count","east_count","west_count"]:
        df[f"{col}_norm"] = df[col] / df[col].max()

    df.to_csv(output_path, index=False)
    print(f"✅ Generated {len(df)} records → {output_path}")
    print(f"   Time range: {df['timestamp'].iloc[0]} → {df['timestamp'].iloc[-1]}")
    print(f"   Avg vehicles: {df['total_vehicles'].mean():.1f}")
    print(f"   Emergency events: {df['emergency_vehicle'].sum()}")
    print(f"   Weather distribution:\n{df['weather_condition'].value_counts()}")
    return df


if __name__ == "__main__":
    generate_traffic_dataset()