import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AlertBannerProps {
  score: number;
}

export const AlertBanner = ({ score }: AlertBannerProps) => {
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);

  useEffect(() => {
    if (score > 0 && score < 40) {
      setShowEmergencyDialog(true);
    }
  }, [score]);

  if (score === 0) return null;

  if (score > 70) {
    return (
      <Alert className="border-green-500 bg-green-50">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <AlertDescription className="text-green-700 ml-2 font-medium text-left">
          <strong>✅ You are fit to fly.</strong> Your wellness metrics are excellent.
        </AlertDescription>
      </Alert>
    );
  }

  if (score >= 40) {
    return (
      <Alert className="border-orange-500 bg-orange-50">
        <AlertTriangle className="h-5 w-5 text-orange-600" />
        <AlertDescription className="text-orange-700 ml-2 font-medium text-left">
          <strong>⚠️ You may be fatigued.</strong> Consider resting before your next flight.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Alert className="border-red-500 bg-red-50">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <AlertDescription className="text-red-700 ml-2 font-medium text-left">
          <strong>❌ Pilot may be unfit for flight.</strong> Please consult medical immediately.
        </AlertDescription>
      </Alert>

      <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
        <DialogContent className="border-red-500">
          <DialogHeader className="text-left">
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-6 h-6" />
              Critical Wellness Level
            </DialogTitle>
            <DialogDescription>Your wellness score is critical ({score}/100).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-left">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
              <h4 className="font-bold mb-2">Immediate Actions:</h4>
              <ul className="list-disc ml-4 space-y-1">
                <li>Do not operate aircraft.</li>
                <li>Contact aviation medical examiner.</li>
                <li>Inform flight operations.</li>
              </ul>
            </div>
            <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => setShowEmergencyDialog(false)}>I Understand</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
