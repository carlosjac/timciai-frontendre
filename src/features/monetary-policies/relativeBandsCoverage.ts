/**
 * Frontend mirror of kernel `validateRelativeBandsCoverage` for form UX.
 * Bounds use API shape: number | null | 'eom' | 'start_next_month'.
 * Collects all coverage issues (not only the first).
 */

export type CoverageBound = number | null | 'eom' | 'start_next_month';

export type CoverageBand = {
  from: CoverageBound;
  to: CoverageBound;
};

export type CoverageErrorCode =
  | 'bandsRequired'
  | 'openFromRequired'
  | 'openToRequired'
  | 'overlapOrGap';

export type CoverageError = {
  code: CoverageErrorCode;
  /** 1-based band numbers for messages (when applicable). */
  a?: number;
  b?: number;
};

function boundStartRank(bound: CoverageBound): { cat: number; n: number } {
  if (bound == null) return { cat: 0, n: 0 };
  if (typeof bound === 'number') return { cat: 1, n: bound };
  if (bound === 'eom') return { cat: 2, n: 0 };
  return { cat: 3, n: 0 };
}

function compareBoundStarts(a: CoverageBound, b: CoverageBound): number {
  const ra = boundStartRank(a);
  const rb = boundStartRank(b);
  if (ra.cat !== rb.cat) return ra.cat - rb.cat;
  return ra.n - rb.n;
}

function boundStartsEqual(a: CoverageBound, b: CoverageBound): boolean {
  return compareBoundStarts(a, b) === 0;
}

function boundsAreAdjacent(to: CoverageBound, nextFrom: CoverageBound): boolean {
  if (typeof to === 'number' && typeof nextFrom === 'number') {
    return nextFrom === to + 1;
  }
  if (to === 'eom' && nextFrom === 'start_next_month') return true;

  return false;
}

/** Returns every coverage problem found (empty = valid). */
export function validateRelativeBandsCoverageForForm(
  bands: CoverageBand[] | undefined | null,
): CoverageError[] {
  if (!bands || bands.length < 1) return [{ code: 'bandsRequired' }];

  const errors: CoverageError[] = [];
  const indexed = bands.map((b, index) => ({ b, index }));
  indexed.sort((a, b) => compareBoundStarts(a.b.from, b.b.from));

  for (let i = 1; i < indexed.length; i++) {
    if (boundStartsEqual(indexed[i - 1]!.b.from, indexed[i]!.b.from)) {
      errors.push({
        code: 'overlapOrGap',
        a: indexed[i - 1]!.index + 1,
        b: indexed[i]!.index + 1,
      });
    }
  }

  const first = indexed[0]!;
  const last = indexed[indexed.length - 1]!;
  if (first.b.from !== null) errors.push({ code: 'openFromRequired' });
  if (last.b.to !== null) errors.push({ code: 'openToRequired' });

  for (let i = 0; i < indexed.length - 1; i++) {
    const cur = indexed[i]!;
    const next = indexed[i + 1]!;
    if (cur.b.to == null || !boundsAreAdjacent(cur.b.to, next.b.from)) {
      // Skip duplicate if we already flagged same pair as equal starts
      const already = errors.some(
        (e) =>
          e.code === 'overlapOrGap' &&
          e.a === cur.index + 1 &&
          e.b === next.index + 1,
      );
      if (!already) {
        errors.push({
          code: 'overlapOrGap',
          a: cur.index + 1,
          b: next.index + 1,
        });
      }
    }
  }

  return errors;
}
