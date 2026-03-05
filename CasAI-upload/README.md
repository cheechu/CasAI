# CasAI

Open-source AI workbench for prototyping CRISPR base editor redesigns.

## Quickstart

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
chmod +x run_dev.sh
./run_dev.sh
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI will be available at `http://localhost:3000`.

## Demo the pipeline

### Via UI

1. Navigate to `http://localhost:3000`
2. Upload a PDB file and provide annotations JSON
3. Click "Start Run"
4. View run progress and results on the detail page

### Via API

Use any PDB file and a small annotations JSON payload.

```bash
curl -X POST http://localhost:8000/runs \
  -F "pdb=@/path/to/input.pdb" \
  -F 'annotations={"region":"loop_620_635","notes":"demo"}'
```

Then poll status and fetch outputs:

```bash
curl http://localhost:8000/runs/<run_id>
curl http://localhost:8000/runs/<run_id>/candidates
curl http://localhost:8000/runs/<run_id>/files/run.log
```

## Knowledge bases & build mode

CRISPR biology knowledge (enzymes, pathways, design principles) is loaded during the pipeline and available for AI/build mode:

- **Enzymes**: Cas9, APOBEC1, TadA, UGI, BE4
- **Pathways**: BER, CBE/ABE editing pathways
- **CRISPR biology**: PAM sites, editing windows, linker design

**API:**
```bash
curl http://localhost:8000/knowledge              # List bases
curl http://localhost:8000/knowledge/enzymes      # Get enzymes
curl http://localhost:8000/knowledge/all/bundle   # All for AI context
```

## Example runs & simulation

**Load examples in the UI:**
- **Load standard** – sample PDB + annotations
- **Load simulation** – enables simulation mode (knowledge bases loaded)
- **ABE linker** / **CBE extended** – different test scenarios
- **Quick simulation** – starts a simulation run immediately

**Simulation mode** (annotations `"simulation": true`):
- Loads all knowledge bases into `build_context.json`
- Produces varied placeholder candidates
- For testing without RFdiffusion/MPNN

**API:**
```bash
curl -X POST http://localhost:8000/runs/simulation   # Start simulation run
```

## Project structure

```
CasAI/
├── backend/
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── core/        # Storage & utilities
│   │   ├── pipeline/    # Pipeline orchestrator & steps
│   │   └── schemas/     # Pydantic models
│   └── requirements.txt
├── data/
│   ├── knowledge/       # Enzymes, pathways, crispr_biology JSON
│   └── examples/        # Sample PDB for simulation
├── frontend/
│   ├── app/             # Next.js pages
│   ├── components/      # React components
│   └── public/examples/ # Example files for Load Example
├── tests/               # Simulation tests
└── results/            # Run outputs (created on first run)
```

## Outputs

Pipeline outputs are written to:

- `data/<run_id>/input.pdb`
- `data/<run_id>/annotations.json`
- `results/<run_id>/backbones/*.pdb`
- `results/<run_id>/sequences.csv`
- `results/<run_id>/predictions/*.pdb`
- `results/<run_id>/scores.csv`
- `results/<run_id>/report.json`
- `results/<run_id>/run.log`
