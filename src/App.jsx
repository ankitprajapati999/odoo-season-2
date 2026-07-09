import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/react";
import TestPage from "./pages/test";

export default function App() {
  return (
    <div
      style={{
        padding: "40px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "30px",
          alignItems: "center",
        }}
      >
        <Show when="signed-out">
          <SignInButton />
          <SignUpButton />
        </Show>

        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>

      <TestPage />
    </div>
  );
}
