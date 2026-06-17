import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface MoodCheckInProps {
  onMoodSubmit: (mood: number) => void;
}

const moodEmojis = ["😫", "😟", "😐", "🙂", "😊"];

export const MoodCheckIn = ({ onMoodSubmit }: MoodCheckInProps) => {
  const [mood, setMood] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    onMoodSubmit(mood);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  const getMoodEmoji = (value: number) => {
    if (value <= 2) return moodEmojis[0];
    if (value <= 4) return moodEmojis[1];
    if (value <= 6) return moodEmojis[2];
    if (value <= 8) return moodEmojis[3];
    return moodEmojis[4];
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">How are you feeling today?</h3>
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-2">{getMoodEmoji(mood)}</div>
          <p className="text-sm text-muted-foreground">{mood <= 3 ? "Stressed" : mood <= 6 ? "Okay" : "Great"}</p>
        </div>
        <div className="px-2">
          <Slider value={[mood]} onValueChange={([v]) => setMood(v)} max={10} min={1} step={1} />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground"><span>Stressed</span><span>Excellent</span></div>
        </div>
        <Button onClick={handleSubmit} className="w-full" disabled={submitted}>{submitted ? "Recorded ✓" : "Submit Check-in"}</Button>
      </div>
    </Card>
  );
};
