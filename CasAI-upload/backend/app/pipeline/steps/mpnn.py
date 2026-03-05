import csv

from app.core.storage import RESULTS_DIR, append_run_log


def run_mpnn(run_id: str) -> None:
    append_run_log(run_id, "MPNN placeholder: generating sequences")
    sequences_path = RESULTS_DIR / run_id / "sequences.csv"

    rows = [
        {"id": "backbone_001", "sequence": "ACDEFGHIKLMNPQRSTVWY"},
        {"id": "backbone_002", "sequence": "CDEFGHIKLMNPQRSTVWYA"},
        {"id": "backbone_003", "sequence": "DEFGHIKLMNPQRSTVWYAC"},
    ]

    with sequences_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["id", "sequence"])
        writer.writeheader()
        writer.writerows(rows)

    append_run_log(run_id, "MPNN placeholder complete")
