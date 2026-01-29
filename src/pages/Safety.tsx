import { ChevronLeft, Shield, AlertTriangle, Heart, Users, Eye, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const safetyTips = [
  {
    icon: Users,
    title: "Keep it on the app",
    description: "Get to know someone through messages before sharing personal contact info."
  },
  {
    icon: Eye,
    title: "Protect your info",
    description: "Never share financial information or send money to someone you haven't met."
  },
  {
    icon: Heart,
    title: "Meet in public",
    description: "For first meetings, choose a well-populated, public place and tell a friend your plans."
  },
  {
    icon: Shield,
    title: "Trust your instincts",
    description: "If something feels off, it probably is. Don't hesitate to end contact."
  },
];

const Safety = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-serif font-bold">Safety Center</h1>
        </div>
      </header>

      <main className="p-4 pb-24 max-w-2xl mx-auto space-y-6">
        {/* Hero */}
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Your Safety Matters</h2>
          <p className="text-sm text-muted-foreground">
            We're committed to keeping our community safe. Here's how you can protect yourself.
          </p>
        </div>

        {/* Safety Tips */}
        <div className="grid gap-3">
          {safetyTips.map((tip, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <tip.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{tip.title}</h3>
                  <p className="text-xs text-muted-foreground">{tip.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reporting */}
        <Card className="border-destructive/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              Report a Problem
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground mb-3">
              If you experience harassment, threats, or any concerning behavior, please report it immediately.
            </p>
            <Button variant="destructive" size="sm" className="w-full">
              <Ban className="w-4 h-4 mr-2" />
              Report an Issue
            </Button>
          </CardContent>
        </Card>

        {/* Community Guidelines */}
        <div className="prose prose-sm dark:prose-invert">
          <h3>Community Guidelines</h3>
          <p>To keep Tangle a positive experience for everyone:</p>
          <ul className="text-sm">
            <li><strong>Be respectful</strong> – Treat others as you'd want to be treated</li>
            <li><strong>Be authentic</strong> – Use real photos and accurate information</li>
            <li><strong>No harassment</strong> – Unwanted messages or behavior aren't tolerated</li>
            <li><strong>No hate speech</strong> – Discrimination of any kind is prohibited</li>
            <li><strong>No spam or scams</strong> – Commercial activity isn't allowed</li>
          </ul>
          <p className="text-xs text-muted-foreground">
            Violations may result in account suspension or permanent ban.
          </p>
        </div>

        {/* Emergency */}
        <Card className="bg-amber-500/10 border-amber-500/50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2">In an Emergency</h3>
            <p className="text-xs text-muted-foreground">
              If you or someone you know is in immediate danger, please contact local emergency services right away.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Safety;
