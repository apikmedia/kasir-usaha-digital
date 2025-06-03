
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, X } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";
import { useState } from "react";

const InstallPrompt = () => {
  const { isInstallable, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isDismissed) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Install Kasir Digital</CardTitle>
            <CardDescription>
              Install aplikasi untuk akses lebih cepat
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button onClick={installApp} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Install Aplikasi
        </Button>
      </CardContent>
    </Card>
  );
};

export default InstallPrompt;
