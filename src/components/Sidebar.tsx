import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Settings, 
  Watch, 
  User, 
  Phone, 
  Menu, 
  X,
  Plane,
  Heart,
  Moon,
  Footprints,
  BookOpen,
  LogOut,
  Shield,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

interface SidebarProps {
  userName: string;
  wearableConnected: boolean;
  wellnessScore: number;
  profilePhoto?: string | null;
}

export const Sidebar = ({ userName, wearableConnected, wellnessScore, profilePhoto }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (data?.role === 'admin') setIsAdmin(true);
      }
    };
    checkRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate("/login");
  };

  const getWellnessStatus = () => {
    if (wellnessScore === 0) return { text: "No Data", color: "bg-gray-400" };
    if (wellnessScore > 70) return { text: "Healthy", color: "bg-green-500" };
    if (wellnessScore >= 40) return { text: "Stressed", color: "bg-orange-500" };
    return { text: "Critical", color: "bg-red-500" };
  };

  const status = getWellnessStatus();

  return (
    <>
      <Button variant="ghost" size="sm" className="lg:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(true)}>
        <Menu className="w-5 h-5" />
      </Button>

      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}

      <div className={`fixed left-0 top-0 h-full w-80 bg-card border-r border-border z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full text-left">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-lg"><Plane className="w-6 h-6 text-primary" /></div>
                <div>
                  <h2 className="text-xl font-bold">AeroMind</h2>
                  <p className="text-sm text-muted-foreground">Pilot Wellness</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsOpen(false)}><X className="w-4 h-4" /></Button>
            </div>
          </div>

          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {profilePhoto ? <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-primary" />}
              </div>
              <div>
                <p className="font-medium">{userName}</p>
                <p className="text-sm text-muted-foreground">{isAdmin ? 'Wellness Admin' : 'Pilot'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${status.color}`} />
              <span className="text-sm font-medium">{status.text} {wellnessScore > 0 ? `(${wellnessScore}/100)` : ''}</span>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-2">
            <Button variant={location.pathname === "/dashboard" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => navigate("/dashboard")}><Home className="w-4 h-4 mr-3" /> Dashboard</Button>
            <Button variant={location.pathname === "/anonymous-support" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => navigate("/anonymous-support")}><MessageSquare className="w-4 h-4 mr-3" /> Anonymous Support</Button>
            {isAdmin && <Button variant={location.pathname === "/admin/reports" ? "secondary" : "ghost"} className="w-full justify-start text-orange-600" onClick={() => navigate("/admin/reports")}><Shield className="w-4 h-4 mr-3" /> Admin Analytics</Button>}
            <Button variant={location.pathname === "/resources" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => navigate("/resources")}><BookOpen className="w-4 h-4 mr-3" /> Resources</Button>
            <Button variant={location.pathname === "/settings" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => navigate("/settings")}><Settings className="w-4 h-4 mr-3" /> Settings</Button>
          </div>

          <div className="p-4 border-t border-border">
            <Card className="p-4 text-left">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><Watch className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium">Wearable</span></div>
                <Badge variant={wearableConnected ? "default" : "secondary"}>{wearableConnected ? "Connected" : "Disconnected"}</Badge>
              </div>
              {wearableConnected ? (
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><Heart className="w-3 h-3" /><span>Heart Rate: Active</span></div>
                  <div className="flex items-center gap-2"><Moon className="w-3 h-3" /><span>Sleep: Tracking</span></div>
                  <div className="flex items-center gap-2"><Footprints className="w-3 h-3" /><span>Steps: Monitoring</span></div>
                </div>
              ) : <p className="text-xs text-muted-foreground">Connect your wearable to start tracking</p>}
            </Card>
          </div>

          <div className="p-4 border-t border-border space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => alert("Connecting to aviation medical examiner...")}><Phone className="w-4 h-4 mr-2" /> Contact Medical</Button>
            <Button variant="destructive" size="sm" className="w-full justify-start" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" /> Logout</Button>
          </div>
        </div>
      </div>
    </>
  );
};
