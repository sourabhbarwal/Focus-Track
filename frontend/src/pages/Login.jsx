// // frontend/src/pages/Login.jsx
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   auth,
//   googleProvider,
//   signInWithPopup,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
// } from "../firebase";
// import { onAuthStateChanged } from "firebase/auth";
// import { api } from "../api";

// export default function Login() {
//   const [mode, setMode] = useState("login"); // "login" | "signup"
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("member"); // admin or member
//   const [loading, setLoading] = useState(false);
//   const [errorText, setErrorText] = useState("");

//   const navigate = useNavigate();

//   // helper: register user in our MongoDB with role
//   const registerInBackend = async (firebaseUser, role) => {
//     try {
//       await api.post("/users/syncFromFirebase", {
//       firebaseUid: firebaseUser.uid,
//       email: firebaseUser.email,
//       name: firebaseUser.displayName || firebaseUser.email,
//       role, // "admin" or "member", from your signup form
//       });
//     } catch (err) {
//         console.error("Backend user registration error", err);
//   }
//   };

//   // helper: check if user exists in backend
//   const fetchBackendUser = async (firebaseUser) => {
//     const res = await api.get("/users/byUid", {
//       params: { firebaseUid: firebaseUser.uid },
//     });
//     return res.data;
//   };

//   // Email/password login
//   const handleEmailLogin = async (e) => {
//     e.preventDefault();
//     setErrorText("");
//     setLoading(true);
//     try {
//       const cred = await signInWithEmailAndPassword(auth, email, password);
//       const firebaseUser = cred.user;

//       try {
//         await fetchBackendUser(firebaseUser);
//         // success: user registered → go to dashboard
//         navigate("/dashboard");
//       } catch (err) {
//         // not registered in app → switch to signup with role
//         console.warn("User not found in backend, redirecting to signup");
//         setMode("signup");
//         setErrorText(
//           "This account is not registered in FocusTrack. Please complete sign up."
//         );
//       }
//     } catch (err) {
//       console.error("Email login error:", err);
//       setErrorText(err.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Email/password signup
//   const handleEmailSignup = async (e) => {
//     e.preventDefault();
//     setErrorText("");
//     setLoading(true);
//     try {
//       const cred = await createUserWithEmailAndPassword(auth, email, password);
//       const firebaseUser = cred.user;
//       await registerInBackend(firebaseUser, role);
//       navigate("/dashboard");
//     } catch (err) {
//       console.error("Email signup error:", err);
//       setErrorText(err.message || "Sign up failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Google login/signup logic
//   const handleGoogleAuth = async () => {
//     setErrorText("");
//     setLoading(true);
//     try {
//       const result = await signInWithPopup(auth, googleProvider);
//       const firebaseUser = result.user;

//       try {
//         // if already registered in MongoDB → go dashboard
//         await fetchBackendUser(firebaseUser);
//         navigate("/dashboard");
//       } catch (err) {
//         // backend 404 → not registered → ask for role (signup)
//         console.warn("Google user not found in backend, need signup");
//         setEmail(firebaseUser.email || "");
//         setMode("signup");
//         setErrorText(
//           "We found your Google account but it is not registered in FocusTrack. Please choose a role and complete sign up."
//         );
//         // user is already logged into Firebase; only backend registration left
//       }
//     } catch (err) {
//       console.error("Google auth error:", err);
//       setErrorText(err.message || "Google sign-in failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isLogin = mode === "login";

//   return (
//     <div className="min-h-screen w-screen flex items-center justify-center bg-gray-50">
//       <div className="w-full max-w-md mx-4">
//         <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 md:p-8">
//           {/* Logo + title */}
//           <div className="flex items-center justify-center gap-2 mb-6">
//             <span className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-500/20 border border-gray-400/60 text-lg">
//               <link rel="icon" type="image/png" href="ft.png" />
//             </span>
//             <div className="text-center">
//               <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
//                 Focus<span className="text-gray-500">Track</span>
//               </h1>
//               <p className="text-[11px] md:text-xs text-gray-700 mt-1">
//                 Plan tasks, focus deeply, and track your progress.
//               </p>
//             </div>
//           </div>

//           {/* Toggle buttons */}
//           <div className="flex mb-4 text-xs bg-gray-200/60 rounded-xl p-1">
//             <button
//               className={`flex-1 py-1.5 rounded-lg ${
//                 isLogin
//                   ? "bg-white text-gray-200"
//                   : "text-gray-200 hover:text-gray-200"
//               }`}
//               onClick={() => {
//                 setMode("login");
//                 setErrorText("");
//               }}
//             >
//               Login
//             </button>
//             <button
//               className={`flex-1 py-1.5 rounded-lg ${
//                 !isLogin
//                   ? "bg-white text-gray-200"
//                   : "text-gray-200 hover:text-gray-200"
//               }`}
//               onClick={() => {
//                 setMode("signup");
//                 setErrorText("");
//               }}
//             >
//               Sign Up
//             </button>
//           </div>

