import { useEffect, useState } from "react";
import database from "../services/database";

export default function TestPage() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    async function load() {
      try {
        const rows = await database.list("messages");

        console.log("Rows returned:", rows);

        if (!rows || rows.length === 0) {
          setMessage("No data found.");
        } else {
          setMessage(rows[0].message);
        }
      } catch (err) {
        console.error("Database Error:", err);
        setMessage(err.message);
      }
    }

    load();
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Supabase Test</h1>
      <p>{message}</p>
    </div>
  );
}
