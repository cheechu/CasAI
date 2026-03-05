"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RunStepper from "@/components/RunStepper";
import CandidateTable from "@/components/CandidateTable";

const API_BASE = "http://localhost:8000";

interface RunMetadata {
  run_id: string;
  status: "CREATED" | "RUNNING" | "FAILED" | "COMPLETE";
  message?: string;
}

interface Candidate {
  id?: string;
  score?: number;
  data?: Record<string, any>;
}

export default function RunDetailPage() {
  const params = useParams();
  const runId = params.id as string;

  const [metadata, setMetadata] = useState<RunMetadata | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;

    const fetchStatus = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const res = await fetch(`${API_BASE}/runs/${runId}`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!res.ok) throw new Error("Failed to fetch run status");
        const data = await res.json();
        setMetadata(data);

        if (data.status === "COMPLETE") {
          const candCtrl = new AbortController();
          const candT = setTimeout(() => candCtrl.abort(), 5000);
          const candidatesRes = await fetch(`${API_BASE}/runs/${runId}/candidates`, {
            signal: candCtrl.signal,
          });
          clearTimeout(candT);
          if (candidatesRes.ok) {
            const candidatesData = await candidatesRes.json();
            setCandidates(candidatesData);
          }
        }
      } catch (err) {
        clearTimeout(timeout);
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg.includes("abort") ? "Backend not responding. Is it running on port 8000?" : msg);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [runId]);

  if (loading) {
    return <div className="text-center py-12">Loading run details...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  if (!metadata) {
    return <div className="text-center py-12">Run not found</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Run {runId}</h1>
        <p className="mt-2 text-gray-600">
          Status: <span className="font-medium">{metadata.status}</span>
        </p>
      </div>

      <RunStepper status={metadata.status} />

      {metadata.status === "COMPLETE" && candidates.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Candidate Designs
          </h2>
          <CandidateTable candidates={candidates} />
        </div>
      )}

      {metadata.status === "FAILED" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Pipeline failed: {metadata.message}</p>
        </div>
      )}
    </div>
  );
}
