/**
 * Calculate the nasofrontal angle
 * @param {Object} glabella - Point {x, y}
 * @param {Object} nasion - Point {x, y}
 * @param {Object} pronasale - Point {x, y}
 * @returns {number} angle in degrees
 */
export const calculateNasofrontalAngle = (glabella, nasion, pronasale) => {
  // Vector 1: nasion to glabella
  const v1 = { x: glabella.x - nasion.x, y: glabella.y - nasion.y };
  // Vector 2: nasion to pronasale
  const v2 = { x: pronasale.x - nasion.x, y: pronasale.y - nasion.y };
  
  const dotProduct = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  
  const angleRad = Math.acos(dotProduct / (mag1 * mag2));
  return (angleRad * 180) / Math.PI;
};

/**
 * Calculate facial symmetry score
 * @param {Array} leftLandmarks - Array of left side points
 * @param {Array} rightLandmarks - Array of right side points
 * @param {Object} midLine - Definition of midline (e.g. {x, y} of nasion and pogonion)
 * @returns {number} symmetry score (0-100)
 */
export const calculateSymmetryScore = (leftLandmarks, rightLandmarks) => {
  if (!leftLandmarks || !rightLandmarks || leftLandmarks.length !== rightLandmarks.length) {
    return 0;
  }
  let totalDiff = 0;
  for (let i = 0; i < leftLandmarks.length; i++) {
    const l = leftLandmarks[i];
    const r = rightLandmarks[i];
    // Simple approach: calculate distance between corresponding points
    // A perfect symmetry across a vertical midline at x=0 would mean l.x = -r.x and l.y = r.y
    const diffX = Math.abs(Math.abs(l.x) - Math.abs(r.x));
    const diffY = Math.abs(l.y - r.y);
    totalDiff += diffX + diffY;
  }
  // Normalize score
  const maxDiff = leftLandmarks.length * 50; // Arbitrary max diff
  const score = Math.max(0, 100 - (totalDiff / maxDiff) * 100);
  return score;
};
