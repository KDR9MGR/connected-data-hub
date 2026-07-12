import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "editor" | "blogger";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      if (s?.user) queueMicrotask(() => loadRoles(s.user));
      else setRoles([]);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) loadRoles(data.session.user);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadRoles(user: User) {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    setRoles((data ?? []).map((r) => r.role as AppRole));
  }

  const isAdmin = roles.includes("admin");
  // admin inherits editor/blogger for UI gating
  return {
    session,
    user: session?.user ?? null,
    roles,
    loading,
    isAdmin,
    isEditor: isAdmin || roles.includes("editor"),
    isBlogger: isAdmin || roles.includes("blogger"),
  };
}