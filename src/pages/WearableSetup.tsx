import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Watch, Loader2, Check, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useWearable } from "@/contexts/WearableContext";

const WearableSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isConnected: connected, isConnecting: connecting, connectWearable, disconnectWearable } = useWearable();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = () => {
    connectWearable();
    toast({ title: "Connecting...", description: "Linking your smartwatch via Bluetooth." });
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  const handleSkip = () => {
    disconnectWearable();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className={`w-full max-w-lg p-8 transition-all ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center space-y-6">
          <div className={`mx-auto inline-block p-6 rounded-full ${connected ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary"}`}>
            {connected ? <Check className="w-16 h-16" /> : <Watch className="w-16 h-16" />}
          </div>

          <div>
            <h1 className="text-3xl font-bold">{connected ? "Connected!" : "Link Wearable"}</h1>
            <p className="text-muted-foreground">{connected ? "Redirecting..." : "Sync your smartwatch to enable real-time health monitoring."}</p>
          </div>

          {!connected && !connecting && (
            <div className="space-y-3">
              <Card className="p-4 border-2 border-primary/20 flex items-center gap-3 text-left">
                <Smartphone className="w-8 h-8 text-primary" />
                <div><h3 className="font-semibold">Apple Watch</h3><p className="text-sm text-muted-foreground">Detected nearby</p></div>
              </Card>
            </div>
          )}

          {connecting && <div className="py-8"><Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" /><p>Connecting...</p></div>}

          {!connected && (
            <div className="space-y-3 pt-4">
              <Button onClick={handleConnect} className="w-full" size="lg" disabled={connecting}>Connect Device</Button>
              <Button onClick={handleSkip} variant="ghost" className="w-full" disabled={connecting}>Skip</Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Connected metrics are stored securely in Supabase.</p>
        </div>
      </Card>
    </div>
  );
};

export default WearableSetup;
