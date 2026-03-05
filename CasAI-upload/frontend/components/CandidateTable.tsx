"use client";

import { usePathname } from "next/navigation";

interface Candidate {
  id?: string;
  score?: number;
  data?: Record<string, any>;
}

interface CandidateTableProps {
  candidates: Candidate[];
}

export default function CandidateTable({ candidates }: CandidateTableProps) {
  const pathname = usePathname();
  const runId = pathname.split("/")[2];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              ID
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Score
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {candidates.map((candidate, index) => (
            <tr key={candidate.id || index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {candidate.id || `candidate_${index + 1}`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {candidate.score !== undefined
                  ? candidate.score.toFixed(2)
                  : candidate.data?.score || "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <a
                  href={`/runs/${runId}/compare?candidate=${candidate.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View 3D
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
