import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { UserPlus, Shield, Trash2, Mail, Search } from 'lucide-react';
import { UserRole } from '@/types/cafeteria';
import { useToast } from '@/hooks/use-toast';

// Mock data for demo
const mockUsers = [
  { id: '1', email: 'admin@runera.edu', name: 'Admin User', role: 'admin' as UserRole, createdAt: new Date('2024-01-15') },
  { id: '2', email: 'cashier1@runera.edu', name: 'John Doe', role: 'cashier' as UserRole, createdAt: new Date('2024-02-20') },
  { id: '3', email: 'cashier2@runera.edu', name: 'Jane Smith', role: 'cashier' as UserRole, createdAt: new Date('2024-03-10') },
];

export function UserManagement() {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'cashier'>('cashier');
  const { toast } = useToast();

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    if (!newUserEmail) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    // In production, this would call Convex to invite user
    toast({
      title: 'Invitation Sent',
      description: `An invitation has been sent to ${newUserEmail}`,
    });
    setNewUserEmail('');
    setShowAddUser(false);
  };

  const handleRemoveUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
    toast({
      title: 'User Removed',
      description: 'The user has been removed from the system',
    });
  };

  const handleChangeRole = (userId: string, newRole: UserRole) => {
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    toast({
      title: 'Role Updated',
      description: `User role has been updated to ${newRole}`,
    });
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'cashier':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Shield className="w-5 h-5 text-primary" />
              User Management
            </CardTitle>
            <Button onClick={() => setShowAddUser(true)} className="gap-2 w-full sm:w-auto">
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name || 'No name'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role || 'cashier'}
                        onValueChange={(value) => handleChangeRole(user.id, value as UserRole)}
                      >
                        <SelectTrigger className="w-32">
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role || 'None'}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="cashier">Cashier</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {user.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {user.name || user.email}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleRemoveUser(user.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.name || 'No name'}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Joined {user.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={getRoleBadgeVariant(user.role)} className="ml-2">
                    {user.role || 'None'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <Select
                    value={user.role || 'cashier'}
                    onValueChange={(value) => handleChangeRole(user.id, value as UserRole)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                    </SelectContent>
                  </Select>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {user.name || user.email}?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleRemoveUser(user.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <AlertDialog open={showAddUser} onOpenChange={setShowAddUser}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add New User</AlertDialogTitle>
            <AlertDialogDescription>
              Send an invitation to a new user. They will receive an email with instructions to set up their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as 'admin' | 'cashier')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddUser}>
              Send Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
