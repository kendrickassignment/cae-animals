/**
 * Fuzzy search with typo tolerance via Levenshtein distance.
 * Supports: exact substring, word-level partial match, and typo tolerance.
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
      if (qw.length >= 2 && qw.includes(tw)) return true;

      // Prefix match (e.g. "yum" matches "yum!" or "yumi")
      if (qw.length >= 2 && tw.startsWith(qw)) return true;

      // Typo tolerance via Levenshtein
      // For short words (3-4 chars), allow distance 1
      // For medium words (5-7 chars), allow distance 2
      // For longer words, allow distance up to length/3
      if (qw.length >= 3) {
        const maxDist = qw.length <= 4 ? 1 : qw.length <= 7 ? 2 : Math.floor(qw.length / 3);
        // Compare against full target word
        if (levenshteinDistance(qw, tw) <= maxDist) return true;
        // Compare against target word prefix of similar length (handles "yim" vs "yum" in "yum!")
        if (tw.length > qw.length) {
          const prefix = tw.substring(0, qw.length);
          if (levenshteinDistance(qw, prefix) <= Math.max(1, Math.floor(qw.length / 3))) return true;
        }
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
