import useAuth from "@/utils/useAuth";

function MainComponent() {
  const { signOut } = useAuth();
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/", redirect: true });
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
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          background: "#FFFFFF",
          borderRadius: "24px",
          padding: "40px 32px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>👋</div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "800",
            color: "#1C1C1E",
            marginBottom: "8px",
          }}
        >
          Sign Out
        </h1>
        <p style={{ fontSize: "14px", color: "#8E8E93", marginBottom: "32px" }}>
          Are you sure you want to sign out?
        </p>
        <button
          onClick={handleSignOut}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #6366F1, #4F46E5)",
            color: "#FFFFFF",
            fontSize: "16px",
            fontWeight: "700",
            border: "none",
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default MainComponent;
