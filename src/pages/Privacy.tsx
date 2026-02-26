import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-serif font-bold">Privacy Policy</h1>
        </div>
      </header>

      <main className="p-4 pb-24 max-w-2xl mx-auto prose prose-sm dark:prose-invert">
        <p className="text-muted-foreground text-sm">Last updated: January 2026</p>

        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly to us, such as:</p>
        <ul>
          <li>Account information (name, email, phone number)</li>
          <li>Profile information (photos, bio, interests, location)</li>
          <li>Communications between you and other users</li>
          <li>Information about your interactions with the app</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Match you with other users based on your preferences</li>
          <li>Send you notifications about matches and messages</li>
          <li>Protect against fraud and abuse</li>
        </ul>

        <h2>3. Information Sharing</h2>
        <p>We share your information with:</p>
        <ul>
          <li>Other users as part of the matching experience</li>
          <li>Service providers who assist with our operations</li>
          <li>Law enforcement when required by law</li>
        </ul>

        <h2>4. Your Choices</h2>
        <p>You can:</p>
        <ul>
          <li>Update your profile information at any time</li>
          <li>Control your visibility settings</li>
          <li>Delete your account and data</li>
          <li>Opt out of marketing communications</li>
        </ul>

        <h2>5. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information 
          against unauthorized access, alteration, disclosure, or destruction.
        </p>

        <h2>6. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at 
          privacy@plurr.app
        </p>
      </main>
    </div>
  );
};

export default Privacy;
