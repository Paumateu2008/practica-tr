import { useMemo, useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  TextField,
  Tooltip,
  IconButton,
  Tabs,
  Tab,
  Button,
  Divider,
  Stack
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import DownloadIcon from "@mui/icons-material/Download";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import "./App.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  AreaChart,
  Area
} from "recharts";
import ControlsPanel from "./components/ControlsPanel.jsx";
import KpiPanel from "./components/KpiPanel.jsx";
import LabeledSlider from "./components/LabeledSlider.jsx";

/**************************************************************
 * Formula 1 Aerodynamics Simulator — Education Edition (MUI)
 **************************************************************/

// ===== Simple aero model =====
const kmhToMs = (vKmh) => vKmh / 3.6;
const degToRad = (g) => (g * Math.PI) / 180;

function wingAero(aoaDeg, { Cl0, slope, Cd0, k }) {
  const a = degToRad(aoaDeg);
  const Cl = Cl0 + slope * a;
  const Cd = Cd0 + k * Cl * Cl;
  return { Cl, Cd };
}

function groundEffectCl(
  rideHeightMm,
  k,
  diffuserAngleDeg = 12,
  hOptMm = 35,
  saturation = 3
) {
  const h = Math.max(10, Math.min(120, rideHeightMm));
  const peak = k * (hOptMm / h);
  const stall = h < 25 ? 0.4 + 0.6 * (h / 25) : 1;
  const angleBoost =
    0.6 + 0.4 * Math.exp(-Math.pow((diffuserAngleDeg - 12) / 8, 2));
  return Math.min(peak * stall * angleBoost, saturation * k);
}

function applyDRS(Cl, Cd, open) {
  if (!open) return { Cl, Cd };
  return { Cl: Cl * 0.75, Cd: Cd * 0.65 };
}

// Reference areas
const S_front = 1.3,
  S_rear = 1.5,
  S_floor = 3.2;

const frontPreset = { Cl0: 0.6, slope: 3.6, Cd0: 0.06, k: 0.08 };
const rearPreset = { Cl0: 0.7, slope: 4.2, Cd0: 0.07, k: 0.1 };

