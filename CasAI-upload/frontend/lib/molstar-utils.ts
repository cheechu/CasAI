import type { StructureElement } from "molstar/lib/mol-model/structure";

export type HighlightedResidues =
  | number[]
  | { start: number; end: number; chain?: string }
  | { residues: number[]; chain?: string };

export function buildResidueSelection(
  highlighted: HighlightedResidues | undefined
): StructureElement.Schema | null {
  if (!highlighted) {
    return null;
  }

  // Case 1: Simple array of residue numbers (implicit chain)
  if (Array.isArray(highlighted)) {
    const residues = highlighted
      .filter((value) => Number.isFinite(value))
      .map((value) => Math.trunc(value))
      .filter((value) => value > 0);

    if (residues.length === 0) return null;

    return {
      items: {
        auth_seq_id: residues,
      },
    };
  }

  // Case 2: Object with 'residues' array and optional 'chain'
  if ("residues" in highlighted) {
    const residues = highlighted.residues
      .filter((value) => Number.isFinite(value))
      .map((value) => Math.trunc(value))
      .filter((value) => value > 0);

    if (residues.length === 0) return null;

    return {
      items: {
        auth_asym_id: highlighted.chain ? [highlighted.chain] : undefined,
        auth_seq_id: residues,
      },
    };
  }

  // Case 3: Range object { start, end, chain? }
  const start = Math.trunc(highlighted.start);
  const end = Math.trunc(highlighted.end);

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return null;
  }

  const normalizedStart = Math.min(start, end);
  const normalizedEnd = Math.max(start, end);

  return {
    auth_asym_id: highlighted.chain ? highlighted.chain : undefined,
    beg_auth_seq_id: normalizedStart,
    end_auth_seq_id: normalizedEnd,
  };
}
