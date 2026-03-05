"use client";

import UploadPanel from "@/components/UploadPanel";
import SampleCard from "@/components/SampleCard";

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">New Run</h1>
        <p className="mt-2 text-gray-600">
          Upload a PDB structure and annotations to start a design run.
        </p>
      </div>
      <div className="mb-6">
        <SampleCard />
      </div>
      <UploadPanel />
    </div>
  );
}
