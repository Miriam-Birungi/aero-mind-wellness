import { Zap, RefreshCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const DemoControls = () => {
  return (
    <Card className="p-6 bg-secondary/50 border-2 border-dashed">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Backend Status</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">This project is now fully connected to a real Supabase backend.</p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => window.location.reload()}><RefreshCcw className="w-4 h-4 mr-2" /> Reload App</Button>
      </div>
    </Card>
  );
};
