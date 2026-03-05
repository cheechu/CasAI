import json
from pathlib import Path
from typing import List

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.core.storage import (
    DATA_DIR,
    EXAMPLES_DIR,
    create_run_dirs,
    ensure_allowed_file,
    find_run_file,
    load_candidates,
    load_run_metadata,
    save_annotations,
    save_pdb_file,
    save_run_metadata,
)
from app.pipeline.orchestrator import run_pipeline
from app.schemas.candidates import Candidate
from app.schemas.run import RunCreateResponse, RunStatus, RunStatusResponse


router = APIRouter()

SIMULATION_ANNOTATIONS = {
    "simulation": True,
    "region": "loop_620_635",
    "linker_start": 10,
    "linker_end": 16,
    "notes": "Simulation test run - uses knowledge bases for build context",
    "target": "CBE",
    "test_scenario": "linker_redesign",
}


@router.post("/simulation", response_model=RunCreateResponse)
async def create_simulation_run(background_tasks: BackgroundTasks) -> RunCreateResponse:
    """Create a run from built-in example data (simulation mode). For testing."""
    from io import BytesIO

    sample_pdb = EXAMPLES_DIR / "sample_base_editor.pdb"
    if not sample_pdb.exists():
        raise HTTPException(status_code=503, detail="Example data not available")

    run_id = create_run_dirs()
    pdb_bytes = sample_pdb.read_bytes()
    pdb_file = UploadFile(filename="sample_base_editor.pdb", file=BytesIO(pdb_bytes))
    save_pdb_file(run_id, pdb_file)
    save_annotations(run_id, SIMULATION_ANNOTATIONS)

    metadata = {
        "run_id": run_id,
        "status": RunStatus.CREATED.value,
        "message": "Simulation run created",
    }
    save_run_metadata(run_id, metadata)
    background_tasks.add_task(run_pipeline, run_id)

    return RunCreateResponse(run_id=run_id, status=RunStatus.CREATED)


@router.post("", response_model=RunCreateResponse)
async def create_run(
    background_tasks: BackgroundTasks,
    pdb: UploadFile = File(...),
    annotations: str = Form(...),
) -> RunCreateResponse:
    try:
        annotations_payload = json.loads(annotations)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid annotations JSON") from exc

    run_id = create_run_dirs()
    save_pdb_file(run_id, pdb)
    save_annotations(run_id, annotations_payload)

    metadata = {
        "run_id": run_id,
        "status": RunStatus.CREATED.value,
        "message": "Run created",
    }
    save_run_metadata(run_id, metadata)
    background_tasks.add_task(run_pipeline, run_id)

    return RunCreateResponse(run_id=run_id, status=RunStatus.CREATED)


@router.get("/{run_id}", response_model=RunStatusResponse)
def get_run_status(run_id: str) -> RunStatusResponse:
    metadata = load_run_metadata(run_id)
    if metadata is None:
        raise HTTPException(status_code=404, detail="Run not found")

    status_value = metadata.get("status", RunStatus.CREATED.value)
    return RunStatusResponse(
        run_id=run_id,
        status=RunStatus(status_value),
        metadata=metadata,
    )


@router.get("/{run_id}/candidates", response_model=List[Candidate])
def get_run_candidates(run_id: str) -> List[Candidate]:
    candidates = load_candidates(run_id)
    if candidates is None:
        raise HTTPException(status_code=404, detail="No candidates found")
    return candidates


@router.get("/{run_id}/files/{path:path}")
def get_run_file(run_id: str, path: str) -> FileResponse:
    try:
        ensure_allowed_file(path)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    file_path = find_run_file(run_id, path)
    if file_path is None:
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)
