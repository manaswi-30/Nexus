from backend.core.database import engine, Base
from backend.models.traffic import IntersectionLog, EmissionsLog, EmergencyEvent

def init_db():
    """Create all tables if they don't exist"""
    print("Initializing database...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()