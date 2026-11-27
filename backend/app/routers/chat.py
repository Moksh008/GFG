"""Aria — text assistant on the dashboard."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.entities import ChatMessage, User
from app.schemas.requests import ChatIn
from app.schemas.serializers import chat_out
from app.services import assistant
from app.services.patient_context import snapshot

router = APIRouter(prefix="/chat", tags=["aria"])


@router.get("/history")
def history(limit: int = Query(30, ge=1, le=200), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    msgs = list(db.scalars(
        select(ChatMessage).where(ChatMessage.user_id == user.id).order_by(ChatMessage.id.desc()).limit(limit)
    ))[::-1]
    if not msgs:
        return {"messages": [{"id": None, "sender": "aria", "text": assistant.greeting(snapshot(db, user)), "createdAt": None}]}
    return {"messages": [chat_out(m) for m in msgs]}


@router.post("")
def send(body: ChatIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prior = list(db.scalars(
        select(ChatMessage).where(ChatMessage.user_id == user.id).order_by(ChatMessage.id.desc()).limit(12)
    ))[::-1]
    history = [{"role": m.role, "text": m.text} for m in prior]
    result = assistant.reply(body.message.strip(), snapshot(db, user), history)
    user_msg = ChatMessage(user_id=user.id, role="user", text=body.message.strip())
    aria_msg = ChatMessage(user_id=user.id, role="aria", text=result["text"])
    db.add_all([user_msg, aria_msg])
    db.commit()
    return {
        "message": chat_out(aria_msg),
        "userMessage": chat_out(user_msg),
        "safety": result["resources"],
        "aiPowered": result["aiPowered"],
    }


@router.delete("/history", status_code=204)
def clear(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.execute(delete(ChatMessage).where(ChatMessage.user_id == user.id))
    db.commit()
