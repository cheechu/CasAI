from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException

from app.core.storage import load_knowledge, list_knowledge_bases

router = APIRouter()


@router.get("", response_model=List[str])
def list_knowledge() -> List[str]:
    """List available knowledge base names."""
    return list_knowledge_bases()


@router.get("/{name}", response_model=Dict[str, Any])
def get_knowledge(name: str) -> Dict[str, Any]:
    """Get a knowledge base by name (enzymes, pathways, crispr_biology)."""
    data = load_knowledge(name)
    if data is None:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    return data


@router.get("/all/bundle", response_model=Dict[str, Any])
def get_all_knowledge() -> Dict[str, Any]:
    """Get all knowledge bases bundled for AI/build mode."""
    bases = list_knowledge_bases()
    bundle: Dict[str, Any] = {}
    for base in bases:
        data = load_knowledge(base)
        if data:
            bundle[base] = data
    return bundle
