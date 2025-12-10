// // frontend/src/pages/AdminPanel.jsx
// import { useEffect, useState } from "react";
// import { useAuth } from "../context/AuthContext.jsx";
// import { api } from "../api";

// export default function AdminPanel() {
//   const { user } = useAuth();
//   const [users, setUsers] = useState([]);
//   const [teams, setTeams] = useState([]);
//   const [selected, setSelected] = useState(new Set());
//   const [teamName, setTeamName] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [creating, setCreating] = useState(false);
//   const [errorText, setErrorText] = useState("");
//   const [successText, setSuccessText] = useState("");

//   // previous detail states
//   const [activeTeamId, setActiveTeamId] = useState(null);
//   const [activeTeamDetails, setActiveTeamDetails] = useState(null);
//   const [detailsLoading, setDetailsLoading] = useState(false);

//   // NEW: modal toggle
//   const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

//   const isAdmin = user?.role === "admin";
//   const adminFirebaseUid = user?.uid;

//   // Fetch all users + all teams created by this admin
//   useEffect(() => {
//     const fetchData = async () => {
//       if (!adminFirebaseUid || !isAdmin) {
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       setErrorText("");
//       setSuccessText("");

//       try {
//         const [usersRes, teamsRes] = await Promise.all([
//           api.get("/users"),
//           api.get("/teams/byAdmin", {
//             params: { adminFirebaseUid },
//           }),
//         ]);

//         setUsers(usersRes.data || []);
//         setTeams(teamsRes.data || []);
//       } catch (err) {
//         console.error("AdminPanel fetch error:", err);
//         setErrorText("Could not load users or teams.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [adminFirebaseUid, isAdmin]);

//   // Load team details (members + progress) and show modal
//   const loadTeamDetails = async (teamId) => {
//     if (!teamId) return;

//     setActiveTeamId(teamId);
//     setDetailsLoading(true);
//     setErrorText("");
//     setSuccessText("");
//     setIsTeamModalOpen(true);        // 🔥 open modal immediately
//     setActiveTeamDetails(null);      // reset details while loading

//     try {
//       const res = await api.get("/teams/details", {
//         params: { teamId },
//       });
//       setActiveTeamDetails(res.data);
//     } catch (err) {
//       console.error("Team details error:", err);
//       setErrorText("Could not load team details.");
//     } finally {
//       setDetailsLoading(false);
//     }
//   };

//   const closeTeamModal = () => {
//     setIsTeamModalOpen(false);
//     setActiveTeamId(null);
//     setActiveTeamDetails(null);
//   };

//   const toggleSelect = (firebaseUid) => {
//     setSelected((prev) => {
//       const copy = new Set(prev);
//       if (copy.has(firebaseUid)) {
//         copy.delete(firebaseUid);
//       } else {
//         copy.add(firebaseUid);
//       }
//       return copy;
//     });
//   };

//   const handleCreateTeam = async (e) => {
//     e.preventDefault();
//     if (!adminFirebaseUid) return;

//     if (!teamName.trim()) {
//       setErrorText("Team name is required.");
//       return;
//     }
//     if (selected.size === 0) {
//       setErrorText("Select at least one member to add to the team.");
//       return;
//     }

//     setErrorText("");
//     setSuccessText("");
//     setCreating(true);

//     try {
//       const memberFirebaseUids = Array.from(selected);

//       const res = await api.post("/teams/createFromUsers", {
//         adminFirebaseUid,
//         name: teamName.trim(),
//         memberFirebaseUids,
//       });

//       setTeams((prev) => [res.data, ...prev]);
//       setTeamName("");
//       setSelected(new Set());
//       setSuccessText("Team created successfully!");
//     } catch (err) {
//       console.error("Create team error:", err);
//       setErrorText(
//         err?.response?.data?.message || "Failed to create team. Try again."
//       );
//     } finally {
//       setCreating(false);
//     }
//   };

//   if (!user) {
//     return (
//       <div className="text-sm text-slate-400">
//         Please log in to view the admin panel.
//       </div>
//     );
//   }

//   if (!isAdmin) {
//     return (
//       <div className="text-sm text-slate-400">
//         You are logged in as{" "}
//         <span className="font-semibold">{user.email}</span> with role{" "}
//         <span className="font-semibold">{user.role || "member"}</span>. Only
//         admins can access this panel.
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-5xl mx-auto space-y-4">
//       <header>
//         <h1 className="text-xl md:text-2xl font-semibold text-slate-50">
//           Admin Panel
//         </h1>
//         <p className="text-xs md:text-sm text-slate-400 mt-1">
//           Manage users, teams and see an overview of activity.
//         </p>
//       </header>

