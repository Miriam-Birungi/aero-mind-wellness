import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  RefreshCw,
  MessageSquare,
  Clock,
  User,
  Inbox
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const AdminReports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        toast({ title: "Access Denied", description: "You do not have admin permissions.", variant: "destructive" });
        navigate("/dashboard");
        return;
      }
      setIsAdmin(true);
      fetchMessages();
    };

    checkAdmin();
  }, [navigate]);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('anonymous_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to fetch reports.", variant: "destructive" });
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar userName="Admin" wearableConnected={false} wellnessScore={0} />

      <div className="flex-1 lg:ml-80 min-h-screen p-4 lg:p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="text-orange-500" /> Admin: Anonymous Reports
            </h1>
            <p className="text-muted-foreground">Review and manage pilot wellness reports</p>
          </div>
          <Button onClick={fetchMessages} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </header>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => <Card key={i} className="h-24 animate-pulse bg-muted" />)}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <Inbox className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-medium">No reports found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {messages.map((msg) => (
              <Card key={msg.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="uppercase">{msg.category}</Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">{msg.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
