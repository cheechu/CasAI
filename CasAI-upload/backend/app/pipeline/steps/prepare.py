import json

from app.core.storage import (
    KNOWLEDGE_DIR,
    RESULTS_DIR,
    append_run_log,
    load_annotations,
    load_knowledge,
    list_knowledge_bases,
)


def run_prepare(run_id: str) -> None:
    results_dir = RESULTS_DIR / run_id
    (results_dir / "backbones").mkdir(parents=True, exist_ok=True)
    (results_dir / "predictions").mkdir(parents=True, exist_ok=True)
    append_run_log(run_id, "Prepared output directories")

    # Build mode: load all knowledge bases for AI context
    if KNOWLEDGE_DIR.exists():
        build_context = {}
        for name in list_knowledge_bases():
            data = load_knowledge(name)
            if data:
                build_context[name] = data
        if build_context:
            context_path = results_dir / "build_context.json"
            with context_path.open("w", encoding="utf-8") as f:
                json.dump(build_context, f, indent=2)
            append_run_log(run_id, f"Loaded {len(build_context)} knowledge bases for build mode")

    # Check for simulation mode from annotations
    annotations = load_annotations(run_id)
    if annotations and annotations.get("simulation"):
        sim_path = results_dir / "simulation_mode.json"
        with sim_path.open("w", encoding="utf-8") as f:
            json.dump({"simulation": True, "annotations": annotations}, f, indent=2)
        append_run_log(run_id, "Simulation mode enabled")