//       {errorText && (
//         <div className="text-xs text-red-300 bg-red-900/30 border border-red-700/50 rounded-xl px-3 py-2">
//           {errorText}
//         </div>
//       )}
//       {successText && (
//         <div className="text-xs text-emerald-300 bg-emerald-900/20 border border-emerald-700/40 rounded-xl px-3 py-2">
//           {successText}
//         </div>
//       )}

//       {loading ? (
//         <div className="text-xs text-slate-400">Loading users and teams…</div>
//       ) : (
//         <>
//           {/* Create team from users */}
//           <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
//             <h2 className="text-sm font-semibold text-slate-100 mb-2">
//               Create team from registered users
//             </h2>

//             <form
//               className="space-y-3 text-xs md:text-sm"
//               onSubmit={handleCreateTeam}
//             >
//               <div className="space-y-1">
//                 <label className="block text-slate-300">Team name</label>
//                 <input
//                   className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs md:text-sm"
//                   placeholder="e.g. Final Year Project Squad"
//                   value={teamName}
//                   onChange={(e) => setTeamName(e.target.value)}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <span className="text-slate-300 text-xs md:text-sm">
//                     Select members
//                   </span>
//                   <span className="text-[11px] text-slate-500">
//                     {selected.size} selected
//                   </span>
//                 </div>

//                 <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-xl">
//                   {users.length === 0 ? (
//                     <div className="p-3 text-xs text-slate-500">
//                       No users registered yet.
//                     </div>
//                   ) : (
//                     <ul className="divide-y divide-slate-800 text-xs md:text-sm">
//                       {users.map((u) => (
//                         <li
//                           key={u.firebaseUid}
//                           className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800/60"
//                         >
//                           <input
//                             type="checkbox"
//                             className="w-4 h-4"
//                             checked={selected.has(u.firebaseUid)}
//                             onChange={() => toggleSelect(u.firebaseUid)}
//                             disabled={u.firebaseUid === adminFirebaseUid} // admin will always be added automatically
//                           />
//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-center gap-2">
//                               <span className="font-medium text-slate-100 truncate">
//                                 {u.name || u.email}
//                               </span>
//                               {u.role === "admin" && (
//                                 <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-[10px] text-indigo-200 border border-indigo-500/50">
//                                   admin
//                                 </span>
//                               )}
//                             </div>
//                             <div className="text-[11px] text-slate-400 truncate">
//                               {u.email}
//                             </div>
//                           </div>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={creating}
//                 className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-slate-50 font-medium text-xs md:text-sm"
//               >
//                 {creating ? "Creating team…" : "Create team"}
//               </button>
//             </form>
//           </section>

//           {/* Team list */}
//           <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-2">
//             <h2 className="text-sm font-semibold text-slate-100 mb-1">
//               Your teams
//             </h2>
//             {teams.length === 0 ? (
//               <div className="text-xs text-slate-500">
//                 You haven&apos;t created any teams yet.
//               </div>
//             ) : (
//               <ul className="space-y-2 text-xs md:text-sm">
//                 {teams.map((t) => (
//                   <li
//                     key={t._id}
//                     className={`border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer hover:border-indigo-500/60 ${
//                       activeTeamId === t._id
//                         ? "border-indigo-500/80 bg-slate-900"
//                         : ""
//                     }`}
//                     onClick={() => loadTeamDetails(t._id)}
//                   >
//                     <div>
//                       <div className="font-medium text-slate-100">
//                         {t.name}
//                       </div>
//                       <div className="text-[11px] text-slate-500">
//                         Team ID: <span className="font-mono">{t._id}</span>
//                       </div>
//                     </div>
//                     <div className="text-[11px] text-slate-400">
//                       Created: {new Date(t.createdAt).toLocaleDateString()}
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </section>
//         </>
//       )}

//       {/* === TEAM DETAILS MODAL (popup) === */}
//       {isTeamModalOpen && (
//         <TeamDetailsModal
//           details={activeTeamDetails}
//           loading={detailsLoading}
//           onClose={closeTeamModal}
//           adminFirebaseUid={adminFirebaseUid}
//           allUsers={users}
//           onTeamUpdated={(updatedTeam) => {
//             // update list
//             setTeams((prev) =>
//               prev.map((t) => (t._id === updatedTeam._id ? updatedTeam : t))
//             );
//             // refresh details (modal stays open)
//             loadTeamDetails(updatedTeam._id);
//             setSuccessText("Team updated successfully.");
//           }}
//           onError={(msg) => setErrorText(msg)}
//         />
//       )}
//     </div>
//   );
// }

