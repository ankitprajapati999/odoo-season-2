import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/react";

export default function App() {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        padding: "40px",
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
  );
}
