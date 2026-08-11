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
import { validateLogin, type LoginFieldErrors } from "@/lib/validation";

const FIELD_ORDER: (keyof LoginFieldErrors)[] = ["identifier", "password"];

/** Focus the first invalid field so the error is immediately visible. */
function focusFirstError(errors: LoginFieldErrors) {
  for (const key of FIELD_ORDER) {
    if (errors[key]) {
      document.getElementById(key)?.focus();
      return;
    }
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Per-field validation messages (shown under the affected input).
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  // Form-level banner for server rejections (wrong credentials, outages).
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect authenticated users away from /login
  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  // Avoid a flash of the form while rehydrating or before redirect
  if (loading || user) return null;

  /** Re-typing in a field clears its error so feedback updates live. */
  function clearFieldError(field: keyof LoginFieldErrors) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    // Per-field validation first — same rules as the backend.
    const errors = validateLogin(identifier, password);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      focusFirstError(errors);
      return;
    }

    setSubmitting(true);
    try {
      await login(identifier.trim(), password);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError && err.data?.fields) {
        // Backend rejected specific fields (400) → per-field messages.
        setFieldErrors(err.data.fields as LoginFieldErrors);
      } else {
        // Wrong credentials (401) or a server failure → one clear banner.
        setSubmitError(
          err instanceof ApiError ? err.message : "Something went wrong. Try again.",
        );
      }
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
                  aria-invalid={!!fieldErrors.identifier || undefined}
                  aria-describedby={fieldErrors.identifier ? "identifier-error" : undefined}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    clearFieldError("identifier");
                  }}
                />
              </div>
              {fieldErrors.identifier && (
                <p id="identifier-error" className="text-sm text-destructive" role="alert">
                  {fieldErrors.identifier}
                </p>
              )}
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
                  aria-invalid={!!fieldErrors.password || undefined}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError("password");
                  }}
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
              {fieldErrors.password && (
                <p id="password-error" className="text-sm text-destructive" role="alert">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {submitError && (
              <p className="text-sm text-destructive" role="alert">
                {submitError}
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
