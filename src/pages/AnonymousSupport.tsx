import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Send,
  Loader2,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useWearable } from "@/contexts/WearableContext";

const AnonymousSupport = () => {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("Pilot");
  const { toast } = useToast();
  const { isConnected: wearableConnected, metrics } = useWearable();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    const { error } = await supabase.from('anonymous_messages').insert({
      content: content.trim(),
      category: category,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to send report.", variant: "destructive" });
    } else {
      toast({ title: "Report Sent", description: "Your message has been shared anonymously." });
      setContent("");
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
          <h1 className="text-3xl font-bold">Anonymous Support</h1>
          <p className="text-muted-foreground">Share concerns or feedback securely and privately.</p>
        </header>

        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="bg-blue-50 border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-800 flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Confidentiality Guaranteed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700">Your identity is not stored with this message. Reports are reviewed by the wellness team within 24 hours to ensure cockpit safety and pilot well-being.</p>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Feedback</SelectItem>
                  <SelectItem value="fatigue">Fatigue Report</SelectItem>
                  <SelectItem value="stress">Stress/Mental Health</SelectItem>
                  <SelectItem value="safety">Safety Concern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your Message</label>
              <Textarea
                placeholder="Describe your situation or concern..."
                className="min-h-[200px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading || !content.trim()}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Submit Anonymous Report
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnonymousSupport;
