/**
 * Facial Embedding Similarity Matcher
 */
const faceMatcher = {
  /**
   * Calculate Euclidean Distance between two face feature embedding vectors
   * @param {Array<Number>} storedEmbedding - User's registered face embedding
   * @param {Array<Number>} liveEmbedding - Kiosk scanner's real-time face embedding
   * @returns {Object} { isMatch: boolean, distance: number }
   */
  compareEmbeddings: (storedEmbedding, liveEmbedding) => {
    if (!storedEmbedding || !liveEmbedding) {
      return { isMatch: false, distance: 1.0 };
    }

    if (storedEmbedding.length !== liveEmbedding.length) {
      console.warn(`[FaceMatcher] Embedding dimensions mismatch. Stored: ${storedEmbedding.length}, Live: ${liveEmbedding.length}`);
      return { isMatch: false, distance: 1.0 };
    }

    // Calculate sum of squared differences
    let sumSquaredDiffs = 0;
    for (let i = 0; i < storedEmbedding.length; i++) {
      const diff = storedEmbedding[i] - liveEmbedding[i];
      sumSquaredDiffs += diff * diff;
    }

    // Euclidean Distance
    const distance = Math.sqrt(sumSquaredDiffs);

    // Read match threshold from environment variables (default: 0.6)
    const threshold = parseFloat(process.env.FACE_MATCH_THRESHOLD) || 0.6;

    // A smaller Euclidean distance indicates closer similarity (0.0 represents identical vectors)
    const isMatch = distance <= threshold;

    return {
      isMatch,
      distance
    };
  }
};

module.exports = faceMatcher;
