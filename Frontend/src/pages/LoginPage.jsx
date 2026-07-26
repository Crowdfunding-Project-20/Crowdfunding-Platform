import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage({ navigate }) {
  const { login, redirectPath, setRedirectPath } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = login({ email, password });
    if (result.success) {
      const next = redirectPath || "home";
      setRedirectPath("home");
      navigate(next);
    } else {
      setError(result.message);
    }
  };

  return (
    <section className="min-h-[calc(100vh-80px)] bg-[#f5f2eb] py-16 sm:py-24">
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-[0_24px_60px_rgba(23,63,53,.08)] sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#588063]">
          Member access
        </p>
        <h1 className="mt-4 font-display text-4xl font-black tracking-[-.04em] text-[#173f35] sm:text-5xl">
          Sign in to Nkoso
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#617067]">
          Use your account to access fundraisers, dashboards, and campaign tools.
        </p>
        <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-bold text-[#173f35]">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-3 w-full rounded-2xl border border-[#d7ded7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none focus:border-[#587b5a]"
            />
          </label>
          <label className="block text-sm font-bold text-[#173f35]">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-3 w-full rounded-2xl border border-[#d7ded7] bg-[#fbfaf7] px-4 py-3 text-sm outline-none focus:border-[#587b5a]"
            />
          </label>
          {error && (
            <div className="rounded-2xl bg-[#fee7e3] px-4 py-3 text-sm text-[#9a3326]">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full rounded-full bg-[#e86f42] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(232,111,66,.25)] transition hover:-translate-y-0.5"
          >
            Sign in
          </button>
        </form>
        <div className="mt-8 flex flex-col gap-2 text-sm text-[#617067] sm:flex-row sm:items-center sm:justify-between">
          <p>New to Nkoso?</p>
          <button
            onClick={() => navigate("register")}
            className="font-bold text-[#173f35] underline underline-offset-4"
          >
            Create an account
          </button>
        </div>
      </div>
    </section>
  );
}