// /**
//  * Modal showing team details (progress + members + edit form)
//  */
// function TeamDetailsModal({
//   details,
//   loading,
//   onClose,
//   adminFirebaseUid,
//   allUsers,
//   onTeamUpdated,
//   onError,
// }) {
//   const team = details?.team;
//   const stats = details?.stats;
//   const members = details?.users || [];

//   return (
//     <div
//       className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
//       onClick={onClose}
//     >
//       <div
//         className="bg-slate-950 border border-slate-800 rounded-2xl max-w-3xl w-full mx-4 p-4 md:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Close button */}
//         <button
//           onClick={onClose}
//           className="absolute top-3 right-3 text-slate-400 hover:text-slate-100 text-lg"
//           aria-label="Close"
//         >
//           ✕
//         </button>

//         {loading || !team ? (
//           <div className="text-sm text-slate-400">Loading team details…</div>
//         ) : (
//           <>
//             {/* Header */}
//             <div className="mb-4 flex items-center justify-between gap-3">
//               <div>
//                 <h2 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
//                   <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 text-sm">
//                     👥
//                   </span>
//                   {team.name}
//                 </h2>
//                 <p className="text-[11px] text-slate-500 mt-1">
//                   Team ID: <span className="font-mono">{team._id}</span>
//                 </p>
//               </div>
//             </div>

//             {/* Progress */}
//             <div className="space-y-1 mb-4">
//               <div className="flex items-center justify-between text-xs text-slate-300">
//                 <span>Progress</span>
//                 <span>
//                   {stats.completedTasks}/{stats.totalTasks} tasks done (
//                   {stats.progressPercent}%)
//                 </span>
//               </div>
//               <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
//                 <div
//                   className="h-2 bg-emerald-500"
//                   style={{ width: `${stats.progressPercent}%` }}
//                 ></div>
//               </div>
//             </div>

//             {/* Members */}
//             <div className="space-y-2 mb-4">
//               <h3 className="text-xs font-semibold text-slate-200">
//                 Members
//               </h3>
//               {members.length === 0 ? (
//                 <div className="text-[11px] text-slate-500">
//                   No user records for this team.
//                 </div>
//               ) : (
//                 <ul className="space-y-1 text-[11px] md:text-xs">
//                   {members.map((m) => (
//                     <li
//                       key={m.firebaseUid}
//                       className="flex items-center justify-between border border-slate-800 rounded-lg px-3 py-1.5"
//                     >
//                       <div className="flex flex-col">
//                         <span className="text-slate-100">
//                           {m.name || m.email}
//                         </span>
//                         <span className="text-slate-500">{m.email}</span>
//                       </div>
//                       <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 text-[10px]">
//                         {m.role}
//                       </span>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>

//             {/* Edit form inside modal */}
//             <TeamEditForm
//               adminFirebaseUid={adminFirebaseUid}
//               allUsers={allUsers}
//               details={details}
//               onUpdated={onTeamUpdated}
//               onError={onError}
//             />
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// /**
//  * Small sub-component to edit team name + members.
//  */
// function TeamEditForm({
//   adminFirebaseUid,
//   allUsers,
//   details,
//   onUpdated,
//   onError,
// }) {
//   const [name, setName] = useState(details.team.name);
//   const [saving, setSaving] = useState(false);
//   const [selectedMembers, setSelectedMembers] = useState(
//     new Set(details.team.memberFirebaseUids)
//   );

//   // keep state in sync when different team is selected
//   useEffect(() => {
//     setName(details.team.name);
//     setSelectedMembers(new Set(details.team.memberFirebaseUids));
//   }, [details]);

//   const toggleMember = (firebaseUid) => {
//     setSelectedMembers((prev) => {
//       const copy = new Set(prev);
//       if (copy.has(firebaseUid)) copy.delete(firebaseUid);
//       else copy.add(firebaseUid);
//       return copy;
//     });
//   };

//   const handleSave = async () => {
//     try {
//       setSaving(true);
//       onError && onError("");

