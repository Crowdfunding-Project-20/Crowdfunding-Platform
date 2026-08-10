"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Envelope, Lock, Eye, EyeSlash, ArrowRight } from "@phosphor-icons/react";

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
import { useAuth, ApiError } from "@/contexts/AuthContext";
import { AuthSplitShell } from "@/app/(auth)/AuthSplitShell";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect authenticated users away from /login
  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  // Avoid a flash of the form while rehydrating or before redirect
  if (loading || user) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Basic UX validation — the backend is the real authority
    if (!identifier.trim() || !password) {
      setError("Enter your email/username and password to continue.");
      return;
    }

    setSubmitting(true);
    try {
      await login(identifier.trim(), password);
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
          <CardTitle className="text-foreground text-xl">Sign in to your account</CardTitle>
          <CardDescription>
            Enter your email or username and password to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="identifier">Email or username</Label>
              <div className="relative">
                <Envelope
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="identifier"
                  type="text"
                  inputMode="email"
                  autoComplete="username"
                  autoFocus
                  placeholder="you@example.com or your_username"
                  className="pl-10"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
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
                  autoComplete="current-password"
                  placeholder="Enter your password"
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

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={submitting} className="mt-2 w-full" size="lg">
              {submitting ? (
                <>
                  <Spinner />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-center text-sm text-foreground/80">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthSplitShell>
  );
}
