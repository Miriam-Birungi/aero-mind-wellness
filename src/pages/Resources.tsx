import { useState, useEffect } from "react";
import { 
  Phone, 
  Mail,
  MessageSquare,
  ExternalLink, 
  FileText,
  Download,
  Search,
  BookOpen,
  LifeBuoy,
  Stethoscope,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { useWearable } from "@/contexts/WearableContext";
import { supabase } from "@/lib/supabase";

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userName, setUserName] = useState("Pilot");
  const { toast } = useToast();
  const { isConnected: wearableConnected, metrics } = useWearable();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        if (profile) setUserName(profile.name || "Pilot");
      }
    };
    fetchUser();
  }, []);

  const handleContact = (type: string) => {
    toast({ title: "Connecting...", description: `Initiating ${type} contact with support personnel.` });
  };

  const handleDownload = (resource: string) => {
    toast({ title: "Download Started", description: `${resource} is being downloaded to your device.` });
  };

  const crisisLines = [
    { name: "Mental Health Uganda", phone: "0800 21 21 21", desc: "24/7 confidential counseling" },
    { name: "StrongMinds Uganda", phone: "+256 800 200 600", desc: "Mental health support" },
    { name: "Befrienders Kenya", phone: "+254 722 178 177", desc: "Emotional support" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        userName={userName}
        wearableConnected={wearableConnected}
        wellnessScore={metrics?.score || 0}
      />

      <div className="flex-1 lg:ml-80 min-h-screen p-4 lg:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Resources & Support</h1>
          <p className="text-muted-foreground">Access help, self-care tools, and educational materials</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {crisisLines.map((line) => (
            <Card key={line.name} className="border-critical/20 bg-critical/5 text-left">
              <CardHeader className="pb-2">
                <CardTitle className="text-critical flex items-center gap-2 text-lg"><Phone className="h-5 w-5" /> {line.name}</CardTitle>
                <CardDescription>{line.desc}</CardDescription>
              </CardHeader>
              <CardContent><Button className="w-full bg-critical hover:bg-critical/90" onClick={() => handleContact('phone')}>{line.phone}</Button></CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList><TabsTrigger value="all">All Resources</TabsTrigger><TabsTrigger value="guides">Guides</TabsTrigger><TabsTrigger value="contacts">Contacts</TabsTrigger></TabsList>
            <div className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search resources..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          </div>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="text-left"><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-600" /> Self-Care Guides</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: "Managing Flight Fatigue", type: "PDF Guide", size: "2.4 MB" },
                    { title: "Sleep Hygiene for Pilots", type: "Article", size: "5 min read" },
                  ].map((guide) => (
                    <div key={guide.title} className="flex items-center justify-between p-3 rounded-lg border hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-muted-foreground" /><div><p className="font-medium">{guide.title}</p><p className="text-xs text-muted-foreground">{guide.type} • {guide.size}</p></div></div>
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(guide.title)}><Download className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-left"><CardTitle className="flex items-center gap-2"><Stethoscope className="h-5 w-5 text-green-600" /> Professional Help</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-4"><div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center"><Video className="h-6 w-6 text-primary" /></div><div className="text-left"><p className="font-semibold">Video Consultation</p><p className="text-sm text-muted-foreground">Secure call with a specialist</p></div></div>
                    <Button onClick={() => handleContact('video')}>Start Call</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Resources;