//           {/* Error */}
//           {errorText && (
//             <div className="mb-3 text-[11px] text-red-300 bg-red-900/30 border border-red-700/50 rounded-xl px-3 py-2">
//               {errorText}
//             </div>
//           )}

//           {/* Form */}
//           <form
//             className="space-y-3 text-xs md:text-sm"
//             onSubmit={isLogin ? handleEmailLogin : handleEmailSignup}
//           >
//             <div className="space-y-1">
//               <label className="block text-gray-900">Email</label>
//               <input
//                 type="email"
//                 required
//                 className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-100 text-gray-700 text-xs md:text-sm"
//                 placeholder="you@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 autoComplete="email"
//               />
//             </div>

//             <div className="space-y-1">
//               <label className="block text-gray-900">Password</label>
//               <input
//                 type="password"
//                 required
//                 minLength={6}
//                 className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-100 text-gray-700 text-xs md:text-sm"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 autoComplete={isLogin ? "current-password" : "new-password"}
//               />
//             </div>

//             {/* Role selection only in Sign Up mode */}
//             {!isLogin && (
//               <div className="space-y-1">
//                 <label className="block text-gray-900">
//                   Select your role
//                 </label>
//                 <select
//                   className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 text-xs md:text-sm"
//                   value={role}
//                   onChange={(e) => setRole(e.target.value)}
//                 >
//                     <option value="admin">Admin (manage team & tasks)</option>
//                     <option value="member">Team member (work on tasks)</option>
//                 </select>
//                 <p className="text-[11px] text-gray-900">
//                   This is stored in the database and remembered for next logins.
//                 </p>
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full mt-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-gray-200 font-medium text-xs md:text-sm"
//             >
//               {loading
//                 ? "Please wait..."
//                 : isLogin
//                 ? "Login with Email"
//                 : "Sign Up with Email"}
//             </button>
//           </form>

//           {/* Divider */}
//           <div className="flex items-center gap-3 my-4">
//             <div className="h-px flex-1 bg-gray-900" />
//             <span className="text-[10px] text-gray-900">OR</span>
//             <div className="h-px flex-1 bg-gray-900" />
//           </div>

//           {/* Google button */}
//           <button
//             onClick={handleGoogleAuth}
//             disabled={loading}
//             className="w-full py-2 rounded-xl border border-gray-200 bg-gray-100 hover:border-gray-500 flex items-center justify-center gap-2 text-xs md:text-sm text-gray-200"
//           >
//             <span>🔐</span>
//             <span>Continue with Google</span>
//           </button>

//           <p className="mt-4 text-[10px] text-center text-gray-900">
//             New Google users will be asked to choose a role the first time and
//             will stay logged in next time.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
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
import { motion, AnimatePresence } from "framer-motion";

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
        {/* 🎥 OPTIONAL VIDEO BACKGROUND */}
          {/* 
            <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src={bgVideo}
            />
          */}

      {/* 🌈 Gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-indigo-300 via-purple-200 to-blue-300 " />

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
        <div className="backdrop-blur-xl bg-white/65 border border-white/30 shadow-2xl rounded-3xl p-8">

          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Focus<span className="text-indigo-600">Track</span>
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              Plan. Focus. Execute.
            </p>
          </div>

          {/* 🔁 Animated Toggle */}
          <div className="relative p-5 mb-5 flex">
            <motion.div
              layout
              className="absolute top-1 bottom-1 w-1/2"
              initial={false}
              animate={{ x: isLogin ? "0%" : "100%" }}
              transition={{ type:"inertia", stiffness: 300, damping: 30 }}
            />
            <button
              className={`relative z-10 flex-1 py-2 text-sm ${
                isLogin ? "text-white font-medium" : "text-white "
              }`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`relative z-10 flex-1 py-2 text-sm ${
                !isLogin ? "text-white font-medium" : "text-white"
              }`}
              onClick={() => setMode("signup")}
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
              <input
                type="email"
                placeholder="Email"
                required
                className="w-full px-4 py-2 rounded-xl border border-indigo-200 text-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                required
                minLength={6}
                className="w-full px-4 py-2 rounded-xl border border-indigo-200 text-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {!isLogin && (
                <select
                  className="w-full px-4 py-2 rounded-xl border text-indigo-300 border-indigo-200 focus:ring-2 focus:ring-indigo-400 outline-none"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                  ? "Login"
                  : "Create Account"}
              </button>
            </motion.form>
          </AnimatePresence>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-400" />
            <span className="text-xs text-gray-600">OR</span>
            <div className="flex-1 h-px bg-gray-400" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleAuth}
            className="w-full py-2 rounded-xl border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 text-sm"
          >
            🔐 Continue with Google
          </button>

          <p className="text-[11px] text-center text-gray-500 mt-4">
            Secure authentication powered by Firebase
          </p>
        </div>
      </motion.div>
    </div>
  );
}