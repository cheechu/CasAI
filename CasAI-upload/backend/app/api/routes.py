from fastapi import APIRouter

from app.api.knowledge import router as knowledge_router
from app.api.runs import router as runs_router

api_router = APIRouter()
api_router.include_router(runs_router, prefix="/runs", tags=["runs"])
api_router.include_router(knowledge_router, prefix="/knowledge", tags=["knowledge"])
