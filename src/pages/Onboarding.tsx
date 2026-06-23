import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plane, ChevronRight, Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    airline: "",
    role: "first-officer",
    restHours: "7",
    compliance: "UCAA",
    metrics: {
      heartRate: true,
      sleep: true,
      stress: false,
      steps: true,
    },
  });

  const handleNext = async () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('onboarding_data').upsert({
        user_id: user.id,
        data: formData,
        completed_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Onboarding failed:", error.message);
        setLoading(false);
        return;
      }

      localStorage.setItem("aeromind_onboarded", "true");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= s ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
              {step > s ? <Check className="w-5 h-5" /> : s}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="text-center space-y-6">
            <div className="bg-gradient-primary text-white p-6 rounded-lg inline-block"><Plane className="w-16 h-16" /></div>
            <h1 className="text-4xl font-bold">Welcome to AeroMind</h1>
            <p className="text-lg text-muted-foreground">Your Personal Mental Health Assistant for Pilots</p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Tell us about yourself</h2>
            <div className="space-y-4">
              <div><Label>Airline</Label><Input value={formData.airline} onChange={(e) => setFormData({ ...formData, airline: e.target.value })} /></div>
              <div>
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="captain">Captain</SelectItem>
                    <SelectItem value="first-officer">First Officer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center space-y-6">
            <div className="bg-green-100 text-green-600 p-6 rounded-lg inline-block"><Check className="w-16 h-16" /></div>
            <h2 className="text-3xl font-bold">Setup Complete!</h2>
            <p>Welcome aboard! Let's start monitoring your wellness via Supabase.</p>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1}>Back</Button>
          <Button onClick={handleNext} disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : (step === 5 ? "Complete Setup" : "Next")}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;
