from app.core.storage import RESULTS_DIR, append_run_log


def run_predict(run_id: str) -> None:
    append_run_log(run_id, "Predict placeholder: generating predictions")
    predictions_dir = RESULTS_DIR / run_id / "predictions"

    for index in range(1, 4):
        pdb_path = predictions_dir / f"prediction_{index:03d}.pdb"
        pdb_path.write_text(
            "\n".join(
                [
                    "HEADER    CASAI PREDICTION PLACEHOLDER",
                    f"REMARK    PREDICTION {index}",
                    "ATOM      1  N   GLY A   1      10.104  12.207   2.100  1.00 20.00           N",
                    "ATOM      2  CA  GLY A   1      11.560  12.200   2.300  1.00 20.00           C",
                    "ATOM      3  C   GLY A   1      12.050  13.620   2.700  1.00 20.00           C",
                    "ATOM      4  O   GLY A   1      11.400  14.620   2.400  1.00 20.00           O",
                    "END",
                ]
            ),
            encoding="utf-8",
        )

    append_run_log(run_id, "Predict placeholder complete")
