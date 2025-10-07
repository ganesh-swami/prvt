import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { database } from "@/lib/database";
import { userApi, organizationApi, analyticsApi } from "@/lib/api";
import { User } from "@supabase/supabase-js";
import { User as AppUser, Organization } from "@/types";

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  currentOrganization: Organization | null;
  organizations: Organization[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  switchOrganization: (orgId: string) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [currentOrganization, setCurrentOrganization] =
    useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  // Utility: ensure promises can't hang UI indefinitely
  const withTimeout = async <T,>(
    promise: Promise<T>,
    ms = 15000
  ): Promise<T> => {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Operation timed out")), ms)
      ),
    ]);
  };

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      // Fallback: never keep the app stuck in loading
      setLoading(false);
    }, 3000);
    // If a logout guard is present, keep user logged out and retry signOut in background
    const hasLogoutGuard = localStorage.getItem("logout_guard") === "1";
    if (hasLogoutGuard) {
      setUser(null);
      setAppUser(null);
      setCurrentOrganization(null);
      setOrganizations([]);
      setLoading(false);
      database
        .signOut()
        .catch(() => {})
        .finally(() => {
          localStorage.removeItem("logout_guard");
        });
      return () => {
        clearTimeout(safetyTimer);
      };
    }
    // Get initial session (avoid aggressive timeouts; rely on safety timer)
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchAppUser(session.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch((e) => {
        console.warn("getSession failed:", e);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchAppUser(session.user.id);
      } else {
        setUser(null);
        setAppUser(null);
        setCurrentOrganization(null);
        setOrganizations([]);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const fetchAppUser = async (userId: string) => {
    try {
      const [userData, userOrgs] = await Promise.all([
        userApi.getUserById(userId),
        organizationApi.getUserOrganizations(userId),
      ]);

      if (userData) {
        setAppUser(userData);
        setOrganizations(userOrgs);

        // Set current organization (first one or from localStorage)
        const savedOrgId = localStorage.getItem("currentOrganizationId");
        const targetOrg = savedOrgId
          ? userOrgs.find((org) => org.id === savedOrgId)
          : userOrgs[0];

        if (targetOrg) {
          setCurrentOrganization(targetOrg);
          localStorage.setItem("currentOrganizationId", targetOrg.id);
        }

        // Track login event (non-blocking)
        (async () => {
          try {
            await analyticsApi.trackEvent({
              event_name: "user_login",
              user_id: userId,
              org_id: targetOrg?.id,
              properties: { method: "email" },
            });
          } catch (e) {
            console.error("Analytics trackEvent failed:", e);
          }
        })();
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await database.signIn(email, password);
      // loading will normally be cleared by onAuthStateChange → fetchAppUser.finally
    } catch (error) {
      throw error;
    } finally {
      // Safety: ensure UI doesn't deadlock if auth event doesn't arrive
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const result = await database.signUp(email, password, { name });

      if (result.user) {
        // Create default organization
        await database.createUserOrganization(
          result.user.id,
          `${name}'s Organization`
        );

        // Track signup event (non-blocking)
        (async () => {
          try {
            await analyticsApi.trackEvent({
              event_name: "user_signup",
              user_id: result.user.id,
              properties: { method: "email" },
            });
          } catch (e) {
            console.error("Analytics trackEvent failed:", e);
          }
        })();
      }
    } catch (error) {
      throw error;
    } finally {
      // Safety: ensure UI doesn't deadlock if auth event doesn't arrive
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      // Track signout event (non-blocking)
      if (appUser) {
        analyticsApi
          .trackEvent({
            event_name: "user_logout",
            user_id: appUser.id,
            org_id: currentOrganization?.id,
          })
          .catch(() => {});
      }

      // Set a logout guard to prevent session rehydration on refresh
      localStorage.setItem("logout_guard", "1");

      // Fire-and-forget sign out; don't block UI if network is slow
      database.signOut().catch((e) => {
        console.warn("database.signOut failed (non-blocking):", e);
      });

      // Clear local state immediately
      setUser(null);
      setAppUser(null);
      setCurrentOrganization(null);
      setOrganizations([]);

      // Clear localStorage key we manage
      localStorage.removeItem("currentOrganizationId");
      // Do not reload; stay in SPA and show AuthLayout
    } catch (error) {
      console.error("Signout error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const switchOrganization = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
      localStorage.setItem("currentOrganizationId", orgId);

      // Track organization switch
      if (appUser) {
        analyticsApi.trackEvent({
          event_name: "organization_switched",
          user_id: appUser.id,
          org_id: orgId,
          properties: { org_name: org.name },
        });
      }
    }
  };

  const refreshUser = async () => {
    if (user) {
      await fetchAppUser(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        appUser,
        currentOrganization,
        organizations,
        loading,
        signIn,
        signUp,
        signOut,
        switchOrganization,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
