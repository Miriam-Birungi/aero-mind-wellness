import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          worker_id: workerId,
        }
      }
    });

    if (error) {
      toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    toast({ title: "Account Created", description: "Please check your email for verification." });
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-lg"><UserPlus className="w-8 h-8 text-primary" /></div>
            <h1 className="text-2xl font-bold">Pilot Signup</h1>
          </div>

          <form onSubmit={handleSignup} className="space-y-4 text-left">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Company Email</Label>
              <Input id="email" type="email" placeholder="pilot@airline.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workerId">Worker ID</Label>
              <Input id="workerId" placeholder="ABC123" value={workerId} onChange={(e) => setWorkerId(e.target.value.toUpperCase())} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Create Account
            </Button>
          </form>

          <div><Button variant="link" asChild><Link to="/login">Already have an account? Log in</Link></Button></div>
        </div>
      </Card>
    </div>
  );
};

export default Signup;
