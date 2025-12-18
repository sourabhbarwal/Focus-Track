//frontend/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "../firebase";
import { api } from "../api";
import {motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const navigate = useNavigate();
  const isLogin = mode === "login";

  // ─────────────────────────────
  // Backend helpers
  // ─────────────────────────────
  const registerInBackend = async (firebaseUser, role) => {
    await api.post("/users/syncFromFirebase", {
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || firebaseUser.email,
      role,
    });
  };

  const fetchBackendUser = async (firebaseUser) => {
    const res = await api.get("/users/byUid", {
      params: { firebaseUid: firebaseUser.uid },
    });
    return res.data;
  };

  // ─────────────────────────────
  // Email login
  // ─────────────────────────────
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorText("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await fetchBackendUser(cred.user);
      navigate("/dashboard");
    } catch (err) {
      setErrorText(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────
  // Email signup
  // ─────────────────────────────
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorText("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await registerInBackend(cred.user, role);
      navigate("/dashboard");
    } catch (err) {
      setErrorText(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────
  // Google auth
  // ─────────────────────────────
  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorText("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      try {
        await fetchBackendUser(result.user);
        navigate("/dashboard");
      } catch {
        setEmail(result.user.email || "");
        setMode("signup");
        setErrorText("Choose a role to complete signup.");
      }
    } catch {
      setErrorText("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* 🔥 FORCE FULL SCREEN – fixes left stuck issue */
    <div className="fixed inset-0 z-9999 flex items-center justify-center overflow-hidden">
      {/* 🌈 Gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-indigo-400 via-purple-100 to-blue-200 " />

      {/* Blurred blobs */}
      <div className="absolute w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl top-16 left-16" />
      <div className="absolute w-80 h-80 bg-purple-500/30 rounded-full blur-3xl bottom-16 right-16" />

      {/* 🧊 Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="backdrop-blur-xl bg-white/30 border border-white/30 shadow-2xl rounded-3xl p-8">

          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Focus<span className="text-indigo-600">Track</span>
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              Plan. Focus. Execute.
            </p>
          </div>

          {/* Animated Login / Signup Toggle */}
          <div className="relative flex mb-5 rounded-xl p-1 overflow-hidden">

            {/* Sliding active pill */}
            <motion.div
              layout
              className="absolute inset-y-1 w-1/2 rounded-lg bg-indigo-400 shadow "
              animate={{ x: isLogin ? "0%" : "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            />

            {/* Login Button */}
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`relative z-10 flex-1 py-2 text-sm font-semibold rounded-xl transition-colors duration-300 cursor-pointer
                ${
                  isLogin
                    ? "text-white "
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Login
            </button>

            {/* Signup Button */}
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`relative z-10 flex-1 py-2 text-sm font-semibold rounded-xl transition-colors duration-300 cursor-pointer 
                ${
                  !isLogin
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Sign Up
            </button>
          </div>


          {/* Error */}
          <AnimatePresence>
            {errorText && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 text-xs text-red-700 bg-red-100 rounded-lg px-3 py-2"
              >
                {errorText}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{ duration: 0.75 }}
              onSubmit={isLogin ? handleEmailLogin : handleEmailSignup}
              className="space-y-4 text-sm"
            >
              <motion.input
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.15 }}
                type="email"
                placeholder="Email"
                required
                className="w-full px-4 py-2 rounded-xl border border-indigo-200 text-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <motion.input
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.15 }}
                type="password"
                placeholder="Password"
                required
                minLength={6}
                className="w-full px-4 py-2 rounded-xl border border-indigo-200 text-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {!isLogin && (
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  className="w-full px-4 py-2 rounded-xl border text-indigo-300 border-indigo-200 focus:ring-2 focus:ring-indigo-400 outline-none cursor-pointer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </motion.select>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 1 }}
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-400 font-medium transition cursor-pointer"
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                  ? "Login"
                  : "Create Account"}
              </motion.button>
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}