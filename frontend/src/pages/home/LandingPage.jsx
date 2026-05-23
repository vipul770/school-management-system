import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Fade,
  Grid,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useScrollTrigger,
  Zoom,
} from "@mui/material";
import {
  ArrowOutward,
  Assessment,
  CheckCircle,
  CloudDone,
  Groups,
  MenuBook,
  Payments,
  School,
  Security,
  TaskAlt,
  Verified,
  Close,
  Menu,
  KeyboardArrowUp,
} from "@mui/icons-material";

const goTo = (path) => {
  window.location.href = path;
};

const heroStats = [
  { label: "Active campuses", value: "128", trend: "+12%", icon: <School fontSize="small" /> },
  { label: "Daily attendance sync", value: "96.4%", trend: "+2.1%", icon: <CloudDone fontSize="small" /> },
  { label: "Staff workflows automated", value: "42", trend: "+8", icon: <Groups fontSize="small" /> },
];

const proofLogos = ["Riverside", "Northfield", "Oakridge", "Bright Future", "Crescent", "Summit"];

const featureCards = [
  {
    icon: <Groups />,
    title: "Student lifecycle",
    description: "Admissions, enrollment, attendance, parent communication, and promotion tracking from one flow.",
    accent: "#6ee7b7",
    gradient: "linear-gradient(135deg, rgba(110,231,183,0.15), rgba(6,78,59,0.15))",
  },
  {
    icon: <Payments />,
    title: "Finance clarity",
    description: "Fee structures, invoice reminders, defaulter snapshots, and collections with less back-office effort.",
    accent: "#fbbf24",
    gradient: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(146,64,14,0.15))",
  },
  {
    icon: <Assessment />,
    title: "Academic control",
    description: "Schedules, grading, report workflows, and classroom operations in a cleaner academic cockpit.",
    accent: "#7dd3fc",
    gradient: "linear-gradient(135deg, rgba(125,211,252,0.15), rgba(30,64,175,0.15))",
  },
  {
    icon: <Security />,
    title: "Role-based access",
    description: "Separate superadmin, school, teacher, parent, librarian, and accountant journeys without data confusion.",
    accent: "#c4b5fd",
    gradient: "linear-gradient(135deg, rgba(196,181,253,0.15), rgba(91,33,182,0.15))",
  },
];

const outcomes = [
  {
    kicker: "Admissions",
    title: "Replace spreadsheet handoffs with a guided intake pipeline.",
    text: "Capture school registrations, verify faster, and turn approval into instant operational setup.",
    icon: <Verified sx={{ color: "#fbbf24" }} />,
  },
  {
    kicker: "Operations",
    title: "Make the admin team feel coordinated, not buried.",
    text: "Your attendance, fees, exams, classes, and messaging modules stop competing and start working together.",
    icon: <Groups sx={{ color: "#6ee7b7" }} />,
  },
  {
    kicker: "Reporting",
    title: "See health signals before problems become fires.",
    text: "Use live metrics across attendance, finance, and academic workflows to act earlier and communicate clearly.",
    icon: <Assessment sx={{ color: "#7dd3fc" }} />,
  },
];

const onboardingSteps = [
  {
    label: "Register",
    description: "Create your institution profile and define the operating context for your school.",
    icon: "📝",
  },
  {
    label: "Approve",
    description: "Complete your review flow so the right tenant and dashboard permissions are activated.",
    icon: "✅",
  },
  {
    label: "Configure",
    description: "Set up classes, fee structures, staff roles, and academic workflows without jumping between tools.",
    icon: "⚙️",
  },
  {
    label: "Run daily",
    description: "Start managing teaching, attendance, exams, finance, and communication from a unified workspace.",
    icon: "🚀",
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Principal, Riverside Academy",
    content: "We went from disconnected admin work to a command center our staff actually trusts every day.",
    avatar: "SJ",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Administrator, Bright Future School",
    content: "The biggest win was operational clarity. Teams now know exactly where work starts, who owns it, and what is pending.",
    avatar: "MC",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Teacher, Mountain View High",
    content: "It feels like the school finally has one system instead of five tools pretending to be one system.",
    avatar: "ER",
    rating: 5,
  },
];

const footerGroups = [
  {
    title: "Platform",
    items: ["Student records", "Attendance", "Fee workflows", "Exam operations"],
  },
  {
    title: "Administration",
    items: ["Tenant onboarding", "Role permissions", "School setup", "Analytics"],
  },
  {
    title: "Support",
    items: ["Help center", "Privacy", "Security", "Billing"],
  },
  {
    title: "Resources",
    items: ["Blog", "Documentation", "API status", "Release notes"],
  },
];

