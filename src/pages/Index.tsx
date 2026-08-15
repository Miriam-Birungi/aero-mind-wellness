import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plane,
  Wind,
  PlusCircle,
  Watch,
  Loader2,
  Activity,
  Moon,
  Footprints
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WellnessScore } from "@/components/WellnessScore";
import { WearableData } from "@/components/WearableData";
import { MoodCheckIn } from "@/components/MoodCheckIn";
import { AlertBanner } from "@/components/AlertBanner";
import { BreathingExercise } from "@/components/BreathingExercise";
import { HistoryChart } from "@/components/HistoryChart";
import { AIInsights } from "@/components/AIInsights";
import { GamificationBadges } from "@/components/GamificationBadges";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { useWearable } from "@/contexts/WearableContext";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const navigate = useNavigate();
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [userName, setUserName] = useState("Pilot");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [logDialogOpen, setLogDialogOpen] = useState(false);

  // Real metric entry state
  const [inputHeartRate, setInputHeartRate] = useState("72");
  const [inputSleep, setInputSleep] = useState("7.5");
  const [inputSteps, setInputSteps] = useState("6500");
  const [submittingMetric, setSubmittingMetric] = useState(false);

  const { toast } = useToast();
  const {
    isConnected: wearableConnected,
    isConnecting: connectingWearable,
    connectWearable,
    metrics,
    loadingMetrics,
    syncData
  } = useWearable();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setUserName(profile.name || "Pilot");
      }
    };

    checkUser();

    const savedPhoto = localStorage.getItem("aeromind_profile_photo");
    if (savedPhoto) setProfilePhoto(savedPhoto);
  }, [navigate]);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hr = parseFloat(inputHeartRate);
    const sleep = parseFloat(inputSleep);
    const steps = parseInt(inputSteps, 10);

    if (isNaN(hr) || isNaN(sleep) || isNaN(steps)) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid numeric biometric data.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingMetric(true);
    try {
      await syncData({
        heartRate: hr,
        sleepHours: sleep,
        steps: steps,
      });

      toast({
        title: "Metrics Logged",
        description: "Biometric reading successfully stored in Supabase.",
      });
      setLogDialogOpen(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to record metrics.",
        variant: "destructive",
      });
    } finally {
      setSubmittingMetric(false);
    }
  };

  const handleMoodSubmit = async () => {
    toast({
      title: "Mood Recorded",
      description: "Thank you for checking in.",
    });
  };

  const handleConnectWearable = async () => {
    await connectWearable();
    toast({
      title: "Wearable Device Linked",
      description: "Successfully configured biometric sensor synchronization.",
    });
  };

  if (loadingMetrics && !metrics) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  const displayData = metrics || {
    score: 0,
    heartRate: 0,
    sleepHours: 0,
    steps: 0,
    history: [],
    insights: ["Log your health metrics or link a wearable device to calculate insights."]
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        userName={userName} 
        wearableConnected={wearableConnected} 
        wellnessScore={displayData.score}
        profilePhoto={profilePhoto}
      />

      <div className="flex-1 lg:ml-80 min-h-screen">
        <header className="bg-gradient-primary text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg"><Plane className="w-8 h-8" /></div>
                <div>
                  <h1 className="text-3xl font-bold">AeroMind</h1>
                  <p className="text-white/80 text-sm">Welcome back, {userName}!</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={() => setBreathingOpen(true)} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Wind className="w-4 h-4 mr-2" /> Breathing
                </Button>

                <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <PlusCircle className="w-4 h-4 mr-2" /> Log Metrics
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Log Biometric Metrics</DialogTitle>
                      <DialogDescription>
                        Enter your current physical readings to save to your secure profile.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleLogSubmit} className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label htmlFor="hr-input" className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-red-500" /> Heart Rate (bpm)
                        </Label>
                        <Input
                          id="hr-input"
                          type="number"
                          value={inputHeartRate}
                          onChange={(e) => setInputHeartRate(e.target.value)}
                          placeholder="e.g. 68"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sleep-input" className="flex items-center gap-2">
                          <Moon className="w-4 h-4 text-blue-500" /> Sleep Duration (hours)
                        </Label>
                        <Input
                          id="sleep-input"
                          type="number"
                          step="0.1"
                          value={inputSleep}
                          onChange={(e) => setInputSleep(e.target.value)}
                          placeholder="e.g. 7.5"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="steps-input" className="flex items-center gap-2">
                          <Footprints className="w-4 h-4 text-green-500" /> Daily Steps
                        </Label>
                        <Input
                          id="steps-input"
                          type="number"
                          value={inputSteps}
                          onChange={(e) => setInputSteps(e.target.value)}
                          placeholder="e.g. 8000"
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full mt-4" disabled={submittingMetric}>
                        {submittingMetric ? <Loader2 className="animate-spin mr-2" /> : null} Save Metrics
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8 space-y-8 max-w-7xl">
          <AlertBanner score={displayData.score} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><WellnessScore score={displayData.score} /></div>
            <div><MoodCheckIn onMoodSubmit={handleMoodSubmit} /></div>
          </div>

          {wearableConnected ? (
            <WearableData
              heartRate={displayData.heartRate}
              sleepHours={displayData.sleepHours}
              steps={displayData.steps}
            />
          ) : (
            <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="space-y-4">
                <div className="bg-primary/20 p-4 rounded-full inline-block"><Watch className="w-12 h-12 text-primary" /></div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Connect Your Wearable</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">Start monitoring real metrics via Bluetooth or health sync integrations.</p>
                </div>
                {connectingWearable ? <Loader2 className="animate-spin mx-auto" /> : (
                  <Button onClick={handleConnectWearable} size="lg" className="bg-gradient-primary"><Watch className="w-4 h-4 mr-2" /> Connect Wearable</Button>
                )}
              </div>
            </Card>
          )}

          <AIInsights
            heartRate={displayData.heartRate}
            sleepHours={displayData.sleepHours}
            score={displayData.score}
          />

          <GamificationBadges history={displayData.history} score={displayData.score} />
          <HistoryChart history={displayData.history} />
        </main>

        <BreathingExercise isOpen={breathingOpen} onClose={() => setBreathingOpen(false)} />
        <footer className="bg-secondary border-t border-border mt-12 py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">AeroMind © 2025 · Real-time Supabase Backend</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