/* ------------------------------------------------------------
   FIX: MOVEMOS downloadCSV ARRIBA PARA EVITAR ERRORES DE PARSE
-------------------------------------------------------------*/
function downloadCSV(rows) {
  if (!rows || !rows.length) return;
  const header = Object.keys(rows[0]).join(",");
  const body = rows.map((r) => Object.values(r).join(",")).join("\n");
  const csv = header + "\n" + body;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "aero_data.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------
                COMPONENTE PRINCIPAL
-------------------------------------------------------------*/

export default function App() {
  // ===== Controls =====
  const [speed, setSpeed] = useState(200);
  const [rho, setRho] = useState(1.225);
  const [frontAoA, setFrontAoA] = useState(8);
  const [rearAoA, setRearAoA] = useState(12);
  const [rideHeight, setRideHeight] = useState(38);
  const [diffuserEff, setDiffuserEff] = useState(1);
  const [drs, setDrs] = useState(false);
  const [tab, setTab] = useState("visual");
  const [snapshot, setSnapshot] = useState(null);
  const [diffuserAngle, setDiffuserAngle] = useState(12);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [showKPIs, setShowKPIs] = useState(true);

  const isMobile = useMediaQuery("(max-width: 900px)");
  const isPortrait = useMediaQuery("(orientation: portrait)");
  const layoutDirection = isMobile && isPortrait ? "column" : "row";

  useEffect(() => {
    if (isMobile) {
      setShowControls(false);
      setShowKPIs(false);
    } else {
      setShowControls(true);
      setShowKPIs(true);
    }
  }, [isMobile]);

  // ===== Core calculations =====
  const v = kmhToMs(speed);
  const q = 0.5 * rho * v * v;

  const current = useMemo(() => {
    const f = wingAero(frontAoA, frontPreset);
    let r = wingAero(rearAoA, rearPreset);
    r = applyDRS(r.Cl, r.Cd, drs);

    const Cl_floor = groundEffectCl(rideHeight, 0.9, diffuserAngle) * diffuserEff;
    const Cd_floor = 0.12 + 0.02 * Cl_floor;

    const L_front = q * S_front * f.Cl;
    const D_front = q * S_front * f.Cd;

    const L_rear = q * S_rear * r.Cl;
    const D_rear = q * S_rear * r.Cd;

    const L_floor = q * S_floor * Cl_floor;
    const D_floor = q * S_floor * Cd_floor;

    const L_total = L_front + L_rear + L_floor;
    const D_total = D_front + D_rear + D_floor;

    return {
      L_front,
      L_rear,
      L_floor,
      L_total,
      D_front,
      D_rear,
      D_floor,
      D_total,
      balanceFront: (L_front / L_total) * 100,
      balanceRear: (L_rear / L_total) * 100,
      coeffs: { f, r, Cl_floor, Cd_floor }
    };
  }, [
    frontAoA,
    rearAoA,
    rideHeight,
    diffuserEff,
    rho,
    v,
    drs,
    diffuserAngle
  ]);

  // ===== Speed sweep =====
  const sweep = useMemo(() => {
    const pts = [];
    for (let s = 60; s <= 340; s += 10) {
      const vv = kmhToMs(s);
      const qq = 0.5 * rho * vv * vv;

      const f = wingAero(frontAoA, frontPreset);
      let r = wingAero(rearAoA, rearPreset);
      r = applyDRS(r.Cl, r.Cd, drs);

      const Cl_floor =
        groundEffectCl(rideHeight, 0.9, diffuserAngle) * diffuserEff;
      const Cd_floor = 0.12 + 0.02 * Cl_floor;

      const Lf = qq * S_front * f.Cl;
      const Lr = qq * S_rear * r.Cl;
      const Lg = qq * S_floor * Cl_floor;

      const D = qq * (S_front * f.Cd + S_rear * r.Cd + S_floor * Cd_floor);

      pts.push({
        speed: s,
        downforce: (Lf + Lr + Lg) / 1000,
        drag: D / 1000,
        front: Lf / 1000,
        rear: Lr / 1000,
        floor: Lg / 1000
      });
    }
    return pts;
  }, [
    frontAoA,
    rearAoA,
    rideHeight,
    diffuserEff,
    rho,
    drs,
    diffuserAngle
  ]);

  const rideSweep = useMemo(() => {
    const pts = [];
    for (let h = 20; h <= 80; h += 2) {
      const f = wingAero(frontAoA, frontPreset);
      let r = wingAero(rearAoA, rearPreset);
      r = applyDRS(r.Cl, r.Cd, drs);

      const Cl_floor = groundEffectCl(h, 0.9, diffuserAngle) * diffuserEff;

      const Lf = q * S_front * f.Cl;
      const Lr = q * S_rear * r.Cl;
      const Lg = q * S_floor * Cl_floor;

      const L = (Lf + Lr + Lg) / 1000;

      pts.push({ height: h, downforce: L, balanceFront: (Lf / (Lf + Lr + Lg)) * 100 });
    }
    return pts;
  }, [q, frontAoA, rearAoA, diffuserEff, drs, diffuserAngle]);

  function setPreset(name) {
    if (name === "Monza") {
      setFrontAoA(4);
      setRearAoA(6);
      setRideHeight(42);
      setDrs(true);
    } else if (name === "Monaco") {
      setFrontAoA(14);
      setRearAoA(18);
      setRideHeight(38);
      setDrs(false);
    } else if (name === "Wet") {
      setFrontAoA(16);
      setRearAoA(20);
      setRideHeight(48);
      setDrs(false);
    } else {
      setFrontAoA(8);
      setRearAoA(12);
      setRideHeight(38);
      setDrs(false);
    }
  }

  function saveSnapshot() {
    setSnapshot({
      speed,
      rho,
      frontAoA,
      rearAoA,
      rideHeight,
      diffuserEff,
      drs,
      diffuserAngle,
      result: current
    });
  }

  // ===== Arrows scaling =====
  const arrowScale = 120 / (0.001 + current.L_total / 1000);
  const frontArrow = Math.min(
    120,
    (current.L_total > 0 ? current.L_front / 1000 : 0) * arrowScale
  );
  const rearArrow = Math.min(
    120,
    (current.L_total > 0 ? current.L_rear / 1000 : 0) * arrowScale
  );
  const dragArrow = Math.min(120, (current.D_total / 1000) * arrowScale);

  /* -------------------------------------------------------
                ** RETURN DEL COMPONENTE **
  -------------------------------------------------------*/
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        overflowX: "hidden"
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          height: 80,
          borderBottom: "2px solid #e5e7eb",
          bgcolor: "linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)",
          display: "flex",
          alignItems: "center",
          px: 3,
          gap: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}
      >
        <img src="/logo.png" alt="Col·legi Montserrat" style={{ height: 60 }} />
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Simulador d'Aerodinàmica F1
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pràctica del Treball de Recerca 2025
          </Typography>
        </Box>
      </Box>

      {/* MOBILE BUTTONS */}
      {isMobile && (
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ p: 2, bgcolor: "#e0f2fe", borderBottom: "1px solid #cbd5f5" }}
        >
          <Button
            variant={showControls ? "contained" : "outlined"}
            color="primary"
            size="small"
            onClick={() => setShowControls((v) => !v)}
          >
            {showControls ? "Amaga controls" : "Mostra controls"}
          </Button>

          <Button
            variant={showKPIs ? "contained" : "outlined"}
            color="primary"
            size="small"
            onClick={() => setShowKPIs((v) => !v)}
          >
            {showKPIs ? "Amaga resultats" : "Mostra resultats"}
          </Button>
        </Stack>
      )}

      {/* LAYOUT PRINCIPAL */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          flexDirection: layoutDirection,
          overflowX: "hidden",
          gap: isMobile ? 2 : 0
        }}
      >
        {/* CONTROL PANEL */}
        {showControls ? (
          <ControlsPanel
            speed={speed}
            setSpeed={setSpeed}
            frontAoA={frontAoA}
            setFrontAoA={setFrontAoA}
            rearAoA={rearAoA}
            setRearAoA={setRearAoA}
            rideHeight={rideHeight}
            setRideHeight={setRideHeight}
            diffuserEff={diffuserEff}
            setDiffuserEff={setDiffuserEff}
            diffuserAngle={diffuserAngle}
            setDiffuserAngle={setDiffuserAngle}
            drs={drs}
            setDrs={setDrs}
            rho={rho}
            setRho={setRho}
            setPreset={setPreset}
            saveSnapshot={saveSnapshot}
            isMobile={isMobile}
            onCollapse={() => setShowControls(false)}
          />
        ) : (
          !isMobile && (
            <Box
              sx={{
                width: 28,
                flexShrink: 0,
                borderRight: "1px solid #e5e7eb",
                bgcolor: "#e0f2fe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Tooltip title="Mostra els controls">
                <IconButton
                  size="small"
                  onClick={() => setShowControls(true)}
                  sx={{ color: "#1d4ed8" }}
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )
        )}

        {/* MAIN CONTENT */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            bgcolor: "#fff",
            p: isMobile ? 2 : 3
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTabs-scrollButtons": {
                color: "#1d4ed8",
                opacity: 1
              },
              "& .MuiTabs-scrollButtons.Mui-disabled": {
                opacity: 0.25
              }
            }}
          >
            <Tab label="Visualització" value="visual" />
            <Tab label="Gràfiques" value="charts" />
            <Tab label="Perfils ales" value="wings" />
            <Tab label="Editor difusor" value="diffuser" />
            {snapshot && <Tab label="Comparació" value="compare" />}
            <Tab label="Aprendre" value="learn" />
          </Tabs>

          <Box sx={{ mt: 2 }}>
            {/* ======== VISUAL ======== */}
            {tab === "visual" && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Visualització del cotxe amb forces aerodinàmiques
                </Typography>

                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    pt: "45%",
                    borderRadius: 2,
                    bgcolor: "#eef2f7"
                  }}
                >
                  <svg viewBox="0 0 600 270" style={{ position: "absolute", inset: 0 }}>
                    <defs>
                      <marker
                        id="arrow"
                        markerWidth="10"
                        markerHeight="10"
                        refX="8"
                        refY="3"
                        orient="auto"
                        markerUnits="strokeWidth"
                      >
                        <path d="M0,0 L0,6 L9,3 z" fill="currentColor" />
                      </marker>
                    </defs>

                    <g transform="translate(100,40)">
                      <rect
                        x="90"
                        y="40"
                        width="220"
                        height="120"
                        rx="14"
                        fill="#fff"
                        stroke="#e5e7eb"
                      />
                      <rect
                        x="60"
                        y="70"
                        width="30"
                        height="60"
                        rx="8"
                        fill="#f1f5f9"
                        stroke="#e5e7eb"
                      />
                      <rect x="30" y="55" width="30" height="90" rx="6" fill="#111827" />
                      <rect
                        x="310"
                        y="60"
                        width="22"
                        height="100"
                        rx="4"
                        fill={drs ? "#059669" : "#111827"}
                      />
                      <rect x="110" y="30" width="40" height="30" rx="6" fill="#111827" />
                      <rect x="110" y="140" width="40" height="30" rx="6" fill="#111827" />
                      <rect x="250" y="30" width="40" height="30" rx="6" fill="#111827" />
                      <rect x="250" y="140" width="40" height="30" rx="6" fill="#111827" />

                      <line
                        x1="70"
                        y1="100"
                        x2={70}
                        y2={100 + frontArrow}
                        stroke="#2563eb"
                        strokeWidth={6}
                        markerEnd="url(#arrow)"
                      />
                      <line
                        x1="320"
                        y1="110"
                        x2={320}
                        y2={110 + rearArrow}
                        stroke="#2563eb"
                        strokeWidth={6}
                        markerEnd="url(#arrow)"
                      />
                      <line
                        x1="360"
                        y1="100"
                        x2={360 + dragArrow}
                        y2="100"
                        stroke="#dc2626"
                        strokeWidth={6}
                        markerEnd="url(#arrow)"
                      />
                    </g>
                  </svg>

                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      bgcolor: "rgba(255,255,255,.8)",
                      px: 1,
                      borderRadius: 1
                    }}
                  >
                    <span style={{ color: "#1d4ed8", fontWeight: 600 }}>Blau</span>: càrrega —
                    <span style={{ color: "#dc2626", fontWeight: 600 }}> Vermell</span>: resistència
                  </Typography>
                </Box>
              </Box>
            )}

            {/* ======== CHARTS ======== */}
            {tab === "charts" && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Forces vs velocitat
                </Typography>

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Forces amb la configuració actual
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => downloadCSV(sweep)}
                  >
                    CSV
                  </Button>
                </Stack>

                <Box sx={{ width: "100%", height: 340 }}>
                  <ResponsiveContainer>
                    <LineChart
                      data={sweep}
                      margin={{ left: 12, right: 12, top: 10, bottom: 10 }}
                    >
                      <XAxis dataKey="speed" tickFormatter={(v) => `${v} km/h`} />
                      <YAxis tickFormatter={(v) => `${v} kN`} />
                      <RTooltip formatter={(v) => `${Number(v).toFixed(2)} kN`} />
                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="downforce"
                        name="Càrrega total"
                        stroke="#1d4ed8"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="drag"
                        name="Resistència"
                        stroke="#dc2626"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="front"
                        name="Eix davanter"
                        stroke="#0d9488"
                        strokeWidth={1.8}
                        dot={false}
                        strokeDasharray="4 4"
                      />
                      <Line
                        type="monotone"
                        dataKey="rear"
                        name="Eix posterior"
                        stroke="#7c3aed"
                        strokeWidth={1.8}
                        dot={false}
                        strokeDasharray="4 4"
                      />
                      <Line
                        type="monotone"
                        dataKey="floor"
                        name="Terra (efecte terra)"
                        stroke="#f59e0b"
                        strokeWidth={1.8}
                        dot={false}
                        strokeDasharray="2 6"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Sensibilitat a l'alçada
                </Typography>

                <Box sx={{ width: "100%", height: 340 }}>
                  <ResponsiveContainer>
                    <AreaChart
                      data={rideSweep}
                      margin={{ left: 12, right: 12, top: 10, bottom: 10 }}
                    >
                      <XAxis dataKey="height" tickFormatter={(v) => `${v} mm`} />
                      <YAxis yAxisId="L" tickFormatter={(v) => `${v} kN`} />
                      <YAxis yAxisId="B" orientation="right" tickFormatter={(v) => `${v}%`} />
                      <RTooltip />
                      <Legend />

                      <Area
                        yAxisId="L"
                        type="monotone"
                        dataKey="downforce"
                        stroke="#1d4ed8"
                        strokeWidth={2}
                        fillOpacity={0.1}
                      />

                      <Line
                        yAxisId="B"
                        type="monotone"
                        dataKey="balanceFront"
                        name="Balanç davanter"
                        stroke="#dc2626"
                        strokeWidth={2}
                        dot={false}
                      />

                      <ReferenceLine
                        x={rideHeight}
                        strokeDasharray="3 3"
                        label={`actual ${rideHeight}mm`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            )}

            {tab === "wings" && (
              <Box>
                <Typography variant="h6" gutterBottom>Perfils d'ales i distribució de pressió</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Visualitza com els perfils de les ales generen càrrega aerodinàmica. Canvia l'angle d'atac per veure com afecta la distribució de pressió.
                </Typography>

                <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
                  {/* Front Wing */}
                  <Card sx={{ flex: 1 }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>Ala davanter ({frontAoA}°)</Typography>
                      <Box sx={{ width: "100%", height: 200, bgcolor: "#f8fafc", borderRadius: 2, position: "relative", overflow: "hidden" }}>
                        <svg viewBox="0 0 400 200" style={{ width: "100%", height: "100%" }}>
                          <defs>
                            <linearGradient id="pressureGradientFront" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.7" />
                              <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.7" />
                            </linearGradient>
                            <marker id="arrowBlue" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                              <path d="M0,0 L0,6 L9,3 z" fill="rgb(37, 99, 235)" />
                            </marker>
                          </defs>

                          {/* Airflow streamlines */}
                          {[0, 1, 2, 3, 4].map((i) => {
                            const yBase = 80 + i * 12;
                            const curveIntensity = i === 2 ? frontAoA * 0.8 : frontAoA * 0.4;
                            return (
                              <path
                                key={i}
                                className="flow-path"
                                d={`M 0 ${yBase} Q 100 ${yBase - curveIntensity} 200 ${yBase - curveIntensity * 0.3} T 400 ${yBase}`}
                                style={{ animationDelay: `${-i * 0.2}s` }}
                              />
                            );
                          })}

                          {/* Wing profile (cambered airfoil) */}
                          <path
                            d={`M 80 ${110 - frontAoA * 0.5} Q 150 ${80 - frontAoA * 2} 250 ${100 - frontAoA * 1.2} T 320 ${115 - frontAoA * 0.3} Q 250 ${125 - frontAoA * 0.5} 150 ${120 - frontAoA * 0.8} T 80 ${110 - frontAoA * 0.5}`}
                            fill="url(#pressureGradientFront)"
                            stroke="#0f172a"
                            strokeWidth="3"
                          />

                          {/* Pressure indicators */}
                          <text x="200" y={70 - frontAoA * 2} fontSize="12" fill="#ef4444" fontWeight="bold" textAnchor="middle">Baixa pressió</text>
                          <text x="200" y={145 - frontAoA * 0.5} fontSize="12" fill="#3b82f6" fontWeight="bold" textAnchor="middle">Alta pressió</text>

                          {/* Force arrow */}
                          <line
                            x1="200"
                            y1={110 - frontAoA}
                            x2="200"
                            y2={110 - frontAoA + Math.min(50, current.coeffs.f.Cl * 25)}
                            stroke="#1d4ed8"
                            strokeWidth="4"
                            markerEnd="url(#arrowBlue)"
                          />
                          <text x="210" y={135 - frontAoA + Math.min(50, current.coeffs.f.Cl * 25) / 2} fontSize="11" fill="#1d4ed8" fontWeight="bold">Càrrega</text>
                        </svg>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" display="block"><b>Cl:</b> {current.coeffs.f.Cl.toFixed(3)} | <b>Cd:</b> {current.coeffs.f.Cd.toFixed(3)}</Typography>
                      <Typography variant="caption" display="block"><b>Càrrega:</b> {(current.L_front / 1000).toFixed(2)} kN | <b>Drag:</b> {(current.D_front / 1000).toFixed(2)} kN</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }} display="block">
                        El perfil corbat accelera l'aire a dalt, creant baixa pressió. Major angle = més càrrega però més drag.
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* Rear Wing */}
                  <Card sx={{ flex: 1 }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>Ala posterior ({rearAoA}°) {drs && "(DRS)"}</Typography>
                      <Box sx={{ width: "100%", height: 200, bgcolor: "#f8fafc", borderRadius: 2, position: "relative", overflow: "hidden" }}>
                        <svg viewBox="0 0 400 200" style={{ width: "100%", height: "100%" }}>
                          <defs>
                            <linearGradient id="pressureGradientRear" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity={drs ? "0.4" : "0.8"} />
                              <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity={drs ? "0.4" : "0.8"} />
                            </linearGradient>
                          </defs>

                          {/* Airflow streamlines */}
                          {[0, 1, 2, 3, 4].map((i) => {
                            const yBase = 80 + i * 12;
                            const curveIntensity = drs ? rearAoA * 0.3 : rearAoA * 0.8;
                            return (
                              <path
                                key={i}
                                className="flow-path"
                                d={`M 0 ${yBase} Q 100 ${yBase - curveIntensity} 200 ${yBase - curveIntensity * 0.3} T 400 ${yBase}`}
                                style={{ animationDelay: `${-i * 0.2}s` }}
                              />
                            );
                          })}

                          {/* Wing profile (cambered airfoil) - flatter if DRS */}
                          <path
                            d={drs
                              ? `M 80 ${110 - rearAoA * 0.2} Q 150 ${95 - rearAoA * 0.8} 250 ${105 - rearAoA * 0.5} T 320 ${115 - rearAoA * 0.15} Q 250 ${120 - rearAoA * 0.2} 150 ${118 - rearAoA * 0.3} T 80 ${110 - rearAoA * 0.2}`
                              : `M 80 ${110 - rearAoA * 0.5} Q 150 ${75 - rearAoA * 2.2} 250 ${98 - rearAoA * 1.3} T 320 ${115 - rearAoA * 0.3} Q 250 ${127 - rearAoA * 0.5} 150 ${122 - rearAoA * 0.8} T 80 ${110 - rearAoA * 0.5}`
                            }
                            fill="url(#pressureGradientRear)"
                            stroke={drs ? "#22c55e" : "#0f172a"}
                            strokeWidth="3"
                          />

                          {/* Pressure indicators */}
                          <text x="200" y={drs ? 85 - rearAoA * 0.8 : 65 - rearAoA * 2.2} fontSize="12" fill="#ef4444" fontWeight="bold" textAnchor="middle">
                            {drs ? "Pressió reduïda" : "Baixa pressió"}
                          </text>
                          <text x="200" y={drs ? 140 - rearAoA * 0.2 : 150 - rearAoA * 0.5} fontSize="12" fill="#3b82f6" fontWeight="bold" textAnchor="middle">Alta pressió</text>

                          {/* Force arrow */}
                          <line
                            x1="200"
                            y1={110 - rearAoA * (drs ? 0.3 : 0.8)}
                            x2="200"
                            y2={110 - rearAoA * (drs ? 0.3 : 0.8) + Math.min(50, current.coeffs.r.Cl * 25)}
                            stroke="#1d4ed8"
                            strokeWidth="4"
                            markerEnd="url(#arrowBlue)"
                          />
                          <text x="210" y={135 - rearAoA * (drs ? 0.3 : 0.8) + Math.min(50, current.coeffs.r.Cl * 25) / 2} fontSize="11" fill="#1d4ed8" fontWeight="bold">Càrrega</text>
                        </svg>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" display="block"><b>Cl:</b> {current.coeffs.r.Cl.toFixed(3)} | <b>Cd:</b> {current.coeffs.r.Cd.toFixed(3)}</Typography>
                    <Typography variant="caption" display="block"><b>Càrrega:</b> {(current.L_rear / 1000).toFixed(2)} kN | <b>Drag:</b> {(current.D_rear / 1000).toFixed(2)} kN</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }} display="block">
                      {drs ? "El DRS redueix el camber efectiu i la diferència de pressió. Menys càrrega però molt menys drag." : "Més angle i camber generen més càrrega posterior, important per a la tracció i el balanç."}
                    </Typography>
                  </CardContent>
                </Card>
                </Stack>
              </Box>
            )}

            {tab === "diffuser" && (
              <Box>
                <Typography variant="h6" gutterBottom>Editor interactiu del difusor</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Canvia l'angle del difusor per veure com afecta l'efecte terra i les forces generades. El difusor accelera l'aire sota el cotxe creant baixa pressió.
                </Typography>
                <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
                  <Box sx={{ flex: 2 }}>
                    <Card sx={{ bgcolor: "#f8fafc", border: "1px solid #e5e7eb" }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Vista lateral del difusor</Typography>
                        <Box sx={{ width: "100%", height: 300, position: "relative" }}>
                          <svg viewBox="0 0 600 300" style={{ width: "100%", height: "100%" }}>
                            <defs>
                              <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#64748b" />
                                <stop offset="100%" stopColor="#475569" />
                              </linearGradient>
                              <linearGradient id="floorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#1e293b" />
                                <stop offset="100%" stopColor="#0f172a" />
                              </linearGradient>
                            </defs>

                            {/* Ground */}
                            <rect x="0" y="220" width="600" height="80" fill="url(#groundGradient)" />

                            {/* Floor underbody */}
                            <path
                              d={`M 100 ${200 - rideHeight * 0.8} L 300 ${200 - rideHeight * 0.8} L ${300 + 200 * Math.cos(degToRad(diffuserAngle))} ${200 - rideHeight * 0.8 - 200 * Math.sin(degToRad(diffuserAngle))} L 520 ${200 - rideHeight * 0.8 - 200 * Math.sin(degToRad(diffuserAngle))} L 520 ${190 - rideHeight * 0.8 - 200 * Math.sin(degToRad(diffuserAngle))} L ${300 + 200 * Math.cos(degToRad(diffuserAngle))} ${190 - rideHeight * 0.8 - 200 * Math.sin(degToRad(diffuserAngle))} L 300 ${190 - rideHeight * 0.8} L 100 ${190 - rideHeight * 0.8} Z`}
                              fill="url(#floorGradient)"
                              stroke="#0ea5e9"
                              strokeWidth="2"
                            />

                            {/* Diffuser angle indicator */}
                            <line
                              x1="300"
                              y1={200 - rideHeight * 0.8}
                              x2={300 + 120 * Math.cos(degToRad(diffuserAngle))}
                              y2={200 - rideHeight * 0.8 - 120 * Math.sin(degToRad(diffuserAngle))}
                              stroke="#f59e0b"
                              strokeWidth="3"
                              strokeDasharray="5,5"
                            />

                            {/* Angle arc */}
                            <path
                              d={`M 420 ${200 - rideHeight * 0.8} A 120 120 0 0 0 ${420 - 120 * (1 - Math.cos(degToRad(diffuserAngle)))} ${200 - rideHeight * 0.8 - 120 * Math.sin(degToRad(diffuserAngle))}`}
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth="2"
                            />

                            <text x="440" y={195 - rideHeight * 0.8 - diffuserAngle * 1.5} fill="#f59e0b" fontSize="18" fontWeight="bold">{diffuserAngle.toFixed(1)}°</text>

                            {/* Ride height indicator */}
                            <line x1="100" y1="220" x2="100" y2={200 - rideHeight * 0.8} stroke="#0ea5e9" strokeWidth="2" />
                            <text x="50" y={210 - rideHeight * 0.4} fill="#0ea5e9" fontSize="14" fontWeight="bold">{rideHeight}mm</text>

                            {/* Airflow lines */}
                            {[0, 1, 2, 3].map((i) => (
                              <path
                                key={i}
                                className="flow-path"
                                d={`M 50 ${230 + i * 8} Q 200 ${225 + i * 8} 300 ${215 - rideHeight * 0.3 + i * 6} T ${400 + 100 * Math.cos(degToRad(diffuserAngle))} ${180 - rideHeight * 0.8 - 100 * Math.sin(degToRad(diffuserAngle)) + i * 8}`}
                                style={{ animationDelay: `${-i * 0.3}s` }}
                              />
                            ))}

                            {/* Labels */}
                            <text x="180" y="50" fontSize="16" fontWeight="bold" fill="#0f172a">Entrada del difusor</text>
                            <text x="380" y="50" fontSize="16" fontWeight="bold" fill="#0f172a">Sortida del difusor</text>
                          </svg>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Stack spacing={2}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom>Càrrega del terra actual</Typography>
                          <Typography variant="h4" color="primary">{(current.L_floor / 1000).toFixed(2)} kN</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {((current.L_floor / current.L_total) * 100).toFixed(0)}% del total
                          </Typography>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom>Com funciona?</Typography>
                          <Typography variant="body2" sx={{ fontSize: 13 }}>
                            El difusor expandeix l'àrea sota el cotxe, accelerant l'aire segons el principi de Bernoulli.
                            Aire més ràpid = menor pressió = més càrrega cap avall.
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="caption" display="block"><b>Angle òptim:</b> 10-15°</Typography>
                          <Typography variant="caption" display="block"><b>Molt baix (&lt;8°):</b> Poca expansió</Typography>
                          <Typography variant="caption" display="block"><b>Molt alt (&gt;18°):</b> Separació del flux</Typography>
                        </CardContent>
                      </Card>

                      <Card sx={{ bgcolor: "#fff" }}>
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#059669", mb: 1 }}>
                            Downforce (càrrega)
                          </Typography>
                          <Box sx={{
                            p: 2,
                            bgcolor: "#f8fafc",
                            borderRadius: 2,
                            fontFamily: "Georgia, serif",
                            fontSize: 18,
                            textAlign: "center",
                            mb: 1
                          }}>
                          <Typography component="span" sx={{ fontStyle: "italic" }}>L</Typography>
                          {" = "}
                          <Typography component="span" sx={{ fontStyle: "italic" }}>q</Typography>
                          {" · "}
                          <Typography component="span" sx={{ fontStyle: "italic" }}>S</Typography>
                          {" · "}
                          <Typography component="span" sx={{ fontStyle: "italic" }}>C</Typography>
                          <sub>L</sub>

                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            <Typography component="span" sx={{ fontStyle: "italic" }}>L</Typography>: càrrega, {" "}
                            <Typography component="span" sx={{ fontStyle: "italic", ml: 0.5 }}>q</Typography>: pressió dinàmica, {" "}
                            <Typography component="span" sx={{ fontStyle: "italic", ml: 0.5 }}>S</Typography>: Àrea de referència, {" "}
                            <Typography component="span" sx={{ fontStyle: "italic", ml: 0.5 }}>C</Typography>
                            <sub>L</sub>: coeficient de sustentació.
                          </Typography>
                        </CardContent>
                      </Card>

                      <Card sx={{ bgcolor: "#fff" }}>
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#059669", mb: 1 }}>
                            Drag (resistència)
                          </Typography>
                          <Box sx={{
                            p: 2,
                            bgcolor: "#f8fafc",
                            borderRadius: 2,
                            fontFamily: "Georgia, serif",
                            fontSize: 18,
                            textAlign: "center",
                            mb: 1
                          }}>
                          <Typography component="span" sx={{ fontStyle: "italic" }}>D</Typography>
                          {" = "}
                          <Typography component="span" sx={{ fontStyle: "italic" }}>q</Typography>
                          {" · "}
                          <Typography component="span" sx={{ fontStyle: "italic" }}>S</Typography>
                          {" · "}
                          <Typography component="span" sx={{ fontStyle: "italic" }}>C</Typography>
                          <sub>D</sub>

                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            <Typography component="span" sx={{ fontStyle: "italic" }}>D</Typography>: resistència, {" "}
                            <Typography component="span" sx={{ fontStyle: "italic", ml: 0.5 }}>q</Typography>: pressió dinàmica, {" "}
                            <Typography component="span" sx={{ fontStyle: "italic", ml: 0.5 }}>S</Typography>: Àrea de referència, {" "}
                            <Typography component="span" sx={{ fontStyle: "italic", ml: 0.5 }}>C</Typography>
                            <sub>D</sub>: coeficient de drag.
                          </Typography>
                        </CardContent>
                      </Card>

                      <Card sx={{ bgcolor: "#fff" }}>
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#059669", mb: 1 }}>
                            Coeficients aerodinàmics
                          </Typography>
                          <Box sx={{
                            p: 2,
                            bgcolor: "#f8fafc",
                            borderRadius: 2,
                            fontFamily: "Georgia, serif",
                            fontSize: 18,
                            mb: 1
                          }}>
                            <Box sx={{ textAlign: "center", mb: 1 }}>
                              <Typography component="span" sx={{ fontStyle: "italic" }}>C</Typography>
                              <sub>L</sub>
                              {" ≈ "}
                              <Typography component="span" sx={{ fontStyle: "italic" }}>C</Typography>
                              <sub>L0</sub>
                              {" + pendent ? α"}
                            </Box>
                            <Box sx={{ textAlign: "center" }}>
                              <Typography component="span" sx={{ fontStyle: "italic" }}>C</Typography>
                              <sub>D</sub>
                              {" ≈ "}
                              <Typography component="span" sx={{ fontStyle: "italic" }}>C</Typography>
                              <sub>D0</sub>
                              {" + "}
                              <Typography component="span" sx={{ fontStyle: "italic" }}>k</Typography>
                              {" · "}
                              <Typography component="span" sx={{ fontStyle: "italic" }}>C</Typography>
                              <sub>L</sub>
                              <sup>2</sup>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Més angle d'atac (α) → més càrrega, però també més drag induït (creix amb el quadrat de C<sub>L</sub>).
                          </Typography>
                        </CardContent>
                      </Card>

                      <Card sx={{ bgcolor: "#fff" }}>
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#059669", mb: 1 }}>
                            Efecte terra
                          </Typography>
                          <Typography variant="body2">
                            Més fort a prop del terra; massa baix pot estrangular el flux i causar pèrdua de càrrega. El difusor expandeix gradualment el flux per maximitzar l'efecte Venturi sense separació.
                          </Typography>
                        </CardContent>
                      </Card>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            )}

                        {tab === "learn" && (
              <Box>
                <Card sx={{ mb: 3, bgcolor: "#f0fdf4", border: "2px solid #10b981" }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ color: "#059669", fontWeight: 700 }}>
                      Per què canvien així les forces?
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      <Card sx={{ bgcolor: "#fff" }}>
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#059669", mb: 1 }}>
                            Pressió dinàmica
                          </Typography>
                          <Box sx={{
                            p: 2,
                            bgcolor: "#f8fafc",
                            borderRadius: 2,
                            fontFamily: "Georgia, serif",
                            fontSize: 18,
                            textAlign: "center",
                            mb: 1
                          }}>
                            <Typography component="span" sx={{ fontStyle: "italic" }}>q</Typography>
                            {" = ½ · ρ · "}
                            <Typography component="span" sx={{ fontStyle: "italic" }}>V</Typography>
                            <sup>2</sup>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Tot escala amb el quadrat de la velocitat. Duplicar la velocitat multiplica les forces per 4.
                          </Typography>
                        </CardContent>
                      </Card>

                      <Card sx={{ bgcolor: "#fff" }}>
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#059669", mb: 1 }}>
                            Forces aerodinàmiques
                          </Typography>
                          <Box sx={{
                            p: 2,
                            bgcolor: "#f8fafc",
                            borderRadius: 2,
                            fontFamily: "Georgia, serif",
                            fontSize: 18,
                            mb: 1
                          }}>
                            <Box sx={{ textAlign: "center", mb: 1 }}>
                              <Typography component="span" sx={{ fontStyle: "italic" }}>L</Typography>
                              {" = ½ · ρ · "}
                              <Typography component="span" sx={{ fontStyle: "italic" }}>V</Typography>
                              <sup>2</sup>
                              {" · "}
                              <Typography component="span" sx={{ fontStyle: "italic" }}>S</Typography>
                              {" · "}
                              <Typography component="span" sx={{ fontStyle: "italic" }}>C</Typography>
                              <sub>L</sub>
                            </Box>
                            <Box sx={{ textAlign: "center" }}>
                              <Typography component="span" sx={{ fontStyle: "italic" }}>D</Typography>
                              {" = ½ · ρ · "}
                              <Typography component="span" sx={{ fontStyle: "italic" }}>V</Typography>
                              <sup>2</sup>
                              {" · "}
                              <Typography component="span" sx={{ fontStyle: "italic" }}>S</Typography>
                              {" · "}
                              <Typography component="span" sx={{ fontStyle: "italic" }}>C</Typography>
                              <sub>D</sub>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            <Typography component="span" sx={{ fontStyle: "italic" }}>L</Typography> = càrrega (downforce),
                            <Typography component="span" sx={{ fontStyle: "italic" }}> D</Typography> = resistència (drag),
                            <Typography component="span" sx={{ fontStyle: "italic" }}> S</Typography> = àrea de referència
                          </Typography>
                        </CardContent>
                      </Card>

                      <Card sx={{ bgcolor: "#fff" }}>
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#059669", mb: 1 }}>
                            Coeficients aerodinàmics
                          </Typography>
                          <Box sx={{
                            p: 2,
                            bgcolor: "#f8fafc",
                            borderRadius: 2,
                            fontFamily: "Georgia, serif",
                            fontSize: 18,
                            mb: 1
                          }}>
                            <Box sx={{ textAlign: "center", mb: 1 }}>
                              <Typography component="span" sx={{ fontStyle: "italic" }}>C</Typography>
                              <sub>L</sub>
                              {" ≈ "}
                              <Typography component="span" sx={{ fontStyle: "italic" }}>C</Typography>
                              <sub>L0</sub>
                              {" + pendent · α"}
                            </Box>
                            <Box sx={{ textAlign: "center" }}>
                              <Typography component="span" sx={{ fontStyle: "italic" }}>C</Typography>
                              <sub>D</sub>
                              {" ≈ "}
                              <Typography component="span" sx={{ fontStyle: "italic" }}>C</Typography>
                              <sub>D0</sub>
                              {" + "}
                              <Typography component="span" sx={{ fontStyle: "italic" }}>k</Typography>
                              {" · "}
                              <Typography component="span" sx={{ fontStyle: "italic" }}>C</Typography>
                              <sub>L</sub>
                              <sup>2</sup>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Més angle d'atac (α) → més càrrega, però també més drag induït (creix amb el quadrat de C<sub>L</sub>).
                          </Typography>
                        </CardContent>
                      </Card>

                      <Card sx={{ bgcolor: "#fff" }}>
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#059669", mb: 1 }}>
                            Efecte terra
                          </Typography>
                          <Typography variant="body2">
                            Més fort a prop del terra; massa baix pot estrangular el flux i causar pèrdua de càrrega. El difusor expandeix gradualment el flux per maximitzar l'efecte Venturi sense separació.
                          </Typography>
                        </CardContent>
                      </Card>
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ mb: 3, bgcolor: "#fef3c7", border: "2px solid #f59e0b" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: "#d97706", fontWeight: 700 }}>
                      Com investigar com a enginyer
                    </Typography>
                    <Box component="ol" sx={{ pl: 3, fontSize: 15, lineHeight: 1.8 }}>
                      <li><b>Tria una base</b>: guarda una instantània amb la configuració inicial.</li>
                      <li><b>Canvia un paràmetre</b>: modifica <i>només un</i> valor cada vegada i observa la tendència.</li>
                      <li><b>Grafica sensibilitat</b>: usa les gràfiques d'alçada per explicar la zona òptima.</li>
                      <li><b>Analitza compromisos</b>: més càrrega sol significar més drag. Quin equilibri és millor pel teu circuit?</li>
                    </Box>
                  </CardContent>
                </Card>

                <Card sx={{ bgcolor: "#e0f2fe", border: "2px solid #0ea5e9" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: "#0369a1", fontWeight: 700 }}>
                      Tasques suggerides
                    </Typography>
                    <Box component="ul" sx={{ pl: 3, fontSize: 15, lineHeight: 1.8 }}>
                      <li>Troba un setup que mantingui el balanç davanter entre 45–55% de 120 a 260 km/h.</li>
                      <li>Compara Monza vs Monaco: quantifica Δdrag a 250 km/h i discuteix l'impacte en temps de volta.</li>
                      <li>Mostra per què el DRS ajuda a avançar: usa la instantània i la gràfica de velocitat per demostrar-ho.</li>
                      <li>Investiga l'angle òptim del difusor: per què 10-15° és millor que angles extrems?</li>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}
            
          </Box>
        </Box>
        {/* KPI PANEL */}
        {showKPIs ? (
          <KpiPanel
            current={current}
            snapshot={snapshot}
            drs={drs}
            isMobile={isMobile}
            onCollapse={() => setShowKPIs(false)}
          />
        ) : (
          !isMobile && (
            <Box
              sx={{
                width: 28,
                flexShrink: 0,
                borderLeft: "1px solid #1d4ed8",
                bgcolor: "#0b1f4d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Tooltip title="Mostra els resultats">
                <IconButton
                  size="small"
                  sx={{ color: "#bfdbfe" }}
                  onClick={() => setShowKPIs(true)}
                >
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )
        )}
      </Box>
    </Box>
  );
}


           