function ScrollToTop() {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Zoom in={trigger}>
      <IconButton
        onClick={handleClick}
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
          bgcolor: "rgba(251,191,36,0.9)",
          color: "#07111f",
          backdropFilter: "blur(8px)",
          "&:hover": { bgcolor: "#fbbf24", transform: "scale(1.1)" },
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1000,
        }}
      >
        <KeyboardArrowUp />
      </IconButton>
    </Zoom>
  );
}

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    const testimonialTimer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    const stepTimer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % onboardingSteps.length);
    }, 4000);

    return () => {
      clearInterval(testimonialTimer);
      clearInterval(stepTimer);
    };
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        color: "#0f172a",
        background: `
          radial-gradient(circle at 0% 0%, rgba(251,191,36,0.08), transparent 50%),
          radial-gradient(circle at 100% 100%, rgba(52,211,153,0.08), transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(59,130,246,0.05), transparent 70%),
          linear-gradient(135deg, #fafbff 0%, #f0f4fe 100%)
        `,
        position: "relative",
      }}
    >
      {/* Animated background patterns */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.3,
          backgroundImage: `
            repeating-linear-gradient(45deg, rgba(148,163,184,0.03) 0px, rgba(148,163,184,0.03) 2px, transparent 2px, transparent 8px),
            repeating-linear-gradient(135deg, rgba(148,163,184,0.03) 0px, rgba(148,163,184,0.03) 2px, transparent 2px, transparent 8px)
          `,
          backgroundSize: "40px 40px",
          animation: "drift 60s linear infinite",
        }}
      />

      {/* Floating orbs */}
      <Box
        sx={{
          position: "fixed",
          top: "20%",
          left: "10%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,191,36,0.1), transparent 70%)",
          filter: "blur(40px)",
          animation: "float 20s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "fixed",
          bottom: "15%",
          right: "5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(52,211,153,0.08), transparent 70%)",
          filter: "blur(50px)",
          animation: "float 25s ease-in-out infinite reverse",
          pointerEvents: "none",
        }}
      />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(15,23,42,0.06)",
          transition: "all 0.3s ease",
        }}
      >
        <Toolbar sx={{ py: 1, justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1.6} alignItems="center">
            <Box
              component="img"
              src={logo}
              alt="School Management System logo"
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                background: "linear-gradient(135deg, #fff, #f1f5f9)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "scale(1.05) rotate(2deg)" },
              }}
            />
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <Typography sx={{ fontWeight: 800, letterSpacing: "-0.02em", fontSize: "1.3rem", background: "linear-gradient(135deg, #0f172a, #1e293b)", backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }}>
                School Management Pro
              </Typography>
              <Typography sx={{ fontSize: 11, color: "rgba(15,23,42,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Cloud Operating System
              </Typography>
            </Box>
          </Stack>

          {/* Desktop Navigation */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
            <Button sx={{ color: "#0f172a", fontWeight: 600, "&:hover": { bgcolor: "rgba(0,0,0,0.04)" } }} onClick={() => goTo("/login")}>
              Login
            </Button>
            <Button
              variant="contained"
              onClick={() => goTo("/register-school")}
              endIcon={<ArrowOutward />}
              sx={{
                borderRadius: 999,
                px: 3,
                py: 1.2,
                fontWeight: 800,
                background: "linear-gradient(135deg, #fbbf24, #34d399)",
                color: "#07111f",
                boxShadow: "0 8px 20px rgba(251,191,36,0.25)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 28px rgba(251,191,36,0.35)",
                  background: "linear-gradient(135deg, #fcd34d, #6ee7b7)",
                },
              }}
            >
              Start setup
            </Button>
          </Stack>

          {/* Mobile Menu Button */}
          <IconButton sx={{ display: { xs: "flex", md: "none" } }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <Close /> : <Menu />}
          </IconButton>
        </Toolbar>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <Box
            sx={{
              position: "absolute",
              top: 72,
              left: 0,
              right: 0,
              bgcolor: "rgba(255,255,255,0.98)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(0,0,0,0.05)",
              p: 2,
              display: { xs: "flex", md: "none" },
              flexDirection: "column",
              gap: 1,
              zIndex: 1300,
            }}
          >
            <Button fullWidth sx={{ py: 1.5 }} onClick={() => goTo("/login")}>
              Login
            </Button>
            <Button fullWidth variant="contained" sx={{ py: 1.5, borderRadius: 999 }} onClick={() => goTo("/register-school")}>
              Start setup
            </Button>
          </Box>
        )}
      </AppBar>

      <Container maxWidth="xl" sx={{ pt: { xs: 12, md: 16 }, pb: 8, position: "relative" }}>
        {/* Hero Section */}
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="stretch">
          <Grid item xs={12} lg={7}>
            <Fade in timeout={800}>
              <Box sx={{ maxWidth: 760 }}>
                <Chip
                  icon={<Verified sx={{ color: "#fde68a !important" }} />}
                  label="Designed for multi-school operations and daily administration"
                  sx={{
                    mb: 3,
                    px: 1.5,
                    py: 2,
                    color: "#92400e",
                    bgcolor: "rgba(251,191,36,0.12)",
                    border: "1px solid rgba(251,191,36,0.2)",
                    backdropFilter: "blur(10px)",
                    fontWeight: 600,
                  }}
                />

                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: "2.5rem", sm: "3.5rem", md: "5rem" },
                    lineHeight: 1,
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    mb: 2.5,
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  The school front office,
                  <Box component="span" sx={{ background: "linear-gradient(135deg, #fbbf24, #34d399)", backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }}>
                    {" "}
                    academic engine,{" "}
                  </Box>
                  and finance desk unified.
                </Typography>

                <Typography
                  sx={{
                    fontSize: { xs: 16, md: 18 },
                    lineHeight: 1.7,
                    color: "rgba(15,23,42,0.7)",
                    maxWidth: 620,
                    mb: 4,
                  }}
                >
                  Replace disconnected admin chaos with one intelligent system for registration, attendance, fees, exams,
                  staff operations, and parent communication. Built for institutions that demand clarity and speed.
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 5, maxWidth: 540 }}>
                  <Button
                    size="large"
                    variant="contained"
                    endIcon={<ArrowOutward />}
                    onClick={() => goTo("/register-school")}
                    sx={{
                      py: 1.5,
                      px: 3.5,
                      borderRadius: 999,
                      fontWeight: 800,
                      fontSize: "1rem",
                      background: "linear-gradient(135deg, #fbbf24, #34d399)",
                      color: "#07111f",
                      boxShadow: "0 20px 40px rgba(52,211,153,0.2)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "0 28px 50px rgba(52,211,153,0.3)",
                      },
                    }}
                  >
                    Register your school
                  </Button>
                  <Button
                    size="large"
                    variant="outlined"
                    onClick={() => goTo("/login")}
                    sx={{
                      py: 1.5,
                      px: 3.5,
                      borderRadius: 999,
                      color: "#0f172a",
                      borderColor: "rgba(15,23,42,0.2)",
                      background: "rgba(255,255,255,0.8)",
                      backdropFilter: "blur(10px)",
                      "&:hover": {
                        borderColor: "#0f172a",
                        background: "rgba(255,255,255,0.95)",
                      },
                    }}
                  >
                    Organisation portal →
                  </Button>
                </Stack>

                <Grid container spacing={2} sx={{ mb: 5 }}>
                  {heroStats.map((item, idx) => (
                    <Grid item xs={12} sm={4} key={item.label}>
                      <Card
                        sx={{
                          p: 2.5,
                          borderRadius: 4,
                          background: "rgba(255,255,255,0.7)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255,255,255,0.8)",
                          transition: "all 0.3s ease",
                          "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 24px rgba(0,0,0,0.1)" },
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "rgba(15,23,42,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            {item.label}
                          </Typography>
                          {item.icon}
                        </Stack>
                        <Typography sx={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", color: "#0f172a", mt: 1 }}>
                          {item.value}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#10b981", mt: 0.5 }}>
                          ↑ {item.trend} from last month
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2} flexWrap="wrap" sx={{ opacity: 0.7 }}>
                  <Typography sx={{ fontWeight: 600, color: "#0f172a" }}>Trusted by:</Typography>
                  {proofLogos.map((name) => (
                    <Box
                      key={name}
                      sx={{
                        px: 2.2,
                        py: 0.8,
                        borderRadius: 999,
                        bgcolor: "rgba(255,255,255,0.6)",
                        color: "#0f172a",
                        fontWeight: 600,
                        fontSize: 14,
                        transition: "all 0.2s ease",
                        "&:hover": { bgcolor: "white", transform: "translateY(-2px)" },
                      }}
                    >
                      {name}
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Fade>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Fade in timeout={1000}>
              <Card
                sx={{
                  borderRadius: 5,
                  background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.98))",
                  border: "1px solid rgba(255,255,255,0.1)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Animated gradient overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: "linear-gradient(90deg, #fbbf24, #34d399, #7dd3fc, #fbbf24)",
                    backgroundSize: "200% 100%",
                    animation: "gradientShift 3s ease infinite",
                  }}
                />
                
                <Box sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Box>
                      <Typography sx={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#93c5fd", fontWeight: 600 }}>
                        Live Dashboard Preview
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: "#f8fbff", mt: 0.5 }}>
                        One unified command center
                      </Typography>
                    </Box>
                    <Chip
                      label="Live sync"
                      size="small"
                      sx={{
                        bgcolor: "rgba(52,211,153,0.2)",
                        color: "#6ee7b7",
                        fontWeight: 700,
                        fontSize: 11,
                      }}
                    />
                  </Stack>

                  <Box sx={{ mb: 2 }}>
                    <Grid container spacing={1.5}>
                      {[
                        { label: "Admissions", value: "43 pending", color: "#7dd3fc", change: "+8" },
                        { label: "Fees due", value: "18 alerts", color: "#fbbf24", change: "+3" },
                        { label: "Attendance", value: "94% marked", color: "#6ee7b7", change: "+2%" },
                      ].map((panel) => (
                        <Grid item xs={4} key={panel.label}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 3,
                              bgcolor: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.05)",
                              transition: "all 0.2s ease",
                              "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                            }}
                          >
                            <Typography sx={{ color: "rgba(226,232,240,0.6)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                              {panel.label}
                            </Typography>
                            <Typography sx={{ fontSize: 18, fontWeight: 800, color: panel.color }}>
                              {panel.value}
                            </Typography>
                            <Typography sx={{ fontSize: 9, color: "#10b981" }}>↑ {panel.change}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ p: 2, borderRadius: 3, bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <Typography sx={{ fontSize: 11, textTransform: "uppercase", color: "rgba(226,232,240,0.6)", mb: 2, letterSpacing: "0.08em" }}>
                        Weekly activity heatmap
                      </Typography>
                      <Box sx={{ height: 100, display: "flex", alignItems: "flex-end", gap: 1, mb: 1.5 }}>
                        {[65, 72, 68, 85, 92, 88, 78].map((height, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              flex: 1,
                              height: `${height}%`,
                              borderRadius: "12px 12px 6px 6px",
                              background: `linear-gradient(180deg, ${idx >= 4 ? "#fbbf24" : "#7dd3fc"}, ${idx >= 4 ? "#fb7185" : "#34d399"})`,
                              transition: "all 0.3s ease",
                              "&:hover": { opacity: 0.8, transform: "scaleX(1.05)" },
                            }}
                          />
                        ))}
                      </Box>
                      <Typography sx={{ color: "rgba(226,232,240,0.5)", fontSize: 11, textAlign: "center" }}>
                        Operational momentum increasing steadily
                      </Typography>
                    </Box>
                  </Box>

                  <Stack spacing={1.5}>
                    {[
                      { icon: <TaskAlt sx={{ color: "#86efac", fontSize: 16 }} />, label: "Morning roll call", meta: "Completed 8:45 AM", status: "success" },
                      { icon: <MenuBook sx={{ color: "#7dd3fc", fontSize: 16 }} />, label: "Exam roster", meta: "Updated 11:20 AM", status: "active" },
                      { icon: <CloudDone sx={{ color: "#fde68a", fontSize: 16 }} />, label: "Fee sync", meta: "1:05 PM", status: "success" },
                    ].map((item) => (
                      <Box
                        key={item.label}
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                          bgcolor: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.05)",
                          transition: "all 0.2s ease",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          {item.icon}
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{item.label}</Typography>
                            <Typography sx={{ color: "rgba(226,232,240,0.5)", fontSize: 11 }}>{item.meta}</Typography>
                          </Box>
                          <CheckCircle sx={{ color: "#10b981", fontSize: 16 }} />
                        </Stack>
                      </Box>
                    ))}
                  </Stack>

                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 3,
                      background: "linear-gradient(135deg, rgba(251,191,36,0.1), rgba(52,211,153,0.05))",
                      border: "1px solid rgba(251,191,36,0.2)",
                    }}
                  >
                    <Typography sx={{ fontSize: 10, textTransform: "uppercase", color: "#fde68a", mb: 0.5 }}>
                      24/7 Operational Visibility
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: 18, color: "#f8fbff" }}>
                      Complete control dashboard
                    </Typography>
                    <Typography sx={{ color: "rgba(226,232,240,0.6)", fontSize: 12, mt: 0.5 }}>
                      Every metric, workflow, and alert in one intelligent surface
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Fade>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Chip label="Core Capabilities" sx={{ mb: 2, bgcolor: "rgba(251,191,36,0.1)", color: "#fbbf24", fontWeight: 600 }} />
          <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "3rem" }, fontWeight: 900, letterSpacing: "-0.02em", mb: 2 }}>
            Everything you need to run
            <Box component="span" sx={{ background: "linear-gradient(135deg, #fbbf24, #34d399)", backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }}>
              {" "}
              your institution
            </Box>
          </Typography>
          <Typography sx={{ color: "rgba(15,23,42,0.7)", maxWidth: 600, mx: "auto" }}>
            Comprehensive tools designed to streamline every aspect of school management
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {featureCards.map((feature, idx) => (
            <Grid item xs={12} md={6} lg={3} key={feature.title}>
              <Fade in timeout={400 + idx * 100}>
                <Card
                  onMouseEnter={() => setHoveredFeature(idx)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  sx={{
                    height: "100%",
                    p: 3,
                    borderRadius: 4,
                    background: feature.gradient,
                    backdropFilter: "blur(10px)",
                    border: `1px solid ${hoveredFeature === idx ? feature.accent : "rgba(255,255,255,0.1)"}`,
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: hoveredFeature === idx ? "translateY(-8px)" : "translateY(0)",
                    boxShadow: hoveredFeature === idx ? `0 20px 40px ${feature.accent}20` : "none",
                    cursor: "pointer",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      mb: 2,
                      bgcolor: `${feature.accent}20`,
                      color: feature.accent,
                      transition: "all 0.3s ease",
                      transform: hoveredFeature === idx ? "scale(1.1) rotate(5deg)" : "scale(1)",
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography sx={{ color: "rgba(15,23,42,0.7)", lineHeight: 1.6, fontSize: 14 }}>
                    {feature.description}
                  </Typography>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Outcomes Section */}
      <Box sx={{ py: 8, bgcolor: "rgba(0,0,0,0.02)" }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="stretch">
            <Grid item xs={12} lg={5}>
              <Typography sx={{ color: "#fbbf24", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5 }}>
                Why choose us
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: "-0.03em", mb: 2, fontSize: { xs: "2rem", md: "2.5rem" } }}>
                Built differently for
                <Box component="span" sx={{ color: "#fbbf24" }}> modern education</Box>
              </Typography>
              <Typography sx={{ color: "rgba(15,23,42,0.7)", lineHeight: 1.8 }}>
                Traditional school software feels fragmented and slows you down. We've reimagined every workflow to be intuitive, connected, and actually helpful.
              </Typography>
            </Grid>
            <Grid item xs={12} lg={7}>
              <Stack spacing={2}>
                {outcomes.map((item, idx) => (
                  <Fade in timeout={400 + idx * 100} key={item.title}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        border: "1px solid rgba(0,0,0,0.05)",
                        transition: "all 0.3s ease",
                        "&:hover": { transform: "translateX(8px)", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" },
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Avatar sx={{ bgcolor: "rgba(251,191,36,0.1)", color: "#fbbf24" }}>{item.icon}</Avatar>
                        <Box>
                          <Typography sx={{ color: "#fbbf24", fontSize: 11, fontWeight: 700, textTransform: "uppercase", mb: 0.5 }}>
                            {item.kicker}
                          </Typography>
                          <Typography sx={{ fontWeight: 800, fontSize: { xs: 18, md: 20 }, mb: 1 }}>
                            {item.title}
                          </Typography>
                          <Typography sx={{ color: "rgba(15,23,42,0.7)" }}>{item.text}</Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Fade>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Onboarding & Testimonials Section */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} lg={6}>
            <Card sx={{ p: 4, borderRadius: 5, background: "linear-gradient(135deg, #0f172a, #1e293b)", color: "white" }}>
              <Typography sx={{ color: "#fbbf24", fontSize: 11, fontWeight: 700, textTransform: "uppercase", mb: 1.5 }}>
                Simple onboarding
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 3 }}>
                Get started in minutes, not weeks
              </Typography>

              <Stack spacing={2}>
                {onboardingSteps.map((step, idx) => {
                  const isActive = idx === activeStep;
                  return (
                    <Box
                      key={step.label}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: isActive ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isActive ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.05)"}`,
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": { bgcolor: "rgba(251,191,36,0.08)" },
                      }}
                      onClick={() => setActiveStep(idx)}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography sx={{ fontSize: 28 }}>{step.icon}</Typography>
                        <Box>
                          <Typography sx={{ fontWeight: 800, mb: 0.5 }}>{step.label}</Typography>
                          <Typography sx={{ color: "rgba(226,232,240,0.7)", fontSize: 14 }}>{step.description}</Typography>
                        </Box>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card sx={{ p: 4, borderRadius: 5, height: "100%", background: "linear-gradient(135deg, #f8fafc, #f1f5f9)" }}>
              <Typography sx={{ color: "#fbbf24", fontSize: 11, fontWeight: 700, textTransform: "uppercase", mb: 1.5 }}>
                Trusted by educators
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 3, color: "#0f172a" }}>
                What schools are saying
              </Typography>

              <Box sx={{ position: "relative", minHeight: 280 }}>
                {testimonials.map((testimonial, idx) => (
                  <Fade in={idx === currentTestimonial} key={testimonial.name}>
                    <Box sx={{ display: idx === currentTestimonial ? "block" : "none" }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: "#fbbf24", color: "#0f172a", fontWeight: 800, fontSize: 20 }}>
                          {testimonial.avatar}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 800, fontSize: 18, color: "#0f172a" }}>{testimonial.name}</Typography>
                          <Typography sx={{ color: "rgba(15,23,42,0.6)" }}>{testimonial.role}</Typography>
                        </Box>
                      </Stack>
                      <Typography sx={{ fontSize: { xs: 18, md: 20 }, lineHeight: 1.5, fontWeight: 500, color: "#0f172a", mb: 2 }}>
                        "{testimonial.content}"
                      </Typography>
                      <Stack direction="row" spacing={0.5}>
                        {[...Array(5)].map((_, i) => (
                          <CheckCircle key={i} sx={{ color: "#fbbf24", fontSize: 20 }} />
                        ))}
                      </Stack>
                    </Box>
                  </Fade>
                ))}
              </Box>

              <Stack direction="row" spacing={1.5} sx={{ mt: 3, justifyContent: "center" }}>
                {testimonials.map((_, idx) => (
                  <Box
                    key={idx}
                    onClick={() => setCurrentTestimonial(idx)}
                    sx={{
                      width: idx === currentTestimonial ? 32 : 8,
                      height: 8,
                      borderRadius: 999,
                      bgcolor: idx === currentTestimonial ? "#fbbf24" : "rgba(0,0,0,0.2)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="xl" sx={{ pb: 8 }}>
        <Card
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 5,
            background: "linear-gradient(135deg, #fbbf24, #34d399)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.2), transparent)",
              animation: "pulse 3s ease-in-out infinite",
            }}
          />
          <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", mb: 2, fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
            Ready to transform your school operations?
          </Typography>
          <Typography sx={{ color: "#0f172a", opacity: 0.9, mb: 4, maxWidth: 600, mx: "auto" }}>
            Join hundreds of institutions that have streamlined their administration with our platform
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button
              size="large"
              variant="contained"
              endIcon={<ArrowOutward />}
              onClick={() => goTo("/register-school")}
              sx={{
                bgcolor: "#0f172a",
                color: "white",
                borderRadius: 999,
                px: 4,
                py: 1.5,
                fontWeight: 800,
                "&:hover": { bgcolor: "#1e293b", transform: "translateY(-2px)" },
              }}
            >
              Start free registration
            </Button>
            <Button
              size="large"
              variant="outlined"
              onClick={() => goTo("/login")}
              sx={{
                borderColor: "#0f172a",
                color: "#0f172a",
                borderRadius: 999,
                px: 4,
                py: 1.5,
                fontWeight: 800,
                "&:hover": { borderColor: "#0f172a", bgcolor: "rgba(15,23,42,0.05)" },
              }}
            >
              Login to portal
            </Button>
          </Stack>
        </Card>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: "#0f172a", color: "#f8fafc", pt: 6, pb: 4 }}>
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <School sx={{ color: "#fbbf24", fontSize: 32 }} />
                <Typography variant="h6" sx={{ fontWeight: 900 }}>School Management Pro</Typography>
              </Stack>
              <Typography sx={{ color: "rgba(248,250,252,0.7)", lineHeight: 1.7 }}>
                The complete operating system for modern educational institutions
              </Typography>
            </Grid>
            {footerGroups.map((group) => (
              <Grid item xs={6} md={2.25} key={group.title}>
                <Typography sx={{ fontWeight: 800, mb: 2, color: "#fbbf24" }}>{group.title}</Typography>
                <Stack spacing={1.5}>
                  {group.items.map((item) => (
                    <Typography key={item} sx={{ color: "rgba(248,250,252,0.6)", fontSize: 14, "&:hover": { color: "#fbbf24", cursor: "pointer" } }}>
                      {item}
                    </Typography>
                  ))}
                </Stack>
              </Grid>
            ))}
          </Grid>
          <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.1)" }} />
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography sx={{ color: "rgba(248,250,252,0.5)", fontSize: 14 }}>
              © 2026 School Management Pro. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={3}>
              <Typography sx={{ color: "rgba(248,250,252,0.6)", fontSize: 14, "&:hover": { color: "#fbbf24", cursor: "pointer" } }}>
                Privacy
              </Typography>
              <Typography sx={{ color: "rgba(248,250,252,0.6)", fontSize: 14, "&:hover": { color: "#fbbf24", cursor: "pointer" } }}>
                Terms
              </Typography>
              <Typography sx={{ color: "rgba(248,250,252,0.6)", fontSize: 14, "&:hover": { color: "#fbbf24", cursor: "pointer" } }}>
                Security
              </Typography>
              <Typography sx={{ color: "rgba(248,250,252,0.6)", fontSize: 14, "&:hover": { color: "#fbbf24", cursor: "pointer" } }}>
                Contact
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <ScrollToTop />

      <style>
        {`
          @keyframes fadeSlide {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(-20px) translateX(10px); }
          }
          
          @keyframes drift {
            from { transform: translateX(0px) translateY(0px); }
            to { transform: translateX(40px) translateY(40px); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
        `}
      </style>
    </Box>
  );
}





















