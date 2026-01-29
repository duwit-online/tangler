import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  Check, 
  ChevronRight, 
  Upload, 
  Copy,
  Building,
  Loader2
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  useSubscriptionPlans,
  useBankAccounts,
  useUserSubscription,
  useCreateSubscription,
  useUploadPaymentProof,
} from '@/hooks/useSubscription';

interface PremiumSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'plans' | 'payment' | 'confirm' | 'success';

const PremiumSheet = ({ open, onOpenChange }: PremiumSheetProps) => {
  const { data: plans, isLoading: loadingPlans } = useSubscriptionPlans();
  const { data: bankAccounts } = useBankAccounts();
  const { data: currentSubscription } = useUserSubscription();
  
  const createSubscription = useCreateSubscription();
  const uploadProof = useUploadPaymentProof();
  
  const [step, setStep] = useState<Step>('plans');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  
  const selectedPlanData = plans?.find(p => p.id === selectedPlan);
  const selectedBankData = bankAccounts?.find(b => b.id === selectedBank);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
    }
  };
  
  const handleSubmit = async () => {
    if (!selectedPlan || !selectedBank || !paymentReference) return;
    
    let proofUrl: string | undefined;
    
    if (proofFile) {
      try {
        proofUrl = await uploadProof.mutateAsync(proofFile);
      } catch {
        toast.error('Failed to upload payment proof');
        return;
      }
    }
    
    createSubscription.mutate({
      planId: selectedPlan,
      paymentReference,
      paymentProofUrl: proofUrl,
      bankAccountId: selectedBank,
    }, {
      onSuccess: () => {
        setStep('success');
      },
    });
  };
  
  const resetAndClose = () => {
    setStep('plans');
    setSelectedPlan(null);
    setSelectedBank(null);
    setPaymentReference('');
    setProofFile(null);
    onOpenChange(false);
  };
  
  // Check if user has active or pending subscription
  const hasPending = currentSubscription?.status === 'pending';
  const hasActive = currentSubscription?.status === 'active' && 
    (!currentSubscription.expires_at || new Date(currentSubscription.expires_at) > new Date());

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            {hasActive ? 'Premium Active' : hasPending ? 'Payment Pending' : 'Get Premium'}
          </SheetTitle>
        </SheetHeader>
        
        <AnimatePresence mode="wait">
          {/* Already Premium */}
          {hasActive && (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">You're Premium!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {currentSubscription?.expires_at 
                  ? `Expires on ${new Date(currentSubscription.expires_at).toLocaleDateString()}`
                  : 'Lifetime access'}
              </p>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </motion.div>
          )}
          
          {/* Pending Verification */}
          {hasPending && (
            <motion.div
              key="pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Payment Under Review</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We're verifying your payment. This usually takes 24 hours.
              </p>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </motion.div>
          )}
          
          {/* Plans Selection */}
          {!hasActive && !hasPending && step === 'plans' && (
            <motion.div
              key="plans"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Unlock premium features like seeing who liked you
                </p>
              </div>
              
              {loadingPlans ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {plans?.map((plan) => (
                    <Card 
                      key={plan.id}
                      className={`cursor-pointer transition-all ${
                        selectedPlan === plan.id 
                          ? 'ring-2 ring-primary border-primary' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{plan.name}</h3>
                            <p className="text-xs text-muted-foreground">{plan.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">${plan.price}</p>
                            {plan.duration_days && (
                              <p className="text-xs text-muted-foreground">
                                {plan.duration_days === 30 ? '/month' : 
                                 plan.duration_days === 365 ? '/year' : ''}
                              </p>
                            )}
                            {!plan.duration_days && (
                              <Badge variant="secondary" className="text-xs">Lifetime</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {plan.features?.map((feature, i) => (
                            <span key={i} className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3 inline mr-0.5" />{feature}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              <Button 
                className="w-full" 
                disabled={!selectedPlan}
                onClick={() => setStep('payment')}
              >
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}
          
          {/* Payment Details */}
          {step === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setStep('plans')}
              >
                ← Back to plans
              </Button>
              
              <div className="bg-primary/5 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium">{selectedPlanData?.name}</p>
                <p className="text-2xl font-bold">${selectedPlanData?.price}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Select Bank Account</Label>
                <div className="space-y-2">
                  {bankAccounts?.map((bank) => (
                    <Card 
                      key={bank.id}
                      className={`cursor-pointer transition-all ${
                        selectedBank === bank.id 
                          ? 'ring-2 ring-primary border-primary' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedBank(bank.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                            <Building className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{bank.bank_name}</p>
                            <p className="text-xs text-muted-foreground">{bank.account_name}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {selectedBankData && (
                <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-semibold">Transfer Details</h4>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Bank Name</p>
                      <p className="text-sm font-medium">{selectedBankData.bank_name}</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(selectedBankData.bank_name)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Account Name</p>
                      <p className="text-sm font-medium">{selectedBankData.account_name}</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(selectedBankData.account_name)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Account Number</p>
                      <p className="text-sm font-medium">{selectedBankData.account_number}</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(selectedBankData.account_number)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {selectedBankData.routing_number && (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Routing Number</p>
                        <p className="text-sm font-medium">{selectedBankData.routing_number}</p>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => copyToClipboard(selectedBankData.routing_number!)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-sm font-bold text-primary">${selectedPlanData?.price} {selectedBankData.currency}</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(String(selectedPlanData?.price))}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              <Button 
                className="w-full" 
                disabled={!selectedBank}
                onClick={() => setStep('confirm')}
              >
                I've Made the Transfer <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}
          
          {/* Confirm Payment */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setStep('payment')}
              >
                ← Back
              </Button>
              
              <div>
                <Label>Payment Reference / Transaction ID *</Label>
                <Input 
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Enter your bank transfer reference"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This helps us verify your payment faster
                </p>
              </div>
              
              <div>
                <Label>Payment Proof (Optional)</Label>
                <div className="mt-2">
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {proofFile ? proofFile.name : 'Upload screenshot'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                disabled={!paymentReference || createSubscription.isPending}
                onClick={handleSubmit}
              >
                {createSubscription.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Submit for Verification
              </Button>
            </motion.div>
          )}
          
          {/* Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Payment Submitted!</h3>
              <p className="text-sm text-muted-foreground mb-6">
                We'll verify your payment and activate your premium within 24 hours.
              </p>
              <Button onClick={resetAndClose}>Done</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
};

export default PremiumSheet;
