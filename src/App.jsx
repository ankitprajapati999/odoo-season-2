import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/react";

import TestPage from "./pages/test";

export default function App() {
  return (
    <div style={{ padding: "40px" }}>
      <SignedOut>
        <h1>Odoo Hackathon Season 2</h1>

        <p>Please sign in to continue.</p>

        <SignInButton />

        <span style={{ margin: "0 10px" }} />

        <SignUpButton />
      </SignedOut>

      <SignedIn>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "20px",
          }}
        >
          <UserButton />
        </div>

        <TestPage />
      </SignedIn>
    </div>
  );
}