// import React, { useEffect, useState } from "react";
// import logo from "../../assets/logo.png";
// import {
//   AppBar,
//   Avatar,
//   Box,
//   Button,
//   Card,
//   Chip,
//   Container,
//   Divider,
//   Grid,
//   Stack,
//   Toolbar,
//   Typography,
// } from "@mui/material";
// import {
//   ArrowOutward,
//   Assessment,
//   CheckCircle,
//   CloudDone,
//   Groups,
//   MenuBook,
//   Payments,
//   School,
//   Security,
//   TaskAlt,
//   Verified,
// } from "@mui/icons-material";

// const goTo = (path) => {
//   window.location.href = path;
// };

// const heroStats = [
//   { label: "Active campuses", value: "128" },
//   { label: "Daily attendance sync", value: "96.4%" },
//   { label: "Staff workflows automated", value: "42" },
// ];

// const proofLogos = ["Riverside", "Northfield", "Oakridge", "Bright Future", "Crescent", "Summit"];

// const featureCards = [
//   {
//     icon: <Groups />,
//     title: "Student lifecycle",
//     description: "Admissions, enrollment, attendance, parent communication, and promotion tracking from one flow.",
//     accent: "#6ee7b7",
//     tone: "linear-gradient(150deg, rgba(110,231,183,0.20), rgba(11,18,32,0.88))",
//   },
//   {
//     icon: <Payments />,
//     title: "Finance clarity",
//     description: "Fee structures, invoice reminders, defaulter snapshots, and collections with less back-office effort.",
//     accent: "#fbbf24",
//     tone: "linear-gradient(150deg, rgba(251,191,36,0.22), rgba(11,18,32,0.88))",
//   },
//   {
//     icon: <Assessment />,
//     title: "Academic control",
//     description: "Schedules, grading, report workflows, and classroom operations in a cleaner academic cockpit.",
//     accent: "#7dd3fc",
//     tone: "linear-gradient(150deg, rgba(125,211,252,0.22), rgba(11,18,32,0.88))",
//   },
//   {
//     icon: <Security />,
//     title: "Role-based access",
//     description: "Separate superadmin, school, teacher, parent, librarian, and accountant journeys without data confusion.",
//     accent: "#c4b5fd",
//     tone: "linear-gradient(150deg, rgba(196,181,253,0.22), rgba(11,18,32,0.88))",
//   },
// ];

