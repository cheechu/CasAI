"use client";

import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import { Viewer } from "molstar/lib/apps/viewer/app";

import {
  buildResidueSelection,
  HighlightedResidues,
} from "@/lib/molstar-utils";

interface MolstarViewerProps {
  pdbUrl: string;
  highlightedResidues?: HighlightedResidues;
  height?: number;
}

export default function MolstarViewer({
  pdbUrl,
  highlightedResidues,
  height = 520,
}: MolstarViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const viewerPromiseRef = useRef<Promise<Viewer> | null>(null);

  useEffect(() => {
    return () => {
      if (viewerRef.current) {
        viewerRef.current.dispose();
        viewerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadStructure = async () => {
      if (!containerRef.current) return;
      const viewer = await getViewer(containerRef.current, viewerRef, viewerPromiseRef);
      await viewer.loadStructureFromUrl(pdbUrl, "pdb");
      if (!isMounted) return;
      applyHighlight(viewer, highlightedResidues);
    };

    loadStructure();

    return () => {
      isMounted = false;
    };
  }, [pdbUrl]); // Re-load if PDB URL changes

  useEffect(() => {
    if (!viewerRef.current) return;
    applyHighlight(viewerRef.current, highlightedResidues);
  }, [highlightedResidues]); // Re-highlight if props change

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg border border-gray-200 bg-white"
      style={{ height }}
    />
  );
}

async function getViewer(
  container: HTMLDivElement,
  viewerRef: MutableRefObject<Viewer | null>,
  viewerPromiseRef: MutableRefObject<Promise<Viewer> | null>
) {
  if (viewerRef.current) {
    return viewerRef.current;
  }

  if (!viewerPromiseRef.current) {
    viewerPromiseRef.current = Viewer.create(container, {
      layoutIsExpanded: false,
      layoutShowControls: false,
      layoutShowSequence: false,
      layoutShowLog: false,
      layoutShowLeftPanel: false,
      viewportShowControls: false,
      viewportShowSelectionMode: false,
      viewportShowAnimation: false,
    });
  }

  const viewer = await viewerPromiseRef.current;
  viewerRef.current = viewer;
  return viewer;
}

function applyHighlight(
  _viewer: Viewer,
  _highlightedResidues: HighlightedResidues | undefined
) {
  // TODO: Use viewer.plugin.managers.structure.selection and focus
  // when migrating from legacy structureInteractivity API
  void buildResidueSelection(_highlightedResidues);
}
