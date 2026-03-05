from typing import Any, Dict, Optional

from pydantic import BaseModel


class Candidate(BaseModel):
    id: Optional[str] = None
    score: Optional[float] = None
    data: Optional[Dict[str, Any]] = None