// const outcomes = [
//   {
//     kicker: "Admissions",
//     title: "Replace spreadsheet handoffs with a guided intake pipeline.",
//     text: "Capture school registrations, verify faster, and turn approval into instant operational setup.",
//   },
//   {
//     kicker: "Operations",
//     title: "Make the admin team feel coordinated, not buried.",
//     text: "Your attendance, fees, exams, classes, and messaging modules stop competing and start working together.",
//   },
//   {
//     kicker: "Reporting",
//     title: "See health signals before problems become fires.",
//     text: "Use live metrics across attendance, finance, and academic workflows to act earlier and communicate clearly.",
//   },
// ];

// const onboardingSteps = [
//   {
//     label: "Register",
//     description: "Create your institution profile and define the operating context for your school.",
//   },
//   {
//     label: "Approve",
//     description: "Complete your review flow so the right tenant and dashboard permissions are activated.",
//   },
//   {
//     label: "Configure",
//     description: "Set up classes, fee structures, staff roles, and academic workflows without jumping between tools.",
//   },
//   {
//     label: "Run daily",
//     description: "Start managing teaching, attendance, exams, finance, and communication from a unified workspace.",
//   },
// ];

// const testimonials = [
//   {
//     name: "Sarah Johnson",
//     role: "Principal, Riverside Academy",
//     content: "We went from disconnected admin work to a command center our staff actually trusts every day.",
//     avatar: "SJ",
//   },
//   {
//     name: "Michael Chen",
//     role: "Administrator, Bright Future School",
//     content: "The biggest win was operational clarity. Teams now know exactly where work starts, who owns it, and what is pending.",
//     avatar: "MC",
//   },
//   {
//     name: "Emily Rodriguez",
//     role: "Teacher, Mountain View High",
//     content: "It feels like the school finally has one system instead of five tools pretending to be one system.",
//     avatar: "ER",
//   },
// ];

