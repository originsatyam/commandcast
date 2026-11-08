import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/useAuth";

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalPrompt, signIn, signUp, signInAsDemo, isConfigured } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = useCallback(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
    closeAuthModal();
  }, [closeAuthModal]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, handleClose]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message);
        } else {
          closeAuthModal();
        }
      } else {
        const { error, user } = await signUp(email, password, fullName);
        if (error) {
          setErrorMsg(error.message);
        } else {
          // If email confirmation is required by Supabase project settings
          if (user && !user.confirmed_at && user.confirmation_sent_at) {
            setSuccessMsg("Account created! If email confirmation is enabled in your Supabase project, check your inbox or sign in below.");
            setMode("signin");
          } else {
            closeAuthModal();
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected authentication error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = () => {
    signInAsDemo("Satyam Manik", "satyam.manik@example.com");
  };

  return (
    <div
      className="auth-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Close Button */}
        <div className="auth-modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="auth-icon-badge">
              <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <span className="t-label kick" style={{ color: "var(--violet)", display: "block" }}>
                Supabase Auth &middot; RLS
              </span>
              <h2 id="auth-modal-title" className="t-h3" style={{ margin: "2px 0 0" }}>
                {mode === "signin" ? "Sign In to Campus Radar" : "Create Student Account"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            className="icon-btn sm"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Auth prompt context */}
        {authModalPrompt && (
          <p className="dim" style={{ fontSize: "0.875rem", margin: 0, lineHeight: 1.45 }}>
            {authModalPrompt}
          </p>
        )}

        {/* Backend status indicator */}
        <div className="auth-status-bar">
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: isConfigured ? "var(--ok)" : "var(--warn)",
              boxShadow: isConfigured ? "0 0 8px rgba(14, 122, 78, 0.4)" : "none",
              display: "inline-block"
            }}
          />
          <span>
            {isConfigured
              ? "Connected to live Supabase Backend"
              : "Development sandbox · Instant demo authentication available"}
          </span>
        </div>

        {/* Tab switchers: Sign In vs Sign Up */}
        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            className={`auth-tab-btn ${mode === "signin" ? "active" : ""}`}
            role="tab"
            aria-selected={mode === "signin"}
            onClick={() => {
              setMode("signin");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === "signup" ? "active" : ""}`}
            role="tab"
            aria-selected={mode === "signup"}
            onClick={() => {
              setMode("signup");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Feedback */}
        {errorMsg && (
          <div
            style={{
              padding: "10px 14px",
              background: "var(--crit-soft)",
              border: "1px solid var(--crit)",
              borderRadius: "var(--r-2)",
              color: "var(--crit)",
              fontSize: "0.8125rem",
              lineHeight: 1.4
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Success Feedback */}
        {successMsg && (
          <div
            style={{
              padding: "10px 14px",
              background: "var(--ok-soft)",
              border: "1px solid var(--ok)",
              borderRadius: "var(--r-2)",
              color: "var(--ok)",
              fontSize: "0.8125rem",
              lineHeight: 1.4
            }}
          >
            {successMsg}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--s-3)" }}>
          {mode === "signup" && (
            <div className="field">
              <label htmlFor="auth-fullname" style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--ink-2)", marginBottom: 4, display: "block" }}>
                Full Name
              </label>
              <input
                id="auth-fullname"
                type="text"
                className="input"
                placeholder="e.g. Satyam Manik"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="auth-email" style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--ink-2)", marginBottom: 4, display: "block" }}>
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              className="input"
              placeholder="satyam@example.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="auth-password" style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--ink-2)", marginBottom: 4, display: "block" }}>
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              className="input"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "var(--s-2)", justifyContent: "center" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : mode === "signin" ? (
              <span>Sign In with Supabase</span>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Instant 1-Click Demo Testing Option */}
        <div style={{ paddingTop: "var(--s-3)", borderTop: "1px solid var(--line)", textAlign: "center" }}>
          <p className="dim" style={{ fontSize: "0.75rem", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
            Instant Testing · No Verification Required
          </p>
          <button
            type="button"
            className="auth-demo-btn"
            onClick={handleDemoSignIn}
          >
            <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>Continue as Satyam Manik (Product Designer Demo)</span>
          </button>
          <span className="dim" style={{ fontSize: "0.75rem", display: "block", marginTop: 6 }}>
            Unlocks private tracker, resume parser, and verified radar instantaneously.
          </span>
        </div>
      </div>
    </div>
  );
};
