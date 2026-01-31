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

export function UserManagement() {
  const { toast } = useToast();

  return (
    <Card className="border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Shield className="w-5 h-5 text-primary" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Shield className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Code System</h3>
          <p className="text-muted-foreground max-w-md">
            This system uses access codes for cashier authentication. 
            Go to the <strong>Access Codes</strong> tab to generate codes for cashiers. 
            Admins can sign up directly on the login page.
          </p>
        </div>
      </CardContent>
    </Card>
    );
  }
