"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { ProfileScoreResult } from "@/lib/services/profile-score.service";

export interface UserStoreProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  country: string;
  website: string;
  image: string;
  avatar_url: string;
  emailVerified: boolean;
  account_status: string;
  role: string;
}

export interface UserStoreContextType {
  user: UserStoreProfile | null;
  avatarUrl: string;
  profileScore: ProfileScoreResult | null;
  isEmailVerified: boolean;
  isLoading: boolean;
  status: "authenticated" | "unauthenticated" | "loading";
  updateUserStore: (partial: Partial<UserStoreProfile>) => void;
  refreshUserStoreSilently: () => Promise<void>;
}

const UserStoreContext = createContext<UserStoreContextType | undefined>(undefined);

export function UserStoreProvider({ children }: { children: ReactNode }) {
  const { data: session, status: authStatus } = useSession();
  const [user, setUser] = useState<UserStoreProfile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [profileScore, setProfileScore] = useState<ProfileScoreResult | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasLoadedInitially, setHasLoadedInitially] = useState<boolean>(false);

  const fetchUserData = useCallback(async (isSilent = false) => {
    if (!isSilent && !hasLoadedInitially) {
      setIsLoading(true);
    }

    try {
      const res = await fetch("/api/v1/users/settings/all");
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;

        if (data.user) {
          const u: UserStoreProfile = data.user;
          setUser(u);
          const currentAvatar = u.image || u.avatar_url || "";
          setAvatarUrl(currentAvatar);
          setIsEmailVerified(Boolean(u.emailVerified));
        }

        if (data.profileScore) {
          setProfileScore(data.profileScore);
        }
        setHasLoadedInitially(true);
      }
    } catch (err) {
      console.error("[UserStore] Error loading user store data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [hasLoadedInitially]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      if (!hasLoadedInitially) {
        fetchUserData(false);
      }
    } else if (authStatus === "unauthenticated") {
      setUser(null);
      setAvatarUrl("");
      setProfileScore(null);
      setIsEmailVerified(false);
      setIsLoading(false);
      setHasLoadedInitially(false);
    }
  }, [authStatus, fetchUserData, hasLoadedInitially]);

  const updateUserStore = useCallback((partial: Partial<UserStoreProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...partial };
      if (partial.image || partial.avatar_url) {
        setAvatarUrl(partial.image || partial.avatar_url || "");
      }
      return updated;
    });
  }, []);

  const refreshUserStoreSilently = useCallback(async () => {
    await fetchUserData(true);
  }, [fetchUserData]);

  return (
    <UserStoreContext.Provider
      value={{
        user,
        avatarUrl: avatarUrl || user?.image || user?.avatar_url || session?.user?.image || "",
        profileScore,
        isEmailVerified,
        isLoading: authStatus === "loading" || isLoading,
        status: authStatus,
        updateUserStore,
        refreshUserStoreSilently,
      }}
    >
      {children}
    </UserStoreContext.Provider>
  );
}

export function useUserStore() {
  const context = useContext(UserStoreContext);
  if (!context) {
    throw new Error("useUserStore must be used within a UserStoreProvider");
  }
  return context;
}
