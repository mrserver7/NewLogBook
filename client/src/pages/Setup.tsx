import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function SetupPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "mrserver.ksa@gmail.com",
    secret: "",
  });

  const setupMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Setup response:', data);
      
      if (data.adminSetup?.userFound && data.adminSetup?.userUpdated) {
        toast({
          title: "Setup Completed Successfully",
          description: `Admin user set up successfully and ${data.proceduresAdded} procedures added.`,
        });
      } else if (data.adminSetup?.userFound && !data.adminSetup?.userUpdated) {
        toast({
          title: "Setup Partially Completed",
          description: `User found but admin role update failed. ${data.proceduresAdded} procedures added.`,
          variant: "destructive",
        });
      } else if (!data.adminSetup?.userFound) {
        toast({
          title: "User Not Found",
          description: `User with email ${data.adminSetup?.email} not found in database. Please login at least once first. ${data.proceduresAdded} procedures added.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Setup Completed",
          description: `Setup completed with ${data.proceduresAdded} procedures added.`,
        });
      }
    },
    onError: (error: any) => {
      console.error('Setup error:', error);
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.secret) {
      toast({
        title: "Missing Setup Secret",
        description: "Please enter the setup secret.",
        variant: "destructive",
      });
      return;
    }
    
    setupMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-tools text-white text-2xl"></i>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Application Setup
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure admin user and default procedures
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-light-elevated dark:bg-dark-elevated border-0"
                placeholder="Enter admin email address"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="secret">Setup Secret</Label>
              <Input
                id="secret"
                type="password"
                value={formData.secret}
                onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                className="bg-light-elevated dark:bg-dark-elevated border-0"
                placeholder="Enter setup secret"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Contact the system administrator for the setup secret
              </p>
            </div>
            
            <Button
              type="submit"
              disabled={setupMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white"
            >
              {setupMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Setting up...
                </>
              ) : (
                <>
                  <i className="fas fa-play mr-2"></i>
                  Run Setup
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center space-y-2">
            <a 
              href="/"
              className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Application
            </a>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>Note: You must login at least once before running setup</p>
              <p>After setup, check your admin status in Settings → Admin Diagnostics</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}