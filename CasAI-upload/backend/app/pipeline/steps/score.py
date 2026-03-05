import csv
import json
from pathlib import Path

from app.core.storage import RESULTS_DIR, append_run_log


def _load_build_context(run_id: str) -> dict:
    path = RESULTS_DIR / run_id / "build_context.json"
    if path.exists():
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def _is_simulation(run_id: str) -> bool:
    path = RESULTS_DIR / run_id / "simulation_mode.json"
    if path.exists():
        with path.open("r", encoding="utf-8") as f:
            return json.load(f).get("simulation", False)
    return False


def run_score(run_id: str) -> None:
    append_run_log(run_id, "Score placeholder: scoring candidates")
    results_dir = RESULTS_DIR / run_id
    scores_path = results_dir / "scores.csv"
    report_path = results_dir / "report.json"

    build_context = _load_build_context(run_id)
    is_sim = _is_simulation(run_id)

    # Simulation mode: use varied test data
    if is_sim:
        rows = [
            {"id": "sim_candidate_001", "score": "0.91"},
            {"id": "sim_candidate_002", "score": "0.85"},
            {"id": "sim_candidate_003", "score": "0.78"},
            {"id": "sim_candidate_004", "score": "0.72"},
        ]
        summary = "Simulation test run complete. Knowledge bases loaded for build context."
    else:
        rows = [
            {"id": "prediction_001", "score": "0.82"},
            {"id": "prediction_002", "score": "0.76"},
            {"id": "prediction_003", "score": "0.69"},
        ]
        summary = "Placeholder scoring results."

    with scores_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["id", "score"])
        writer.writeheader()
        writer.writerows(rows)

    report_payload = {
        "run_id": run_id,
        "summary": summary,
        "candidates": [{"id": row["id"], "score": float(row["score"])} for row in rows],
    }
    if build_context:
        report_payload["knowledge_loaded"] = list(build_context.keys())
    if is_sim:
        report_payload["simulation"] = True

    with report_path.open("w", encoding="utf-8") as handle:
        json.dump(report_payload, handle, indent=2)

    append_run_log(run_id, "Score placeholder complete")
