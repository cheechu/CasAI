from enum import Enum
from typing import Any, Dict, Optional

from pydantic import BaseModel


class RunStatus(str, Enum):
    CREATED = "CREATED"
    RUNNING = "RUNNING"
    FAILED = "FAILED"
    COMPLETE = "COMPLETE"


class RunCreateResponse(BaseModel):
    run_id: str
    status: RunStatus


class RunStatusResponse(BaseModel):
    run_id: str
    status: RunStatus
    metadata: Optional[Dict[str, Any]] = None
