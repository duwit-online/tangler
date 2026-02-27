import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, CreditCard, Flag, BarChart3, Settings, ChevronLeft, CheckCircle, XCircle, Ban, Eye, Plus, Trash2, Edit, Building, Loader2, Bot, BotOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  useIsAdmin, useAdminStats, useAdminUsers, usePendingPayments, useAllPayments,
  useVerifyPayment, usePendingReports, useResolveReport, useBanUser, useAdminBankAccounts, useManageBankAccount,
} from '@/hooks/useAdmin';
import { useDummyUsers, useCreateDummyUser, useDeleteDummyUser, useToggleAI } from '@/hooks/useDummyUsers';
import { format } from 'date-fns';

const Admin = () => {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { data: stats } = useAdminStats();
  const { data: users } = useAdminUsers();
  const { data: pendingPayments } = usePendingPayments();
  const { data: allPayments } = useAllPayments();
  const { data: reports } = usePendingReports();
  const { data: bankAccounts } = useAdminBankAccounts();
  const { data: dummyUsers } = useDummyUsers();
  
  const verifyPayment = useVerifyPayment();
  const resolveReport = useResolveReport();
  const banUser = useBanUser();
  const manageBankAccount = useManageBankAccount();
  const createDummy = useCreateDummyUser();
  const deleteDummy = useDeleteDummyUser();
  const toggleAI = useToggleAI();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [banDialog, setBanDialog] = useState<{ open: boolean; userId?: string; userName?: string }>({ open: false });
  const [banReason, setBanReason] = useState('');
  const [banDays, setBanDays] = useState('7');
  const [bankDialog, setBankDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; account?: any }>({ open: false, mode: 'create' });
  const [bankForm, setBankForm] = useState({ account_name: '', bank_name: '', account_number: '', routing_number: '', swift_code: '', currency: 'USD', is_active: true });
  const [dummyDialog, setDummyDialog] = useState(false);
  const [dummyForm, setDummyForm] = useState({
    display_name: '', age: 25, gender: 'Women', location: '', bio: '',
    interests: '', looking_for: 'Everyone', ai_personality: '', ai_enabled: true, photos: '',
  });
  
  useEffect(() => {
    if (!checkingAdmin && !isAdmin) navigate('/');
  }, [isAdmin, checkingAdmin, navigate]);
  
  if (checkingAdmin) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!isAdmin) return null;

  const handleBanUser = () => {
    if (!banDialog.userId || !banReason) return;
    banUser.mutate({ userId: banDialog.userId, reason: banReason, permanent: banDays === 'permanent', days: banDays !== 'permanent' ? parseInt(banDays) : undefined }, {
      onSuccess: () => { setBanDialog({ open: false }); setBanReason(''); setBanDays('7'); },
    });
  };

  const handleSaveBankAccount = () => {
    if (bankDialog.mode === 'create') manageBankAccount.mutate({ action: 'create', data: bankForm });
    else if (bankDialog.account?.id) manageBankAccount.mutate({ id: bankDialog.account.id, action: 'update', data: bankForm });
    setBankDialog({ open: false, mode: 'create' });
    setBankForm({ account_name: '', bank_name: '', account_number: '', routing_number: '', swift_code: '', currency: 'USD', is_active: true });
  };

  const handleCreateDummy = () => {
    createDummy.mutate({
      display_name: dummyForm.display_name,
      age: dummyForm.age,
      gender: dummyForm.gender,
      location: dummyForm.location,
      bio: dummyForm.bio,
      interests: dummyForm.interests.split(',').map(i => i.trim()).filter(Boolean),
      looking_for: dummyForm.looking_for,
      ai_personality: dummyForm.ai_personality,
      ai_enabled: dummyForm.ai_enabled,
      photos: dummyForm.photos.split(',').map(p => p.trim()).filter(Boolean),
    }, {
      onSuccess: () => {
        setDummyDialog(false);
        setDummyForm({ display_name: '', age: 25, gender: 'Women', location: '', bio: '', interests: '', looking_for: 'Everyone', ai_personality: '', ai_enabled: true, photos: '' });
      },
    });
  };

  const openEditBankDialog = (account: any) => {
    setBankForm({ account_name: account.account_name, bank_name: account.bank_name, account_number: account.account_number, routing_number: account.routing_number || '', swift_code: account.swift_code || '', currency: account.currency, is_active: account.is_active });
    setBankDialog({ open: true, mode: 'edit', account });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}><ChevronLeft className="w-5 h-5" /></Button>
            <div><h1 className="text-lg font-serif font-bold">Admin Panel</h1><p className="text-xs text-muted-foreground">Manage Plurr</p></div>
          </div>
        </div>
      </header>
      
      <main className="p-4 pb-24 max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 mb-4">
            <TabsTrigger value="overview" className="text-xs px-1"><BarChart3 className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="users" className="text-xs px-1"><Users className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="dummy" className="text-xs px-1"><Bot className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="payments" className="text-xs px-1"><CreditCard className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="reports" className="text-xs px-1"><Flag className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="settings" className="text-xs px-1"><Settings className="w-4 h-4" /></TabsTrigger>
          </TabsList>
          
          {/* Overview */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card><CardHeader className="p-3 pb-1"><CardDescription className="text-xs">Total Users</CardDescription><CardTitle className="text-2xl">{stats?.totalUsers || 0}</CardTitle></CardHeader></Card>
              <Card><CardHeader className="p-3 pb-1"><CardDescription className="text-xs">Active (7d)</CardDescription><CardTitle className="text-2xl">{stats?.activeUsers || 0}</CardTitle></CardHeader></Card>
              <Card><CardHeader className="p-3 pb-1"><CardDescription className="text-xs">Total Matches</CardDescription><CardTitle className="text-2xl">{stats?.totalMatches || 0}</CardTitle></CardHeader></Card>
              <Card><CardHeader className="p-3 pb-1"><CardDescription className="text-xs">AI Users</CardDescription><CardTitle className="text-2xl">{dummyUsers?.length || 0}</CardTitle></CardHeader></Card>
            </div>
          </TabsContent>
          
          {/* Users */}
          <TabsContent value="users" className="space-y-3">
            {users?.filter(u => !(u as any).is_dummy).map((user) => (
              <Card key={user.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{user.display_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{user.location || 'No location'} • {format(new Date(user.created_at), 'MMM d, yyyy')}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => setBanDialog({ open: true, userId: user.user_id, userName: user.display_name || 'User' })}>
                    <Ban className="w-4 h-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          {/* Dummy Users / AI */}
          <TabsContent value="dummy" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold">AI-Controlled Users</h2>
              <Button size="sm" onClick={() => setDummyDialog(true)}><Plus className="w-3 h-3 mr-1" /> Create</Button>
            </div>
            {dummyUsers?.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{user.display_name}, {user.age}</p>
                      <p className="text-xs text-muted-foreground">{user.gender} • {user.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.ai_enabled ? 'default' : 'secondary'} className="text-[10px]">
                        {user.ai_enabled ? 'AI On' : 'AI Off'}
                      </Badge>
                      <Switch checked={user.ai_enabled} onCheckedChange={(checked) => toggleAI.mutate({ userId: user.user_id, enabled: checked })} />
                      <Button size="icon" variant="ghost" onClick={() => deleteDummy.mutate(user.user_id)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{user.bio}</p>
                  {user.ai_personality && <p className="text-xs text-primary/70 mt-1 italic line-clamp-1">🤖 {user.ai_personality}</p>}
                </CardContent>
              </Card>
            ))}
            {(!dummyUsers || dummyUsers.length === 0) && (
              <Card><CardContent className="p-6 text-center text-muted-foreground text-sm">No AI users created yet</CardContent></Card>
            )}
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments" className="space-y-4">
            {pendingPayments && pendingPayments.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-amber-500">Pending</h3>
                {pendingPayments.map((payment: any) => (
                  <Card key={payment.id} className="border-amber-500/50">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div><p className="font-medium text-sm">{payment.plan?.name}</p><p className="text-xs text-muted-foreground">${payment.amount_paid} • Ref: {payment.payment_reference}</p></div>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/50">Pending</Badge>
                      </div>
                      {payment.payment_proof_url && <Button size="sm" variant="outline" asChild><a href={payment.payment_proof_url} target="_blank" rel="noopener noreferrer"><Eye className="w-3 h-3 mr-1" /> View Proof</a></Button>}
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={() => verifyPayment.mutate({ subscriptionId: payment.id, approve: true })}><CheckCircle className="w-3 h-3 mr-1" /> Approve</Button>
                        <Button size="sm" variant="destructive" className="flex-1" onClick={() => verifyPayment.mutate({ subscriptionId: payment.id, approve: false })}><XCircle className="w-3 h-3 mr-1" /> Reject</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">All Payments</h3>
              {allPayments?.map((payment: any) => (
                <Card key={payment.id}><CardContent className="p-3 flex justify-between items-center"><div><p className="font-medium text-sm">{payment.plan?.name}</p><p className="text-xs text-muted-foreground">${payment.amount_paid} • {format(new Date(payment.created_at), 'MMM d')}</p></div><Badge variant={payment.status === 'active' ? 'default' : payment.status === 'pending' ? 'outline' : 'destructive'}>{payment.status}</Badge></CardContent></Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Reports */}
          <TabsContent value="reports" className="space-y-3">
            {reports?.length === 0 && <Card><CardContent className="p-6 text-center text-muted-foreground">No pending reports</CardContent></Card>}
            {reports?.map((report: any) => (
              <Card key={report.id}><CardContent className="p-3 space-y-2">
                <div className="flex justify-between"><Badge variant="outline">{report.reported_content_type}</Badge><span className="text-xs text-muted-foreground">{format(new Date(report.created_at), 'MMM d, yyyy')}</span></div>
                <p className="text-sm font-medium">{report.reason}</p>
                {report.description && <p className="text-xs text-muted-foreground">{report.description}</p>}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => resolveReport.mutate({ reportId: report.id, action: 'dismissed' })}>Dismiss</Button>
                  <Button size="sm" variant="destructive" className="flex-1" onClick={() => resolveReport.mutate({ reportId: report.id, action: 'banned', banUser: true, banReason: report.reason })}>Ban User</Button>
                </div>
              </CardContent></Card>
            ))}
          </TabsContent>
          
          {/* Settings */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2"><Building className="w-4 h-4" />Bank Accounts</CardTitle>
                  <Button size="sm" onClick={() => { setBankForm({ account_name: '', bank_name: '', account_number: '', routing_number: '', swift_code: '', currency: 'USD', is_active: true }); setBankDialog({ open: true, mode: 'create' }); }}><Plus className="w-3 h-3 mr-1" /> Add</Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-2">
                {bankAccounts?.map((account: any) => (
                  <div key={account.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div><p className="font-medium text-sm">{account.bank_name}</p><p className="text-xs text-muted-foreground">{account.account_name} • ****{account.account_number.slice(-4)}</p></div>
                    <div className="flex items-center gap-2">
                      <Badge variant={account.is_active ? 'default' : 'secondary'}>{account.is_active ? 'Active' : 'Inactive'}</Badge>
                      <Button size="icon" variant="ghost" onClick={() => openEditBankDialog(account)}><Edit className="w-3 h-3" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => manageBankAccount.mutate({ id: account.id, action: 'delete' })}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
                {(!bankAccounts || bankAccounts.length === 0) && <p className="text-sm text-muted-foreground text-center py-4">No bank accounts configured</p>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Ban Dialog */}
      <Dialog open={banDialog.open} onOpenChange={(open) => setBanDialog({ ...banDialog, open })}>
        <DialogContent><DialogHeader><DialogTitle>Ban User</DialogTitle><DialogDescription>Ban {banDialog.userName}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Reason</Label><Textarea value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="Reason for banning..." /></div>
            <div><Label>Duration</Label><Select value={banDays} onValueChange={setBanDays}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">1 day</SelectItem><SelectItem value="7">7 days</SelectItem><SelectItem value="30">30 days</SelectItem><SelectItem value="permanent">Permanent</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setBanDialog({ open: false })}>Cancel</Button><Button variant="destructive" onClick={handleBanUser} disabled={!banReason}>Ban User</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bank Account Dialog */}
      <Dialog open={bankDialog.open} onOpenChange={(open) => setBankDialog({ ...bankDialog, open })}>
        <DialogContent><DialogHeader><DialogTitle>{bankDialog.mode === 'create' ? 'Add' : 'Edit'} Bank Account</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Account Name</Label><Input value={bankForm.account_name} onChange={(e) => setBankForm({ ...bankForm, account_name: e.target.value })} /></div>
            <div><Label>Bank Name</Label><Input value={bankForm.bank_name} onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })} /></div>
            <div><Label>Account Number</Label><Input value={bankForm.account_number} onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Routing</Label><Input value={bankForm.routing_number} onChange={(e) => setBankForm({ ...bankForm, routing_number: e.target.value })} /></div>
              <div><Label>SWIFT</Label><Input value={bankForm.swift_code} onChange={(e) => setBankForm({ ...bankForm, swift_code: e.target.value })} /></div>
            </div>
            <div><Label>Currency</Label><Select value={bankForm.currency} onValueChange={(v) => setBankForm({ ...bankForm, currency: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem><SelectItem value="NGN">NGN</SelectItem></SelectContent></Select></div>
            <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={bankForm.is_active} onCheckedChange={(checked) => setBankForm({ ...bankForm, is_active: checked })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setBankDialog({ open: false, mode: 'create' })}>Cancel</Button><Button onClick={handleSaveBankAccount}>{bankDialog.mode === 'create' ? 'Add' : 'Save'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dummy User Dialog */}
      <Dialog open={dummyDialog} onOpenChange={setDummyDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create AI User</DialogTitle><DialogDescription>This user will be AI-powered and visible to real users</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name</Label><Input value={dummyForm.display_name} onChange={(e) => setDummyForm({ ...dummyForm, display_name: e.target.value })} placeholder="Jessica" /></div>
              <div><Label>Age</Label><Input type="number" value={dummyForm.age} onChange={(e) => setDummyForm({ ...dummyForm, age: parseInt(e.target.value) || 25 })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Gender</Label><Select value={dummyForm.gender} onValueChange={(v) => setDummyForm({ ...dummyForm, gender: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Women">Women</SelectItem><SelectItem value="Men">Men</SelectItem><SelectItem value="Non-binary">Non-binary</SelectItem></SelectContent></Select></div>
              <div><Label>Looking for</Label><Select value={dummyForm.looking_for} onValueChange={(v) => setDummyForm({ ...dummyForm, looking_for: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Everyone">Everyone</SelectItem><SelectItem value="Men">Men</SelectItem><SelectItem value="Women">Women</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Location</Label><Input value={dummyForm.location} onChange={(e) => setDummyForm({ ...dummyForm, location: e.target.value })} placeholder="Lagos, Nigeria" /></div>
            <div><Label>Bio</Label><Textarea value={dummyForm.bio} onChange={(e) => setDummyForm({ ...dummyForm, bio: e.target.value })} placeholder="A short bio..." /></div>
            <div><Label>Interests (comma-separated)</Label><Input value={dummyForm.interests} onChange={(e) => setDummyForm({ ...dummyForm, interests: e.target.value })} placeholder="Travel, Music, Cooking" /></div>
            <div><Label>AI Personality Notes</Label><Textarea value={dummyForm.ai_personality} onChange={(e) => setDummyForm({ ...dummyForm, ai_personality: e.target.value })} placeholder="Bubbly, uses lots of emojis, loves asking questions..." /></div>
            <div><Label>Photo URLs (comma-separated storage paths)</Label><Input value={dummyForm.photos} onChange={(e) => setDummyForm({ ...dummyForm, photos: e.target.value })} placeholder="dummy/photo1.jpg, dummy/photo2.jpg" /></div>
            <div className="flex items-center justify-between"><Label>Enable AI responses</Label><Switch checked={dummyForm.ai_enabled} onCheckedChange={(checked) => setDummyForm({ ...dummyForm, ai_enabled: checked })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDummyDialog(false)}>Cancel</Button><Button onClick={handleCreateDummy} disabled={!dummyForm.display_name || createDummy.isPending}>{createDummy.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create AI User'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
