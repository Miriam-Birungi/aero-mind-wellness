import { describe, it, expect } from 'vitest';
import { calculateWellnessScore } from '../lib/wellness';

describe('calculateWellnessScore', () => {
  it('should return a perfect score for ideal biometrics', () => {
    const score = calculateWellnessScore(70, 8.0);
    expect(score).toBe(100);
  });

  it('should decrease the score for high heart rate', () => {
    const score = calculateWellnessScore(95, 8.0);
    expect(score).toBeLessThan(100);
  });

  it('should decrease the score for insufficient sleep', () => {
    const score = calculateWellnessScore(70, 5.0);
    expect(score).toBe(70); // 100 - (7.0 - 5.0) * 15 = 70
  });

  it('should bound the score between 10 and 100', () => {
    const scoreLow = calculateWellnessScore(150, 1.0);
    expect(scoreLow).toBe(10);
  });
});
