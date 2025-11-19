"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PendingApprovalPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="font-headline text-2xl">Pending Approval</CardTitle>
          <CardDescription>
            Your account is awaiting admin approval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>✅ Your registration was successful</p>
            <p>⏳ Waiting for organization admin approval</p>
            <p>📧 You'll receive notification once approved</p>
            <p>🔄 This usually takes 24-48 hours</p>
          </div>
          
          <div className="rounded-lg border border-border p-4 bg-muted/30">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>Need help? Contact your organization admin</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.href = "/login"}
          >
            Return to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}