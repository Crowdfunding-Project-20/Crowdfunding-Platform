"use client";

import { useEffect, useState, FormEvent } from "react";
import { Envelope, Lock, Eye, EyeSlash, User as UserIcon } from "@phosphor-icons/react";

import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;

type Role = "USER" | "ADMIN";
type AuthResponse = { token: string; email: string; username: string; role: Role };
type Profile = { email: string; username: string; role: Role; createdAt?: string };

export default function ProfilePage() {
  const { ready, user } = useRequireAuth();
  const { setSession } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  // Fetch the server's copy once for createdAt + a source of truth. Context
  // user is the fallback, so a failed fetch still renders a working page.
  useEffect(() => {
    if (!ready) return;
    api
      .get<Profile>("/api/users/me")
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [ready]);

  if (!ready || !user) return null;

  const current = profile ?? user;
  const initial = (current.username || current.email || "?").charAt(0).toUpperCase();

  // After a profile save: refresh server-fetched state AND the session (the
  // PUT returns a fresh token, since changing the email invalidates the old one).
  const handleSaved = (res: AuthResponse) => {
    setProfile((p) => (p ? { ...p, email: res.email, username: res.username } : p));
    setSession(res);
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Your profile
        </h1>
        <p className="text-sm text-muted-foreground">
          The details we have for your account.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <Avatar size="lg" className="size-14">
            <AvatarFallback className="bg-primary/10 text-lg font-medium text-primary">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <span className="text-base font-medium text-foreground">
              {current.username || current.email}
            </span>
            {current.username && (
              <span className="text-sm text-muted-foreground">
                {current.email}
              </span>
            )}
            <span className="inline-flex w-fit items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {current.role === "ADMIN" ? "Admin" : "Member"}
            </span>
            {profile?.createdAt && (
              <span className="text-xs text-muted-foreground">
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <AccountDetailsForm
        email={current.email}
        username={current.username}
        onSaved={handleSaved}
      />

      <ChangePasswordForm />
    </main>
  );
}

function AccountDetailsForm({
  email,
  username,
  onSaved,
}: {
  email: string;
  username: string;
  onSaved: (res: AuthResponse) => void;
}) {
  const [emailField, setEmailField] = useState(email);
  const [usernameField, setUsernameField] = useState(username);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmedEmail = emailField.trim();
    const trimmedUsername = usernameField.trim();

    // UX-only checks — the backend owns the real rules.
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (!USERNAME_RE.test(trimmedUsername)) {
      setError("Username must be 3-30 characters: letters, numbers, or underscores.");
      return;
    }

    setSubmitting(true);
    try {
      // Always send BOTH fields — prefilled, so the backend's null-skip never
      // fires and an empty string can't trip @Email / @Pattern.
      const res = await api.put<AuthResponse>("/api/users/me", {
        email: trimmedEmail,
        username: trimmedUsername,
      });
      onSaved(res);

      // No exclamation: keep the copy calm.
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-foreground">Account details</CardTitle>
        <CardDescription>Update your email or username.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-email">Email</Label>
            <div className="relative">
              <Envelope
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="profile-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="pl-10"
                value={emailField}
                onChange={(e) => {
                  setEmailField(e.target.value);
                  setError(null);
                  setSuccess(false);
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-username">Username</Label>
            <div className="relative">
              <UserIcon
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="profile-username"
                type="text"
                autoComplete="username"
                placeholder="your_username"
                className="pl-10"
                value={usernameField}
                onChange={(e) => {
                  setUsernameField(e.target.value);
                  setError(null);
                  setSuccess(false);
                }}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm font-medium text-green-700 dark:text-green-300" role="status">
              Details saved.
            </p>
          )}

          <Button type="submit" disabled={submitting} size="lg" className="w-full">
            {submitting ? (
              <>
                <Spinner />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!current) {
      setError("Enter your current password.");
      return;
    }
    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/users/me/password", {
        currentPassword: current,
        newPassword: next,
      });
      setCurrent("");
      setNext("");
      setConfirm("");
      setSuccess(true);
    } catch (err) {
      // A wrong current password comes back as a 400 with the backend's
      // message — it surfaces here without logging the user out.
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-foreground">Change password</CardTitle>
        <CardDescription>
          Choose a new password. You&apos;ll need your current one first.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <PasswordField
            id="profile-current-password"
            label="Current password"
            autoComplete="current-password"
            placeholder="Your current password"
            value={current}
            show={show}
            onValueChange={(v) => {
              setCurrent(v);
              setError(null);
              setSuccess(false);
            }}
            onToggle={() => setShow((s) => !s)}
          />
          <PasswordField
            id="profile-new-password"
            label="New password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={next}
            show={show}
            onValueChange={(v) => {
              setNext(v);
              setError(null);
              setSuccess(false);
            }}
            onToggle={() => setShow((s) => !s)}
          />
          <PasswordField
            id="profile-confirm-password"
            label="Confirm new password"
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            value={confirm}
            show={show}
            onValueChange={(v) => {
              setConfirm(v);
              setError(null);
              setSuccess(false);
            }}
            onToggle={() => setShow((s) => !s)}
          />

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm font-medium text-green-700 dark:text-green-300" role="status">
              Password changed.
            </p>
          )}

          <Button type="submit" disabled={submitting} size="lg" variant="outline" className="w-full">
            {submitting ? (
              <>
                <Spinner />
                Saving...
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordField({
  id,
  label,
  autoComplete,
  placeholder,
  value,
  show,
  onValueChange,
  onToggle,
}: {
  id: string;
  label: string;
  autoComplete: string;
  placeholder: string;
  value: string;
  show: boolean;
  onValueChange: (v: string) => void;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="px-10"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeSlash size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
