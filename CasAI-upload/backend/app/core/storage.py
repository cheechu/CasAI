import csv
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import UploadFile

from app.schemas.candidates import Candidate


RUN_METADATA_FILENAME = "metadata.json"

BASE_DIR = Path(__file__).resolve().parents[3]
DATA_DIR = BASE_DIR / "data"
RESULTS_DIR = BASE_DIR / "results"
KNOWLEDGE_DIR = BASE_DIR / "data" / "knowledge"
EXAMPLES_DIR = BASE_DIR / "data" / "examples"
ALLOWED_EXTENSIONS = {".pdb", ".csv", ".json"}


def create_run_dirs() -> str:
    run_id = uuid4().hex
    (DATA_DIR / run_id).mkdir(parents=True, exist_ok=True)
    (RESULTS_DIR / run_id).mkdir(parents=True, exist_ok=True)
    return run_id


def save_pdb_file(run_id: str, pdb: UploadFile) -> None:
    target = DATA_DIR / run_id / "input.pdb"
    with target.open("wb") as buffer:
        buffer.write(pdb.file.read())


def save_annotations(run_id: str, annotations: Dict[str, Any]) -> None:
    target = DATA_DIR / run_id / "annotations.json"
    with target.open("w", encoding="utf-8") as handle:
        json.dump(annotations, handle, indent=2)


def save_run_metadata(run_id: str, metadata: Dict[str, Any]) -> None:
    target = DATA_DIR / run_id / RUN_METADATA_FILENAME
    with target.open("w", encoding="utf-8") as handle:
        json.dump(metadata, handle, indent=2)


def append_run_log(run_id: str, message: str) -> None:
    log_path = RESULTS_DIR / run_id / "run.log"
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    with log_path.open("a", encoding="utf-8") as handle:
        handle.write(f"[{timestamp}] {message}\n")


def load_annotations(run_id: str) -> Optional[Dict[str, Any]]:
    """Load annotations for a run."""
    target = DATA_DIR / run_id / "annotations.json"
    if not target.exists():
        return None
    with target.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def load_run_metadata(run_id: str) -> Optional[Dict[str, Any]]:
    target = DATA_DIR / run_id / RUN_METADATA_FILENAME
    if not target.exists():
        return None
    with target.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def load_candidates(run_id: str) -> Optional[List[Candidate]]:
    report_path = RESULTS_DIR / run_id / "report.json"
    scores_path = RESULTS_DIR / run_id / "scores.csv"

    if report_path.exists():
        with report_path.open("r", encoding="utf-8") as handle:
            payload = json.load(handle)
        items = payload.get("candidates", payload)
        return [Candidate(**item) for item in items]

    if scores_path.exists():
        with scores_path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            return [Candidate(data=row) for row in reader]

    return None


def ensure_allowed_file(path: str) -> None:
    extension = Path(path).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError("Unsupported file type")


def find_run_file(run_id: str, path: str) -> Optional[Path]:
    normalized = Path(path)
    data_candidate = _safe_join(DATA_DIR / run_id, normalized)
    if data_candidate and data_candidate.exists():
        return data_candidate

    results_candidate = _safe_join(RESULTS_DIR / run_id, normalized)
    if results_candidate and results_candidate.exists():
        return results_candidate

    return None


def load_knowledge(name: str) -> Optional[Dict[str, Any]]:
    """Load a knowledge base JSON file (enzymes, pathways, crispr_biology)."""
    if not name.endswith(".json"):
        name = f"{name}.json"
    path = KNOWLEDGE_DIR / name
    if not path.exists():
        return None
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def list_knowledge_bases() -> List[str]:
    """List available knowledge base filenames."""
    if not KNOWLEDGE_DIR.exists():
        return []
    return [f.stem for f in KNOWLEDGE_DIR.glob("*.json")]


def _safe_join(base: Path, target: Path) -> Optional[Path]:
    try:
        resolved = (base / target).resolve()
    except RuntimeError:
        return None
    if base.resolve() not in resolved.parents and base.resolve() != resolved:
        return None
    return resolved
