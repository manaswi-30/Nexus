from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from backend.core.database import Base

class IntersectionLog(Base):
    """Stores snapshot of each intersection every minute"""
    __tablename__ = "intersection_logs"

    id = Column(Integer, primary_key=True, index=True)
    intersection_id = Column(String, index=True)          # e.g. "I00"
    queue_length = Column(Integer, default=0)
    phase = Column(String, default="green")               # green/red/yellow
    wait_time = Column(Float, default=0.0)
    vehicle_count = Column(Integer, default=0)
    emergency_active = Column(Boolean, default=False)
    weather = Column(String, default="Clear")
    co2_saved = Column(Float, default=0.0)
    timestamp = Column(DateTime, server_default=func.now())

class EmissionsLog(Base):
    """Tracks CO2 savings over time"""
    __tablename__ = "emissions_logs"

    id = Column(Integer, primary_key=True, index=True)
    total_co2_saved = Column(Float, default=0.0)
    vehicles_processed = Column(Integer, default=0)
    avg_wait_time = Column(Float, default=0.0)
    timestamp = Column(DateTime, server_default=func.now())

class EmergencyEvent(Base):
    """Records every emergency vehicle event"""
    __tablename__ = "emergency_events"

    id = Column(Integer, primary_key=True, index=True)
    intersection_id = Column(String)
    duration_seconds = Column(Float)
    corridor_cleared = Column(Boolean, default=True)
    response_time_ms = Column(Float)
    timestamp = Column(DateTime, server_default=func.now())