// import React, { useEffect, useMemo, useRef, useState } from "react";
// import Snackbar from "@mui/material/Snackbar";
// import Alert from "@mui/material/Alert";
// import { apiFetch } from "../../services/api";
// import {
//   TrendingUp as TrendingUpIcon,
//   TrendingDown as TrendingDownIcon,
//   School as SchoolIcon,
//   CheckCircle as CheckCircleIcon,
//   Cancel as CancelIcon,
//   Warning as WarningIcon,
//   Bolt as BoltIcon,
//   Security as SecurityIcon,
//   Speed as SpeedIcon,
//   Storage as StorageIcon,
//   Settings as SettingsIcon,
//   Refresh as RefreshIcon,
//   Notifications as NotificationsIcon,
//   PersonAdd as PersonAddIcon,
//   Business as BusinessIcon,
//   Description as DescriptionIcon,
//   AttachMoney as AttachMoneyIcon,
//   Memory as MemoryIcon,
// } from "@mui/icons-material";

// /* ─── Premium Design Tokens ─── */
// const getTokens = () => ({
//   bg: "linear-gradient(135deg, #0a0e27 0%, #0f1535 50%, #1a1f3e 100%)",
//   surface: "rgba(30, 35, 65, 0.7)",
//   surfaceHover: "rgba(40, 45, 75, 0.8)",
//   surfaceStrong: "rgba(255,255,255,0.08)",
//   border: "rgba(255,255,255,0.08)",
//   borderAccent: "rgba(16,185,129,0.3)",
//   borderGlow: "rgba(16,185,129,0.5)",
//   emerald: "#10b981",
//   emeraldDim: "rgba(16,185,129,0.15)",
//   gold: "#fbbf24",
//   goldDim: "rgba(251,191,36,0.12)",
//   violet: "#8b5cf6",
//   violetDim: "rgba(139,92,246,0.12)",
//   blue: "#3b82f6",
//   blueDim: "rgba(59,130,246,0.12)",
//   red: "#ef4444",
//   redDim: "rgba(239,68,68,0.12)",
//   text: "#f1f5f9",
//   textSoft: "#94a3b8",
//   textMid: "#cbd5e1",
//   gradientPrimary: "linear-gradient(135deg, #10b981, #3b82f6)",
//   gradientSecondary: "linear-gradient(135deg, #8b5cf6, #ec4899)",
//   gradientAccent: "linear-gradient(135deg, #fbbf24, #f97316)",
// });

// const T = getTokens();

// /* ─── Premium Styles ─── */
// const stylesBase = (T) => ({
//   shell: {
//     fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
//     background: T.bg,
//     minHeight: "100vh",
//     color: T.text,
//     position: "relative",
//     overflowX: "hidden",
//   },
//   canvas: {
//     position: "fixed",
//     inset: 0,
//     zIndex: 0,
//     pointerEvents: "none",
//   },
//   inner: {
//     position: "relative",
//     zIndex: 1,
//     padding: "24px 32px 48px",
//     maxWidth: 1600,
//     margin: "0 auto",
//   },

//   /* Premium Topbar */
//   topbar: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: "16px 24px",
//     background: "rgba(30, 35, 65, 0.6)",
//     backdropFilter: "blur(20px)",
//     borderRadius: "16px",
//     border: `1px solid ${T.border}`,
//     marginBottom: 24,
//     boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
//     flexWrap: "wrap",
//     gap: 16,
//   },

//   logo: {
//     display: "flex",
//     alignItems: "center",
//     gap: 12,
//   },
//   logoIcon: {
//     width: 40,
//     height: 40,
//     background: T.gradientPrimary,
//     borderRadius: 12,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   statusContainer: {
//     display: "flex",
//     alignItems: "center",
//     gap: 20,
//     flexWrap: "wrap",
//   },
//   statusChip: {
//     display: "flex",
//     alignItems: "center",
//     gap: 8,
//     padding: "6px 14px",
//     background: T.emeraldDim,
//     border: `1px solid ${T.borderAccent}`,
//     borderRadius: 999,
//     fontSize: 12,
//     fontWeight: 600,
//     color: T.emerald,
//   },
//   timeDisplay: {
//     fontFamily: "'JetBrains Mono', monospace",
//     fontSize: 12,
//     color: T.textSoft,
//     background: T.surfaceStrong,
//     padding: "6px 12px",
//     borderRadius: 8,
//     letterSpacing: "0.5px",
//   },

//   /* Premium KPI Cards */
//   kpiGrid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(4, 1fr)",
//     gap: 20,
//     marginBottom: 24,
//     "@media (max-width: 1024px)": {
//       gridTemplateColumns: "repeat(2, 1fr)",
//     },
//     "@media (max-width: 640px)": {
//       gridTemplateColumns: "1fr",
//     },
//   },
//   kpiCard: {
//     background: "rgba(30, 35, 65, 0.6)",
//     backdropFilter: "blur(20px)",
//     border: `1px solid ${T.border}`,
//     borderRadius: 20,
//     padding: "20px",
//     transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//     cursor: "pointer",
//     "&:hover": {
//       transform: "translateY(-4px)",
//       borderColor: T.borderAccent,
//       boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
//     },
//   },
//   kpiHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   kpiLabel: {
//     fontSize: 12,
//     fontWeight: 600,
//     textTransform: "uppercase",
//     letterSpacing: "0.1em",
//     color: T.textSoft,
//   },
//   kpiValue: {
//     fontSize: 36,
//     fontWeight: 800,
//     background: T.gradientPrimary,
//     backgroundClip: "text",
//     WebkitBackgroundClip: "text",
//     color: "transparent",
//     marginBottom: 8,
//   },
//   kpiDelta: {
//     fontSize: 12,
//     display: "flex",
//     alignItems: "center",
//     gap: 4,
//   },

//   /* Premium Panels */
//   panel: {
//     background: "rgba(30, 35, 65, 0.6)",
//     backdropFilter: "blur(20px)",
//     border: `1px solid ${T.border}`,
//     borderRadius: 20,
//     padding: "24px",
//     transition: "all 0.3s ease",
//   },
//   panelHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//     paddingBottom: 12,
//     borderBottom: `1px solid ${T.border}`,
//     flexWrap: "wrap",
//     gap: 12,
//   },
//   panelTitle: {
//     fontSize: 14,
//     fontWeight: 700,
//     letterSpacing: "0.1em",
//     textTransform: "uppercase",
//     color: T.textSoft,
//     display: "flex",
//     alignItems: "center",
//     gap: 8,
//   },

//   /* Premium Tables */
//   table: {
//     width: "100%",
//     borderCollapse: "collapse",
//   },
//   th: {
//     fontSize: 11,
//     fontWeight: 600,
//     letterSpacing: "0.08em",
//     textTransform: "uppercase",
//     color: T.textSoft,
//     padding: "12px 8px",
//     textAlign: "left",
//     borderBottom: `1px solid ${T.border}`,
//   },
//   td: {
//     padding: "12px 8px",
//     fontSize: 13,
//     color: T.textMid,
//     borderBottom: "1px solid rgba(255,255,255,0.05)",
//   },

//   /* Premium Badges */
//   tierBadge: (tier) => {
//     const map = {
//       enterprise: { bg: T.violetDim, color: T.violet, borderColor: "rgba(139,92,246,0.3)" },
//       gold: { bg: T.goldDim, color: T.gold, borderColor: "rgba(251,191,36,0.3)" },
//       premium: { bg: T.emeraldDim, color: T.emerald, borderColor: "rgba(16,185,129,0.3)" },
//     };
//     const s = map[tier] || map.premium;
//     return {
//       fontSize: 10,
//       fontWeight: 700,
//       letterSpacing: "0.08em",
//       textTransform: "uppercase",
//       padding: "4px 10px",
//       borderRadius: 999,
//       background: s.bg,
//       color: s.color,
//       border: `1px solid ${s.borderColor}`,
//     };
//   },

//   /* Premium Pulse Pod */
//   pulsePod: {
//     background: "rgba(30, 35, 65, 0.75)",
//     backdropFilter: "blur(20px)",
//     border: `1px solid ${T.border}`,
//     borderRadius: 20,
//     padding: "20px",
//     position: "sticky",
//     top: 20,
//   },

//   /* Premium Buttons */
//   primaryBtn: {
//     background: T.gradientPrimary,
//     border: "none",
//     borderRadius: 12,
//     padding: "12px 24px",
//     color: "white",
//     fontWeight: 700,
//     fontSize: 13,
//     letterSpacing: "0.08em",
//     textTransform: "uppercase",
//     cursor: "pointer",
//     transition: "all 0.3s ease",
//     width: "100%",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     "&:hover": {
//       transform: "translateY(-2px)",
//       boxShadow: "0 8px 20px rgba(16,185,129,0.3)",
//     },
//   },

