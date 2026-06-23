import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, HeartPulse, Brain, PlaneTakeoff, ShieldCheck, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

const Landing = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setIsOnboarded(localStorage.getItem("aeromind_onboarded") === "true");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getPrimaryCta = () => {
    if (session && isOnboarded) return { label: "Open Dashboard", to: "/dashboard" };
    if (session && !isOnboarded) return { label: "Continue Onboarding", to: "/onboarding" };
    return { label: "Get Started", to: "/signup" };
  };

  const cta = getPrimaryCta();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.15),_transparent_40%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--secondary)/0.35)_100%)] text-foreground">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/15 p-2">
              <PlaneTakeoff className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold leading-none">AeroMind</p>
              <p className="text-xs text-muted-foreground">Pilot Wellness Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!session && (
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
            )}
            <Button asChild>
              <Link to={cta.to}>{cta.label}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-16 pt-10">
        <section className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16 text-left">
          <div className="space-y-6">
            <Badge variant="secondary" className="w-fit">Built for high-stakes flight teams</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              The AeroMind Story:
              <span className="block text-primary">Helping pilots stay mentally fit to fly</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              AeroMind makes mental wellness operationally visible.
              Our platform gives pilots practical support through wearable synchronization with Supabase and real-time insights.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={() => navigate(cta.to)}>
                {cta.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/resources")}>
                Explore Resources
              </Button>
            </div>
          </div>

          <Card className="border-primary/25 bg-gradient-to-br from-primary/8 to-background p-6 shadow-lg">
            <div className="space-y-5">
              <h2 className="text-xl font-semibold">Your Supabase-powered Journey</h2>
              <div className="space-y-4">
                {[
                  { title: "1. Create account", body: "Secure Auth with Supabase." },
                  { title: "2. Complete onboarding", body: "Save your profile and compliance context." },
                  { title: "3. Real-time Dashboard", body: "Sync metrics directly to the DB." },
                  { title: "4. Data Privacy", body: "Role-based access and row-level security." },
                ].map((step) => (
                  <div key={step.title} className="flex items-start gap-3 rounded-lg border border-border/70 bg-card/80 p-3">
                    <ChevronRight className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-14 grid gap-5 md:grid-cols-3">
          <Card className="border-border/70 p-6 text-left">
            <div className="mb-3 w-fit rounded-md bg-primary/15 p-2"><HeartPulse className="h-5 w-5 text-primary" /></div>
            <h3 className="text-lg font-semibold">Supabase Metrics</h3>
            <p className="mt-2 text-sm text-muted-foreground">No more random numbers. Track real heart rate trends and sleep from your wearable.</p>
          </Card>
          <Card className="border-border/70 p-6 text-left">
            <div className="mb-3 w-fit rounded-md bg-primary/15 p-2"><Brain className="h-5 w-5 text-primary" /></div>
            <h3 className="text-lg font-semibold">PostgreSQL Analytics</h3>
            <p className="mt-2 text-sm text-muted-foreground">Translate wellness signals into practical steps using historical data analysis.</p>
          </Card>
          <Card className="border-border/70 p-6 text-left">
            <div className="mb-3 w-fit rounded-md bg-primary/15 p-2"><ShieldCheck className="h-5 w-5 text-primary" /></div>
            <h3 className="text-lg font-semibold">Secure & Anonymous</h3>
            <p className="mt-2 text-sm text-muted-foreground">Anonymous reporting via Supabase Realtime for pilot safety and confidentiality.</p>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Landing;
