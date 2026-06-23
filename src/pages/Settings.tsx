import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Bell,
  Globe,
  Phone,
  Camera,
  Check,
  Plane,
  Clock,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Palette,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { useWearable } from "@/contexts/WearableContext";
import { supabase } from "@/lib/supabase";

const Settings = () => {
  const [userName, setUserName] = useState("Pilot");
  const [userEmail, setUserEmail] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [dataSharing, setDataSharing] = useState(true);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const { toast } = useToast();
  const { isConnected: wearableConnected, metrics } = useWearable();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserName(profile.name || "Pilot");
        setUserEmail(user.email || "");
        setWorkerId(profile.worker_id || "");
      }
    };
    fetchUser();

    const savedPhoto = localStorage.getItem("aeromind_profile_photo");
    if (savedPhoto) setProfilePhoto(savedPhoto);
  }, []);

  useEffect(() => {
    let interval: number;
    if (isVideoCallOpen) {
      interval = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVideoCallOpen]);

  const handleUpdateProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('profiles').update({
      name: userName,
      worker_id: workerId,
    }).eq('id', user.id);

    if (error) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settings Saved", description: "Your profile has been updated in Supabase." });
    }
  };

  const handlePhotoUpload = () => {
    toast({ title: "Coming Soon", description: "Profile photo upload to Supabase Storage is coming soon." });
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startVideoCall = () => {
    setIsVideoCallOpen(true);
    setCallDuration(0);
    toast({ title: "Calling Medical Personnel", description: "Connecting to a secure video consultation..." });
  };

  const endVideoCall = () => {
    setIsVideoCallOpen(false);
    toast({ title: "Call Ended", description: `Consultation duration: ${formatCallDuration(callDuration)}` });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        userName={userName}
        wearableConnected={wearableConnected}
        wellnessScore={metrics?.score || 0}
        profilePhoto={profilePhoto}
      />

      <div className="flex-1 lg:ml-80 min-h-screen p-4 lg:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>Update your personal details and public profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                    {profilePhoto ? <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" /> : <User className="h-12 w-12 text-primary" />}
                  </div>
                  <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-md" onClick={handlePhotoUpload}><Camera className="h-4 w-4" /></Button>
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" value={userName} onChange={(e) => setUserName(e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="email">Email Address</Label><Input id="email" type="email" value={userEmail} disabled className="bg-muted" /></div>
                  <div className="space-y-2"><Label htmlFor="workerId">Worker ID</Label><Input id="workerId" value={workerId} onChange={(e) => setWorkerId(e.target.value.toUpperCase())} /></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2"><Bell className="h-5 w-5 text-blue-600" /><span>Notifications</span></CardTitle>
              <CardDescription>Configure how you receive alerts and reminders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5"><Label>Critical Health Alerts</Label><p className="text-sm text-gray-500">Urgent notifications when wellness score is critical</p></div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5"><Label>Reminder Alerts</Label><p className="text-sm text-gray-500">Daily mindfulness and breathing reminders</p></div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2"><Shield className="h-5 w-5 text-purple-600" /><span>Privacy & Data</span></CardTitle>
              <CardDescription>Control your data sharing and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5"><Label>Anonymous Data Sharing</Label><p className="text-sm text-gray-500">Help improve the app by sharing anonymous usage data</p></div>
                <Switch checked={dataSharing} onCheckedChange={setDataSharing} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5"><Label>Health Data Export</Label><p className="text-sm text-gray-500">Allow exporting your wellness data</p></div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2"><Palette className="h-5 w-5 text-orange-600" /><span>Appearance</span></CardTitle>
              <CardDescription>Customize the look and feel of your app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5"><Label>Dark Mode</Label><p className="text-sm text-gray-500">Switch to dark theme</p></div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleUpdateProfile}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