// const footerGroups = [
//   {
//     title: "Platform",
//     items: ["Student records", "Attendance", "Fee workflows", "Exam operations"],
//   },
//   {
//     title: "Administration",
//     items: ["Tenant onboarding", "Role permissions", "School setup", "Analytics"],
//   },
//   {
//     title: "Support",
//     items: ["Help center", "Privacy", "Security", "Billing"],
//   },
// ];

// const glassPanel = {
//   border: "1px solid rgba(255,255,255,0.09)",
//   background: "linear-gradient(180deg, rgba(15,23,42,0.78), rgba(15,23,42,0.52))",
//   backdropFilter: "blur(18px)",
//   boxShadow: "0 28px 80px rgba(2, 8, 23, 0.34)",
// };

// const metricCard = {
//   p: 2.2,
//   borderRadius: 4,
//   border: "1px solid rgba(255,255,255,0.08)",
//   background: "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
// };

// export default function LandingPage() {
//   const [activeStep, setActiveStep] = useState(0);
//   const [currentTestimonial, setCurrentTestimonial] = useState(0);

//   useEffect(() => {
//     const testimonialTimer = setInterval(() => {
//       setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
//     }, 4200);

//     const stepTimer = setInterval(() => {
//       setActiveStep((prev) => (prev + 1) % onboardingSteps.length);
//     }, 3200);

//     return () => {
//       clearInterval(testimonialTimer);
//       clearInterval(stepTimer);
//     };
//   }, []);

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         color: "#0f172a",
//         background: `
//           radial-gradient(circle at 8% 10%, rgba(251,191,36,0.12), transparent 24%),
//           radial-gradient(circle at 88% 14%, rgba(45,212,191,0.12), transparent 22%),
//           radial-gradient(circle at 50% 45%, rgba(59,130,246,0.08), transparent 26%),
//           linear-gradient(180deg, #f8fbff 0%, #edf4ff 42%, #e6eef9 100%)
//         `,
//         overflow: "hidden",
//       }}
//     >
//       <Box
//         sx={{
//           position: "fixed",
//           inset: 0,
//           pointerEvents: "none",
//           opacity: 0.18,
//           backgroundImage:
//             "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
//           backgroundSize: "72px 72px",
//           maskImage: "linear-gradient(180deg, rgba(0,0,0,0.85), transparent 92%)",
//         }}
//       />

//       <AppBar
//         position="fixed"
//         elevation={0}
//         sx={{
//           background: "rgba(255,255,255,0.78)",
//           borderBottom: "1px solid rgba(15,23,42,0.08)",
//           backdropFilter: "blur(18px)",
//         }}
//       >
//         <Toolbar sx={{ py: 1.2 }}>
//           <Stack direction="row" spacing={1.6} alignItems="center" sx={{ flexGrow: 1 }}>
//             <Box
//               component="img"
//               src={logo}
//               alt="School Management System logo"
//               sx={{
//                 width: 46,
//                 height: 46,
//                 p: 0.6,
//                 borderRadius: 2.5,
//                 background: "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(226,232,240,0.90))",
//                 border: "1px solid rgba(15,23,42,0.08)",
//               }}
//             />
//             <Box>
//               <Typography sx={{ fontWeight: 800, letterSpacing: "0.02em", color: "#0f172a" }}>
//                 School Management Pro
//               </Typography>
//               <Typography
//                 sx={{
//                   fontSize: 12,
//                   color: "rgba(15,23,42,0.58)",
//                   letterSpacing: "0.14em",
//                   textTransform: "uppercase",
//                 }}
//               >
//                 Cloud operating system for schools
//               </Typography>
//             </Box>
//           </Stack>

//           <Stack direction="row" spacing={1.2} alignItems="center">
//             <Button sx={{ color: "#0f172a", fontWeight: 600 }} onClick={() => goTo("/login")}>
//               Login
//             </Button>
//             <Button
//               variant="contained"
//               onClick={() => goTo("/register-school")}
//               endIcon={<ArrowOutward />}
//               sx={{
//                 borderRadius: 999,
//                 px: 2.8,
//                 py: 1.2,
//                 fontWeight: 800,
//                 background: "linear-gradient(135deg, #fbbf24, #34d399)",
//                 color: "#07111f",
//                 boxShadow: "0 18px 40px rgba(251,191,36,0.22)",
//                 "&:hover": {
//                   background: "linear-gradient(135deg, #fcd34d, #6ee7b7)",
//                 },
//               }}
//             >
//               Start setup
//             </Button>
//           </Stack>
//         </Toolbar>
//       </AppBar>

//       <Container maxWidth="xl" sx={{ pt: { xs: 14, md: 18 }, pb: 10, position: "relative" }}>
//         <Grid container spacing={{ xs: 4, md: 5 }} alignItems="stretch">
//           <Grid item xs={12} lg={7}>
//             <Box sx={{ maxWidth: 760 }}>
//               <Chip
//                 icon={<Verified sx={{ color: "#fde68a !important" }} />}
//                 label="Designed for multi-school operations and daily administration"
//                 sx={{
//                   mb: 3,
//                   px: 1,
//                   color: "#92400e",
//                   bgcolor: "rgba(251,191,36,0.12)",
//                   border: "1px solid rgba(251,191,36,0.18)",
//                   backdropFilter: "blur(10px)",
//                 }}
//               />

