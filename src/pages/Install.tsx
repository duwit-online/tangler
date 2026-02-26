import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, CheckCircle, Share, Plus, MoreVertical, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto space-y-6"
      >
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Smartphone className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Install Plurr</h1>
          <p className="text-muted-foreground">Get the full app experience on your device</p>
        </div>

        {isInstalled ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="font-semibold text-lg">Already Installed!</h3>
              <p className="text-muted-foreground mt-2">Plurr is installed on your device. Open it from your home screen.</p>
              <Button onClick={() => navigate("/")} className="mt-4 gradient-primary text-primary-foreground">Continue to App</Button>
            </CardContent>
          </Card>
        ) : deferredPrompt ? (
          <Card>
            <CardHeader>
              <CardTitle>One-tap Install</CardTitle>
              <CardDescription>Install Plurr to your home screen for the best experience</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleInstall} className="w-full gradient-primary text-primary-foreground" size="lg">
                <Download className="w-5 h-5 mr-2" />Install Plurr
              </Button>
            </CardContent>
          </Card>
        ) : isIOS ? (
          <Card>
            <CardHeader>
              <CardTitle>Install on iPhone</CardTitle>
              <CardDescription>Follow these steps to add Plurr to your home screen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Share className="w-5 h-5 text-primary" /></div>
                <div><h4 className="font-medium">1. Tap Share</h4><p className="text-sm text-muted-foreground">Tap the share button at the bottom of Safari</p></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Plus className="w-5 h-5 text-primary" /></div>
                <div><h4 className="font-medium">2. Add to Home Screen</h4><p className="text-sm text-muted-foreground">Scroll down and tap "Add to Home Screen"</p></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><CheckCircle className="w-5 h-5 text-primary" /></div>
                <div><h4 className="font-medium">3. Confirm</h4><p className="text-sm text-muted-foreground">Tap "Add" to confirm and enjoy Plurr!</p></div>
              </div>
            </CardContent>
          </Card>
        ) : isAndroid ? (
          <Card>
            <CardHeader>
              <CardTitle>Install on Android</CardTitle>
              <CardDescription>Follow these steps to add Plurr to your home screen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><MoreVertical className="w-5 h-5 text-primary" /></div>
                <div><h4 className="font-medium">1. Tap Menu</h4><p className="text-sm text-muted-foreground">Tap the three-dot menu in Chrome</p></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Download className="w-5 h-5 text-primary" /></div>
                <div><h4 className="font-medium">2. Install App</h4><p className="text-sm text-muted-foreground">Tap "Install app" or "Add to Home screen"</p></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><CheckCircle className="w-5 h-5 text-primary" /></div>
                <div><h4 className="font-medium">3. Confirm</h4><p className="text-sm text-muted-foreground">Tap "Install" and find Plurr on your home screen!</p></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Install on Desktop</CardTitle>
              <CardDescription>Use the browser's install button in the address bar</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Look for the install icon (➕) in your browser's address bar to add Plurr to your desktop.</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Why Install?</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-primary" /><span>Quick access from your home screen</span></div>
            <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-primary" /><span>Push notifications for new matches</span></div>
            <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-primary" /><span>Works offline with cached content</span></div>
            <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-primary" /><span>Full-screen experience</span></div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Install;
