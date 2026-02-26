import { useState } from 'react';
import { ChevronLeft, Mail, MessageCircle, HelpCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const faqs = [
  {
    question: "How do I get more matches?",
    answer: "Complete your profile with high-quality photos and a detailed bio. Be active on the app and respond to matches promptly. Consider upgrading to Premium to see who liked you first."
  },
  {
    question: "Can I unmatch with someone?",
    answer: "Yes! Open the match's profile and tap the 'Unmatch' button. This will remove them from your matches and both of you will be able to see each other on Discover again."
  },
  {
    question: "How does Premium work?",
    answer: "Premium gives you access to features like seeing who liked you, unlimited likes, read receipts, and priority support. You can subscribe monthly, yearly, or get lifetime access."
  },
  {
    question: "How do I verify my payment?",
    answer: "After making a bank transfer, submit your payment with the transaction reference. Our team verifies payments within 24 hours."
  },
  {
    question: "How do I delete my account?",
    answer: "Go to Settings > Account Settings > Delete My Account. Note that this action is permanent and cannot be undone."
  },
  {
    question: "Why can't I see some profiles?",
    answer: "You might have already swiped on them, or they may have deleted their account. Your discovery settings also affect who you see."
  },
];

const Support = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    setSubmitting(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Support request submitted! We\'ll get back to you soon.');
    setSubject('');
    setMessage('');
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-serif font-bold">Help & Support</h1>
        </div>
      </header>

      <main className="p-4 pb-24 max-w-2xl mx-auto space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Live Chat</p>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Email Us</p>
                <p className="text-xs text-muted-foreground">support@plurr.app</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card rounded-lg border px-4"
              >
                <AccordionTrigger className="text-sm text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-sm font-semibold mb-3">Still Need Help?</h2>
          <Card>
            <CardContent className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Subject</Label>
                  <Input 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What do you need help with?"
                  />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    rows={4}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!subject || !message || submitting}
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Support;