//   /* Premium Input */
//   input: {
//     background: "rgba(255,255,255,0.05)",
//     border: `1px solid ${T.border}`,
//     borderRadius: 12,
//     padding: "10px 14px",
//     color: T.text,
//     fontSize: 13,
//     fontFamily: "inherit",
//     outline: "none",
//     transition: "all 0.2s ease",
//     width: "100%",
//     "&:focus": {
//       borderColor: T.emerald,
//       boxShadow: `0 0 0 2px ${T.emeraldDim}`,
//     },
//   },
  
//   mainGrid: {
//     display: "grid",
//     gridTemplateColumns: "1fr 360px",
//     gap: 24,
//     "@media (max-width: 1024px)": {
//       gridTemplateColumns: "1fr",
//     },
//   },
// });

// const styles = stylesBase(T);

// /* ─── Animated Background ─── */
// function AnimatedBackground() {
//   const canvasRef = useRef(null);
//   const particles = useRef([]);
//   const mouseRef = useRef({ x: 0.5, y: 0.5 });

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     let animationFrame;

//     const initParticles = () => {
//       particles.current = Array.from({ length: 100 }, () => ({
//         x: Math.random(),
//         y: Math.random(),
//         size: Math.random() * 2 + 1,
//         speedX: (Math.random() - 0.5) * 0.002,
//         speedY: (Math.random() - 0.5) * 0.002,
//         opacity: Math.random() * 0.5,
//       }));
//     };

//     const resize = () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
//     };

//     const draw = () => {
//       if (!ctx) return;
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
      
//       const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
//       gradient.addColorStop(0, "#0a0e27");
//       gradient.addColorStop(0.5, "#0f1535");
//       gradient.addColorStop(1, "#1a1f3e");
//       ctx.fillStyle = gradient;
//       ctx.fillRect(0, 0, canvas.width, canvas.height);
      
//       particles.current.forEach(p => {
//         ctx.beginPath();
//         ctx.arc(p.x * canvas.width, p.y * canvas.height, p.size, 0, Math.PI * 2);
//         ctx.fillStyle = `rgba(16, 185, 129, ${p.opacity * 0.3})`;
//         ctx.fill();
        
//         p.x += p.speedX;
//         p.y += p.speedY;
//         if (p.x < 0) p.x = 1;
//         if (p.x > 1) p.x = 0;
//         if (p.y < 0) p.y = 1;
//         if (p.y > 1) p.y = 0;
//       });
      
//       const gradientGlow = ctx.createRadialGradient(
//         mouseRef.current.x * canvas.width,
//         mouseRef.current.y * canvas.height,
//         0,
//         mouseRef.current.x * canvas.width,
//         mouseRef.current.y * canvas.height,
//         300
//       );
//       gradientGlow.addColorStop(0, "rgba(16,185,129,0.1)");
//       gradientGlow.addColorStop(1, "transparent");
//       ctx.fillStyle = gradientGlow;
//       ctx.fillRect(0, 0, canvas.width, canvas.height);
      
//       animationFrame = requestAnimationFrame(draw);
//     };
    
//     const handleMouseMove = (e) => {
//       mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
//     };
    
//     initParticles();
//     resize();
//     draw();
    
//     window.addEventListener("resize", resize);
//     window.addEventListener("mousemove", handleMouseMove);
    
//     return () => {
//       cancelAnimationFrame(animationFrame);
//       window.removeEventListener("resize", resize);
//       window.removeEventListener("mousemove", handleMouseMove);
//     };
//   }, []);
  
//   return <canvas ref={canvasRef} style={styles.canvas} />;
// }

// /* ─── Live Ticker Component ─── */
// function LiveTicker() {
//   const [items, setItems] = useState([]);
//   const schoolNames = ["Meridian", "Apex", "Nexus", "Bright Path", "Horizon", "Cedar Ridge", "Summit"];
  
//   useEffect(() => {
//     const generateItem = () => ({
//       school: schoolNames[Math.floor(Math.random() * schoolNames.length)],
//       amount: Math.floor(Math.random() * 800) + 200,
//       timestamp: new Date(),
//     });
    
//     setItems(Array.from({ length: 4 }, generateItem));
    
//     const interval = setInterval(() => {
//       setItems(prev => [generateItem(), ...prev.slice(0, 5)]);
//     }, 2500);
    
//     return () => clearInterval(interval);
//   }, []);
  
//   return (
//     <div style={{ height: 120, overflow: "hidden" }}>
//       {items.map((item, idx) => (
//         <div
//           key={idx}
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             padding: "8px 0",
//             borderBottom: `1px solid ${T.border}`,
//             animation: "slideIn 0.3s ease",
//           }}
//         >
//           <span style={{ fontSize: 12, color: T.textMid }}>{item.school}</span>
//           <span style={{ fontSize: 12, fontWeight: 600, color: T.emerald }}>+${item.amount}</span>
//         </div>
//       ))}
//     </div>
//   );
// }

