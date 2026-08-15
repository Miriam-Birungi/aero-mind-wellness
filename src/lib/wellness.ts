export const calculateWellnessScore = (heartRate: number, sleepHours: number): number => {
  if (heartRate < 40 || heartRate > 120 || sleepHours <= 0) {
    return 10;
  }

  // High heart rate and low sleep hours reduce the score
  let score = 100;

  if (heartRate > 85) {
    score -= (heartRate - 85) * 1.5;
  }
  if (sleepHours < 7.0) {
    score -= (7.0 - sleepHours) * 15;
  }

  return Math.max(10, Math.min(100, Math.round(score)));
};
