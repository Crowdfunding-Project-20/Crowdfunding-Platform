import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_CURRENT_USER = "nkoso.currentUser";
const STORAGE_ACCOUNTS = "nkoso.accounts";

const AuthContext = createContext(null);

function hashPassword(password) {
  return btoa(password.trim());
}

function loadAccounts() {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(STORAGE_ACCOUNTS);
  return stored ? JSON.parse(stored) : [];
}

function saveAccounts(accounts) {
  window.localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(accounts));
}

function createDefaultProfile() {
  return {
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80",
    about: "I care about community-led change and sustainable fundraising.",
    passions: ["Community", "Education", "Health"],
    visibility: true,
    followers: [
      { name: "Ama Mensah", detail: "Supported community health" },
      { name: "Kofi Asante", detail: "Backed local education" },
    ],
    following: [
      { name: "Selina Adu", detail: "Follows development work" },
      { name: "Kojo Badu", detail: "Follows rural impact" },
    ],
    stats: {
      donatedCampaigns: 0,
      totalDonated: "GH₵ 0",
      joined: new Date().toISOString(),
    },
    activity: [
      {
        id: "joined",
        title: "Joined Nkoso",
        description: "Created a member profile.",
        date: new Date().toLocaleDateString(),
      },
    ],
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [redirectPath, setRedirectPath] = useState("home");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_CURRENT_USER);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) {
      window.localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_CURRENT_USER);
    }
  }, [user]);

  const login = ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = hashPassword(password);
    const accounts = loadAccounts();
    const account = accounts.find(
      (account) =>
        account.email === normalizedEmail &&
        account.password === hashedPassword,
    );

    if (!account) {
      return { success: false, message: "No matching account found." };
    }

    const signedInUser = {
      name: account.name,
      email: account.email,
      createdAt: account.createdAt,
      profile: account.profile || createDefaultProfile(),
    };
    setUser(signedInUser);
    return { success: true, user: signedInUser };
  };

  const register = ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!name || !normalizedEmail || !password) {
      return { success: false, message: "Please complete all fields." };
    }

    const accounts = loadAccounts();
    if (accounts.some((account) => account.email === normalizedEmail)) {
      return {
        success: false,
        message: "An account with that email already exists.",
      };
    }

    const newAccount = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashPassword(password),
      createdAt: new Date().toISOString(),
      profile: createDefaultProfile(),
    };

    saveAccounts([...accounts, newAccount]);
    const signedInUser = {
      name: newAccount.name,
      email: newAccount.email,
      createdAt: newAccount.createdAt,
      profile: newAccount.profile,
    };
    setUser(signedInUser);
    return { success: true, user: signedInUser };
  };

  const updateProfile = (profileUpdates) => {
    if (!user) return { success: false };
    const accounts = loadAccounts();
    const nextAccounts = accounts.map((account) => {
      if (account.email !== user.email) return account;
      return {
        ...account,
        profile: {
          ...account.profile,
          ...profileUpdates,
        },
      };
    });
    saveAccounts(nextAccounts);
    setUser((current) =>
      current
        ? {
            ...current,
            profile: {
              ...current.profile,
              ...profileUpdates,
            },
          }
        : current,
    );
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isSignedIn: Boolean(user),
      login,
      register,
      logout,
      updateProfile,
      redirectPath,
      setRedirectPath,
    }),
    [user, redirectPath],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
