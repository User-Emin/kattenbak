/**
 * LOGIN PAGE - DRY & Secure
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loginApi, storeAuth } from '@/lib/api/auth';
import { toast } from 'sonner';
import { Lock, Mail } from 'lucide-react';

// DRY: Zod validation schema
const loginSchema = z.object({
  email: z.string().min(3, 'Email is verplicht'),
  password: z.string().min(1, 'Wachtwoord is verplicht'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const result = await loginApi({
        email: data.email,
        password: data.password,
      });

      // Store auth data
      storeAuth(result.token, result.user);

      // Success feedback
      toast.success('Login successful! Redirecting...');
      
      // DRY: Force redirect to dashboard
      console.log('Login success! Redirecting to /dashboard...');
      
      // Use window.location for hard redirect (ensures middleware runs)
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500); // Small delay for toast visibility
      
    } catch (error: any) {
      // DRY: Comprehensive error handling with user-friendly messages
      const errorMessage = error.message || 'Er is een fout opgetreden';
      const errorStatus = error.status || 0;
      
      console.error('Login error details:', {
        message: errorMessage,
        status: errorStatus,
        details: error.details || error,
      });

      // User-friendly error messages
      let displayMessage = errorMessage;
      
      if (errorStatus === 401) {
        displayMessage = 'Ongeldige email of wachtwoord';
      } else if (errorStatus === 0) {
        displayMessage = 'Kan geen verbinding maken met de server. Controleer of de backend draait.';
      } else if (errorStatus === 404) {
        displayMessage = 'Login endpoint niet gevonden. Controleer de backend configuratie.';
      } else if (errorStatus >= 500) {
        displayMessage = 'Server fout. Probeer het later opnieuw.';
      }

      toast.error(displayMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Kattenbak Admin</CardTitle>
          <CardDescription>Log in om het dashboard te openen</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder="admin@localhost"
                          className="pl-10"
                          disabled={isLoading}
                          autoComplete="email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wachtwoord</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          disabled={isLoading}
                          autoComplete="current-password"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Inloggen...
                  </>
                ) : (
                  'Inloggen'
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
            <p className="font-medium mb-1">Development credentials:</p>
            <p>Email: admin@localhost</p>
            <p>Password: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

