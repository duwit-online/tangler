import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  CreditCard, 
  Flag, 
  BarChart3, 
  Settings,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Ban,
  Eye,
  Plus,
  Trash2,
  Edit,
  Building,
  Loader2
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
  useIsAdmin,
  useAdminStats,
  useAdminUsers,
  usePendingPayments,
  useAllPayments,
  useVerifyPayment,
  usePendingReports,
  useResolveReport,
  useBanUser,
  useAdminBankAccounts,
  useManageBankAccount,
} from '@/hooks/useAdmin';
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
  
  const verifyPayment = useVerifyPayment();
  const resolveReport = useResolveReport();
  const banUser = useBanUser();
  const manageBankAccount = useManageBankAccount();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [banDialog, setBanDialog] = useState<{ open: boolean; userId?: string; userName?: string }>({ open: false });
  const [banReason, setBanReason] = useState('');
  const [banDays, setBanDays] = useState('7');
  const [bankDialog, setBankDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; account?: any }>({ open: false, mode: 'create' });
  const [bankForm, setBankForm] = useState({
    account_name: '',
    bank_name: '',
    account_number: '',
    routing_number: '',
    swift_code: '',
    currency: 'USD',
    is_active: true,
  });
  
  useEffect(() => {
    if (!checkingAdmin && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, checkingAdmin, navigate]);
  
  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isAdmin) return null;
  
  const handleBanUser = () => {
    if (!banDialog.userId || !banReason) return;
    
    banUser.mutate({
      userId: banDialog.userId,
      reason: banReason,
      permanent: banDays === 'permanent',
      days: banDays !== 'permanent' ? parseInt(banDays) : undefined,
    }, {
      onSuccess: () => {
        setBanDialog({ open: false });
        setBanReason('');
        setBanDays('7');
      },
    });
  };
  
  const handleSaveBankAccount = () => {
    if (bankDialog.mode === 'create') {
      manageBankAccount.mutate({ action: 'create', data: bankForm });
    } else if (bankDialog.account?.id) {
      manageBankAccount.mutate({ id: bankDialog.account.id, action: 'update', data: bankForm });
    }
    setBankDialog({ open: false, mode: 'create' });
    setBankForm({
      account_name: '',
      bank_name: '',
      account_number: '',
      routing_number: '',
      swift_code: '',
      currency: 'USD',
      is_active: true,
    });
  };
  
  const openEditBankDialog = (account: any) => {
    setBankForm({
      account_name: account.account_name,
      bank_name: account.bank_name,
      account_number: account.account_number,
      routing_number: account.routing_number || '',
      swift_code: account.swift_code || '',
      currency: account.currency,
      is_active: account.is_active,
    });
    setBankDialog({ open: true, mode: 'edit', account });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-serif font-bold">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Manage your app</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="p-4 pb-24 max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="overview" className="text-xs px-2">
              <BarChart3 className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs px-2">
              <Users className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="text-xs px-2">
              <CreditCard className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs px-2">
              <Flag className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs px-2">
              <Settings className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardHeader className="p-3 pb-1">
                  <CardDescription className="text-xs">Total Users</CardDescription>
                  <CardTitle className="text-2xl">{stats?.totalUsers || 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="p-3 pb-1">
                  <CardDescription className="text-xs">Active (7d)</CardDescription>
                  <CardTitle className="text-2xl">{stats?.activeUsers || 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="p-3 pb-1">
                  <CardDescription className="text-xs">Total Matches</CardDescription>
                  <CardTitle className="text-2xl">{stats?.totalMatches || 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="p-3 pb-1">
                  <CardDescription className="text-xs">Pending</CardDescription>
                  <CardTitle className="text-2xl text-amber-500">
                    {(stats?.pendingPayments || 0) + (stats?.pendingReports || 0)}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-2">
                {(stats?.pendingPayments || 0) > 0 && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('payments')}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {stats?.pendingPayments} payment(s) awaiting verification
                  </Button>
                )}
                {(stats?.pendingReports || 0) > 0 && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('reports')}
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    {stats?.pendingReports} report(s) need review
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users" className="space-y-3">
            {users?.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{user.display_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.location || 'No location'} • Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => setBanDialog({ open: true, userId: user.user_id, userName: user.display_name || 'User' })}
                    >
                      <Ban className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            {pendingPayments && pendingPayments.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-amber-500">Pending Verification</h3>
                {pendingPayments.map((payment: any) => (
                  <Card key={payment.id} className="border-amber-500/50">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{payment.plan?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ${payment.amount_paid} • Ref: {payment.payment_reference}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(payment.created_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/50">
                          Pending
                        </Badge>
                      </div>
                      {payment.payment_proof_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={payment.payment_proof_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-3 h-3 mr-1" /> View Proof
                          </a>
                        </Button>
                      )}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => verifyPayment.mutate({ subscriptionId: payment.id, approve: true })}
                          disabled={verifyPayment.isPending}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="flex-1"
                          onClick={() => verifyPayment.mutate({ subscriptionId: payment.id, approve: false })}
                          disabled={verifyPayment.isPending}
                        >
                          <XCircle className="w-3 h-3 mr-1" /> Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">All Payments</h3>
              {allPayments?.map((payment: any) => (
                <Card key={payment.id}>
                  <CardContent className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{payment.plan?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ${payment.amount_paid} • {format(new Date(payment.created_at), 'MMM d')}
                      </p>
                    </div>
                    <Badge variant={
                      payment.status === 'active' ? 'default' :
                      payment.status === 'pending' ? 'outline' :
                      'destructive'
                    }>
                      {payment.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-3">
            {reports?.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No pending reports
                </CardContent>
              </Card>
            )}
            {reports?.map((report: any) => (
              <Card key={report.id}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex justify-between">
                    <Badge variant="outline">{report.reported_content_type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(report.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{report.reason}</p>
                  {report.description && (
                    <p className="text-xs text-muted-foreground">{report.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => resolveReport.mutate({ reportId: report.id, action: 'dismissed' })}
                    >
                      Dismiss
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="flex-1"
                      onClick={() => resolveReport.mutate({ 
                        reportId: report.id, 
                        action: 'banned',
                        banUser: true,
                        banReason: report.reason,
                      })}
                    >
                      Ban User
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Bank Accounts
                  </CardTitle>
                  <Button 
                    size="sm"
                    onClick={() => {
                      setBankForm({
                        account_name: '',
                        bank_name: '',
                        account_number: '',
                        routing_number: '',
                        swift_code: '',
                        currency: 'USD',
                        is_active: true,
                      });
                      setBankDialog({ open: true, mode: 'create' });
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-2">
                {bankAccounts?.map((account: any) => (
                  <div 
                    key={account.id} 
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{account.bank_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {account.account_name} • ****{account.account_number.slice(-4)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={account.is_active ? 'default' : 'secondary'}>
                        {account.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => openEditBankDialog(account)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => manageBankAccount.mutate({ id: account.id, action: 'delete' })}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(!bankAccounts || bankAccounts.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No bank accounts configured
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Ban Dialog */}
      <Dialog open={banDialog.open} onOpenChange={(open) => setBanDialog({ ...banDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Ban {banDialog.userName} from using the app
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason</Label>
              <Textarea 
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Reason for banning..."
              />
            </div>
            <div>
              <Label>Duration</Label>
              <Select value={banDays} onValueChange={setBanDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialog({ open: false })}>Cancel</Button>
            <Button variant="destructive" onClick={handleBanUser} disabled={!banReason}>
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bank Account Dialog */}
      <Dialog open={bankDialog.open} onOpenChange={(open) => setBankDialog({ ...bankDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{bankDialog.mode === 'create' ? 'Add' : 'Edit'} Bank Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Account Name</Label>
              <Input 
                value={bankForm.account_name}
                onChange={(e) => setBankForm({ ...bankForm, account_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label>Bank Name</Label>
              <Input 
                value={bankForm.bank_name}
                onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })}
                placeholder="First National Bank"
              />
            </div>
            <div>
              <Label>Account Number</Label>
              <Input 
                value={bankForm.account_number}
                onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })}
                placeholder="1234567890"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Routing Number</Label>
                <Input 
                  value={bankForm.routing_number}
                  onChange={(e) => setBankForm({ ...bankForm, routing_number: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label>SWIFT Code</Label>
                <Input 
                  value={bankForm.swift_code}
                  onChange={(e) => setBankForm({ ...bankForm, swift_code: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div>
              <Label>Currency</Label>
              <Select value={bankForm.currency} onValueChange={(v) => setBankForm({ ...bankForm, currency: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="NGN">NGN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch 
                checked={bankForm.is_active}
                onCheckedChange={(checked) => setBankForm({ ...bankForm, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBankDialog({ open: false, mode: 'create' })}>Cancel</Button>
            <Button onClick={handleSaveBankAccount}>
              {bankDialog.mode === 'create' ? 'Add Account' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
