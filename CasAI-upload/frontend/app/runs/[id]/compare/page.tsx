"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import MolstarViewer from "@/components/MolstarViewer";
import type { HighlightedResidues } from "@/lib/molstar-utils";

const API_BASE = "http://localhost:8000";

interface ScoreData {
  id: string;
  score: number;
  data?: {
    rmsd?: number;
    linkerLength?: number;
    sanityFlags?: string[];
    confidence?: number;
  };
}

export default function ComparePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const runId = params.id as string;
  const candidateId = searchParams.get("candidate");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<any>(null);
  const [candidateData, setCandidateData] = useState<ScoreData | null>(null);

  useEffect(() => {
    if (!runId || !candidateId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch annotations to know which region to highlight
        const annotRes = await fetch(`${API_BASE}/runs/${runId}/files/annotations.json`);
        if (!annotRes.ok) throw new Error("Failed to load annotations");
        const annotData = await annotRes.json();
        setAnnotations(annotData);

        // Fetch candidate score/metadata
        const candRes = await fetch(`${API_BASE}/runs/${runId}/candidates`);
        if (!candRes.ok) throw new Error("Failed to load candidates");
        const candidates = await candRes.json();
        const match = candidates.find((c: any) => c.id === candidateId);
        if (match) {
          setCandidateData(match);
        } else {
          throw new Error("Candidate not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [runId, candidateId]);

  if (!candidateId) return <div className="p-8">Missing candidate ID</div>;
  if (loading) return <div className="p-8 text-center">Loading comparison...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  // Determine highlight region from annotations
  // Expecting annotations like: { "region": "loop_620_635" } or { "start": 620, "end": 635, "chain": "A" }
  let highlight: HighlightedResidues | undefined;
  if (annotations?.start && annotations?.end) {
    highlight = {
      start: annotations.start,
      end: annotations.end,
      chain: annotations.chain || "A",
    };
  } else if (annotations?.region) {
    // Fallback parsing for demo string "loop_620_635"
    const parts = annotations.region.split("_");
    if (parts.length >= 3) {
      highlight = {
        start: parseInt(parts[1], 10),
        end: parseInt(parts[2], 10),
        chain: "A",
      };
    }
  }

  const originalUrl = `${API_BASE}/runs/${runId}/files/input.pdb`;
  // Candidate PDB might be in predictions/ or backbones/ depending on pipeline stage
  // For this demo we'll assume predictions/ folder based on earlier backend setup
  const candidateUrl = `${API_BASE}/runs/${runId}/files/predictions/${candidateId}.pdb`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Design Comparison</h1>
          <p className="text-gray-500">
            Comparing Original vs <span className="font-mono text-blue-600">{candidateId}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Global Score</div>
          <div className="text-3xl font-bold text-blue-600">
            {candidateData?.score?.toFixed(2) ?? "N/A"}
          </div>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ScoreCard
          label="RMSD"
          value={candidateData?.data?.rmsd?.toFixed(2) ?? "0.00"}
          unit="Å"
        />
        <ScoreCard
          label="Linker Length"
          value={candidateData?.data?.linkerLength ?? "N/A"}
          unit="res"
        />
        <ScoreCard
          label="Confidence"
          value={candidateData?.data?.confidence?.toFixed(2) ?? "N/A"}
          unit="pLDDT"
        />
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
            Sanity Checks
          </div>
          <div className="flex flex-wrap gap-1">
            {candidateData?.data?.sanityFlags?.length ? (
              candidateData.data.sanityFlags.map((flag) => (
                <span
                  key={flag}
                  className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                >
                  {flag}
                </span>
              ))
            ) : (
              <span className="text-green-600 text-sm font-medium">Passed</span>
            )}
          </div>
        </div>
      </div>

      {/* Viewers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        <div className="flex flex-col h-full">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Original Structure</h3>
          <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white relative">
            <MolstarViewer
              pdbUrl={originalUrl}
              highlightedResidues={highlight}
              height={560}
            />
            <div className="absolute top-4 left-4 bg-white/90 px-2 py-1 rounded text-xs font-mono shadow-sm">
              Input PDB
            </div>
          </div>
        </div>

        <div className="flex flex-col h-full">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Candidate Design</h3>
          <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white relative">
            <MolstarViewer
              pdbUrl={candidateUrl}
              highlightedResidues={highlight}
              height={560}
            />
            <div className="absolute top-4 left-4 bg-blue-50/90 text-blue-800 px-2 py-1 rounded text-xs font-mono shadow-sm">
              {candidateId}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
        {label}
      </div>
      <div className="flex items-baseline">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {unit && <span className="ml-1 text-sm text-gray-500">{unit}</span>}
      </div>
    </div>
  );
}
