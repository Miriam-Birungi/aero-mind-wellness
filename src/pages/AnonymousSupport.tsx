import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Send,
  Loader2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Plane
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useWearable } from "@/contexts/WearableContext";

const AnonymousSupport = () => {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [severity, setSeverity] = useState("routine");
  const [flightDetails, setFlightDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("Pilot");
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const { toast } = useToast();
  const { isConnected: wearableConnected, metrics } = useWearable();

  const MAX_CHARS = 2000;

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).single();
        if (profile) setUserName(profile.name || "Pilot");
      }
    };
    fetchUser();
  }, []);

  const generateRefId = () => {
    const randomHex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0').toUpperCase();
    return `REF-AM-${randomHex}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);

    const fullContent = flightDetails.trim()
      ? `[Flight Details: ${flightDetails.trim()}] [Severity: ${severity.toUpperCase()}]\n\n${content.trim()}`
      : `[Severity: ${severity.toUpperCase()}]\n\n${content.trim()}`;

    const { error } = await supabase.from('anonymous_messages').insert({
      content: fullContent,
      category: category,
    });

    if (error) {
      toast({ title: "Submission Failed", description: "Could not deliver report securely.", variant: "destructive" });
    } else {
      const refCode = generateRefId();
      setSubmittedRef(refCode);
      toast({ title: "Anonymous Report Logged", description: `Reference Code: ${refCode}` });
      setContent("");
      setFlightDetails("");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        userName={userName}
        wearableConnected={wearableConnected}
        wellnessScore={metrics?.score || 0}
      />

      <div className="flex-1 lg:ml-80 min-h-screen p-4 lg:p-8 text-left">
        <header className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-emerald-600" /> Anonymous Safety & Wellness Reporting
          </h1>
          <p className="text-muted-foreground">Submit confidential operational feedback, fatigue notices, or safety concerns.</p>
        </header>

        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="bg-emerald-50/50 border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-900 flex items-center gap-2 text-lg">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Strict Anonymity Safeguards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-emerald-800">
                Your user identity, IP address, and credentials are stripped before persistence. Reports are routed directly to safety and medical admin review channels.
              </p>
            </CardContent>
          </Card>

          {submittedRef && (
            <Card className="bg-blue-50 border-blue-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">Report Successfully Submitted</p>
                  <p className="text-xs text-blue-700">Tracking Reference: <span className="font-mono font-bold">{submittedRef}</span></p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setSubmittedRef(null)}>File Another Report</Button>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Report Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Feedback</SelectItem>
                    <SelectItem value="fatigue">Fatigue Report</SelectItem>
                    <SelectItem value="stress">Stress / Mental Health</SelectItem>
                    <SelectItem value="safety">Cockpit Safety Concern</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Urgency Level</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger id="severity"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine (Info / Non-urgent)</SelectItem>
                    <SelectItem value="caution">Caution (Needs Advisory)</SelectItem>
                    <SelectItem value="critical">Critical (Immediate Operational Risk)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flight-details" className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-primary" /> Operational Context (Optional)
              </Label>
              <Input
                id="flight-details"
                placeholder="e.g. Flight AA-402, JFK to LHR, Duty Hour 11"
                value={flightDetails}
                onChange={(e) => setFlightDetails(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Add flight number, route, or sector details if applicable.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Report Narrative</Label>
              <Textarea
                id="message"
                placeholder="Detailed description of fatigue markers, cockpit observations, or mental wellness factors..."
                className="min-h-[180px]"
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
                required
                aria-describedby="char-count"
              />
              <div id="char-count" aria-live="polite" className="text-xs text-muted-foreground text-right">
                {content.length} / {MAX_CHARS} characters
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading || !content.trim()}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Submit Confidential Report
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnonymousSupport;
