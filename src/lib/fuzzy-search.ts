/**
 * Simple fuzzy search: checks if all characters of the query appear in order in the target string.
 * Also supports partial keyword matching and basic typo tolerance via substring matching.
 */
export function fuzzyMatch(query: string, target: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();
  
  if (!q) return true;

  // Exact substring match
  if (t.includes(q)) return true;
  
  // Word-level partial matching: every query word must match at least one target word
  const queryWords = q.split(/\s+/).filter(Boolean);
  const targetWords = t.split(/\s+/).filter(Boolean);
  
  const allWordsMatch = queryWords.every(qw =>
    targetWords.some(tw => {
      // Substring match (either direction, but query word must be >= 2 chars)
      if (qw.length >= 2 && tw.includes(qw)) return true;
      if (qw.length >= 2 && qw.includes(tw)) return true;
      // Typo tolerance via Levenshtein - only for words of similar length
      if (qw.length >= 3 && Math.abs(qw.length - tw.length) <= 2) {
        return levenshteinDistance(qw, tw) <= Math.max(1, Math.floor(Math.min(qw.length, tw.length) / 3));
      }
      return false;
    })
  );
  return allWordsMatch;
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
