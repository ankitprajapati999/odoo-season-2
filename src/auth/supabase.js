import { useSession } from "@clerk/react";
import { createClient } from "@supabase/supabase-js";

export function useSupabase() {
  const { session } = useSession();

  if (!session) {
    throw new Error("No authenticated Clerk session found.");
  }

  return createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      accessToken: async () =>
        await session.getToken({
          template: import.meta.env.VITE_CLERK_JWT_TEMPLATE,
        }),
    }
  );
}
