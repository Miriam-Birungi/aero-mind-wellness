import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface AIInsightsProps {
  heartRate: number;
  sleepHours: number;
  score: number;
}

export const AIInsights = ({ heartRate, sleepHours, score }: AIInsightsProps) => {
  const pool = useMemo(() => ({
    sleepLow: ["🛌 Low sleep detected. Consider a 20-minute power nap before duty."],
    hrHigh: ["💓 Elevated heart rate. Try a 3-minute breathing session."],
    riskHigh: ["⚠️ Fatigue risk detected. Defer non-critical tasks."],
    excellent: ["✨ Excellent wellness. You’re set for optimal performance."],
    neutral: ["📊 Metrics are stable. Maintain your routine."],
  }), []);

  const insights = useMemo(() => {
    const items: string[] = [];
    if (sleepHours > 0 && sleepHours < 6) items.push(pool.sleepLow[0]);
    if (heartRate > 85) items.push(pool.hrHigh[0]);
    if (score > 0 && score < 60) items.push(pool.riskHigh[0]);
    if (score > 80 && sleepHours > 7) items.push(pool.excellent[0]);
    if (items.length === 0) items.push(pool.neutral[0]);
    return items;
  }, [heartRate, sleepHours, score, pool]);

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-center gap-2 mb-4 text-left">
        <div className="bg-primary/20 p-2 rounded-lg"><Sparkles className="w-5 h-5 text-primary" /></div>
        <h3 className="text-lg font-semibold">AI Wellness Insights</h3>
        <Badge variant="secondary" className="ml-auto text-xs">Real-time Analysis</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
        <Badge variant="outline">HR {Math.round(heartRate)} bpm</Badge>
        <Badge variant="outline">Sleep {sleepHours.toFixed(1)} h</Badge>
        <Badge variant="outline">Score {Math.round(score)}</Badge>
      </div>

      <Separator className="my-3" />

      <div className="space-y-3">
        {insights.map((tip, idx) => (
          <div key={idx} className="bg-card p-3 rounded-lg border border-border text-left">
            <div className="text-sm">{tip}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};
