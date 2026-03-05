"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = "http://localhost:8000";

const EXAMPLES = {
  standard: {
    pdb: "/examples/sample_base_editor.pdb",
    annotations: "/examples/sample_annotations.json",
    label: "Standard example",
  },
  simulation: {
    pdb: "/examples/sample_base_editor.pdb",
    annotations: "/examples/simulation_annotations.json",
    label: "Simulation test",
  },
  abe: {
    pdb: "/examples/sample_base_editor.pdb",
    annotations: "/examples/abe_linker_annotations.json",
    label: "ABE linker simulation",
  },
  cbeExtended: {
    pdb: "/examples/sample_base_editor.pdb",
    annotations: "/examples/cbe_extended_annotations.json",
    label: "CBE extended window",
  },
} as const;

export default function UploadPanel() {
  const router = useRouter();
  const [pdbFile, setPdbFile] = useState<File | null>(null);
  const [annotations, setAnnotations] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startQuickSimulation = async () => {
    setError(null);
    setSubmitting(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${API_BASE}/runs/simulation`, {
        method: "POST",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to start simulation");
      }
      const data = await res.json();
      router.push(`/runs/${data.run_id}`);
    } catch (err) {
      clearTimeout(timeout);
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg.includes("abort") ? "Backend not responding. Start it with: cd backend && uvicorn app.main:app --port 8000" : msg);
      setSubmitting(false);
    }
  };

  const loadExample = async (key: keyof typeof EXAMPLES) => {
    const ex = EXAMPLES[key];
    setError(null);
    try {
      const [pdbRes, annRes] = await Promise.all([
        fetch(ex.pdb),
        fetch(ex.annotations),
      ]);
      if (!pdbRes.ok || !annRes.ok) throw new Error("Failed to load example");
      const pdbBlob = await pdbRes.blob();
      const ann = await annRes.json();
      setPdbFile(new File([pdbBlob], "sample_base_editor.pdb", { type: "chemical/x-pdb" }));
      setAnnotations(JSON.stringify(ann, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load example");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pdbFile) {
      setError("Please select a PDB file");
      return;
    }

    let annotationsPayload: any;
    try {
      annotationsPayload = annotations.trim()
        ? JSON.parse(annotations)
        : {};
    } catch {
      setError("Invalid JSON in annotations field");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("pdb", pdbFile);
      formData.append("annotations", JSON.stringify(annotationsPayload));

      const res = await fetch(`${API_BASE}/runs`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to create run");
      }

      const data = await res.json();
      router.push(`/runs/${data.run_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Example test runs</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => loadExample("standard")}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Load standard
          </button>
          <button
            type="button"
            onClick={() => loadExample("simulation")}
            className="px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md"
          >
            Load simulation
          </button>
          <button
            type="button"
            onClick={() => loadExample("abe")}
            className="px-3 py-1.5 text-sm bg-green-50 hover:bg-green-100 text-green-700 rounded-md"
          >
            ABE linker
          </button>
          <button
            type="button"
            onClick={() => loadExample("cbeExtended")}
            className="px-3 py-1.5 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md"
          >
            CBE extended
          </button>
          <button
            type="button"
            onClick={startQuickSimulation}
            disabled={submitting}
            className="px-3 py-1.5 text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-md font-medium"
          >
            Quick simulation
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="pdb"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            PDB File
          </label>
          <input
            id="pdb"
            type="file"
            accept=".pdb"
            onChange={(e) => setPdbFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            required
          />
        </div>

        <div>
          <label
            htmlFor="annotations"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Annotations (JSON)
          </label>
          <textarea
            id="annotations"
            value={annotations}
            onChange={(e) => setAnnotations(e.target.value)}
            placeholder='{"region": "loop_620_635", "notes": "demo"}'
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Starting run..." : "Start Run"}
        </button>
      </form>
    </div>
  );
}
