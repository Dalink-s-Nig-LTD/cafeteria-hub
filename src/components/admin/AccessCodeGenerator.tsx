import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Key, Copy, Plus, Ban, Check, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccessCodeData {
  id: string;
  code: string;
  role: 'admin' | 'cashier';
  createdAt: Date;
  expiresAt: Date | null;
  usedAt: Date | null;
  usedBy: string | null;
  isRevoked: boolean;
}

// Mock data for demo
const mockCodes: AccessCodeData[] = [
  { id: '1', code: 'ABC123', role: 'cashier', createdAt: new Date('2024-03-01'), expiresAt: new Date('2024-04-01'), usedAt: null, usedBy: null, isRevoked: false },
  { id: '2', code: 'XYZ789', role: 'cashier', createdAt: new Date('2024-02-15'), expiresAt: new Date('2024-03-15'), usedAt: new Date('2024-02-20'), usedBy: 'John Doe', isRevoked: false },
  { id: '3', code: 'DEF456', role: 'admin', createdAt: new Date('2024-01-10'), expiresAt: null, usedAt: null, usedBy: null, isRevoked: true },
];

interface AccessCodeGeneratorProps {
  isSuperadmin?: boolean;
}

export function AccessCodeGenerator({ isSuperadmin = false }: AccessCodeGeneratorProps) {
  const [codes, setCodes] = useState<AccessCodeData[]>(mockCodes);
  const [showGenerate, setShowGenerate] = useState(false);
  const [newCodeRole, setNewCodeRole] = useState<'admin' | 'cashier'>('cashier');
  const [expiresInDays, setExpiresInDays] = useState<string>('7');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleGenerateCode = () => {
    const code = generateRandomCode();
    const expiresAt = expiresInDays === 'never' 
      ? null 
      : new Date(Date.now() + parseInt(expiresInDays) * 24 * 60 * 60 * 1000);

    const newCode: AccessCodeData = {
      id: Date.now().toString(),
      code,
      role: newCodeRole,
      createdAt: new Date(),
      expiresAt,
      usedAt: null,
      usedBy: null,
      isRevoked: false,
    };

    setCodes([newCode, ...codes]);
    setGeneratedCode(code);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied!',
      description: 'Access code copied to clipboard',
    });
  };

  const handleRevokeCode = (codeId: string) => {
    setCodes(codes.map(c => c.id === codeId ? { ...c, isRevoked: true } : c));
    toast({
      title: 'Code Revoked',
      description: 'The access code has been revoked',
    });
  };

  const getStatusBadge = (code: AccessCodeData) => {
    if (code.isRevoked) {
      return <Badge variant="destructive" className="gap-1"><Ban className="w-3 h-3" /> Revoked</Badge>;
    }
    if (code.usedAt) {
      return <Badge variant="secondary" className="gap-1"><Check className="w-3 h-3" /> Used</Badge>;
    }
    if (code.expiresAt && code.expiresAt < new Date()) {
      return <Badge variant="outline" className="gap-1 text-muted-foreground"><Clock className="w-3 h-3" /> Expired</Badge>;
    }
    return <Badge variant="default" className="gap-1 bg-success"><Check className="w-3 h-3" /> Active</Badge>;
  };

  const activeCodes = codes.filter(c => !c.isRevoked && !c.usedAt && (!c.expiresAt || c.expiresAt > new Date()));

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Codes</p>
          <p className="text-2xl font-bold">{codes.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-success">{activeCodes.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Used</p>
          <p className="text-2xl font-bold">{codes.filter(c => c.usedAt).length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Revoked</p>
          <p className="text-2xl font-bold text-destructive">{codes.filter(c => c.isRevoked).length}</p>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Key className="w-5 h-5 text-primary" />
              Access Codes
            </CardTitle>
            <Button onClick={() => { setShowGenerate(true); setGeneratedCode(null); }} className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Generate Code
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Used By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-lg font-bold tracking-wider">
                          {code.code}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleCopyCode(code.code)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={code.role === 'admin' ? 'secondary' : 'outline'}>
                        {code.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(code)}</TableCell>
                    <TableCell>
                      {code.expiresAt 
                        ? code.expiresAt.toLocaleDateString() 
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      {code.usedBy || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {!code.isRevoked && !code.usedAt && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRevokeCode(code.id)}
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {codes.map((code) => (
              <Card key={code.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-lg font-bold tracking-wider">
                      {code.code}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleCopyCode(code.code)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  {getStatusBadge(code)}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Role</p>
                    <Badge variant={code.role === 'admin' ? 'secondary' : 'outline'}>
                      {code.role}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expires</p>
                    <p>{code.expiresAt ? code.expiresAt.toLocaleDateString() : 'Never'}</p>
                  </div>
                  {code.usedBy && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Used by</p>
                      <p>{code.usedBy}</p>
                    </div>
                  )}
                </div>
                {!code.isRevoked && !code.usedAt && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full mt-4 text-destructive"
                    onClick={() => handleRevokeCode(code.id)}
                  >
                    <Ban className="w-4 h-4 mr-1" />
                    Revoke Code
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate Code Dialog */}
      <AlertDialog open={showGenerate} onOpenChange={setShowGenerate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {generatedCode ? 'Code Generated!' : 'Generate Access Code'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {generatedCode 
                ? 'Share this code with the user. They can use it to log in.'
                : 'Create a new access code for a user to join the system.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {generatedCode ? (
            <div className="py-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <code className="font-mono text-3xl font-bold tracking-[0.5em] bg-secondary px-6 py-4 rounded-lg">
                  {generatedCode}
                </code>
              </div>
              <Button 
                variant="outline" 
                onClick={() => handleCopyCode(generatedCode)}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Code
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={newCodeRole} onValueChange={(v) => setNewCodeRole(v as 'admin' | 'cashier')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {isSuperadmin && <SelectItem value="admin">Admin</SelectItem>}
                    <SelectItem value="cashier">Cashier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Expires In</label>
                <Select value={expiresInDays} onValueChange={setExpiresInDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {!isSuperadmin && newCodeRole === 'admin' && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Only superadmins can create admin codes</span>
                </div>
              )}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>
              {generatedCode ? 'Close' : 'Cancel'}
            </AlertDialogCancel>
            {!generatedCode && (
              <AlertDialogAction onClick={handleGenerateCode}>
                Generate Code
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