//       const res = await api.put(`/teams/${details.team._id}`, {
//         adminFirebaseUid,
//         name,
//         memberFirebaseUids: Array.from(selectedMembers),
//       });

//       onUpdated && onUpdated(res.data);
//     } catch (err) {
//       console.error("Update team error:", err);
//       onError &&
//         onError(
//           err?.response?.data?.message || "Failed to update team."
//         );
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="space-y-3 text-xs md:text-sm mt-3">
//       <div className="space-y-1">
//         <label className="block text-slate-300">Edit team name</label>
//         <input
//           className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs md:text-sm"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />
//       </div>

//       <div className="space-y-2">
//         <div className="flex items-center justify-between">
//           <span className="text-slate-300">Edit members</span>
//           <span className="text-[11px] text-slate-500">
//             {selectedMembers.size} selected
//           </span>
//         </div>

//         <div className="max-h-40 overflow-y-auto border border-slate-800 rounded-xl">
//           <ul className="divide-y divide-slate-800 text-xs md:text-sm">
//             {allUsers.map((u) => {
//               const checked = selectedMembers.has(u.firebaseUid);
//               return (
//                 <li
//                   key={u.firebaseUid}
//                   className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800/60"
//                 >
//                   <input
//                     type="checkbox"
//                     className="w-4 h-4"
//                     checked={checked}
//                     onChange={() => toggleMember(u.firebaseUid)}
//                   />
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2">
//                       <span className="font-medium text-slate-100 truncate">
//                         {u.name || u.email}
//                       </span>
//                       {u.role === "admin" && (
//                         <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-[10px] text-indigo-200 border border-indigo-500/50">
//                           admin
//                         </span>
//                       )}
//                     </div>
//                     <div className="text-[11px] text-slate-400 truncate">
//                       {u.email}
//                     </div>
//                   </div>
//                 </li>
//               );
//             })}
//           </ul>
//         </div>
//       </div>

//       <button
//         onClick={handleSave}
//         disabled={saving}
//         className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-slate-50 font-medium text-xs md:text-sm"
//       >
//         {saving ? "Saving…" : "Save changes"}
//       </button>
//     </div>
//   );
// }

