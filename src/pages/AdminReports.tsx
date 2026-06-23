import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  RefreshCw,
  Clock,
  Inbox,
  BarChart,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const AdminReports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
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
        toast({ title: "Access Denied", description: "Admin permissions required.", variant: "destructive" });
        navigate("/dashboard");
        return;
      }
      setIsAdmin(true);
      fetchData();
    };

    checkAdmin();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    const [msgRes, metricsRes] = await Promise.all([
      supabase.from('anonymous_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('wellness_metrics').select('score, recorded_at')
    ]);

    if (!msgRes.error) setMessages(msgRes.data || []);

    if (!metricsRes.error && metricsRes.data) {
      const data = metricsRes.data;
      const healthy = data.filter(d => d.score > 70).length;
      const stressed = data.filter(d => d.score >= 40 && d.score <= 70).length;
      const critical = data.filter(d => d.score < 40).length;

      setStats({
        distribution: [
          { name: 'Healthy', value: healthy, color: '#22c55e' },
          { name: 'Stressed', value: stressed, color: '#f97316' },
          { name: 'Critical', value: critical, color: '#ef4444' },
        ],
        totalMetrics: data.length
      });
    }
    setLoading(false);
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar userName="Admin" wearableConnected={false} wellnessScore={0} />

      <div className="flex-1 lg:ml-80 min-h-screen p-4 lg:p-8 text-left">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2"><Shield className="text-orange-600" /> Admin Analytics</h1>
            <p className="text-muted-foreground">Fleet-wide wellness monitoring</p>
          </div>
          <Button onClick={fetchData} disabled={loading}><RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh</Button>
        </header>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="messages">Reports ({messages.length})</TabsTrigger></TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card><CardHeader className="pb-2 text-sm">Total Reports</CardHeader><CardContent><p className="text-3xl font-bold">{messages.length}</p></CardContent></Card>
              <Card><CardHeader className="pb-2 text-sm">Active Metrics</CardHeader><CardContent><p className="text-3xl font-bold">{stats?.totalMetrics || 0}</p></CardContent></Card>
              <Card><CardHeader className="pb-2 text-sm">Fleet Status</CardHeader><CardContent><Badge className="bg-green-500">Operational</Badge></CardContent></Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Wellness Distribution</CardTitle></CardHeader>
                <CardContent className="h-64">
                  {stats && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {stats.distribution.map((entry: any, index: number) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {messages.slice(0, 5).map(m => (
                    <div key={m.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 text-sm truncate">{m.content}</div>
                      <Badge variant="outline" className="text-[10px] uppercase">{m.category}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-20"><Inbox className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><p>No reports found</p></div>
            ) : messages.map((msg) => (
              <Card key={msg.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="uppercase">{msg.category}</Badge>
                    <div className="flex items-center text-xs text-muted-foreground"><Clock className="w-3 h-3 mr-1" />{new Date(msg.created_at).toLocaleString()}</div>
                  </div>
                </CardHeader>
                <CardContent><p>{msg.content}</p></CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminReports;