//               <Typography
//                 component="h1"
//                 sx={{
//                   fontSize: { xs: "2.8rem", md: "5.3rem" },
//                   lineHeight: 0.96,
//                   fontWeight: 900,
//                   letterSpacing: "-0.05em",
//                   mb: 2.5,
//                   maxWidth: 720,
//                 }}
//               >
//                 The school front office,
//                 <Box component="span" sx={{ color: "#fbbf24" }}>
//                   {" "}
//                   academic engine,{" "}
//                 </Box>
//                 and finance desk in one sharper interface.
//               </Typography>

//               <Typography
//                 sx={{
//                   fontSize: { xs: 16, md: 19 },
//                   lineHeight: 1.85,
//                   color: "rgba(15,23,42,0.72)",
//                   maxWidth: 660,
//                   mb: 4,
//                 }}
//               >
//                 Replace disconnected admin tasks with one system for registration, attendance, fees, exams,
//                 staff operations, and parent communication. Built for institutions that want clarity, speed,
//                 and cleaner accountability.
//               </Typography>

//               <Stack direction={{ xs: "column", sm: "row" }} spacing={1.6} sx={{ mb: 4.5, maxWidth: 520 }}>
//                 <Button
//                   size="large"
//                   variant="contained"
//                   endIcon={<ArrowOutward />}
//                   onClick={() => goTo("/register-school")}
//                   sx={{
//                     py: 1.55,
//                     px: 3.3,
//                     borderRadius: 999,
//                     fontWeight: 800,
//                     background: "linear-gradient(135deg, #fbbf24, #34d399)",
//                     color: "#07111f",
//                     boxShadow: "0 20px 44px rgba(52,211,153,0.18)",
//                   }}
//                 >
//                   Register your school
//                 </Button>
//                 <Button
//                   size="large"
//                   variant="outlined"
//                   onClick={() => goTo("/login")}
//                   sx={{
//                     py: 1.55,
//                     px: 3.3,
//                     borderRadius: 999,
//                     color: "#0f172a",
//                     borderColor: "rgba(15,23,42,0.18)",
//                     background: "rgba(255,255,255,0.72)",
//                   }}
//                 >
//                   Enter organisation portal
//                 </Button>
//               </Stack>

//               <Grid container spacing={1.5} sx={{ mb: 4.5 }}>
//                 {heroStats.map((item) => (
//                   <Grid item xs={12} sm={4} key={item.label}>
//                     <Box sx={metricCard}>
//                       <Typography
//                         sx={{
//                           fontSize: 12,
//                           color: "rgba(191,219,254,0.70)",
//                           letterSpacing: "0.14em",
//                           textTransform: "uppercase",
//                           mb: 0.6,
//                         }}
//                       >
//                         {item.label}
//                       </Typography>
//                       <Typography
//                         sx={{
//                           fontSize: 30,
//                           fontWeight: 900,
//                           letterSpacing: "-0.04em",
//                           color: "#f8fbff",
//                         }}
//                       >
//                         {item.value}
//                       </Typography>
//                     </Box>
//                   </Grid>
//                 ))}
//               </Grid>

//               <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} flexWrap="wrap">
//                 {proofLogos.map((name) => (
//                   <Box
//                     key={name}
//                     sx={{
//                       px: 2.2,
//                       py: 1.2,
//                       borderRadius: 999,
//                       border: "1px solid rgba(255,255,255,0.09)",
//                       bgcolor: "rgba(255,255,255,0.03)",
//                       color: "rgba(226,232,240,0.72)",
//                       fontWeight: 700,
//                       letterSpacing: "0.04em",
//                     }}
//                   >
//                     {name}
//                   </Box>
//                 ))}
//               </Stack>
//             </Box>
//           </Grid>

//           <Grid item xs={12} lg={5}>
//             <Box
//               sx={{
//                 ...glassPanel,
//                 borderRadius: 7,
//                 p: { xs: 2.2, md: 3 },
//                 height: "100%",
//                 position: "relative",
//                 overflow: "hidden",
//               }}
//             >
//               <Box
//                 sx={{
//                   position: "absolute",
//                   top: -60,
//                   right: -20,
//                   width: 200,
//                   height: 200,
//                   borderRadius: "50%",
//                   background: "radial-gradient(circle, rgba(251,191,36,0.28), transparent 68%)",
//                 }}
//               />

//               <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
//                 <Box>
//                   <Typography sx={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", color: "#93c5fd" }}>
//                     Command center preview
//                   </Typography>
//                   <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.6 }}>
//                     One operational surface for the whole school.
//                   </Typography>
//                 </Box>
//                 <Box
//                   sx={{
//                     px: 1.5,
//                     py: 0.8,
//                     borderRadius: 999,
//                     bgcolor: "rgba(52,211,153,0.14)",
//                     color: "#86efac",
//                     fontWeight: 700,
//                     fontSize: 12,
//                   }}
//                 >
//                   Live sync
//                 </Box>
//               </Stack>

//               <Box
//                 sx={{
//                   p: 2,
//                   borderRadius: 5,
//                   background: "linear-gradient(180deg, rgba(8,15,30,0.92), rgba(15,23,42,0.84))",
//                   border: "1px solid rgba(255,255,255,0.08)",
//                 }}
//               >
//                 <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
//                   {[
//                     { label: "Admissions", value: "43 pending", tone: "#7dd3fc" },
//                     { label: "Fees due", value: "18 alerts", tone: "#fbbf24" },
//                     { label: "Attendance", value: "94% marked", tone: "#6ee7b7" },
//                   ].map((panel) => (
//                     <Grid item xs={12} sm={4} key={panel.label}>
//                       <Box
//                         sx={{
//                           p: 1.7,
//                           borderRadius: 4,
//                           bgcolor: "rgba(255,255,255,0.04)",
//                           border: "1px solid rgba(255,255,255,0.06)",
//                         }}
//                       >
//                         <Typography
//                           sx={{
//                             color: "rgba(226,232,240,0.62)",
//                             fontSize: 12,
//                             textTransform: "uppercase",
//                             letterSpacing: "0.12em",
//                           }}
//                         >
//                           {panel.label}
//                         </Typography>
//                         <Typography sx={{ fontSize: 20, fontWeight: 800, mt: 0.8, color: panel.tone }}>
//                           {panel.value}
//                         </Typography>
//                       </Box>
//                     </Grid>
//                   ))}
//                 </Grid>

