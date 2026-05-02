from backend.core.database import engine, Base
from backend.models.traffic import IntersectionLog, EmissionsLog, EmergencyEvent
from backend.models.user import User

def init_db():
    print("Initializing database...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()