"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Lock, Mail } from "lucide-react";
import { apiFetch, API_CONFIG } from "@/lib/config";

/**
 * Admin Login Page - DRY & Secure
 * Login met credentials uit backend .env
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    try {
      const response = await apiFetch<{ success: boolean; data: { token: string; user: any } }>(
        `${API_CONFIG.ENDPOINTS.ADMIN}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (response.success && response.data.token) {
        // Store token
        localStorage.setItem('admin_token', response.data.token);
        localStorage.setItem('admin_user', JSON.stringify(response.data.user));
        
        setFeedback({ type: 'success', message: 'Login succesvol! Redirecting...' });
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1000);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setFeedback({ type: 'error', message: 'Onjuiste inloggegevens' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600 text-sm">Toegang tot beheerportaal</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              name="email"
              label="Email *"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@localhost"
              required
              autoFocus
            />

            <Input
              name="password"
              label="Wachtwoord *"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {/* Feedback */}
            {feedback && (
              <div className={`flex items-center gap-2 p-4 rounded-lg ${
                feedback.type === 'success' 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-red-50 text-red-800'
              }`}>
                {feedback.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                )}
                <p className="text-sm font-medium">{feedback.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="cta"
              fullWidth
              loading={isLoading}
              size="lg"
            >
              Inloggen
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Alleen voor geautoriseerd personeel
            </p>
          </div>
        </div>

        {/* Dev Info (alleen lokaal) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-xs text-yellow-800">
            <p className="font-semibold mb-2">Development Mode:</p>
            <p>Email: admin@localhost</p>
            <p>Password: admin123</p>
          </div>
        )}
      </div>
    </div>
  );
}