// frontend/src/pages/AdminPanel.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api";

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  const [activeTeamId, setActiveTeamId] = useState(null);
  const [activeTeamDetails, setActiveTeamDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const adminFirebaseUid = user?.uid;

  // Fetch all users + all teams created by this admin
  useEffect(() => {
    const fetchData = async () => {
      if (!adminFirebaseUid || !isAdmin) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorText("");
      setSuccessText("");

      try {
        const [usersRes, teamsRes] = await Promise.all([
          api.get("/users"),
          api.get("/teams/byAdmin", {
            params: { adminFirebaseUid },
          }),
        ]);

        setUsers(usersRes.data || []);
        setTeams(teamsRes.data || []);
      } catch (err) {
        console.error("AdminPanel fetch error:", err);
        setErrorText("Could not load users or teams.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [adminFirebaseUid, isAdmin]);

  // Load team details (members + progress) and show modal
  const loadTeamDetails = async (teamId) => {
    if (!teamId) return;

    setActiveTeamId(teamId);
    setDetailsLoading(true);
    setErrorText("");
    setSuccessText("");
    setIsTeamModalOpen(true);
    setActiveTeamDetails(null); // reset while fresh data loads

    try {
      const res = await api.get("/teams/details", {
        params: { teamId },
      });
      setActiveTeamDetails(res.data);
    } catch (err) {
      console.error("Team details error:", err);
      setErrorText("Could not load team details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeTeamModal = () => {
    setIsTeamModalOpen(false);
    setActiveTeamId(null);
    setActiveTeamDetails(null);
  };

  const toggleSelect = (firebaseUid) => {
    setSelected((prev) => {
      const copy = new Set(prev);
      if (copy.has(firebaseUid)) {
        copy.delete(firebaseUid);
      } else {
        copy.add(firebaseUid);
      }
      return copy;
    });
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!adminFirebaseUid) return;

    if (!teamName.trim()) {
      setErrorText("Team name is required.");
      return;
    }
    if (selected.size === 0) {
      setErrorText("Select at least one member to add to the team.");
      return;
    }

    setErrorText("");
    setSuccessText("");
    setCreating(true);

    try {
      const memberFirebaseUids = Array.from(selected);

      const res = await api.post("/teams/createFromUsers", {
        adminFirebaseUid,
        name: teamName.trim(),
        memberFirebaseUids,
      });

      setTeams((prev) => [res.data, ...prev]);
      setTeamName("");
      setSelected(new Set());
      setSuccessText("Team created successfully!");
    } catch (err) {
      console.error("Create team error:", err);
      setErrorText(
        err?.response?.data?.message || "Failed to create team. Try again."
      );
    } finally {
      setCreating(false);
    }
  };

  if (!user) {
    return (
      <div className="text-sm text-slate-400">
        Please log in to view the admin panel.
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-sm text-slate-400">
        You are logged in as{" "}
          <span className="font-semibold">{user.email}</span> with role{" "}
        <span className="font-semibold">{user.role || "member"}</span>. Only
        admins can access this panel.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-slate-50">
          Admin Panel
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Manage users, teams and see an overview of activity.
        </p>
      </header>

      {errorText && (
        <div className="text-xs text-red-300 bg-red-900/30 border border-red-700/50 rounded-xl px-3 py-2">
          {errorText}
        </div>
      )}
      {successText && (
        <div className="text-xs text-emerald-300 bg-emerald-900/20 border border-emerald-700/40 rounded-xl px-3 py-2">
          {successText}
        </div>
      )}

      {loading ? (
        <div className="text-xs text-slate-400">Loading users and teams…</div>
      ) : (
        <>
          {/* Create team from users */}
          <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-100 mb-2">
              Create team from registered users
            </h2>

            <form
              className="space-y-3 text-xs md:text-sm"
              onSubmit={handleCreateTeam}
            >
              <div className="space-y-1">
                <label className="block text-slate-300">Team name</label>
                <input
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs md:text-sm"
                  placeholder="e.g. Final Year Project Squad"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-xs md:text-sm">
                    Select members
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {selected.size} selected
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-xl">
                  {users.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500">
                      No users registered yet.
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-800 text-xs md:text-sm">
                      {users.map((u) => (
                        <li
                          key={u.firebaseUid}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800/60"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={selected.has(u.firebaseUid)}
                            onChange={() => toggleSelect(u.firebaseUid)}
                            disabled={u.firebaseUid === adminFirebaseUid}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-100 truncate">
                                {u.name || u.email}
                              </span>
                              {u.role === "admin" && (
                                <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-[10px] text-indigo-200 border border-indigo-500/50">
                                  admin
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {u.email}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-slate-50 font-medium text-xs md:text-sm"
              >
                {creating ? "Creating team…" : "Create team"}
              </button>
            </form>
          </section>

          {/* Team list */}
          <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-2">
            <h2 className="text-sm font-semibold text-slate-100 mb-1">
              Your teams
            </h2>
            {teams.length === 0 ? (
              <div className="text-xs text-slate-500">
                You haven&apos;t created any teams yet.
              </div>
            ) : (
              <ul className="space-y-2 text-xs md:text-sm">
                {teams.map((t) => (
                  <li
                    key={t._id}
                    className={`border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer hover:border-indigo-500/60 ${
                      activeTeamId === t._id
                        ? "border-indigo-500/80 bg-slate-900"
                        : ""
                    }`}
                    onClick={() => loadTeamDetails(t._id)}
                  >
                    <div>
                      <div className="font-medium text-slate-100">
                        {t.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Team ID: <span className="font-mono">{t._id}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Created: {new Date(t.createdAt).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {/* Animated TEAM DETAILS MODAL */}
      {isTeamModalOpen && (
        <TeamDetailsModal
          details={activeTeamDetails}
          loading={detailsLoading}
          onClose={closeTeamModal}
          adminFirebaseUid={adminFirebaseUid}
          allUsers={users}
          onTeamUpdated={(updatedTeam) => {
            setTeams((prev) =>
              prev.map((t) => (t._id === updatedTeam._id ? updatedTeam : t))
            );
            loadTeamDetails(updatedTeam._id);
            setSuccessText("Team updated successfully.");
          }}
          onError={(msg) => setErrorText(msg)}
        />
      )}
    </div>
  );
}

/**
 * Modal showing team details (progress + members + edit form)
 * with smooth open/close transitions.
 */
function TeamDetailsModal({
  details,
  loading,
  onClose,
  adminFirebaseUid,
  allUsers,
  onTeamUpdated,
  onError,
}) {
  const [visible, setVisible] = useState(false);

  // Trigger enter animation
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Handle closing with exit animation
  const handleClose = () => {
    setVisible(false);
    const timeout = setTimeout(() => {
      onClose && onClose();
    }, 200); // duration must match tailwind duration-200

    return () => clearTimeout(timeout);
  };

  const team = details?.team;
  const stats = details?.stats;
  const members = details?.users || [];

  return (
    <div
      className={`
        fixed inset-0 z-40 flex items-center justify-center 
        bg-black/60 backdrop-blur-sm
        transition-opacity duration-200
        ${visible ? "opacity-100" : "opacity-0"}
      `}
      onClick={handleClose}
    >
      <div
        className={`
          bg-slate-950 border border-slate-800 rounded-2xl 
          max-w-3xl w-full mx-4 p-4 md:p-6 shadow-2xl relative 
          max-h-[90vh] overflow-y-auto
          transform transition-all duration-200 ease-out
          ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-100 text-lg"
          aria-label="Close"
        >
          ✕
        </button>

        {loading || !team ? (
          <div className="text-sm text-slate-400">Loading team details…</div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 text-sm">
                    👥
                  </span>
                  {team.name}
                </h2>
                <p className="text-[11px] text-slate-500 mt-1">
                  Team ID: <span className="font-mono">{team._id}</span>
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-1 mb-4">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Progress</span>
                <span>
                  {stats.completedTasks}/{stats.totalTasks} tasks done (
                  {stats.progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-2 bg-emerald-500"
                  style={{ width: `${stats.progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Members */}
            <div className="space-y-2 mb-4">
              <h3 className="text-xs font-semibold text-slate-200">
                Members
              </h3>
              {members.length === 0 ? (
                <div className="text-[11px] text-slate-500">
                  No user records for this team.
                </div>
              ) : (
                <ul className="space-y-1 text-[11px] md:text-xs">
                  {members.map((m) => (
                    <li
                      key={m.firebaseUid}
                      className="flex items-center justify-between border border-slate-800 rounded-lg px-3 py-1.5"
                    >
                      <div className="flex flex-col">
                        <span className="text-slate-100">
                          {m.name || m.email}
                        </span>
                        <span className="text-slate-500">{m.email}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 text-[10px]">
                        {m.role}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Edit form inside modal */}
            <TeamEditForm
              adminFirebaseUid={adminFirebaseUid}
              allUsers={allUsers}
              details={details}
              onUpdated={onTeamUpdated}
              onError={onError}
            />
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Small sub-component to edit team name + members.
 */
function TeamEditForm({
  adminFirebaseUid,
  allUsers,
  details,
  onUpdated,
  onError,
}) {
  const [name, setName] = useState(details.team.name);
  const [saving, setSaving] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState(
    new Set(details.team.memberFirebaseUids)
  );

  // keep state in sync when different team is selected
  useEffect(() => {
    setName(details.team.name);
    setSelectedMembers(new Set(details.team.memberFirebaseUids));
  }, [details]);

  const toggleMember = (firebaseUid) => {
    setSelectedMembers((prev) => {
      const copy = new Set(prev);
      if (copy.has(firebaseUid)) copy.delete(firebaseUid);
      else copy.add(firebaseUid);
      return copy;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      onError && onError("");

      const res = await api.put(`/teams/${details.team._id}`, {
        adminFirebaseUid,
        name,
        memberFirebaseUids: Array.from(selectedMembers),
      });

      onUpdated && onUpdated(res.data);
    } catch (err) {
      console.error("Update team error:", err);
      onError &&
        onError(
          err?.response?.data?.message || "Failed to update team."
        );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 text-xs md:text-sm mt-3">
      <div className="space-y-1">
        <label className="block text-slate-300">Edit team name</label>
        <input
          className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs md:text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Edit members</span>
          <span className="text-[11px] text-slate-500">
            {selectedMembers.size} selected
          </span>
        </div>

        <div className="max-h-40 overflow-y-auto border border-slate-800 rounded-xl">
          <ul className="divide-y divide-slate-800 text-xs md:text-sm">
            {allUsers.map((u) => {
              const checked = selectedMembers.has(u.firebaseUid);
              return (
                <li
                  key={u.firebaseUid}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800/60"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={checked}
                    onChange={() => toggleMember(u.firebaseUid)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-100 truncate">
                        {u.name || u.email}
                      </span>
                      {u.role === "admin" && (
                        <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-[10px] text-indigo-200 border border-indigo-500/50">
                          admin
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {u.email}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-slate-50 font-medium text-xs md:text-sm"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