//                 <Grid container spacing={1.5}>
//                   <Grid item xs={12} md={7}>
//                     <Box
//                       sx={{
//                         p: 2,
//                         borderRadius: 4,
//                         height: "100%",
//                         bgcolor: "rgba(255,255,255,0.04)",
//                         border: "1px solid rgba(255,255,255,0.06)",
//                       }}
//                     >
//                       <Typography
//                         sx={{
//                           fontSize: 12,
//                           textTransform: "uppercase",
//                           letterSpacing: "0.14em",
//                           color: "rgba(191,219,254,0.68)",
//                           mb: 1.5,
//                         }}
//                       >
//                         Weekly momentum
//                       </Typography>
//                       <Stack direction="row" alignItems="end" spacing={1} sx={{ height: 140, mb: 1 }}>
//                         {[42, 58, 54, 76, 72, 88, 94].map((height, index) => (
//                           <Box
//                             key={index}
//                             sx={{
//                               flex: 1,
//                               height: `${height}%`,
//                               borderRadius: "16px 16px 6px 6px",
//                               background:
//                                 index > 4
//                                   ? "linear-gradient(180deg, #fbbf24, #fb7185)"
//                                   : "linear-gradient(180deg, #38bdf8, #34d399)",
//                               boxShadow: "0 16px 30px rgba(56,189,248,0.14)",
//                             }}
//                           />
//                         ))}
//                       </Stack>
//                       <Typography sx={{ color: "rgba(226,232,240,0.64)", fontSize: 13 }}>
//                         Admin actions, attendance updates, and fee confirmations all climbing on the same rhythm.
//                       </Typography>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} md={5}>
//                     <Stack spacing={1.5} sx={{ height: "100%" }}>
//                       {[
//                         { icon: <TaskAlt sx={{ color: "#86efac", fontSize: 18 }} />, label: "Morning roll call closed", meta: "8:45 AM" },
//                         { icon: <MenuBook sx={{ color: "#7dd3fc", fontSize: 18 }} />, label: "Exam roster updated", meta: "11:20 AM" },
//                         { icon: <CloudDone sx={{ color: "#fde68a", fontSize: 18 }} />, label: "Fee receipts synced", meta: "1:05 PM" },
//                       ].map((item) => (
//                         <Box
//                           key={item.label}
//                           sx={{
//                             p: 1.7,
//                             borderRadius: 4,
//                             bgcolor: "rgba(255,255,255,0.04)",
//                             border: "1px solid rgba(255,255,255,0.06)",
//                           }}
//                         >
//                           <Stack direction="row" spacing={1.2} alignItems="center">
//                             {item.icon}
//                             <Box>
//                               <Typography sx={{ fontWeight: 700 }}>{item.label}</Typography>
//                               <Typography sx={{ color: "rgba(226,232,240,0.58)", fontSize: 13 }}>{item.meta}</Typography>
//                             </Box>
//                           </Stack>
//                         </Box>
//                       ))}
//                       <Box
//                         sx={{
//                           p: 1.8,
//                           borderRadius: 4,
//                           bgcolor: "rgba(251,191,36,0.10)",
//                           border: "1px solid rgba(251,191,36,0.16)",
//                           mt: "auto",
//                         }}
//                       >
//                         <Typography sx={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "#fde68a", mb: 0.7 }}>
//                           Snapshot
//                         </Typography>
//                         <Typography sx={{ fontWeight: 800, fontSize: 24 }}>24/7 visibility</Typography>
//                         <Typography sx={{ color: "rgba(255,255,255,0.66)", mt: 0.8 }}>
//                           A better homepage should immediately communicate confidence, control, and scale.
//                         </Typography>
//                       </Box>
//                     </Stack>
//                   </Grid>
//                 </Grid>
//               </Box>
//             </Box>
//           </Grid>
//         </Grid>
//       </Container>

//       <Container maxWidth="xl" sx={{ pb: 10 }}>
//         <Grid container spacing={3}>
//           {featureCards.map((feature) => (
//             <Grid item xs={12} md={6} lg={3} key={feature.title}>
//               <Card
//                 sx={{
//                   height: "100%",
//                   p: 3,
//                   color: "inherit",
//                   borderRadius: 6,
//                   background: feature.tone,
//                   border: `1px solid ${feature.accent}33`,
//                   boxShadow: `0 24px 60px ${feature.accent}18`,
//                   backdropFilter: "blur(18px)",
//                   transition: "transform 0.22s ease, border-color 0.22s ease",
//                   "&:hover": {
//                     transform: "translateY(-8px)",
//                     borderColor: `${feature.accent}66`,
//                   },
//                 }}
//               >
//                 <Avatar sx={{ width: 58, height: 58, mb: 2.2, bgcolor: `${feature.accent}22`, color: feature.accent }}>
//                   {feature.icon}
//                 </Avatar>
//                 <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.1 }}>
//                   {feature.title}
//                 </Typography>
//                 <Typography sx={{ color: "rgba(226,232,240,0.72)", lineHeight: 1.75 }}>
//                   {feature.description}
//                 </Typography>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>
//       </Container>

//       <Box
//         sx={{
//           py: { xs: 8, md: 10 },
//           borderTop: "1px solid rgba(255,255,255,0.06)",
//           borderBottom: "1px solid rgba(255,255,255,0.06)",
//           background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.04))",
//         }}
//       >
//         <Container maxWidth="xl">
//           <Grid container spacing={3} alignItems="stretch">
//             <Grid item xs={12} lg={5}>
//               <Typography sx={{ color: "#93c5fd", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", mb: 1.2 }}>
//                 Why it feels better
//               </Typography>
//               <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.02, letterSpacing: "-0.04em", mb: 2.2 }}>
//                 A homepage that sells operational confidence, not just features.
//               </Typography>
//               <Typography sx={{ color: "rgba(226,232,240,0.72)", lineHeight: 1.9, maxWidth: 560 }}>
//                 The strongest school software experiences do not feel cluttered or generic. They signal structure,
//                 trust, and speed before the visitor even scrolls into details.
//               </Typography>
//             </Grid>
//             <Grid item xs={12} lg={7}>
//               <Stack spacing={2}>
//                 {outcomes.map((item) => (
//                   <Box
//                     key={item.title}
//                     sx={{
//                       p: { xs: 2.2, md: 2.8 },
//                       borderRadius: 5,
//                       border: "1px solid rgba(255,255,255,0.08)",
//                       background: "linear-gradient(145deg, rgba(15,23,42,0.68), rgba(15,23,42,0.48))",
//                     }}
//                   >
//                     <Typography sx={{ color: "#fde68a", fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", mb: 0.9 }}>
//                       {item.kicker}
//                     </Typography>
//                     <Typography sx={{ fontWeight: 800, fontSize: { xs: 22, md: 28 }, lineHeight: 1.15, mb: 1 }}>
//                       {item.title}
//                     </Typography>
//                     <Typography sx={{ color: "rgba(226,232,240,0.68)", lineHeight: 1.75 }}>
//                       {item.text}
//                     </Typography>
//                   </Box>
//                 ))}
//               </Stack>
//             </Grid>
//           </Grid>
//         </Container>
//       </Box>

//       <Container maxWidth="xl" sx={{ py: { xs: 8, md: 10 } }}>
//         <Grid container spacing={4} alignItems="stretch">
//           <Grid item xs={12} lg={6}>
//             <Box sx={{ ...glassPanel, borderRadius: 6, p: { xs: 2.4, md: 3.2 }, height: "100%" }}>
//               <Typography sx={{ color: "#93c5fd", fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", mb: 1.2 }}>
//                 Launch sequence
//               </Typography>
//               <Typography variant="h4" sx={{ fontWeight: 900, mb: 3 }}>
//                 Onboarding that feels guided instead of messy.
//               </Typography>

//               <Stack spacing={1.4}>
//                 {onboardingSteps.map((step, index) => {
//                   const isActive = index === activeStep;
//                   return (
//                     <Box
//                       key={step.label}
//                       onClick={() => setActiveStep(index)}
//                       sx={{
//                         p: 2,
//                         borderRadius: 4,
//                         cursor: "pointer",
//                         border: isActive ? "1px solid rgba(251,191,36,0.34)" : "1px solid rgba(255,255,255,0.07)",
//                         background: isActive
//                           ? "linear-gradient(135deg, rgba(251,191,36,0.14), rgba(52,211,153,0.10))"
//                           : "rgba(255,255,255,0.03)",
//                         transition: "all 0.22s ease",
//                       }}
//                     >
//                       <Stack direction="row" spacing={1.5} alignItems="flex-start">
//                         <Avatar
//                           sx={{
//                             width: 34,
//                             height: 34,
//                             bgcolor: isActive ? "#fbbf24" : "rgba(255,255,255,0.08)",
//                             color: isActive ? "#07111f" : "#e2e8f0",
//                             fontSize: 14,
//                             fontWeight: 800,
//                           }}
//                         >
//                           {index + 1}
//                         </Avatar>
//                         <Box>
//                           <Typography sx={{ fontWeight: 800, mb: 0.5 }}>{step.label}</Typography>
//                           <Typography sx={{ color: "rgba(226,232,240,0.68)", lineHeight: 1.7 }}>
//                             {step.description}
//                           </Typography>
//                         </Box>
//                       </Stack>
//                     </Box>
//                   );
//                 })}
//               </Stack>
//             </Box>
//           </Grid>

