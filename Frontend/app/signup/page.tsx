"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Envelope, Lock, Eye, EyeSlash, ArrowRight, User as UserIcon } from "@phosphor-icons/react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { AuthSplitShell } from "@/app/(auth)/AuthSplitShell";


type AuthResponse = { token: string; email: string; username: string; role: "USER" | "ADMIN" };

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;

export default function SignupPage() {
  const router = useRouter();
  const { user, loading, setSession } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect authenticated users away from /signup
  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading || user) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Basic UX validation — the backend enforces the real rules
    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (!USERNAME_RE.test(username.trim())) {
      setError("Username must be 3-30 characters: letters, numbers, or underscores.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      // Register returns the same AuthResponse shape as login — persist it
      // directly via setSession so the rest of the app sees the user immediately.
      const data = await api.post<AuthResponse>("/api/auth/register", {
        email: email.trim(),
        username: username.trim(),
        password,
      });
      setSession(data);
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthSplitShell>
      <Card className="w-full max-w-md shadow-none md:bg-card md:dark:bg-card">
        <CardHeader>
          <CardTitle className="text-foreground text-xl">Create an account</CardTitle>
          <CardDescription>
            Join the community and start supporting campaigns
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Envelope
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <UserIcon
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="your_username"
                  className="pl-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="px-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={submitting} className="mt-2 w-full" size="lg">
              {submitting ? (
                <>
                  <Spinner />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-center text-sm text-foreground/80">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthSplitShell>
  );
}
