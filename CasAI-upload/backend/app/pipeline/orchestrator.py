from app.core.storage import append_run_log, load_run_metadata, save_run_metadata
from app.pipeline.steps.mpnn import run_mpnn
from app.pipeline.steps.predict import run_predict
from app.pipeline.steps.prepare import run_prepare
from app.pipeline.steps.rfdiffusion import run_rfdiffusion
from app.pipeline.steps.score import run_score
from app.schemas.run import RunStatus


def run_pipeline(run_id: str) -> None:
    metadata = load_run_metadata(run_id) or {"run_id": run_id}
    metadata.update({"status": RunStatus.RUNNING.value, "message": "Pipeline started"})
    save_run_metadata(run_id, metadata)
    append_run_log(run_id, "Pipeline started")

    try:
        run_prepare(run_id)
        run_rfdiffusion(run_id)
        run_mpnn(run_id)
        run_predict(run_id)
        run_score(run_id)
    except Exception as exc:
        append_run_log(run_id, f"Pipeline failed: {exc}")
        metadata.update({"status": RunStatus.FAILED.value, "message": "Pipeline failed"})
        save_run_metadata(run_id, metadata)
        return

    append_run_log(run_id, "Pipeline complete")
    metadata.update({"status": RunStatus.COMPLETE.value, "message": "Pipeline complete"})
    save_run_metadata(run_id, metadata)
