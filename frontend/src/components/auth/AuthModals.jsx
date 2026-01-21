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
  Sparkles,
  Shield,
  Zap,
  Car,
} from "lucide-react";
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

// Input component with floating label
const FloatingInput = ({
  label,
  type = "text",
  value,
  onChange,
  icon: Icon,
  error,
  showPasswordToggle,
  autoComplete,
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isActive = focused || value;

  return (
    <div className="relative">
      <div
        className={`relative border-2 rounded-xl transition-all duration-200 ${
          error
            ? "border-red-400 bg-red-50/50"
            : focused
            ? "border-red-500 bg-white shadow-sm shadow-red-100"
            : "border-gray-200 bg-gray-50 hover:border-gray-300"
        }`}
      >
        {Icon && (
          <Icon
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
              error ? "text-red-400" : focused ? "text-red-500" : "text-gray-400"
            }`}
          />
        )}
        <input
          type={showPasswordToggle ? (showPassword ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          className={`w-full bg-transparent px-4 py-4 text-gray-900 placeholder-transparent focus:outline-none ${
            Icon ? "pl-12" : ""
          } ${showPasswordToggle ? "pr-12" : ""}`}
          placeholder={label}
        />
        <label
          className={`absolute transition-all duration-200 pointer-events-none ${
            Icon ? "left-12" : "left-4"
          } ${
            isActive
              ? "-top-2.5 text-xs bg-white px-2 rounded"
              : "top-1/2 -translate-y-1/2 text-base"
          } ${error ? "text-red-500" : focused ? "text-red-500" : "text-gray-500"}`}
        >
          {label}
        </label>
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </motion.p>
      )}
    </div>
  );
};

// Feature badge component
const FeatureBadge = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 text-gray-600 text-sm">
    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
      <Icon className="w-4 h-4 text-red-600" />
    </div>
    <span>{text}</span>
  </div>
);

// Main AuthModals Component
export const AuthModals = ({ openType, onClose }) => {
  const dispatch = useDispatch();
  const { status, error, passwordResetStatus, passwordResetError } = useSelector(
    (state) => state.auth
  );

  const [view, setView] = useState(openType);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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

  if (!openType) return null;

  return (
    <AnimatePresence>
      {openType && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Success overlay */}
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.1 }}
                      className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4"
                    >
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl font-semibold text-gray-900"
                    >
                      {successMessage}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content */}
              <div className="p-8">
                {/* Reset Sent View */}
                {view === "resetSent" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-6"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Mail className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Check Your Email</h2>
                    <p className="text-gray-600 mb-2">We've sent password reset instructions to:</p>
                    <p className="font-semibold text-gray-900 mb-6">{formData.email}</p>
                    <p className="text-sm text-gray-500 mb-8">
                      Didn't receive the email? Check your spam folder or try again.
                    </p>
                    <button
                      onClick={() => setView("login")}
                      className="flex items-center justify-center gap-2 text-red-600 hover:text-red-700 font-medium mx-auto"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Sign In
                    </button>
                  </motion.div>
                )}

                {/* Forgot Password View */}
                {view === "forgotPassword" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <button
                      onClick={() => setView("login")}
                      className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Sign In
                    </button>

                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-red-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                      <p className="text-gray-600">No worries, we'll send you reset instructions.</p>
                    </div>

                    {getErrorMessage() && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-start gap-3"
                      >
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{getErrorMessage()}</span>
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <FloatingInput
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        icon={Mail}
                        error={fieldErrors.email}
                        autoComplete="email"
                      />

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          "Send Reset Link"
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* Login / Register View */}
                {(view === "login" || view === "register") && (
                  <motion.div
                    key={view}
                    initial={{ opacity: 0, x: view === "login" ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Header */}
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-200">
                        <Car className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {view === "login" ? "Welcome Back!" : "Create Account"}
                      </h2>
                      <p className="text-gray-600">
                        {view === "login"
                          ? "Sign in to access your dashboard"
                          : "Join Zimbabwe's trusted car marketplace"}
                      </p>
                    </div>

                    {/* Error message */}
                    {getErrorMessage() && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-start gap-3"
                      >
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{getErrorMessage()}</span>
                      </motion.div>
                    )}

                    {/* Google Sign In */}
                    {GOOGLE_CLIENT_ID && (
                      <>
                        <div className="flex justify-center mb-4">
                          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                            <GoogleLogin
                              onSuccess={handleGoogleSuccess}
                              onError={() => console.log("Google login failed")}
                              useOneTap={false}
                              theme="outline"
                              size="large"
                              text={view === "login" ? "signin_with" : "signup_with"}
                              shape="pill"
                              width="100%"
                            />
                          </GoogleOAuthProvider>
                        </div>

                        <div className="relative my-6">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                          </div>
                          <div className="relative flex justify-center">
                            <span className="bg-white px-4 text-sm text-gray-500">
                              or continue with email
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {view === "register" && (
                        <FloatingInput
                          label="Email Address"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          icon={Mail}
                          error={fieldErrors.email}
                          autoComplete="email"
                        />
                      )}

                      <FloatingInput
                        label="Username"
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        icon={User}
                        error={fieldErrors.username}
                        autoComplete="username"
                      />

                      <div>
                        <FloatingInput
                          label="Password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          icon={Lock}
                          error={fieldErrors.password}
                          showPasswordToggle
                          autoComplete={view === "login" ? "current-password" : "new-password"}
                        />

                        {/* Password strength indicator for register */}
                        {view === "register" && formData.password && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-2"
                          >
                            <div className="flex gap-1 mb-1">
                              {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                  key={level}
                                  className={`h-1 flex-1 rounded-full transition-colors ${
                                    level <= passwordStrength.score
                                      ? passwordStrength.color
                                      : "bg-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-gray-500">
                              Password strength:{" "}
                              <span
                                className={
                                  passwordStrength.score >= 4
                                    ? "text-green-600"
                                    : passwordStrength.score >= 3
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }
                              >
                                {passwordStrength.label}
                              </span>
                            </p>
                          </motion.div>
                        )}
                      </div>

                      {/* Remember me & Forgot password for login */}
                      {view === "login" && (
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-600">Remember me</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setView("forgotPassword")}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            Forgot password?
                          </button>
                        </div>
                      )}

                      {/* Submit button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-200 hover:-translate-y-0.5"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : view === "login" ? (
                          "Sign In"
                        ) : (
                          "Create Account"
                        )}
                      </button>
                    </form>

                    {/* Features for register */}
                    {view === "register" && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-3">
                          <FeatureBadge icon={Shield} text="Verified Sellers" />
                          <FeatureBadge icon={Zap} text="Instant Listings" />
                          <FeatureBadge icon={Sparkles} text="AI Assistant" />
                          <FeatureBadge icon={Car} text="80+ Vehicles" />
                        </div>
                      </div>
                    )}

                    {/* Switch view */}
                    <div className="mt-6 text-center">
                      <p className="text-gray-600">
                        {view === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                        <button
                          type="button"
                          onClick={() => setView(view === "login" ? "register" : "login")}
                          className="text-red-600 hover:text-red-700 font-semibold"
                        >
                          {view === "login" ? "Sign up" : "Sign in"}
                        </button>
                      </p>
                    </div>

                    {/* Terms for register */}
                    {view === "register" && (
                      <p className="mt-4 text-xs text-center text-gray-500">
                        By creating an account, you agree to our{" "}
                        <a href="/terms" className="text-red-600 hover:underline">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="/privacy" className="text-red-600 hover:underline">
                          Privacy Policy
                        </a>
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModals;
