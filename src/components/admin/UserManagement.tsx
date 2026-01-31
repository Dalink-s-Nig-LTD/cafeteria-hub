import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";
import { UserPlus, Shield, Trash2, Mail, Search } from "lucide-react";
import { UserRole, UserProfile } from "@/types/cafeteria";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";

export function UserManagement() {
  const { toast } = useToast();
  // Fetch all admin users
  const rawUsers = useQuery(api.adminuser.getAll);
  const users =
    rawUsers?.map((u) => ({
      id: u._id,
      email: u.email,
      name: u.name,
      role: "admin",
      createdAt: new Date(u.createdAt),
    })) ?? undefined;

  return (
    <Card className="border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Shield className="w-5 h-5 text-primary" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {users === undefined ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No users found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.name || (
                      <span className="italic text-muted-foreground">
                        (No name)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === "superadmin" ? "destructive" : "default"
                      }
                    >
                      {user.role || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