// /* ─── System Metrics ─── */
// function SystemMetrics() {
//   const [metrics, setMetrics] = useState({ cpu: 23, memory: 45, latency: 87, requests: 2841 });
  
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setMetrics({
//         cpu: Math.floor(20 + Math.random() * 15),
//         memory: Math.floor(40 + Math.random() * 20),
//         latency: Math.floor(70 + Math.random() * 30),
//         requests: Math.floor(2500 + Math.random() * 500),
//       });
//     }, 3000);
//     return () => clearInterval(interval);
//   }, []);
  
//   return (
//     <div style={{ display: "grid", gap: 12 }}>
//       {[
//         { label: "CPU Usage", value: metrics.cpu, icon: <MemoryIcon style={{ fontSize: 14 }} /> },
//         { label: "Memory", value: metrics.memory, icon: <StorageIcon style={{ fontSize: 14 }} /> },
//         { label: "API Latency", value: metrics.latency, icon: <SpeedIcon style={{ fontSize: 14 }} />, unit: "ms" },
//         { label: "Requests/min", value: metrics.requests, icon: <TrendingUpIcon style={{ fontSize: 14 }} /> },
//       ].map(metric => (
//         <div key={metric.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: T.textSoft }}>
//             {metric.icon}
//             {metric.label}
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <div style={{ width: 100, height: 4, background: T.surfaceStrong, borderRadius: 2, overflow: "hidden" }}>
//               <div
//                 style={{
//                   width: `${metric.value}%`,
//                   height: "100%",
//                   background: T.gradientPrimary,
//                   borderRadius: 2,
//                 }}
//               />
//             </div>
//             <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>
//               {metric.value}{metric.unit || "%"}
//             </span>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default function SuperadminDashboard() {
//   const [token, setToken] = useState(localStorage.getItem("token"));
//   const [schools, setSchools] = useState([]);
//   const [userRequests, setUserRequests] = useState([]);
//   const [schoolRegistrationRequests, setSchoolRegistrationRequests] = useState([]);
//   const [selectedSchoolId, setSelectedSchoolId] = useState(null);
//   const [successMessage, setSuccessMessage] = useState("");
//   const [successOpen, setSuccessOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
  
//   // Load data
//   useEffect(() => {
//     if (!token) return;
//     Promise.all([
//       apiFetch("/admin/schools", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
//       apiFetch("/admin/user-requests", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
//       apiFetch("/saas/registration-requests?status=pending", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
//     ]).then(([schoolsData, requestsData, registrationsData]) => {
//       setSchools(Array.isArray(schoolsData) ? schoolsData : []);
//       setUserRequests(Array.isArray(requestsData) ? requestsData : []);
//       setSchoolRegistrationRequests(Array.isArray(registrationsData) ? registrationsData : []);
//     }).catch(console.error);
//   }, [token]);
  
//   if (!token) {
//     window.location.href = "/login";
//     return null;
//   }
  
//   const totalSchools = schools.length;
//   const totalRequests = userRequests.length + schoolRegistrationRequests.length;
//   const activeSchools = schools.filter(s => s.status === "active").length;
//   const filteredSchools = schools.filter(s => 
//     s.name?.toLowerCase().includes(searchQuery.toLowerCase())
//   );
  
//   const handleApprove = async (type, id) => {
//     const endpoint = type === "user" 
//       ? `/admin/user-requests/${id}/approve`
//       : `/saas/approve-registration/${id}`;
    
//     const res = await apiFetch(endpoint, {
//       method: "POST",
//       headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//       body: type === "school" ? JSON.stringify({ temp_password: "school123" }) : undefined,
//     });
    
//     if (res.ok) {
//       if (type === "user") setUserRequests(prev => prev.filter(r => r.id !== id));
//       else setSchoolRegistrationRequests(prev => prev.filter(r => r.id !== id));
//       setSuccessMessage(`${type === "user" ? "User" : "School"} request approved`);
//       setSuccessOpen(true);
//     }
//   };
  
//   const handleReject = async (type, id) => {
//     const endpoint = type === "user"
//       ? `/admin/user-requests/${id}/reject`
//       : `/saas/reject-registration/${id}`;
    
//     const res = await apiFetch(endpoint, {
//       method: "POST",
//       headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//       body: type === "school" ? JSON.stringify({ reason: "Rejected by superadmin" }) : undefined,
//     });
    
//     if (res.ok) {
//       if (type === "user") setUserRequests(prev => prev.filter(r => r.id !== id));
//       else setSchoolRegistrationRequests(prev => prev.filter(r => r.id !== id));
//       setSuccessMessage(`${type === "user" ? "User" : "School"} request rejected`);
//       setSuccessOpen(true);
//     }
//   };
  
//   const selectedSchool = schools.find(s => s.id === Number(selectedSchoolId));
  
//   return (
//     <div style={styles.shell}>
//       <AnimatedBackground />
      
//       <div style={styles.inner}>
//         {/* Premium Topbar */}
//         <div style={styles.topbar}>
//           <div style={styles.logo}>
//             <div style={styles.logoIcon}>
//               <SecurityIcon style={{ fontSize: 20, color: "white" }} />
//             </div>
//             <div>
//               <div style={{ fontSize: 18, fontWeight: 800 }}>Obsidian Command Center</div>
//               <div style={{ fontSize: 11, color: T.textSoft }}>Superadmin Portal</div>
//             </div>
//           </div>
          
//           <div style={styles.statusContainer}>
//             <div style={styles.statusChip}>
//               <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.emerald, animation: "pulse 2s infinite" }} />
//               All Systems Operational
//             </div>
//             <div style={styles.timeDisplay}>
//               {new Date().toLocaleTimeString()}
//             </div>
//             <button
//               style={{
//                 padding: "6px 12px",
//                 background: T.surfaceStrong,
//                 border: `1px solid ${T.border}`,
//                 borderRadius: 8,
//                 color: T.text,
//                 cursor: "pointer",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 6,
//               }}
//               onClick={() => window.location.reload()}
//             >
//               <RefreshIcon style={{ fontSize: 14 }} />
//               Refresh
//             </button>
//           </div>
//         </div>
        
//         {/* KPI Grid */}
//         <div style={styles.kpiGrid}>
//           {[
//             { label: "Total Schools", value: totalSchools, icon: <BusinessIcon style={{ fontSize: 20 }} />, trend: "+12%", positive: true },
//             { label: "Active Institutions", value: activeSchools, icon: <SchoolIcon style={{ fontSize: 20 }} />, trend: "+8%", positive: true },
//             { label: "Pending Approvals", value: totalRequests, icon: <WarningIcon style={{ fontSize: 20 }} />, trend: totalRequests > 5 ? "+3" : "All good", positive: totalRequests < 5 },
//             { label: "Monthly Revenue", value: "$42.8K", icon: <AttachMoneyIcon style={{ fontSize: 20 }} />, trend: "+18%", positive: true },
//           ].map((kpi, idx) => (
//             <div key={idx} style={styles.kpiCard}>
//               <div style={styles.kpiHeader}>
//                 <span style={styles.kpiLabel}>{kpi.label}</span>
//                 <div style={{ color: kpi.positive ? T.emerald : T.gold }}>{kpi.icon}</div>
//               </div>
//               <div style={styles.kpiValue}>{kpi.value}</div>
//               <div style={{ ...styles.kpiDelta, color: kpi.positive ? T.emerald : T.red }}>
//                 {kpi.positive ? <TrendingUpIcon style={{ fontSize: 14 }} /> : <TrendingDownIcon style={{ fontSize: 14 }} />}
//                 {kpi.trend}
//               </div>
//             </div>
//           ))}
//         </div>
        
//         {/* Main Content Grid */}
//         <div style={styles.mainGrid}>
//           <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
//             {/* Schools Table */}
//             <div style={styles.panel}>
//               <div style={styles.panelHeader}>
//                 <div style={styles.panelTitle}>
//                   <BusinessIcon style={{ fontSize: 16 }} />
//                   Institutions Overview
//                 </div>
//                 <button style={{ ...styles.primaryBtn, width: "auto", padding: "8px 16px" }}>
//                   <PersonAddIcon style={{ fontSize: 14, marginRight: 6 }} />
//                   Add School
//                 </button>
//               </div>
              
//               <div style={{ marginBottom: 16 }}>
//                 <input
//                   placeholder="Search schools..."
//                   style={styles.input}
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
              
//               <div style={{ overflowX: "auto" }}>
//                 <table style={styles.table}>
//                   <thead>
//                     <tr>
//                       {["School Name", "Tier", "Users", "Status", "Actions"].map(h => (
//                         <th key={h} style={styles.th}>{h}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredSchools.slice(0, 5).map((school, idx) => (
//                       <tr key={school.id}>
//                         <td style={styles.td}>
//                           <div style={{ fontWeight: 600 }}>{school.name}</div>
//                           <div style={{ fontSize: 10, color: T.textSoft }}>ID: {school.id}</div>
//                         </td>
//                         <td style={styles.td}>
//                           <span style={styles.tierBadge(idx === 0 ? "enterprise" : idx < 3 ? "gold" : "premium")}>
//                             {idx === 0 ? "Enterprise" : idx < 3 ? "Gold" : "Premium"}
//                           </span>
//                         </td>
//                         <td style={styles.td}>{Math.floor(Math.random() * 200) + 50}</td>
//                         <td style={styles.td}>
//                           <span style={{ color: T.emerald, fontSize: 11, fontWeight: 600 }}>● Active</span>
//                         </td>
//                         <td style={styles.td}>
//                           <button
//                             style={{
//                               padding: "4px 12px",
//                               background: T.blueDim,
//                               border: `1px solid ${T.border}`,
//                               borderRadius: 6,
//                               color: T.text,
//                               cursor: "pointer",
//                               fontSize: 11,
//                             }}
//                             onClick={() => setSelectedSchoolId(school.id)}
//                           >
//                             Manage
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                     {filteredSchools.length === 0 && (
//                       <tr>
//                         <td colSpan={5} style={{ ...styles.td, textAlign: "center", padding: "40px 0", color: T.textSoft }}>
//                           No schools found
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
            
//             {/* Requests Section */}
//             <div style={styles.panel}>
//               <div style={styles.panelHeader}>
//                 <div style={styles.panelTitle}>
//                   <NotificationsIcon style={{ fontSize: 16 }} />
//                   Pending Approvals
//                   {totalRequests > 0 && (
//                     <span style={{
//                       background: T.goldDim,
//                       color: T.gold,
//                       padding: "2px 8px",
//                       borderRadius: 999,
//                       fontSize: 11,
//                     }}>
//                       {totalRequests}
//                     </span>
//                   )}
//                 </div>
//               </div>
              
//               <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//                 {schoolRegistrationRequests.map(req => (
//                   <div
//                     key={`school-${req.id}`}
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "space-between",
//                       padding: 12,
//                       background: T.surfaceStrong,
//                       borderRadius: 12,
//                       border: `1px solid ${T.border}`,
//                       flexWrap: "wrap",
//                       gap: 12,
//                     }}
//                   >
//                     <div>
//                       <div style={{ fontWeight: 600 }}>{req.school_name}</div>
//                       <div style={{ fontSize: 11, color: T.textSoft }}>School Registration · {req.admin_name}</div>
//                     </div>
//                     <div style={{ display: "flex", gap: 8 }}>
//                       <button
//                         style={{ padding: "6px 10px", background: T.emeraldDim, color: T.emerald, border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
//                         onClick={() => handleApprove("school", req.id)}
//                       >
//                         <CheckCircleIcon style={{ fontSize: 14 }} /> Approve
//                       </button>
//                       <button
//                         style={{ padding: "6px 10px", background: T.redDim, color: T.red, border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
//                         onClick={() => handleReject("school", req.id)}
//                       >
//                         <CancelIcon style={{ fontSize: 14 }} /> Reject
//                       </button>
//                     </div>
//                   </div>
//                 ))}
                
//                 {userRequests.map(req => (
//                   <div
//                     key={`user-${req.id}`}
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "space-between",
//                       padding: 12,
//                       background: T.surfaceStrong,
//                       borderRadius: 12,
//                       border: `1px solid ${T.border}`,
//                       flexWrap: "wrap",
//                       gap: 12,
//                     }}
//                   >
//                     <div>
//                       <div style={{ fontWeight: 600 }}>{req.username}</div>
//                       <div style={{ fontSize: 11, color: T.textSoft }}>{req.role} · {req.email}</div>
//                     </div>
//                     <div style={{ display: "flex", gap: 8 }}>
//                       <button
//                         style={{ padding: "6px 10px", background: T.emeraldDim, color: T.emerald, border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
//                         onClick={() => handleApprove("user", req.id)}
//                       >
//                         <CheckCircleIcon style={{ fontSize: 14 }} /> Approve
//                       </button>
//                       <button
//                         style={{ padding: "6px 10px", background: T.redDim, color: T.red, border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
//                         onClick={() => handleReject("user", req.id)}
//                       >
//                         <CancelIcon style={{ fontSize: 14 }} /> Reject
//                       </button>
//                     </div>
//                   </div>
//                 ))}
                
//                 {totalRequests === 0 && (
//                   <div style={{ textAlign: "center", padding: 40, color: T.textSoft }}>
//                     <DescriptionIcon style={{ fontSize: 32, marginBottom: 12 }} />
//                     <div>All caught up! No pending requests</div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
          
//           {/* Right Sidebar - Pulse Pod */}
//           <div>
//             <div style={styles.pulsePod}>
//               {/* Live Revenue */}
//               <div style={{ marginBottom: 24 }}>
//                 <div style={{ fontSize: 11, fontWeight: 600, color: T.textSoft, marginBottom: 12, letterSpacing: "0.1em" }}>
//                   LIVE REVENUE STREAM
//                 </div>
//                 <LiveTicker />
//               </div>
              
//               {/* System Health */}
//               <div style={{ marginBottom: 24 }}>
//                 <div style={{ fontSize: 11, fontWeight: 600, color: T.textSoft, marginBottom: 12, letterSpacing: "0.1em" }}>
//                   SYSTEM HEALTH
//                 </div>
//                 <SystemMetrics />
//               </div>
              
//               {/* Quick Actions */}
//               <div style={{ marginBottom: 24 }}>
//                 <div style={{ fontSize: 11, fontWeight: 600, color: T.textSoft, marginBottom: 12, letterSpacing: "0.1em" }}>
//                   QUICK ACTIONS
//                 </div>
//                 <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//                   <button style={styles.primaryBtn}>
//                     <BoltIcon style={{ fontSize: 14 }} />
//                     Create New School
//                   </button>
//                   <button style={{ ...styles.primaryBtn, background: T.gradientSecondary }}>
//                     <SettingsIcon style={{ fontSize: 14 }} />
//                     System Settings
//                   </button>
//                 </div>
//               </div>
              
//               {/* Selected School Context */}
//               {selectedSchool && (
//                 <div>
//                   <div style={{ fontSize: 11, fontWeight: 600, color: T.textSoft, marginBottom: 12, letterSpacing: "0.1em" }}>
//                     SELECTED CONTEXT
//                   </div>
//                   <div style={{ background: T.surfaceStrong, borderRadius: 12, padding: 12 }}>
//                     <div style={{ fontWeight: 600, marginBottom: 4 }}>{selectedSchool.name}</div>
//                     <div style={{ fontSize: 11, color: T.textSoft }}>ID: {selectedSchool.id}</div>
//                     <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
//                       <button
//                         style={{
//                           flex: 1,
//                           padding: "8px",
//                           background: T.blueDim,
//                           border: `1px solid ${T.border}`,
//                           borderRadius: 6,
//                           color: T.text,
//                           cursor: "pointer",
//                           fontSize: 11,
//                           fontWeight: 600,
//                         }}
//                         onClick={() => window.location.href = `/admin/schools/${selectedSchool.id}`}
//                       >
//                         View Details
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* Success Snackbar */}
//       <Snackbar
//         open={successOpen}
//         autoHideDuration={4000}
//         onClose={() => setSuccessOpen(false)}
//         anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//       >
//         <Alert
//           severity="success"
//           onClose={() => setSuccessOpen(false)}
//           sx={{
//             background: "rgba(30, 35, 65, 0.95)",
//             backdropFilter: "blur(10px)",
//             border: `1px solid ${T.borderAccent}`,
//             color: T.emerald,
//             "& .MuiAlert-icon": { color: T.emerald },
//           }}
//         >
//           {successMessage}
//         </Alert>
//       </Snackbar>
      
//       {/* Animations */}
//       <style>
//         {`
//           @keyframes pulse {
//             0%, 100% { opacity: 1; transform: scale(1); }
//             50% { opacity: 0.5; transform: scale(0.8); }
//           }
//           @keyframes slideIn {
//             from {
//               opacity: 0;
//               transform: translateY(-10px);
//             }
//             to {
//               opacity: 1;
//               transform: translateY(0);
//             }
//           }
          
//           * {
//             box-sizing: border-box;
//           }
//         `}
//       </style>
//     </div>
//   );
// }












import React, { useEffect, useMemo, useRef, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { apiFetch } from "../../services/api";

/* ─── Design tokens ─── */
const getTokens = () => ({
  bg: "#f6f8fc",

  surface: "rgba(255,255,255,0.88)",
  surfaceHover: "rgba(241,245,249,0.96)",
  surfaceStrong: "#ffffff",
  surfaceTint: "#f8fafc",

  border: "rgba(15,23,42,0.10)",
  borderAccent: "rgba(14,165,166,0.25)",
  borderSoft: "rgba(15,23,42,0.06)",

  emerald: "#0f766e",
  emeraldDim: "rgba(15,118,110,0.12)",

  gold: "#c8a96e",
  goldDim: "rgba(200,169,110,0.14)",

  violet: "#7c3aed",
  blue: "#2563eb",
  red: "#dc2626",

  text: "#0f172a",
  textSoft: "#64748b",
  textMid: "#334155",
});

const T = getTokens();

const stylesBase = (T) => ({
  shell: {
    fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
    background: T.bg,
    minHeight: "100vh",
    color: T.text,
    position: "relative",
    overflowX: "hidden",
  },
  canvas: {
    position: "fixed",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
  },
  inner: {
    position: "relative",
    zIndex: 1,
    padding: "20px 24px 40px",
    maxWidth: 1400,
    margin: "0 auto",
  },

  /* Topbar */
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 0 16px",
    borderBottom: `1px solid ${T.borderAccent}`,
    marginBottom: 22,
  },
  topbarLeft: { display: "flex", alignItems: "center", gap: 12 },
  liveDot: {
    width: 7, height: 7, borderRadius: "50%",
    background: T.emerald,
    boxShadow: `0 0 8px ${T.emerald}`,
    animation: "pulseDot 2s infinite",
    flexShrink: 0,
  },
  topbarTitle: {
    fontSize: 11, fontWeight: 700,
    letterSpacing: "0.16em", textTransform: "uppercase", color: "#94a3b8",
  },
  topbarTier: { fontSize: 10, color: "#334155", letterSpacing: "0.08em" },
  topbarRight: { display: "flex", alignItems: "center", gap: 14 },
  statusChip: {
    display: "flex", alignItems: "center", gap: 6,
    fontSize: 11, color: T.emerald, fontWeight: 600,
    background: T.emeraldDim,
    border: `1px solid rgba(16,185,129,0.25)`,
    borderRadius: 20, padding: "4px 10px",
    letterSpacing: "0.04em",
  },
  timeDisplay: { fontSize: 11, color: T.textSoft, fontVariantNumeric: "tabular-nums", letterSpacing: "0.05em" },
  topBtn: (variant) => ({
    padding: "6px 14px",
    borderRadius: 7,
    fontSize: 11, fontWeight: 700,
    letterSpacing: "0.08em", textTransform: "uppercase",
    cursor: "pointer", fontFamily: "inherit",
    border: variant === "ghost"
      ? `1px solid ${T.border}`
      : `1px solid rgba(239,68,68,0.35)`,
    background: variant === "ghost"
      ? "rgba(255,255,255,0.03)"
      : "rgba(239,68,68,0.12)",
    color: variant === "ghost" ? T.textMid : "#f87171",
    transition: "all 0.2s",
  }),

  /* KPI Row */
  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12, marginBottom: 16,
  },
  kpiCard: () => ({
    background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.96))",
    border: `1px solid ${T.border}`,
    borderRadius: 14,
    padding: "18px",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
  }),
  kpiAccentLine: (color) => ({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
    boxShadow: `0 0 12px ${color}`,
  }),
  kpiLabel: {
    fontSize: 9, fontWeight: 700,
    letterSpacing: "0.14em", textTransform: "uppercase",
    color: T.textSoft, marginBottom: 8,
  },
  kpiValue: (color) => ({
    fontSize: 26, fontWeight: 800,
    letterSpacing: "-0.03em", lineHeight: 1,
    color, marginBottom: 5,
  }),
  kpiDelta: (ok) => ({
    fontSize: 11, fontWeight: 500,
    color: ok ? T.emerald : T.gold,
  }),

  /* Panel */
  panel: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(248,250,252,0.96))",
    backdropFilter: "blur(18px)",
    border: `1px solid ${T.border}`,
    borderRadius: 14,
    padding: "20px",
    boxShadow: "0 14px 34px rgba(15,23,42,0.08)",
  },
  panelHead: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginBottom: 14,
  },
  panelTitle: {
    fontSize: 10, fontWeight: 700,
    letterSpacing: "0.14em", textTransform: "uppercase",
    color: T.textSoft,
  },
  liveBadge: {
    fontSize: 10, fontWeight: 600,
    padding: "2px 9px", borderRadius: 20,
    background: T.emeraldDim, color: T.emerald,
    border: `1px solid rgba(16,185,129,0.25)`,
    letterSpacing: "0.04em",
  },

  /* Main grid */
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 290px",
    gap: 14, marginBottom: 14,
  },
  leftCol: { display: "flex", flexDirection: "column", gap: 14 },

  /* Tenant table */
  tenantTable: { width: "100%", borderCollapse: "collapse" },
  th: {
    fontSize: 9, fontWeight: 700,
    letterSpacing: "0.14em", textTransform: "uppercase",
    color: T.textSoft, padding: "0 8px 10px", textAlign: "left",
    borderBottom: `1px solid ${T.borderSoft}`,
  },
  td: {
    padding: "10px 8px", fontSize: 12,
    color: T.textMid, borderBottom: `1px solid ${T.borderSoft}`,
  },

  /* Tier badges */
  tierBadge: (tier) => {
    const map = {
      enterprise: { bg: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "rgba(139,92,246,0.3)" },
      gold: { bg: T.goldDim, color: T.gold, border: "rgba(245,158,11,0.3)" },
      premium: { bg: T.emeraldDim, color: T.emerald, border: "rgba(16,185,129,0.3)" },
    };
    const s = map[tier] || map.premium;
    return {
      fontSize: 9, fontWeight: 700,
      letterSpacing: "0.08em", textTransform: "uppercase",
      padding: "2px 7px", borderRadius: 20,
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
    };
  },

  /* Pulse Pod */
  pod: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))",
    backdropFilter: "blur(20px)",
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 16px 36px rgba(15,23,42,0.10)",
    position: "sticky",
    top: 20,
  },
  podLabel: {
    fontSize: 9, fontWeight: 700,
    letterSpacing: "0.14em", textTransform: "uppercase",
    color: T.textSoft, marginBottom: 8,
  },
  podSection: {
    borderBottom: `1px solid ${T.borderSoft}`,
    paddingBottom: 14,
  },

  /* Ticker */
  tickerWrap: { height: 80, overflow: "hidden" },
  tickerItem: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", padding: "5px 0", fontSize: 11,
    borderBottom: `1px solid ${T.borderSoft}`,
  },
  tickerSchool: {
    color: T.textMid, whiteSpace: "nowrap",
    overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160,
  },
  tickerAmount: { color: T.emerald, fontWeight: 600 },

  /* Health metrics */
  healthGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6,
  },
  healthCard: {
    background: T.surfaceTint,
    border: `1px solid ${T.borderSoft}`,
    borderRadius: 6, padding: "6px 9px",
  },
  hmLabel: {
    fontSize: 9, color: T.textSoft,
    letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2,
  },
  hmValue: (ok) => ({
    fontSize: 13, fontWeight: 700,
    color: ok ? T.emerald : T.gold,
  }),

  /* Broadcast button */
    broadcastBtn: {
    width: "100%",
    padding: 14,
    borderRadius: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",

    background: "linear-gradient(135deg, #0f766e, #2563eb)",
    border: "none",
    color: "#fff",

    boxShadow: "0 14px 28px rgba(37,99,235,0.18)",
    cursor: "pointer",
    transition: "all 0.25s ease",
  },

  /* School list */
  schoolRow: {
    display: "flex", alignItems: "center",
    padding: "11px 12px", borderRadius: 8,
    border: `1px solid ${T.border}`,
    background: T.surfaceTint,
    marginBottom: 6, gap: 12,
    transition: "border-color 0.2s, background 0.2s",
  },
  schoolName: { fontSize: 13, fontWeight: 600, color: T.text },
  userPill: {
    fontSize: 9, fontWeight: 700,
    letterSpacing: "0.08em", textTransform: "uppercase",
    padding: "2px 7px", borderRadius: 20,
    background: T.emeraldDim, color: T.emerald,
    border: `1px solid rgba(16,185,129,0.2)`,
  },
  schoolId: { fontSize: 10, color: T.textSoft, marginTop: 2, letterSpacing: "0.04em" },

  /* Approval rows */
  apprRow: {
    display: "flex", alignItems: "center",
    gap: 10, padding: "9px 0",
    borderBottom: `1px solid rgba(255,255,255,0.03)`,
  },
  apprAvatar: {
    width: 30, height: 30, borderRadius: "50%",
    background: "rgba(139,92,246,0.15)",
    border: `1px solid rgba(139,92,246,0.25)`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: 800, color: "#a78bfa", flexShrink: 0,
  },
  apprName: { fontSize: 11, fontWeight: 600, color: T.text },
  apprSub: { fontSize: 10, color: T.textSoft },
  apprBtn: (variant) => ({
    fontSize: 9, fontWeight: 700,
    letterSpacing: "0.08em", textTransform: "uppercase",
    padding: "3px 8px", borderRadius: 4,
    cursor: "pointer", fontFamily: "inherit",
    border: `1px solid ${variant === "approve" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.25)"}`,
    background: variant === "approve" ? T.emeraldDim : "rgba(239,68,68,0.08)",
    color: variant === "approve" ? T.emerald : "#f87171",
    transition: "all 0.15s",
  }),

  /* Request rows */
  requestRow: {
    display: "flex", alignItems: "center",
    padding: "11px 12px", borderRadius: 8,
    border: `1px solid ${T.border}`,
    background: T.surfaceTint,
    marginBottom: 6, gap: 12,
  },
  reqBadge: {
    fontSize: 9, fontWeight: 700,
    letterSpacing: "0.07em", textTransform: "uppercase",
    padding: "2px 7px", borderRadius: 20,
    background: "rgba(59,130,246,0.1)", color: "#60a5fa",
    border: `1px solid rgba(59,130,246,0.2)`,
  },

  /* Input */
  inputWrap: { display: "flex", flexDirection: "column", gap: 4 },
  label: {
    fontSize: 10, fontWeight: 700,
    letterSpacing: "0.12em", textTransform: "uppercase",
    color: T.textSoft, marginBottom: 4,
  },
  input: {
    background: T.surfaceStrong,
    border: `1px solid ${T.border}`,
    borderRadius: 8, padding: "10px 13px",
    color: T.text, fontSize: 13, fontFamily: "inherit",
    outline: "none", transition: "border-color 0.2s", width: "100%",
    boxSizing: "border-box",
  },
  helperText: { fontSize: 10, color: T.textSoft, marginTop: 3 },
  errorText: { fontSize: 10, color: "#f87171", marginTop: 3 },

  /* Buttons */
  primaryBtn: (disabled) => ({
    padding: "11px 24px",
    background: disabled
      ? "rgba(15,118,110,0.24)"
      : "linear-gradient(135deg, rgba(15,118,110,0.94), rgba(17,94,89,0.92))",
    border: `1px solid ${disabled ? "rgba(15,118,110,0.12)" : "rgba(15,118,110,0.34)"}`,
    borderRadius: 8, color: disabled ? "rgba(255,255,255,0.58)" : "#fff",
    fontSize: 12, fontWeight: 700,
    letterSpacing: "0.08em", textTransform: "uppercase",
    cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit",
    transition: "all 0.2s",
  }),
  searchBtn: {
    padding: "8px 16px",
    background: T.emeraldDim,
    border: `1px solid rgba(16,185,129,0.3)`,
    borderRadius: 7, color: T.emerald,
    fontSize: 11, fontWeight: 700,
    letterSpacing: "0.08em", cursor: "pointer", fontFamily: "inherit",
    transition: "all 0.2s",
  },

  /* Bottom grid */
  bottomGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },

  /* Create org section */
  quickSetup: {
    background: "linear-gradient(135deg, rgba(15,118,110,0.05), rgba(200,169,110,0.08))",
    border: `1px solid rgba(15,118,110,0.12)`,
    borderRadius: 8, padding: 14, marginBottom: 18,
  },

  /* Select */
  select: {
    width: "100%", padding: "9px 13px",
    background: T.surfaceStrong,
    border: `1px solid ${T.border}`,
    borderRadius: 8, color: T.text,
    fontSize: 13, fontFamily: "inherit",
    outline: "none", cursor: "pointer",
    appearance: "none",
  },

  /* Error box */
  errorBox: {
    marginTop: 14, padding: 12,
    background: "rgba(220,38,38,0.08)",
    border: `1px solid rgba(220,38,38,0.25)`,
    borderRadius: 8, color: "#f87171", fontSize: 13,
  },

  /* Metric cards in live context */
  metricGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
    gap: 8, marginTop: 12,
  },
  metric: (span) => ({
    background: T.surfaceTint,
    border: `1px solid ${T.borderSoft}`,
    borderRadius: 8, padding: "10px 12px",
    gridColumn: span ? `span ${span}` : undefined,
  }),
  metricLabel: { fontSize: 9, color: T.textSoft, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 },
  metricValue: { fontSize: 14, fontWeight: 700, color: T.text },

  /* Empty state */
  emptyState: {
    textAlign: "center", padding: "28px 0",
    color: T.textSoft, fontSize: 13,
  },
});

