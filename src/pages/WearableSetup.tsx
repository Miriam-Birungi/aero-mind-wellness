import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Watch, Loader2, Check, Smartphone, Activity, Radio } from "lucide-react";
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

  const handleConnect = async () => {
    toast({ title: "Scanning...", description: "Initiating Web Bluetooth sensor scan." });
    await connectWearable();
    toast({ title: "Connected", description: "Linked sensor device successfully." });
    navigate("/dashboard");
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
            <h1 className="text-3xl font-bold">{connected ? "Connected!" : "Link Biometric Device"}</h1>
            <p className="text-muted-foreground">{connected ? "Redirecting..." : "Connect your smartwatch or Bluetooth HR monitor for real-time monitoring."}</p>
          </div>

          {!connected && !connecting && (
            <div className="space-y-3">
              <Card className="p-4 border-2 border-primary/20 flex items-center gap-3 text-left hover:border-primary transition-colors cursor-pointer" onClick={handleConnect}>
                <Radio className="w-8 h-8 text-primary animate-pulse" />
                <div>
                  <h3 className="font-semibold">Web Bluetooth BLE HR Sensor</h3>
                  <p className="text-sm text-muted-foreground">Direct connection to chest strap or smartwatch</p>
                </div>
              </Card>

              <Card className="p-4 border flex items-center gap-3 text-left">
                <Smartphone className="w-8 h-8 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">Apple Health / Health Connect</h3>
                  <p className="text-sm text-muted-foreground">Sync via mobile companion application</p>
                </div>
              </Card>

              <Card className="p-4 border flex items-center gap-3 text-left">
                <Activity className="w-8 h-8 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">Garmin & Oura Cloud REST API</h3>
                  <p className="text-sm text-muted-foreground">Configure webhook sync in Settings</p>
                </div>
              </Card>
            </div>
          )}

          {connecting && <div className="py-8"><Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" /><p>Connecting device...</p></div>}

          {!connected && (
            <div className="space-y-3 pt-4">
              <Button onClick={handleConnect} className="w-full" size="lg" disabled={connecting}>
                {connecting ? <Loader2 className="animate-spin mr-2" /> : null} Connect BLE Device
              </Button>
              <Button onClick={handleSkip} variant="ghost" className="w-full" disabled={connecting}>Skip For Now</Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Biometric metrics are securely saved in your encrypted Supabase profile.</p>
        </div>
      </Card>
    </div>
  );
};

export default WearableSetup;
