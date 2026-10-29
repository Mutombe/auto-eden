// src/components/auth/AuthModals.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "../ui/icons";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { login, register, googleLogin, requestPasswordReset } from "../../redux/slices/authSlice";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// Password strength calculator
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const levels = [
    { score: 0, label: "", color: "" },
    { score: 1, label: "Weak", color: "bg-red-500" },
    { score: 2, label: "Fair", color: "bg-orange-500" },
    { score: 3, label: "Good", color: "bg-yellow-500" },
    { score: 4, label: "Strong", color: "bg-green-500" },
    { score: 5, label: "Very Strong", color: "bg-emerald-500" },
  ];
  return levels[Math.min(score, 5)];
};

// Labelled input in the same style as the admin sign-in: label above, quiet ring, red focus.
const FieldInput = ({ label, type = "text", value, onChange, icon: Icon, error, showPasswordToggle, autoComplete, autoFocus, trailing }) => {
  const [showPassword, setShowPassword] = useState(false);
  const id = `auth-${label.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
        {trailing}
      </div>
      <div className="relative">
        {Icon && <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none ${error ? "text-red-400" : "text-gray-400"}`} />}
        <input
          id={id}
          type={showPasswordToggle ? (showPassword ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-invalid={!!error}
          className={`w-full h-11 rounded-lg bg-white text-[15px] text-gray-900 placeholder-gray-400 border-0 ring-1 transition-shadow focus:outline-none focus:ring-2 ${
            Icon ? "pl-10" : "pl-3"
          } ${showPasswordToggle ? "pr-11" : "pr-3"} ${error ? "ring-red-300 focus:ring-red-500" : "ring-gray-200 hover:ring-gray-300 focus:ring-red-500"}`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-md text-gray-400 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
};

// The Auto Eden mark heads every auth card.
const BrandMark = () => (
  <div className="w-12 h-12 rounded-lg bg-white ring-1 ring-gray-200 shadow-sm grid place-items-center mb-4 overflow-hidden">
    <img src="/Auto-eden-favicon.png" alt="Auto Eden" className="w-9 h-9 object-contain" />
  </div>
);

const ErrorBanner = ({ children }) => (
  <div role="alert" className="bg-red-50 ring-1 ring-red-100 text-red-700 px-3 py-2.5 rounded-lg mb-4 flex items-start gap-2 text-sm">
    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);

const Spinner = () => <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />;

const PRIMARY_BTN =
  "w-full h-11 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-[15px] font-medium transition-colors flex items-center justify-center gap-2";

// Main AuthModals Component
export const AuthModals = ({ openType, onClose }) => {
  const dispatch = useDispatch();
  const { status, error, passwordResetStatus, passwordResetError } = useSelector(
    (state) => state.auth
  );

  const [view, setView] = useState(openType);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setView(openType);
    if (openType) {
      setFormData({ email: "", password: "", username: "", confirmPassword: "" });
      setFieldErrors({});
      setSuccessMessage("");
    }
  }, [openType]);

  const validateForm = () => {
    const errors = {};
    if (view === "register") {
      if (!formData.email) errors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email format";
      if (!formData.username) errors.username = "Username is required";
      else if (formData.username.length < 3) errors.username = "Username must be at least 3 characters";
      if (!formData.password) errors.password = "Password is required";
      else if (formData.password.length < 8) errors.password = "Password must be at least 8 characters";
    } else if (view === "login") {
      if (!formData.username) errors.username = "Username is required";
      if (!formData.password) errors.password = "Password is required";
    } else if (view === "forgotPassword") {
      if (!formData.email) errors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email format";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;

    try {
      if (view === "login") {
        await dispatch(login({ username: formData.username, password: formData.password })).unwrap();
        setSuccessMessage("Welcome back!");
        setTimeout(() => onClose(), 1000);
      } else if (view === "register") {
        await dispatch(register(formData)).unwrap();
        setSuccessMessage("Account created! Please sign in.");
        setTimeout(() => setView("login"), 1500);
      } else if (view === "forgotPassword") {
        await dispatch(requestPasswordReset(formData.email)).unwrap();
        setView("resetSent");
      }
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await dispatch(
        googleLogin({
          access_token: credentialResponse.credential,
          id_token: credentialResponse.credential,
        })
      ).unwrap();
      setSuccessMessage("Signed in with Google!");
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      console.error("Google login error:", err);
    }
  };

  const getErrorMessage = () => {
    if (view === "forgotPassword" && passwordResetError) {
      return typeof passwordResetError === "object"
        ? passwordResetError.detail || passwordResetError.email?.[0]
        : passwordResetError;
    }
    if (!error) return null;
    if (typeof error === "object") {
      return error.detail || error.username?.[0] || error.email?.[0] || error.non_field_errors?.[0];
    }
    return error;
  };

  const isLoading = status === "loading" || passwordResetStatus === "loading";
  const passwordStrength = getPasswordStrength(formData.password);

  // view catches up with openType in an effect, one render after the modal opens.
  if (!openType || !view) return null;

  const heading = {
    login: ["Sign in", "Welcome back to Auto Eden"],
    register: ["Create your account", "Buy and sell verified cars in Zimbabwe"],
    forgotPassword: ["Reset your password", "We'll email you a link to choose a new one"],
  }[view];

  return (
    <AnimatePresence>
      {openType && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-950/50 backdrop-blur-[2px] z-50"
          />

          <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={heading?.[0] || "Check your email"}
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="pointer-events-auto relative w-full max-w-[400px] bg-white rounded-xl shadow-[0_24px_60px_-20px_rgba(16,24,40,0.45)] ring-1 ring-black/5 overflow-hidden pacaembu-font"
              >
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute top-3 right-3 z-30 p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Success state */}
                <AnimatePresence>
                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center gap-3"
                    >
                      <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="w-14 h-14 rounded-full bg-emerald-50 grid place-items-center">
                        <CheckCircle weight="fill" className="w-8 h-8 text-emerald-500" />
                      </motion.div>
                      <p className="text-lg font-semibold text-gray-900">{successMessage}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="p-6 sm:p-7">
                  {view === "resetSent" ? (
                    <div>
                      <BrandMark />
                      <h2 className="text-lg font-semibold text-gray-900">Check your email</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        We sent reset instructions to <span className="font-medium text-gray-900">{formData.email}</span>. If it doesn't arrive in a few minutes, check your spam folder.
                      </p>
                      <button onClick={() => setView("login")} className={`${PRIMARY_BTN} mt-6`}>
                        Back to sign in
                      </button>
                    </div>
                  ) : (
                    <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
                      {view === "forgotPassword" && (
                        <button onClick={() => setView("login")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4 -mt-1 transition-colors">
                          <ArrowLeft className="w-4 h-4" />
                          Back to sign in
                        </button>
                      )}
                      <BrandMark />
                      <h2 className="text-lg font-semibold text-gray-900">{heading[0]}</h2>
                      <p className="text-sm text-gray-500 mt-0.5 mb-5">{heading[1]}</p>

                      {getErrorMessage() && <ErrorBanner>{getErrorMessage()}</ErrorBanner>}

                      {view !== "forgotPassword" && GOOGLE_CLIENT_ID && (
                        <>
                          <div className="flex justify-center">
                            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                              <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => console.log("Google login failed")}
                                useOneTap={false}
                                theme="outline"
                                size="large"
                                text={view === "login" ? "signin_with" : "signup_with"}
                                shape="rectangular"
                                width="300"
                              />
                            </GoogleOAuthProvider>
                          </div>
                          <div className="flex items-center gap-3 my-5 text-xs text-gray-400">
                            <div className="h-px flex-1 bg-gray-200" />
                            or with email
                            <div className="h-px flex-1 bg-gray-200" />
                          </div>
                        </>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
                        {view !== "login" && (
                          <FieldInput
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            icon={Mail}
                            error={fieldErrors.email}
                            autoComplete="email"
                            autoFocus={view === "forgotPassword"}
                          />
                        )}

                        {view !== "forgotPassword" && (
                          <>
                            <FieldInput
                              label="Username"
                              value={formData.username}
                              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                              icon={User}
                              error={fieldErrors.username}
                              autoComplete="username"
                              autoFocus={view === "login"}
                            />
                            <div>
                              <FieldInput
                                label="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                icon={Lock}
                                error={fieldErrors.password}
                                showPasswordToggle
                                autoComplete={view === "login" ? "current-password" : "new-password"}
                                trailing={
                                  view === "login" && (
                                    <button type="button" onClick={() => setView("forgotPassword")} className="text-sm text-red-600 hover:text-red-700 font-medium">
                                      Forgot password?
                                    </button>
                                  )
                                }
                              />
                              {view === "register" && formData.password && (
                                <div className="mt-2">
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                      <div
                                        key={level}
                                        className={`h-1 flex-1 rounded-full transition-colors ${level <= passwordStrength.score ? passwordStrength.color : "bg-gray-200"}`}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Strength: <span className="font-medium text-gray-700">{passwordStrength.label}</span>
                                  </p>
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        <button type="submit" disabled={isLoading} className={`${PRIMARY_BTN} !mt-5`}>
                          {isLoading ? <Spinner /> : { login: "Sign in", register: "Create account", forgotPassword: "Send reset link" }[view]}
                        </button>
                      </form>

                      {view !== "forgotPassword" && (
                        <p className="mt-5 text-sm text-center text-gray-500">
                          {view === "login" ? "New to Auto Eden?" : "Already have an account?"}{" "}
                          <button
                            type="button"
                            onClick={() => setView(view === "login" ? "register" : "login")}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            {view === "login" ? "Create an account" : "Sign in"}
                          </button>
                        </p>
                      )}

                      {view === "register" && (
                        <p className="mt-3 text-xs text-center text-gray-400">
                          By creating an account you agree to our{" "}
                          <a href="/privacy" className="text-gray-600 underline underline-offset-2 hover:text-gray-900">Privacy Policy</a> and{" "}
                          <a href="/cookies" className="text-gray-600 underline underline-offset-2 hover:text-gray-900">Cookie Policy</a>.
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModals;
