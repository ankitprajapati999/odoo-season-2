import { useEffect, useState } from "react";
import { useUser } from "@clerk/react";

import { useSupabase } from "../auth/supabase";
import database from "../services/database";

export default function TestPage() {
  const { user } = useUser();
  const supabase = useSupabase();

  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    async function load() {
      try {
        const rows = await database.list(
          supabase,
          "messages"
        );

        if (rows.length === 0) {
          setMessage("No data found.");
        } else {
          setMessage(rows[0].message);
        }
      } catch (error) {
        console.error(error);
        setMessage(error.message);
      }
    }

    load();
  }, [supabase]);

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "24px",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      <h1>🔐 Clerk + Supabase + RLS Test</h1>

      <hr />

      <h3>Current User</h3>

      <p>
        <strong>Name:</strong> {user?.fullName || "Unknown"}
      </p>

      <p>
        <strong>Email:</strong>{" "}
        {user?.primaryEmailAddress?.emailAddress}
      </p>

      <p>
        <strong>Clerk User ID:</strong>
      </p>

      <code>{user?.id}</code>

      <hr />

      <h3>Database Result</h3>

      <p>{message}</p>
    </div>
  );
}
