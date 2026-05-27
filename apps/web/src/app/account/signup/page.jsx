import { useState, useEffect } from "react";
import useAuth from "@/utils/useAuth";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { signUpWithCredentials } = useAuth();

  // Check if auth redirected back with an error in the URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get("error");
    if (urlError) {
      const messages = {
        EmailCreateAccount:
          "An account with this email already exists. Try signing in instead.",
        CredentialsSignin: "This email is already registered. Please sign in.",
        Default: "Something went wrong. Please try again.",
      };
      setError(messages[urlError] || messages.Default);
    }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Please fill in your email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const result = await signUpWithCredentials({
        email: email.trim(),
        password,
        name: name.trim() || undefined,
        redirect: false,
      });

      if (result?.error) {
        const messages = {
          EmailCreateAccount:
            "An account with this email already exists. Try signing in.",
          CredentialsSignin: "This email may already be registered.",
          Configuration: "Something went wrong. Please try again later.",
        };
        setError(
          messages[result.error] ||
            "Could not create account. This email may already be registered.",
        );
        setLoading(false);
      } else if (result?.ok || result?.url) {
        window.location.href = "/";
      } else {
        setError("Could not create account. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Sign-up error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1C1C3A 0%, #0A2463 50%, #1B4FD8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <form
        noValidate
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#FFFFFF",
          borderRadius: "24px",
          padding: "40px 32px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>💼</div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "800",
              color: "#1C1C1E",
              margin: "0 0 4px",
            }}
          >
            Create Account
          </h1>
          <p style={{ fontSize: "14px", color: "#8E8E93", margin: 0 }}>
            Your data stays in the cloud
          </p>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "6px",
            }}
          >
            Name (optional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "1.5px solid #E5E7EB",
              fontSize: "15px",
              color: "#1C1C1E",
              outline: "none",
              boxSizing: "border-box",
              background: "#F9FAFB",
            }}
          />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "6px",
            }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "1.5px solid #E5E7EB",
              fontSize: "15px",
              color: "#1C1C1E",
              outline: "none",
              boxSizing: "border-box",
              background: "#F9FAFB",
            }}
          />
        </div>
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "6px",
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "1.5px solid #E5E7EB",
              fontSize: "15px",
              color: "#1C1C1E",
              outline: "none",
              boxSizing: "border-box",
              background: "#F9FAFB",
            }}
          />
        </div>

        {error && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "10px",
              padding: "12px 16px",
              fontSize: "13px",
              color: "#DC2626",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: "12px",
            background: loading
              ? "#C7C7CC"
              : "linear-gradient(135deg, #6366F1, #4F46E5)",
            color: "#FFFFFF",
            fontSize: "16px",
            fontWeight: "700",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "16px",
          }}
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>

        <p style={{ textAlign: "center", fontSize: "14px", color: "#6B7280" }}>
          Already have an account?{" "}
          <a
            href="/account/signin"
            style={{
              color: "#6366F1",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}

export default MainComponent;