const styles = stylesBase(T);

/* ─── Tiny reusable components ─── */
function SectionLabel({ children }) {
  return <div style={styles.panelTitle}>{children}</div>;
}

function LiveBadge({ children }) {
  return <div style={styles.liveBadge}>{children}</div>;
}

function SelectBtn({ variant, onClick, children }) {
  const base = {
    fontSize: 10, fontWeight: 700,
    letterSpacing: "0.08em", textTransform: "uppercase",
    padding: "4px 10px", borderRadius: 6,
    cursor: "pointer", fontFamily: "inherit",
    transition: "all 0.15s",
  };
  const active = {
    ...base,
    background: T.emeraldDim, color: T.emerald,
    border: `1px solid rgba(16,185,129,0.3)`,
  };
  const inactive = {
    ...base,
    background: "rgba(255,255,255,0.03)", color: T.textMid,
    border: `1px solid ${T.border}`,
  };
  return <button style={variant === "active" ? active : inactive} onClick={onClick}>{children}</button>;
}

/* ─── Heartbeat Canvas ─── */
function HeartbeatCanvas() {
  const ref = useRef(null);
  const data = useRef(Array(90).fill(0));
  const phase = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      phase.current += 0.11;
      const p = phase.current % (Math.PI * 2);
      let v = 0;
      if (p < 0.3) v = Math.sin((p / 0.3) * Math.PI) * 0.85;
      else if (p < 0.5) v = -Math.sin(((p - 0.3) / 0.2) * Math.PI) * 0.35;
      else v = Math.sin((p - 0.5) * 2) * 0.1 * Math.random();
      data.current.push(v + Math.random() * 0.03 - 0.015);
      data.current.shift();

      const c = ref.current;
      if (!c) return;
      const W = c.offsetWidth || 230;
      c.width = W; c.height = 40;
      const ctx = c.getContext("2d");
      ctx.clearRect(0, 0, W, 40);
      ctx.beginPath();
      ctx.strokeStyle = T.emerald;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = T.emerald;
      ctx.shadowBlur = 4;
      data.current.forEach((v, i) => {
        const x = (i / (data.current.length - 1)) * W;
        const y = 20 - v * 15;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    }, 60);
    return () => clearInterval(id);
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ width: "100%", height: 40, display: "block" }}
      role="img"
      aria-label="Live server heartbeat waveform"
    />
  );
}

