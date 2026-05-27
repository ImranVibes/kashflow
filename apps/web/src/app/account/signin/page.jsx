import { useState, useEffect } from "react";
import useAuth from "@/utils/useAuth";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signInWithCredentials } = useAuth();

  // Check if NextAuth redirected back with an error in the URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get("error");
    if (urlError) {
      const messages = {
        CredentialsSignin: "Incorrect email or password. Please try again.",
        "no-account": "No account found with this email. Please sign up first.",
        AccessDenied: "Access denied. Please check your credentials.",
        Configuration: "Something went wrong. Please try again later.",
        Default: "Sign-in failed. Please check your credentials and try again.",
      };
      setError(messages[urlError] || messages.Default);
    }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }
    setLoading(true);
    try {
      // Use redirect: false so we get the result back instead of a page reload
      const result = await signInWithCredentials({
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        const messages = {
          CredentialsSignin: "Incorrect email or password. Please try again.",
          "no-account":
            "No account found with this email. Please sign up first.",
          AccessDenied: "Access denied.",
          Configuration: "Something went wrong. Please try again later.",
        };
        setError(
          messages[result.error] ||
            "Incorrect email or password. Please try again.",
        );
        setLoading(false);
      } else if (result?.ok || result?.url) {
        // Success — redirect to the app
        const callbackUrl =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("callbackUrl") ||
              "/"
            : "/";
        window.location.href = callbackUrl;
      } else {
        // Unknown response — assume error
        setError("Sign-in failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Sign-in error:", err);
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
            Welcome back
          </h1>
          <p style={{ fontSize: "14px", color: "#8E8E93", margin: 0 }}>
            Sign in to your account
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1.5px solid #FECACA",
              borderRadius: "12px",
              padding: "14px 16px",
              fontSize: "14px",
              color: "#DC2626",
              marginBottom: "20px",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "16px", flexShrink: 0 }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

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
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: `1.5px solid ${error ? "#FECACA" : "#E5E7EB"}`,
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
            placeholder="••••••••"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: `1.5px solid ${error ? "#FECACA" : "#E5E7EB"}`,
              fontSize: "15px",
              color: "#1C1C1E",
              outline: "none",
              boxSizing: "border-box",
              background: "#F9FAFB",
            }}
          />
        </div>

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
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <p style={{ textAlign: "center", fontSize: "14px", color: "#6B7280" }}>
          No account?{" "}
          <a
            href="/account/signup"
            style={{
              color: "#6366F1",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Create one
          </a>
        </p>
      </form>
    </div>
  );
}

export default MainComponent;
