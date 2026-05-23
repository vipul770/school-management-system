import React, { useEffect, useState } from "react";
import { Box, Button, Chip, Container, Grid, Typography } from "@mui/material";
import { ArrowForward, CheckCircle, Shield, Storefront } from "@mui/icons-material";
import SchoolRegistration from "../../components/forms/SchoolRegistration";

const banners = [
  {
    title: "Register Your School",
    desc: "Fill school & admin details easily",
    accent: "#38bdf8",
    bg: "linear-gradient(135deg, rgba(56,189,248,0.22), rgba(15,23,42,0.96))",
  },
  {
    title: "Get Approved Fast",
    desc: "Quick verification within 24 hours",
    accent: "#22c55e",
    bg: "linear-gradient(135deg, rgba(34,197,94,0.22), rgba(15,23,42,0.96))",
  },
  {
    title: "Start Managing",
    desc: "Access dashboard & manage everything",
    accent: "#f59e0b",
    bg: "linear-gradient(135deg, rgba(245,158,11,0.22), rgba(15,23,42,0.96))",
  },
];

export default function RegisterSchool() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 10% 10%, rgba(56,189,248,0.12), transparent 24%), radial-gradient(circle at 88% 18%, rgba(34,197,94,0.10), transparent 22%), linear-gradient(180deg, #f8fbff 0%, #edf4ff 55%, #e5eef9 100%)",
        color: "#0f172a",
      }}
    >
      <Container maxWidth="xl" sx={{ pt: { xs: 4, md: 6 }, pb: 10 }}>
        <Grid container spacing={4} alignItems="stretch">
          <Grid item xs={12} lg={5}>
            <Box
              sx={{
                height: "100%",
                p: { xs: 3, md: 4 },
                borderRadius: 6,
                background: "rgba(255,255,255,0.82)",
                border: "1px solid rgba(15,23,42,0.08)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 24px 70px rgba(15,23,42,0.12)",
              }}
            >
              <Chip
                icon={<Storefront sx={{ color: "#38bdf8 !important" }} />}
                label="Premium onboarding"
                sx={{
                  mb: 3,
                  color: "#075985",
                  bgcolor: "rgba(56,189,248,0.10)",
                  border: "1px solid rgba(56,189,248,0.2)",
                }}
              />

              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: "-0.04em",
                  fontSize: { xs: "2.35rem", md: "4rem" },
                  mb: 2,
                }}
              >
                Register your school with a premium first impression.
              </Typography>

              <Typography
                sx={{
                  color: "rgba(15,23,42,0.72)",
                  lineHeight: 1.8,
                  fontSize: 16,
                  mb: 4,
                  maxWidth: 520,
                }}
              >
                Create your institution profile, share admin details, and move smoothly from approval to daily operations.
              </Typography>

              <Box
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 5,
                  border: "1px solid rgba(255,255,255,0.08)",
                  mb: 4,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    width: `${banners.length * 100}%`,
                    transform: `translateX(-${current * (100 / banners.length)}%)`,
                    transition: "transform 0.7s ease-in-out",
                  }}
                >
                  {banners.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: `${100 / banners.length}%`,
                        minHeight: 250,
                        p: 4,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        background: item.bg,
                        color: "#0f172a",
                      }}
                    >
                      <Box>
                        <Box
                          sx={{
                            width: 46,
                            height: 46,
                            borderRadius: 3,
                            bgcolor: `${item.accent}22`,
                            color: item.accent,
                            display: "grid",
                            placeItems: "center",
                            mb: 3,
                          }}
                        >
                          {index === 0 ? <CheckCircle /> : index === 1 ? <Shield /> : <ArrowForward />}
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.2 }}>
                          {item.title}
                        </Typography>
                        <Typography sx={{ color: "rgba(15,23,42,0.72)", fontSize: 17 }}>
                          {item.desc}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: 13, color: item.accent, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                        Step {index + 1}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  {banners.map((item, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: i === current ? 28 : 10,
                        height: 10,
                        borderRadius: 999,
                        bgcolor: i === current ? item.accent : "rgba(15,23,42,0.18)",
                        transition: "all 0.25s ease",
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Grid container spacing={2}>
                {[
                  "Guided school onboarding",
                  "Fast admin verification",
                  "Secure SaaS access setup",
                ].map((item) => (
                  <Grid item xs={12} sm={4} lg={12} key={item}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.72)",
                        border: "1px solid rgba(15,23,42,0.08)",
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                      }}
                    >
                      <CheckCircle sx={{ color: "#4ade80", fontSize: 18 }} />
                      <Typography sx={{ fontSize: 14 }}>{item}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          <Grid item xs={12} lg={7}>
            <Box id="registration-form">
              <SchoolRegistration />
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Box
        sx={{
          py: 6,
          background: "linear-gradient(135deg, rgba(56,189,248,0.14), rgba(255,255,255,0.92))",
          borderTop: "1px solid rgba(15,23,42,0.08)",
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Already Have an Account?
          </Typography>

          <Typography sx={{ mb: 3, color: "rgba(15,23,42,0.72)" }}>
            Login and continue managing your school
          </Typography>

          <Button
            variant="contained"
            size="large"
            sx={{
              borderRadius: 999,
              px: 4,
              fontWeight: 700,
              background: "linear-gradient(135deg, #38bdf8, #22c55e)",
              color: "#03111f",
            }}
            onClick={() => (window.location.href = "/login")}
          >
            Login
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
