import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-serif font-bold">Terms of Service</h1>
        </div>
      </header>

      <main className="p-4 pb-24 max-w-2xl mx-auto prose prose-sm dark:prose-invert">
        <p className="text-muted-foreground text-sm">Last updated: January 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using Tangle, you agree to be bound by these Terms of Service. 
          If you do not agree to these terms, please do not use our services.
        </p>

        <h2>2. Eligibility</h2>
        <p>You must be at least 18 years old to use Tangle. By using our services, you represent that:</p>
        <ul>
          <li>You are at least 18 years of age</li>
          <li>You have the legal capacity to enter into this agreement</li>
          <li>You are not prohibited by law from using the service</li>
        </ul>

        <h2>3. Account Registration</h2>
        <p>
          You agree to provide accurate and complete information when creating an account. 
          You are responsible for maintaining the confidentiality of your account credentials.
        </p>

        <h2>4. User Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the service for any unlawful purpose</li>
          <li>Harass, threaten, or intimidate other users</li>
          <li>Post false or misleading information</li>
          <li>Upload inappropriate or harmful content</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Use automated systems to access the service</li>
        </ul>

        <h2>5. Content</h2>
        <p>
          You retain ownership of content you post, but grant us a license to use, 
          display, and distribute it on our platform. We reserve the right to remove 
          any content that violates these terms.
        </p>

        <h2>6. Premium Subscriptions</h2>
        <p>
          Premium features are offered on a subscription basis. Payment is made via 
          bank transfer and must be verified by our team. Subscriptions are 
          non-refundable except where required by law.
        </p>

        <h2>7. Termination</h2>
        <p>
          We may suspend or terminate your account at any time for violations of 
          these terms or for any other reason at our discretion.
        </p>

        <h2>8. Disclaimers</h2>
        <p>
          The service is provided "as is" without warranties of any kind. We do not 
          guarantee any matches or outcomes from using the service.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Tangle shall not be liable for any 
          indirect, incidental, special, or consequential damages arising from your 
          use of the service.
        </p>

        <h2>10. Changes to Terms</h2>
        <p>
          We may modify these terms at any time. Continued use of the service after 
          changes constitutes acceptance of the modified terms.
        </p>

        <h2>11. Contact</h2>
        <p>
          For questions about these Terms of Service, please contact us at 
          legal@tangle.app
        </p>
      </main>
    </div>
  );
};

export default Terms;
