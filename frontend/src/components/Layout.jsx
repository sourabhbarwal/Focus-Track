// frontend/src/components/Layout.jsx
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { logout } from "../firebase";
import { api } from "../api";
import { motion, AnimatePresence } from "framer-motion";


const navLinkBase =
  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ";
const navLinkInactive = "text-indigo-400 hover:bg-white/20";
const navLinkActive = "bg-white/40 text-indigo-400 shadow-lg";


function NavLinks({ onNavigate, isAdmin }) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <NavLink
        to="/dashboard"
        onClick={onNavigate}
        className={({ isActive }) =>
          `${navLinkBase} ${
            isActive ? navLinkActive : navLinkInactive
          } w-full block`
        }
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/focus"
        onClick={onNavigate}
        className={({ isActive }) =>
          `${navLinkBase} ${
            isActive ? navLinkActive : navLinkInactive
          } w-full block`
        }
      >
        Focus Mode
      </NavLink>

      <NavLink
        to="/stats"
        onClick={onNavigate}
        className={({ isActive }) =>
          `${navLinkBase} ${
            isActive ? navLinkActive : navLinkInactive
          } w-full block`
        }
      >
        Stats
      </NavLink>

      {isAdmin && (
        <NavLink
          to="/admin"
          onClick={onNavigate}
          className={({ isActive }) =>
            `${navLinkBase} ${
              isActive ? navLinkActive : navLinkInactive
            } w-full block`
          }
        >
          Admin Panel
        </NavLink>
      )}
    </nav>
  );
}

export default function Layout({ children }) {
  // ✅ get auth safely
  const auth = useAuth();
  const user = auth?.user || null;
  const isAdmin = user?.role === "admin";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [streak, setStreak] = useState(0);

  const displayName =
    user?.displayName || user?.name || user?.email || "User";
  const avatarUrl = user?.photoURL || null;
  const initials = (displayName[0] || "U").toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
      alert("Could not log out. Please try again.");
    }
  };

  const closeMobile = () => setMobileOpen(false);
  const todayLabel = new Date().toLocaleDateString();
  const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };
  // classname="min-h-screen bg-linear-to-br from-indigo-300 via-purple-200 to-blue-200 p-6"
  return (
    <div className="min-h-screen w-screen flex bg-linear-to-br from-indigo-300 via-purple-200 to-blue-200 overflow-hidden">
      {/* Sidebar (desktop) */}
      <motion.aside 
        className="hidden md:flex flex-col w-64 border-r border-indigo-900/90 backdrop-blur-xl"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {/* Profile */}
        <div className="px-5 py-4 border-b border-indigo-900/90 bg-white/30 backdrop-blur-lg flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-indigo-900"
            />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 text-medium font-semibold">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-indigo-700 truncate">
              {user?.email}
            </div>
            {user?.role && (
              <div className="text-[10px] text-gray-700 mt-0.5">
                Role: {user.role}
              </div>
            )}
          </div>
        </div>

        <NavLinks onNavigate={() => {}} isAdmin={isAdmin} />

        {/* Bottom area */}
        <div className="px-4 py-3 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 1 }}
            onClick={handleLogout}
            className=" px-4 py-2 rounded-xl bg-gray-600 hover:bg-gray-400 font-medium text-xs transition cursor-pointer"
            //className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-400 font-medium transition cursor-pointer"
          >
            Logout
          </motion.button>
        </div>
      </motion.aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 w-full h-full overflow-hidden">
        {/* Top bar */}
        <motion.header 
          className="md:hidden px-4 py-3 bg-linear-to-br from-indigo-300 via-purple-200 to-blue-200 backdrop-blur-xl flex items-center justify-between"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <motion.button
              whileHover={{scale: 1.1}}
              whileTap={{scale: 1 }}
              className="md:hidden inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-500 hover:border-slate-900 cursor-pointer"
              onClick={() => setMobileOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <div className="space-y-1">
                <span className="block w-3 h-0.5 bg-slate-900"></span>
                <span className="block w-3 h-0.5 bg-slate-900"></span>
                <span className="block w-3 h-0.5 bg-slate-900"></span>
              </div>
            </motion.button>

            <div className="flex items-center gap-2 font-semibold text-base md:text-lg">
              {/* <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-400/60 text-xs">
                🎯
              </span> */}
              <span className="text-gray-900 font-bold text-3xl">
                Focus<span className="text-indigo-600">Track</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs md:text-sm text-slate-900">
              <span>
                Today:{" "}
                <span className="text-slate-900 font-medium">
                  {todayLabel}
                </span>
              </span>
              
            </div>            
          </div>
        </motion.header>

        {/* Page content */}
        <main className="flex-1 w-full h-full overflow-y-auto p-4 md:p-6 bg-linear-to-br from-indigo-300 via-purple-200 to-blue-200 backdrop-blur-xl">
          {children}
        </main>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={closeMobile}
          ></div>

          <aside className="absolute inset-y-0 left-0 w-64 roundel-4xl bg-linear-to-br from-indigo-300 via-purple-200 to-blue-200 border-r border-indigo-600/60 flex flex-col">
            <div className="px-5 py-4 border-b border-indigo-900/90 bg-white/30 backdrop-blur-lg flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-indigo-900"
            />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 text-medium font-semibold">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-indigo-700 truncate">
                {user?.email}
              </div>
                {user?.role && (
                <div className="text-[10px] text-gray-700 mt-0.5">
                  Role: {user.role}
                </div>
                )}
              </div>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/30 text-gray-900 text-sm cursor-pointer"
                onClick={closeMobile}
              >
                ✕
              </button>
            </div>

            <NavLinks
              onNavigate={() => {
                closeMobile();
              }}
              isAdmin={isAdmin}
            />

            <div className="px-4 py-3 flex justify-center text-xs">
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 1 }}
                onClick={handleLogout}
                className=" px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-400 font-medium text-xs transition cursor-pointer"
              >
                Logout
              </motion.button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}