//           <Grid item xs={12} lg={6}>
//             <Box sx={{ ...glassPanel, borderRadius: 6, p: { xs: 2.4, md: 3.2 }, height: "100%" }}>
//               <Typography sx={{ color: "#93c5fd", fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", mb: 1.2 }}>
//                 Trusted voice
//               </Typography>
//               <Typography variant="h4" sx={{ fontWeight: 900, mb: 3 }}>
//                 What teams notice after switching.
//               </Typography>

//               <Box
//                 key={currentTestimonial}
//                 sx={{
//                   p: { xs: 2.4, md: 3 },
//                   borderRadius: 5,
//                   background: "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
//                   border: "1px solid rgba(255,255,255,0.08)",
//                   animation: "fadeSlide 0.55s ease",
//                 }}
//               >
//                 <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.2 }}>
//                   <Avatar sx={{ width: 54, height: 54, bgcolor: "rgba(125,211,252,0.18)", color: "#7dd3fc", fontWeight: 800 }}>
//                     {testimonials[currentTestimonial].avatar}
//                   </Avatar>
//                   <Box>
//                     <Typography sx={{ fontWeight: 800 }}>{testimonials[currentTestimonial].name}</Typography>
//                     <Typography sx={{ color: "rgba(226,232,240,0.60)" }}>{testimonials[currentTestimonial].role}</Typography>
//                   </Box>
//                 </Stack>

//                 <Typography sx={{ fontSize: { xs: 19, md: 24 }, lineHeight: 1.6, fontWeight: 600, color: "#f8fbff" }}>
//                   "{testimonials[currentTestimonial].content}"
//                 </Typography>

//                 <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
//                   {[...Array(5)].map((_, index) => (
//                     <CheckCircle key={index} sx={{ color: "#fbbf24", fontSize: 18 }} />
//                   ))}
//                 </Stack>
//               </Box>

//               <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
//                 {testimonials.map((item, index) => (
//                   <Box
//                     key={item.name}
//                     onClick={() => setCurrentTestimonial(index)}
//                     sx={{
//                       width: index === currentTestimonial ? 34 : 10,
//                       height: 10,
//                       borderRadius: 999,
//                       cursor: "pointer",
//                       transition: "all 0.22s ease",
//                       backgroundColor: index === currentTestimonial ? "#fbbf24" : "rgba(255,255,255,0.26)",
//                     }}
//                   />
//                 ))}
//               </Stack>
//             </Box>
//           </Grid>
//         </Grid>
//       </Container>

//       <Container maxWidth="xl" sx={{ pb: 10 }}>
//         <Box
//           sx={{
//             p: { xs: 3, md: 4.5 },
//             borderRadius: 7,
//             border: "1px solid rgba(255,255,255,0.09)",
//             background: "linear-gradient(135deg, rgba(251,191,36,0.14), rgba(52,211,153,0.12), rgba(59,130,246,0.14))",
//             boxShadow: "0 28px 80px rgba(2, 8, 23, 0.28)",
//           }}
//         >
//           <Grid container spacing={3} alignItems="center">
//             <Grid item xs={12} md={8}>
//               <Typography
//                 variant="h3"
//                 sx={{
//                   fontWeight: 900,
//                   lineHeight: 1.02,
//                   letterSpacing: "-0.04em",
//                   mb: 1.4,
//                   color: "#f8fbff",
//                 }}
//               >
//                 Ready to give your school a homepage and product story that feels more premium?
//               </Typography>
//               <Typography sx={{ color: "rgba(239,246,255,0.76)", lineHeight: 1.8, maxWidth: 700 }}>
//                 Start the registration flow, or continue to the organisation portal if your school is already onboarded.
//               </Typography>
//             </Grid>
//             <Grid item xs={12} md={3}>
//               <Stack spacing={1.4}>
//                 <Button
//                   fullWidth
//                   size="large"
//                   variant="contained"
//                   endIcon={<ArrowOutward />}
//                   onClick={() => goTo("/register-school")}
//                   sx={{
//                     py: 1.5,
//                     borderRadius: 999,
//                     fontWeight: 800,
//                     background: "#f8fbff",
//                     color: "#07111f",
//                   }}
//                 >
//                   Create your school workspace
//                 </Button>
//                 <Button
//                   fullWidth
//                   size="large"
//                   variant="outlined"
//                   onClick={() => goTo("/login")}
//                   sx={{
//                     py: 1.5,
//                     borderRadius: 999,
//                     color: "#f8fbff",
//                     borderColor: "rgba(255,255,255,0.28)",
//                   }}
//                 >
//                   Go to login
//                 </Button>
//               </Stack>
//             </Grid>
//           </Grid>
//         </Box>
//       </Container>

//       <Box
//         sx={{
//           borderTop: "1px solid rgba(255,255,255,0.08)",
//           background: "linear-gradient(180deg, rgba(4,8,20,0.96), rgba(4,8,20,1))",
//           pt: 7,
//           pb: 4,
//         }}
//       >
//         <Container maxWidth="xl">
//           <Grid
//             container
//             spacing={3}
//             sx={{
//               flexWrap: { xs: "wrap", lg: "nowrap" },
//             }}
//           >
//             <Grid item xs={12} lg={3}>
//               <Stack direction="row" spacing={1.4} alignItems="center" sx={{ mb: 2 }}>
//                 <School sx={{ color: "#fbbf24", fontSize: 30 }} />
//                 <Typography variant="h6" sx={{ fontWeight: 900 }}>
//                   School Management Pro
//                 </Typography>
//               </Stack>
//               <Typography sx={{ color: "rgba(226,232,240,0.64)", lineHeight: 1.8, maxWidth: 420 }}>
//                 A school operating system built to make administration, academics, finance, and communication feel coordinated.
//               </Typography>
//             </Grid>

//             {footerGroups.map((group) => (
//               <Grid item xs={12} sm={4} lg={3} key={group.title}>
//                 <Typography sx={{ fontWeight: 800, mb: 1.6 }}>{group.title}</Typography>
//                 <Stack spacing={1}>
//                   {group.items.map((item) => (
//                     <Typography key={item} sx={{ color: "rgba(226,232,240,0.64)" }}>
//                       {item}
//                     </Typography>
//                   ))}
//                 </Stack>
//               </Grid>
//             ))}
//           </Grid>

//           <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.08)" }} />

//           <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
//             <Typography sx={{ color: "rgba(226,232,240,0.44)" }}>
//               © 2026 School Management Pro. Built for modern institutions.
//             </Typography>
//             <Stack direction="row" spacing={2} sx={{ color: "rgba(226,232,240,0.54)" }}>
//               <Typography>Privacy</Typography>
//               <Typography>Terms</Typography>
//               <Typography>Security</Typography>
//             </Stack>
//           </Stack>
//         </Container>
//       </Box>

//       <style>
//         {`
//           @keyframes fadeSlide {
//             from { opacity: 0; transform: translateY(18px); }
//             to { opacity: 1; transform: translateY(0); }
//           }
//         `}
//       </style>
//     </Box>
//   );
// }
