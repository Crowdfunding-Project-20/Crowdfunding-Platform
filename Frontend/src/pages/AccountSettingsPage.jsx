import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function AccountSettingsPage({ navigate }) {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      navigate("login");
    }
  }, [isSignedIn, navigate]);

  return (
    <section className="min-h-[calc(100vh-80px)] bg-[#f5f2eb] py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid gap-8 xl:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-[2rem] bg-white p-8 shadow-[0_24px_60px_rgba(23,63,53,.08)] sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#588063]">
              Account settings
            </p>
            <h1 className="mt-4 font-display text-4xl font-black tracking-[-.04em] text-[#173f35] sm:text-5xl">
              Manage your Nkoso account
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#617067]">
              Update login details, control how you receive updates, and manage your personal settings.
            </p>

            <section className="mt-10 space-y-8">
              <div className="rounded-[2rem] border border-[#d7ded7] bg-[#f8faf6] p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-[#173f35]">Email</p>
                    <p className="mt-2 text-sm text-[#617067]">Used to sign in and receive notifications.</p>
                  </div>
                  <button className="rounded-full bg-[#e86f42] px-5 py-2 text-sm font-bold text-white">Change</button>
                </div>
              </div>

              <div className="rounded-[2rem] border border-[#d7ded7] bg-[#f8faf6] p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-[#173f35]">Password</p>
                    <p className="mt-2 text-sm text-[#617067]">Keep your account secure with a strong password.</p>
                  </div>
                  <button className="rounded-full bg-[#173f35] px-5 py-2 text-sm font-bold text-white">Update</button>
                </div>
              </div>

              <div className="rounded-[2rem] border border-[#d7ded7] bg-[#f8faf6] p-7">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[#173f35]">Notifications</p>
                      <p className="mt-2 text-sm text-[#617067]">Choose which email updates you want to receive.</p>
                    </div>
                    <button className="rounded-full bg-white px-5 py-2 text-sm font-bold text-[#173f35] ring-1 ring-[#d7ded7]">Manage</button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
                      <p className="text-sm font-bold text-[#173f35]">Campaign updates</p>
                      <p className="mt-2 text-xs text-[#69746c]">Progress alerts and supporter messages.</p>
                    </div>
                    <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
                      <p className="text-sm font-bold text-[#173f35]">Inspiration emails</p>
                      <p className="mt-2 text-xs text-[#69746c]">Stories and ideas from the Nkoso community.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6 rounded-[2rem] bg-[#eef4eb] p-8 text-[#173f35] shadow-[0_24px_60px_rgba(23,63,53,.08)]">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[.16em] text-[#588063]">Your role</p>
              <p className="mt-3 text-2xl font-black">Member</p>
              <p className="mt-2 text-sm leading-6 text-[#617067]">Signed in users can manage their account details here.</p>
            </div>
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[.16em] text-[#588063]">Security</p>
              <p className="mt-3 text-sm leading-6 text-[#617067]">Use a strong password and keep your email updated for account recovery.</p>
            </div>
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[.16em] text-[#588063]">Support</p>
              <p className="mt-3 text-sm leading-6 text-[#617067]">Need help? Contact Nkoso support if you have trouble signing in.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
