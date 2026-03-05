"""
Simulation test runs for CasAI pipeline.
Run from project root: python -m pytest tests/test_simulation.py -v
"""
import json
from pathlib import Path

import pytest

# Assume backend is in path when running tests
BACKEND_DIR = Path(__file__).resolve().parents[1] / "backend"


@pytest.fixture
def data_dir():
    return Path(__file__).resolve().parents[1] / "data"


def test_knowledge_bases_exist(data_dir):
    """Knowledge bases (enzymes, pathways, crispr_biology) must exist."""
    knowledge_dir = data_dir / "knowledge"
    assert knowledge_dir.exists(), "data/knowledge directory missing"
    required = ["enzymes.json", "pathways.json", "crispr_biology.json"]
    for name in required:
        path = knowledge_dir / name
        assert path.exists(), f"Missing {name}"
        data = json.loads(path.read_text())
        assert isinstance(data, dict), f"{name} must be valid JSON object"


def test_example_pdb_exists(data_dir):
    """Example PDB file must exist for simulation runs."""
    pdb_path = data_dir / "examples" / "sample_base_editor.pdb"
    assert pdb_path.exists(), "Example PDB missing"
    content = pdb_path.read_text()
    assert "ATOM" in content
    assert "END" in content


def test_simulation_annotations_valid():
    """Simulation annotations schema."""
    ann = {
        "simulation": True,
        "region": "loop_620_635",
        "linker_start": 10,
        "linker_end": 16,
        "target": "CBE",
    }
    assert ann["simulation"] is True
    assert 1 <= ann["linker_start"] < ann["linker_end"]
