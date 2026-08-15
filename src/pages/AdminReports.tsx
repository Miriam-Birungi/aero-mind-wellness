import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  RefreshCw,
  Clock,
  Inbox,
  AlertTriangle,
  Download,
  Filter,
  CheckCircle,
  Activity,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface AnonymousMessage {
  id: number;
  content: string;
  category: string;
  created_at: string;
}

interface ActiveAlert {
  id: number;
  user_id: string;
  rule_type: string;
  triggered_at: string;
  resolved: boolean;
}

interface DistributionStat {
  name: string;
  value: number;
  color: string;
}

interface FleetStats {
  distribution: DistributionStat[];
  totalMetrics: number;
  avgScore: number;
  criticalCount: number;
}

const AdminReports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<AnonymousMessage[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const [stats, setStats] = useState<FleetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [msgRes, metricsRes, alertsRes] = await Promise.all([
      supabase.from('anonymous_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('wellness_metrics').select('score, recorded_at'),
      supabase.from('active_alerts').select('*').order('triggered_at', { ascending: false })
    ]);

    if (!msgRes.error) setMessages(msgRes.data || []);
    if (!alertsRes.error) setActiveAlerts(alertsRes.data || []);

    if (!metricsRes.error && metricsRes.data) {
      const data = metricsRes.data;
      const healthy = data.filter(d => d.score > 70).length;
      const stressed = data.filter(d => d.score >= 40 && d.score <= 70).length;
      const critical = data.filter(d => d.score < 40).length;
      const totalScoreSum = data.reduce((acc, curr) => acc + (curr.score || 0), 0);
      const avgScore = data.length > 0 ? Math.round(totalScoreSum / data.length) : 85;

      setStats({
        distribution: [
          { name: 'Optimal', value: healthy || 1, color: '#22c55e' },
          { name: 'Caution', value: stressed, color: '#f97316' },
          { name: 'Critical', value: critical, color: '#ef4444' },
        ],
        totalMetrics: data.length,
        avgScore: avgScore,
        criticalCount: critical
      });
    }
    setLoading(false);
  }, []);

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
  }, [navigate, toast, fetchData]);

  const exportCSV = () => {
    if (messages.length === 0) {
      toast({ title: "No Data", description: "No messages available to export." });
      return;
    }

    const headers = ["ID", "Category", "Content", "Created At"];
    const rows = messages.map(m => [
      m.id,
      `"${m.category}"`,
      `"${m.content.replace(/"/g, '""')}"`,
      `"${new Date(m.created_at).toLocaleString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AeroMind_Anonymous_Reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Export Complete", description: "Anonymous report CSV generated." });
  };

  const filteredMessages = messages.filter(m => {
    if (categoryFilter === "all") return true;
    return m.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar userName="Admin Overseer" wearableConnected={false} wellnessScore={stats?.avgScore || 85} />

      <div className="flex-1 lg:ml-80 min-h-screen p-4 lg:p-8 text-left">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="text-orange-600 w-8 h-8" /> Admin Operational Analytics
            </h1>
            <p className="text-muted-foreground">Fleet wellness monitoring & compliance alert management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
            <Button onClick={fetchData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        </header>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="messages">Reports ({messages.length})</TabsTrigger>
            <TabsTrigger value="alerts">Compliance Alerts ({activeAlerts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2 text-sm text-muted-foreground">Total Reports</CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{messages.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Anonymous safety submissions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 text-sm text-muted-foreground">Fleet Avg Wellness</CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-emerald-600">{stats?.avgScore || 85} / 100</p>
                  <p className="text-xs text-muted-foreground mt-1">Calculated rest & health score</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 text-sm text-muted-foreground">Compliance Alerts</CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-amber-600">{activeAlerts.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">FAA / UCAA breach triggers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 text-sm text-muted-foreground">Fleet Status</CardHeader>
                <CardContent>
                  <Badge className="bg-emerald-500 text-white font-semibold">Operational</Badge>
                  <p className="text-xs text-muted-foreground mt-2">Active telemetry synced</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fleet Wellness Score Breakdown</CardTitle>
                  <CardDescription>Aggregate condition distribution of active pilots</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  {stats && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                          {stats.distribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Anonymous Submissions</CardTitle>
                  <CardDescription>Latest pilot fatigue and safety messages</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No messages submitted yet.</p>
                  ) : (
                    messages.slice(0, 5).map(m => (
                      <div key={m.id} className="flex items-center gap-3 p-3 rounded-md bg-muted/40 hover:bg-muted transition-colors">
                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 text-sm truncate">{m.content}</div>
                        <Badge variant="outline" className="text-[10px] uppercase shrink-0">{m.category}</Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <div className="flex items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by Category:</span>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="fatigue">Fatigue</SelectItem>
                    <SelectItem value="stress">Stress</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <span className="text-xs text-muted-foreground">Showing {filteredMessages.length} reports</span>
            </div>

            {filteredMessages.length === 0 ? (
              <div className="text-center py-20 border rounded-lg bg-card"><Inbox className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No reports matching selected filter.</p></div>
            ) : filteredMessages.map((msg) => (
              <Card key={msg.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="uppercase font-semibold">{msg.category}</Badge>
                    <div className="flex items-center text-xs text-muted-foreground"><Clock className="w-3 h-3 mr-1" />{new Date(msg.created_at).toLocaleString()}</div>
                  </div>
                </CardHeader>
                <CardContent><p className="text-sm whitespace-pre-wrap">{msg.content}</p></CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            {activeAlerts.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold">No Compliance Violations Triggered</p>
                <p className="text-xs text-muted-foreground">All logged flight rest metrics adhere to FAA and UCAA limits.</p>
              </Card>
            ) : (
              activeAlerts.map((alert) => (
                <Card key={alert.id} className="border-amber-200 bg-amber-50/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <CardTitle className="text-base text-amber-900 font-semibold">{alert.rule_type} Rest Threshold Breach</CardTitle>
                      </div>
                      <Badge variant={alert.resolved ? "secondary" : "destructive"}>
                        {alert.resolved ? "Resolved" : "Active Violation"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Triggered at: {new Date(alert.triggered_at).toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminReports;
