from app.core.storage import RESULTS_DIR, append_run_log


def run_rfdiffusion(run_id: str) -> None:
    append_run_log(run_id, "RFdiffusion placeholder: generating backbones")
    backbones_dir = RESULTS_DIR / run_id / "backbones"

    for index in range(1, 4):
        pdb_path = backbones_dir / f"backbone_{index:03d}.pdb"
        pdb_path.write_text(
            "\n".join(
                [
                    "HEADER    CASAI BACKBONE PLACEHOLDER",
                    f"REMARK    BACKBONE {index}",
                    "ATOM      1  N   ALA A   1      11.104  13.207   2.100  1.00 20.00           N",
                    "ATOM      2  CA  ALA A   1      12.560  13.200   2.300  1.00 20.00           C",
                    "ATOM      3  C   ALA A   1      13.050  14.620   2.700  1.00 20.00           C",
                    "ATOM      4  O   ALA A   1      12.400  15.620   2.400  1.00 20.00           O",
                    "END",
                ]
            ),
            encoding="utf-8",
        )

    append_run_log(run_id, "RFdiffusion placeholder complete")
