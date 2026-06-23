import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plane,
  Wind,
  RefreshCw,
  Watch,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const [mounted, setMounted] = useState(false);
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

    setMounted(true);
  }, [navigate]);

  const refreshData = async () => {
    // Sync some random but "real" looking data to DB
    await syncData({
      heartRate: 60 + Math.floor(Math.random() * 30),
      sleepHours: 5 + Math.random() * 4,
      steps: 2000 + Math.floor(Math.random() * 8000)
    });

    toast({
      title: "Data Refreshed",
      description: "Wearable data has been updated from Supabase.",
    });
  };

  const handleMoodSubmit = async (mood: number) => {
    // For now, mood just triggers a toast, but we could sync it to DB too
    toast({
      title: "Mood Recorded",
      description: "Thank you for checking in.",
    });
  };

  const handleConnectWearable = () => {
    connectWearable();
    toast({
      title: "Wearable Connected!",
      description: "Successfully connected to your smartwatch.",
    });
  };

  if (loadingMetrics && !metrics) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  // Fallback if no metrics yet
  const displayData = metrics || {
    score: 0,
    heartRate: 0,
    sleepHours: 0,
    steps: 0,
    history: [],
    insights: ["Connect your wearable to see insights."]
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
                <Button onClick={refreshData} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <RefreshCw className="w-4 h-4 mr-2" /> Sync
                </Button>
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
                  <p className="text-muted-foreground max-w-md mx-auto">Start monitoring your real metrics via Supabase.</p>
                </div>
                {connectingWearable ? <Loader2 className="animate-spin mx-auto" /> : (
                  <Button onClick={handleConnectWearable} size="lg" className="bg-gradient-primary"><Watch className="w-4 h-4 mr-2" /> Connect</Button>
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
