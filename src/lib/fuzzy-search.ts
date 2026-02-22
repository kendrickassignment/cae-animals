/**
 * Fuzzy search with typo tolerance via Levenshtein distance.
 * Matches query against individual target fields, not concatenated strings.
 */
export function fuzzyMatch(query: string, target: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();

  if (!q) return true;

  // Exact substring match
  if (t.includes(q)) return true;

  // Split into words
  const queryWords = q.split(/\s+/).filter(Boolean);
  const targetWords = t.split(/\s+/).filter(Boolean);

  // Every query word must match at least one target word
  return queryWords.every(qw =>
    targetWords.some(tw => {
      // Substring match
      if (qw.length >= 2 && tw.includes(qw)) return true;
      // Prefix match
      if (qw.length >= 2 && tw.startsWith(qw)) return true;

      // Typo tolerance via Levenshtein — only match against words of similar length
      if (qw.length >= 3 && Math.abs(qw.length - tw.length) <= 2) {
        const maxDist = qw.length <= 4 ? 1 : qw.length <= 7 ? 2 : Math.floor(qw.length / 3);
        if (levenshteinDistance(qw, tw) <= maxDist) return true;
      }

      // Prefix-based typo tolerance for longer target words
      if (qw.length >= 3 && tw.length > qw.length + 2) {
        const prefix = tw.substring(0, qw.length);
        if (levenshteinDistance(qw, prefix) <= 1) return true;
      }

      return false;
    })
  );
}

/**
 * Match query specifically against a company/entity name — stricter than general fuzzy.
 * Used to avoid matching "ikia" against random words in summaries.
 */
export function fuzzyMatchName(query: string, name: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  const n = name.toLowerCase();

  if (!q) return true;
  if (n.includes(q)) return true;

  const queryWords = q.split(/\s+/).filter(Boolean);
  const nameWords = n.split(/\s+/).filter(w => w.length > 1);

  // At least one query word must match a name word
  return queryWords.some(qw =>
    nameWords.some(nw => {
      if (qw.length >= 2 && nw.includes(qw)) return true;
      if (qw.length >= 2 && nw.startsWith(qw)) return true;

      // Typo tolerance
      if (qw.length >= 3 && Math.abs(qw.length - nw.length) <= 2) {
        const maxDist = qw.length <= 4 ? 1 : qw.length <= 7 ? 2 : Math.floor(qw.length / 3);
        if (levenshteinDistance(qw, nw) <= maxDist) return true;
      }

      // Prefix typo for longer names
      if (qw.length >= 3 && nw.length > qw.length + 2) {
        const prefix = nw.substring(0, qw.length);
        if (levenshteinDistance(qw, prefix) <= 1) return true;
      }

      return false;
    })
  );
}

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[b.length][a.length];
}
