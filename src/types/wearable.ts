export interface WearableMetricsHistory {
  date: string;
  score: number;
}

export interface WearableMetrics {
  score: number;
  heartRate: number;
  sleepHours: number;
  steps: number;
  history: WearableMetricsHistory[];
  insights: string[];
}
