from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.core.dependencies import (
    get_current_user, require_admin, require_operator
)
from backend.models.user import User
from backend.models.traffic import IntersectionLog, EmissionsLog, EmergencyEvent

router = APIRouter(prefix="/api/v1/traffic", tags=["Traffic"])

# ── Anyone logged in can view traffic state ───────────────────────────────
@router.get("/status")
def get_traffic_status(current_user: User = Depends(get_current_user)):
    return {
        "message": "Live traffic status",
        "accessed_by": current_user.email,
        "role": current_user.role,
        "status": "operational",
    }

# ── Only operators and admins can trigger emergency ───────────────────────
@router.post("/emergency")
def trigger_emergency(current_user: User = Depends(require_operator)):
    return {
        "message": "Emergency corridor activated",
        "triggered_by": current_user.email,
        "role": current_user.role,
    }

# ── Only admins can see all logs ──────────────────────────────────────────
@router.get("/logs")
def get_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    logs = db.query(IntersectionLog).order_by(
        IntersectionLog.timestamp.desc()
    ).limit(50).all()
    return {
        "logs": [
            {
                "id": log.id,
                "intersection": log.intersection_id,
                "queue": log.queue_length,
                "phase": log.phase,
                "weather": log.weather,
                "timestamp": log.timestamp,
            }
            for log in logs
        ],
        "accessed_by": current_user.email,
    }

# ── Only admins can see emissions data ───────────────────────────────────
@router.get("/emissions")
def get_emissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    logs = db.query(EmissionsLog).order_by(
        EmissionsLog.timestamp.desc()
    ).limit(20).all()
    return {
        "emissions": [
            {
                "id": log.id,
                "co2_saved": log.total_co2_saved,
                "vehicles": log.vehicles_processed,
                "avg_wait": log.avg_wait_time,
                "timestamp": log.timestamp,
            }
            for log in logs
        ]
    }

# ── Only admins can see emergency events ─────────────────────────────────
@router.get("/emergency/history")
def get_emergency_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    events = db.query(EmergencyEvent).order_by(
        EmergencyEvent.timestamp.desc()
    ).limit(20).all()
    return {
        "events": [
            {
                "id": e.id,
                "intersection": e.intersection_id,
                "duration": e.duration_seconds,
                "cleared": e.corridor_cleared,
                "timestamp": e.timestamp,
            }
            for e in events
        ]
    }