/* ─── Live Ticker ─── */
const SCHOOL_NAMES = [
  "Meridian Acad.", "Apex Hub", "Nexus Intl", "Bright Path",
  "Horizon Sch.", "Cedar Ridge", "Summit Elite", "Pinnacle Edu.",
  "Nova Academy", "Delta Schools",
];
const AMOUNTS = [299, 499, 799, 1099, 399, 699, 599, 249, 449, 899];

function LiveTicker() {
  const [items, setItems] = useState(() =>
    Array.from({ length: 4 }, () => ({
      school: SCHOOL_NAMES[Math.floor(Math.random() * SCHOOL_NAMES.length)],
      amount: AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)],
      id: Math.random(),
    }))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setItems(prev => [
        {
          school: SCHOOL_NAMES[Math.floor(Math.random() * SCHOOL_NAMES.length)],
          amount: AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)],
          id: Math.random(),
        },
        ...prev.slice(0, 5),
      ]);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={styles.tickerWrap} aria-live="polite" aria-label="Live revenue stream">
      {items.map(item => (
        <div key={item.id} style={styles.tickerItem}>
          <span style={styles.tickerSchool}>{item.school}</span>
          <span style={styles.tickerAmount}>+${item.amount}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Health Metrics ─── */
function HealthMetrics() {
  const [metrics, setMetrics] = useState({ cpu: 21, redis: 4, rps: 2841, err: "0.02" });
  useEffect(() => {
    const id = setInterval(() => {
      setMetrics({
        cpu: Math.round(15 + Math.random() * 22),
        redis: Math.round(3 + Math.random() * 5),
        rps: Math.round(2600 + Math.random() * 450),
        err: (0.01 + Math.random() * 0.04).toFixed(2),
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const items = [
    { label: "CPU", value: `${metrics.cpu}%`, ok: metrics.cpu < 70 },
    { label: "Redis p99", value: `${metrics.redis}ms`, ok: true },
    { label: "API RPS", value: metrics.rps.toLocaleString(), ok: true },
    { label: "Error Rate", value: `${metrics.err}%`, ok: Number(metrics.err) < 0.1 },
  ];

  return (
    <div style={styles.healthGrid}>
      {items.map(m => (
        <div key={m.label} style={styles.healthCard}>
          <div style={styles.hmLabel}>{m.label}</div>
          <div style={styles.hmValue(m.ok)}>{m.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Clock ─── */
function Clock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => setT(new Date().toUTCString().slice(17, 25) + " UTC");
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <div style={styles.timeDisplay}>{t}</div>;
}

/* ─── Fluid BG Canvas ─── */
function FluidBg() {
  const ref = useRef(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const frameRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext("2d");

    const onMove = (e) => {
      mouse.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    window.addEventListener("mousemove", onMove);

    const draw = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      const W = c.width, H = c.height;
      ctx.fillStyle = T.bg;
      ctx.fillRect(0, 0, W, H);
      const t = timeRef.current;

      const orbs = [
        { x: 0.15 + Math.sin(t * 0.4) * 0.08 + mouse.current.x * 0.04, y: 0.2 + Math.cos(t * 0.3) * 0.06, r: 0.38, c: "rgba(16,185,129,0.042)" },
        { x: 0.75 + Math.cos(t * 0.35) * 0.07 + mouse.current.x * 0.03, y: 0.6 + Math.sin(t * 0.45) * 0.08, r: 0.3, c: "rgba(59,130,246,0.038)" },
        { x: 0.5 + Math.sin(t * 0.25) * 0.12, y: 0.85 + Math.cos(t * 0.38) * 0.05, r: 0.28, c: "rgba(139,92,246,0.036)" },
        { x: mouse.current.x * 0.8 + 0.1, y: mouse.current.y * 0.8 + 0.1, r: 0.2, c: "rgba(16,185,129,0.022)" },
      ];
      orbs.forEach(o => {
        const gx = o.x * W, gy = o.y * H, gr = o.r * Math.max(W, H);
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        g.addColorStop(0, o.c);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });
      timeRef.current += 0.007;
      frameRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return <canvas ref={ref} style={styles.canvas} aria-hidden="true" />;
}

/* ─── Sparkline ─── */
function Sparkline({ data, color }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.width = c.offsetWidth || 180;
    c.height = 30;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
    ctx.clearRect(0, 0, W, H);
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - min) / range) * (H - 4) - 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, color + "30");
    grad.addColorStop(1, color + "00");
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  });
  return <canvas ref={ref} style={{ width: "100%", height: 30, display: "block", marginTop: 10 }} aria-hidden="true" />;
}

/* ─── Main Component ─── */
export default function SuperadminDashboard() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [profile, setProfile] = useState(
    localStorage.getItem("profile") ? JSON.parse(localStorage.getItem("profile")) : null
  );
  const [schools, setSchools] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [userRequests, setUserRequests] = useState([]);
  const [schoolRegistrationRequests, setSchoolRegistrationRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [schoolUserCounts, setSchoolUserCounts] = useState({});
  const [schoolSearchInput, setSchoolSearchInput] = useState("");
  const [schoolSearchQuery, setSchoolSearchQuery] = useState("");

  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [userErrorMessage, setUserErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        setProfile(d);
        localStorage.setItem("profile", JSON.stringify(d));
        if (d?.role !== "superadmin") window.location.href = "/dashboard/admin";
      })
      .catch(() => null);
  }, [token]);

  async function loadSchools() {
    if (!token) return;
    setLoadingSchools(true);
    try {
      const res = await apiFetch("/admin/schools", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { setSchools([]); return; }
      const d = await res.json();
      setSchools(Array.isArray(d) ? d : []);
    } catch { setSchools([]); } finally { setLoadingSchools(false); }
  }

  async function loadSchoolUserCounts() {
    if (!token) return;
    setLoadingUsers(true);
    try {
      const res = await apiFetch("/admin/users", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { setSchoolUserCounts({}); return; }
      const d = await res.json();
      if (!Array.isArray(d)) { setSchoolUserCounts({}); return; }
      const counts = {};
      d.forEach(u => {
        const sid = Number(u?.school_id);
        if (Number.isFinite(sid) && sid > 0) counts[sid] = (counts[sid] || 0) + 1;
      });
      setSchoolUserCounts(counts);
    } catch { setSchoolUserCounts({}); } finally { setLoadingUsers(false); }
  }

  async function loadUserRequests() {
    if (!token) return;
    setLoadingRequests(true);
    try {
      const res = await apiFetch("/admin/user-requests", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { setUserRequests([]); return; }
      const d = await res.json();
      setUserRequests(Array.isArray(d) ? d : []);
    } catch { setUserRequests([]); } finally { setLoadingRequests(false); }
  }

  async function loadSchoolRegistrationRequests() {
    if (!token) return;
    try {
      const res = await apiFetch("/saas/registration-requests?status=pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setSchoolRegistrationRequests([]); return; }
      const d = await res.json();
      setSchoolRegistrationRequests(Array.isArray(d) ? d : []);
    } catch { setSchoolRegistrationRequests([]); }
  }

  useEffect(() => {
    loadSchools(); loadSchoolUserCounts(); loadUserRequests(); loadSchoolRegistrationRequests();
  }, [token]);

  useEffect(() => {
    if (!selectedSchoolId && schools.length > 0) setSelectedSchoolId(schools[0].id);
  }, [schools, selectedSchoolId]);

  async function approveUserRequest(id) {
    if (!token) return;
    const res = await apiFetch(`/admin/user-requests/${id}/approve`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    setUserRequests(prev => prev.filter(r => r.id !== id));
    setSuccessMessage("User request approved"); setSuccessOpen(true);
    await loadSchools(); await loadUserRequests(); await loadSchoolUserCounts();
  }

  async function rejectUserRequest(id) {
    if (!token) return;
    const res = await apiFetch(`/admin/user-requests/${id}/reject`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    setUserRequests(prev => prev.filter(r => r.id !== id));
    setSuccessMessage("User request rejected"); setSuccessOpen(true);
    await loadUserRequests();
  }

  async function approveSchoolRegistrationRequest(id) {
    if (!token) return;
    const res = await apiFetch(`/saas/approve-registration/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ temp_password: "school123" }),
    });
    if (!res.ok) return;
    setSchoolRegistrationRequests(prev => prev.filter(r => r.id !== id));
    setSuccessMessage("School registration approved"); setSuccessOpen(true);
    await loadSchools(); await loadSchoolRegistrationRequests();
  }

  async function rejectSchoolRegistrationRequest(id) {
    if (!token) return;
    const res = await apiFetch(`/saas/reject-registration/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reason: "Rejected by superadmin" }),
    });
    if (!res.ok) return;
    setSchoolRegistrationRequests(prev => prev.filter(r => r.id !== id));
    setSuccessMessage("School registration rejected"); setSuccessOpen(true);
    await loadSchoolRegistrationRequests();
  }

  async function createUser() {
    if (!token) return;
    const errors = {};
    if (!newUserUsername || newUserUsername.trim().length < 3) errors.username = "Minimum 3 characters";
    if (!newUserPassword || newUserPassword.length < 6) errors.password = "Minimum 6 characters";
    if (!newUserFullName || !newUserFullName.trim()) errors.full_name = "Full name is required";
    if (newUserEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newUserEmail)) errors.email = "Invalid email";
    if (Object.keys(errors).length) { setFormErrors(errors); return; }

    setFormErrors({}); setUserErrorMessage(""); setCreatingUser(true);
    try {
      const payload = {
        username: newUserUsername.trim(), password: newUserPassword,
        full_name: newUserFullName.trim(), email: newUserEmail || undefined, role: "school",
      };
      const res = await apiFetch("/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setUserErrorMessage(data?.detail || data?.raw || "Create user failed"); return; }
      setNewUserUsername(""); setNewUserPassword(""); setNewUserFullName(""); setNewUserEmail("");
      await loadSchools(); await loadSchoolUserCounts();
      if (data?.school_id || data?.user?.school_id)
        setSelectedSchoolId(Number(data.school_id || data.user.school_id));
      const cu = data?.user || data;
      const parts = [
        `User ${cu?.username || payload.username} (${cu?.role || payload.role}) created.`,
        data?.organisation_code ? `Org Code: ${data.organisation_code}.` : "",
        cu?.tenant_id ? `Org ID: ${cu.tenant_id}.` : "",
        cu?.school_id ? `School ID: ${cu.school_id}.` : "",
      ];
      setSuccessMessage(parts.filter(Boolean).join(" ")); setSuccessOpen(true);
    } finally { setCreatingUser(false); }
  }

  if (!token) { window.location.href = "/login"; return null; }

  const selectedSchool = schools.find(s => s.id === Number(selectedSchoolId));
  const totalUsers = Object.values(schoolUserCounts).reduce((s, c) => s + Number(c || 0), 0);
  const schoolsWithUsers = schools
    .map(s => ({ ...s, userCount: Number(schoolUserCounts[s.id] || 0) }))
    .sort((a, b) => b.userCount - a.userCount);
  const filteredSchoolsWithUsers = schoolsWithUsers.filter(s =>
    (s.name || "").toLowerCase().includes(schoolSearchQuery.trim().toLowerCase())
  );
  const topSchool = schoolsWithUsers[0] || null;
  const pendingAdminRequests = useMemo(
    () => userRequests.filter(r => r.role === "admin" || r.role === "school").length + schoolRegistrationRequests.length,
    [userRequests, schoolRegistrationRequests]
  );

  const spark1 = [210, 225, 218, 240, 252, 248, 263, 271, schools.length || 5];
  const spark2 = [112, 115, 118, 120, 122, 121, 124, 126, totalUsers || 0];
  const spark3 = [20, 24, 28, 30, 35, 38, 40, 44, userRequests.length + schoolRegistrationRequests.length];
  const spark4 = [5, 8, 6, 10, 12, 9, 11, 13, pendingAdminRequests];

  const isLoading = loadingSchools || loadingUsers || loadingRequests;

  /* ─── Inject keyframes ─── */
  if (!document.getElementById("cmd-kf")) {
    const s = document.createElement("style");
    s.id = "cmd-kf";
    s.textContent = `
      @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.45;transform:scale(.75)} }
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    `;
    document.head.appendChild(s);
  }

  const TIERS = [
    { label: "enterprise", style: styles.tierBadge("enterprise") },
    { label: "gold", style: styles.tierBadge("gold") },
    { label: "premium", style: styles.tierBadge("premium") },
  ];
  const topTenants = schoolsWithUsers.slice(0, 5).map((s, i) => ({
    ...s,
    tier: i === 0 ? "enterprise" : i < 3 ? "gold" : "premium",
  }));

  return (
    <div style={styles.shell}>
      <FluidBg />

      <div style={styles.inner}>
        {/* ── TOPBAR ── */}
        <header style={styles.topbar}>
          <div style={styles.topbarLeft}>
            <div style={styles.liveDot} />
            <span style={styles.topbarTitle}>Obsidian Command Center</span>
            <span style={{ color: "#1e293b", fontSize: 12 }}>|</span>
            <span style={styles.topbarTier}>SUPERADMIN TIER</span>
          </div>
          <div style={styles.topbarRight}>
            {isLoading && (
              <span style={{ fontSize: 11, color: T.textSoft, letterSpacing: "0.06em" }}>Syncing…</span>
            )}
            <div style={styles.statusChip}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.emerald, animation: "pulseDot 1.5s infinite" }} />
              All systems nominal
            </div>
            <Clock />
            <button style={styles.topBtn("ghost")} onClick={() => window.location.href = "/modules"}>Modules</button>
            <button
              style={styles.topBtn("danger")}
              onClick={() => {
                localStorage.removeItem("token"); localStorage.removeItem("profile");
                setToken(null); window.location.href = "/login";
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* ── KPI ROW ── */}
        <section style={styles.kpiRow} aria-label="Key performance indicators">
          {[
            { label: "Total Schools", value: schools.length, color: T.emerald, delta: "↑ 8 this week", spark: spark1 },
            { label: "Managed Users", value: totalUsers.toLocaleString(), color: T.gold, delta: "↑ 2,140 this week", spark: spark2 },
            { label: "Pending Requests", value: userRequests.length + schoolRegistrationRequests.length, color: "#60a5fa", delta: "Manual review queue", spark: spark3 },
            { label: "Priority Reviews", value: pendingAdminRequests, color: "#a78bfa", delta: `${pendingAdminRequests > 0 ? "↑ Needs attention" : "All clear"}`, spark: spark4 },
          ].map((k, i) => (
            <div key={i} style={styles.kpiCard()}>
              <div style={styles.kpiAccentLine([T.emerald, T.gold, "#60a5fa", "#a78bfa"][i])} />
              <div style={styles.kpiLabel}>{k.label}</div>
              <div style={styles.kpiValue(k.color)}>{k.value}</div>
              <div style={styles.kpiDelta(true)}>{k.delta}</div>
              <Sparkline data={k.spark} color={k.color} />
            </div>
          ))}
        </section>

        {/* ── MAIN GRID ── */}
        <div style={styles.mainGrid}>
          <div style={styles.leftCol}>
            {/* Schools + Context row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {/* Schools List */}
              <div style={styles.panel}>
                <div style={styles.panelHead}>
                  <SectionLabel>Schools List</SectionLabel>
                  <LiveBadge>{schools.length} total</LiveBadge>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <input
                    style={{ ...styles.input, flex: 1 }}
                    placeholder="Search by school name…"
                    value={schoolSearchInput}
                    onChange={e => setSchoolSearchInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && setSchoolSearchQuery(schoolSearchInput)}
                  />
                  <button style={styles.searchBtn} onClick={() => setSchoolSearchQuery(schoolSearchInput)}>
                    Search
                  </button>
                </div>
                <div style={{ maxHeight: 280, overflowY: "auto", paddingRight: 2 }}>
                  {filteredSchoolsWithUsers.length === 0 ? (
                    <div style={styles.emptyState}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>🏫</div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>No schools found</div>
                      <div style={{ fontSize: 11 }}>
                        {schoolSearchQuery ? "Try adjusting your search" : "Create your first school to get started"}
                      </div>
                    </div>
                  ) : filteredSchoolsWithUsers.map(s => (
                    <div key={s.id} style={styles.schoolRow}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={styles.schoolName}>{s.name}</span>
                          <span style={styles.userPill}>{s.userCount} users</span>
                        </div>
                        <div style={styles.schoolId}>ID: {s.id}</div>
                      </div>
                      <SelectBtn
                        variant={Number(selectedSchoolId) === Number(s.id) ? "active" : "inactive"}
                        onClick={() => setSelectedSchoolId(s.id)}
                      >
                        {Number(selectedSchoolId) === Number(s.id) ? "Selected" : "Select"}
                      </SelectBtn>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Context */}
              <div style={styles.panel}>
                <div style={styles.panelHead}>
                  <SectionLabel>Live Context</SectionLabel>
                </div>
                <select
                  style={styles.select}
                  value={selectedSchoolId ?? ""}
                  onChange={e => setSelectedSchoolId(e.target.value === "" ? null : Number(e.target.value))}
                >
                  <option value="">Choose school…</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <div style={styles.metricGrid}>
                  <div style={{ ...styles.metric(3), background: "rgba(16,185,129,0.06)", border: `1px solid rgba(16,185,129,0.2)` }}>
                    <div style={{ ...styles.metricLabel, color: T.emerald }}>Selected School</div>
                    <div style={{ ...styles.metricValue, color: T.emerald, fontSize: 13 }}>{selectedSchool?.name || "Not selected"}</div>
                  </div>
                  <div style={styles.metric()}>
                    <div style={styles.metricLabel}>School ID</div>
                    <div style={styles.metricValue}>{selectedSchoolId || "N/A"}</div>
                  </div>
                  <div style={styles.metric()}>
                    <div style={styles.metricLabel}>Largest School</div>
                    <div style={{ ...styles.metricValue, fontSize: 12 }}>{topSchool?.name || "N/A"}</div>
                  </div>
                  <div style={styles.metric()}>
                    <div style={styles.metricLabel}>Users in Largest</div>
                    <div style={{ ...styles.metricValue, color: T.gold }}>{topSchool?.userCount || 0}</div>
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <button
                      style={{ ...styles.primaryBtn(false), width: "100%", marginBottom: 8 }}
                      onClick={() => window.location.href = "/register-school"}
                    >
                      + Create Organisation
                    </button>
                  <button
                    style={{ ...styles.searchBtn, width: "100%", display: "block" }}
                    onClick={() => window.location.href = "/admin/role-permissions"}
                  >
                    Access Controls
                  </button>
                </div>
              </div>
            </div>

            {/* Top Tenant Monitor */}
            <div style={styles.panel}>
              <div style={styles.panelHead}>
                <SectionLabel>Top Tenant Monitor</SectionLabel>
                <span style={{ fontSize: 10, color: T.textSoft, letterSpacing: "0.06em" }}>BY USER COUNT</span>
              </div>
              <table style={styles.tenantTable} role="table" aria-label="Top schools by activity">
                <thead>
                  <tr>
                    {["School", "Tier", "Users", "School ID", "Activity", "Status"].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topTenants.map((s, i) => {
                    const activity = Math.max(40, 100 - i * 8);
                    return (
                      <tr key={s.id}>
                        <td style={{ ...styles.td, color: T.text, fontWeight: 600 }}>{s.name}</td>
                        <td style={styles.td}>
                          <span style={styles.tierBadge(s.tier)}>
                            {s.tier.charAt(0).toUpperCase() + s.tier.slice(1)}
                          </span>
                        </td>
                        <td style={styles.td}>{s.userCount.toLocaleString()}</td>
                        <td style={{ ...styles.td, color: T.textSoft }}>{s.id}</td>
                        <td style={styles.td}>
                          <div style={{ height: 4, width: 70, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${activity}%`, background: `linear-gradient(90deg, ${T.emerald}, ${T.blue})`, borderRadius: 2 }} />
                          </div>
                        </td>
                        <td style={{ ...styles.td, color: T.emerald, fontSize: 10, fontWeight: 700 }}>● ONLINE</td>
                      </tr>
                    );
                  })}
                  {topTenants.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ ...styles.td, textAlign: "center", padding: "20px 0", color: T.textSoft }}>
                        No schools loaded yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── GLOBAL PULSE POD ── */}
          <div style={styles.pod}>
            {/* Revenue Ticker */}
            <div style={styles.podSection}>
              <div style={styles.podLabel}>Live Revenue Stream</div>
              <LiveTicker />
            </div>

            {/* Heartbeat */}
            <div style={styles.podSection}>
              <div style={styles.podLabel}>System Heartbeat</div>
              <HeartbeatCanvas />
              <HealthMetrics />
            </div>

            {/* Pending Approvals */}
            <div style={styles.podSection}>
              <div style={styles.podLabel}>
                Pending Approvals
                {(userRequests.length + schoolRegistrationRequests.length) > 0 && (
                  <span style={{
                    marginLeft: 8, fontSize: 9, fontWeight: 700,
                    padding: "1px 6px", borderRadius: 20,
                    background: "rgba(245,158,11,0.15)", color: T.gold,
                    border: `1px solid rgba(245,158,11,0.3)`,
                  }}>
                    {userRequests.length + schoolRegistrationRequests.length}
                  </span>
                )}
              </div>
              {loadingRequests && <div style={{ fontSize: 11, color: T.textSoft, marginBottom: 6 }}>Syncing…</div>}
              {userRequests.length === 0 && schoolRegistrationRequests.length === 0 && !loadingRequests && (
                <div style={{ fontSize: 12, color: T.textSoft, padding: "12px 0", textAlign: "center" }}>
                  All requests processed
                </div>
              )}
              {schoolRegistrationRequests.map(r => (
                <div key={`sr-${r.id}`} style={styles.apprRow}>
                  <div style={{ ...styles.apprAvatar, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", color: "#60a5fa" }}>
                    {(r.school_name || "S").slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.apprName}>{r.school_name}</div>
                    <div style={styles.apprSub}>{r.admin_name} · school reg.</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button style={styles.apprBtn("approve")} onClick={() => approveSchoolRegistrationRequest(r.id)}>✓</button>
                    <button style={styles.apprBtn("reject")} onClick={() => rejectSchoolRegistrationRequest(r.id)}>✗</button>
                  </div>
                </div>
              ))}
              {userRequests.map(r => (
                <div key={r.id} style={styles.apprRow}>
                  <div style={styles.apprAvatar}>
                    {(r.username || "U").slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.apprName}>{r.username}</div>
                    <div style={styles.apprSub}>{r.role} · {r.email}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button style={styles.apprBtn("approve")} onClick={() => approveUserRequest(r.id)}>✓</button>
                    <button style={styles.apprBtn("reject")} onClick={() => rejectUserRequest(r.id)}>✗</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Broadcast */}
            <button style={styles.broadcastBtn}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke={T.emerald} strokeWidth="1.5" />
                <circle cx="6" cy="6" r="2" fill={T.emerald} />
              </svg>
              Global Broadcast
            </button>
          </div>
        </div>
      </div>

      <Snackbar
        open={successOpen}
        autoHideDuration={6000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSuccessOpen(false)}
          severity="success"
          sx={{
            width: "100%",
            background: "rgba(13,20,35,0.98)",
            border: "1px solid rgba(16,185,129,0.3)",
            color: "#10b981",
            fontFamily: "Inter, sans-serif",
            "& .MuiAlert-icon": { color: "#10b981" },
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
