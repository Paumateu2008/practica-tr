import { Box, Card, CardContent, Typography, IconButton } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KPI from "./KPI.jsx";

const PANEL_BG = "#0b1f4d";
const PANEL_BORDER = "#1d4ed8";

export default function KpiPanel({ current, snapshot, drs, onCollapse }) {
  return (
    <Box
      sx={{
        width: 260,
        flexShrink: 0,
        overflowY: "auto",
        borderLeft: `1px solid ${PANEL_BORDER}`,
        bgcolor: PANEL_BG,
        color: "#e2e8f0",
        p: 2
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="h6" fontWeight={600} sx={{ color: "#f8fafc" }}>
          Resultats
        </Typography>
        {onCollapse && (
          <IconButton size="small" onClick={onCollapse} sx={{ color: "#c7d2fe" }}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <KPI dark title="Càrrega total" value={(current.L_total / 1000).toFixed(1)} unit="kN" />
      <KPI dark title="Resistència (drag)" value={(current.D_total / 1000).toFixed(1)} unit="kN" />
      <KPI dark title="Balanç davanter" value={`${current.balanceFront.toFixed(0)}%`} unit="" />
      <KPI dark title="Càrrega terra" value={(current.L_floor / 1000).toFixed(1)} unit="kN" />
      <KPI
        dark
        title="Ala davanter Cl/Cd"
        value={`${current.coeffs.f.Cl.toFixed(2)} / ${current.coeffs.f.Cd.toFixed(2)}`}
        unit=""
      />
      <KPI
        dark
        title="Ala posterior Cl/Cd"
        value={`${current.coeffs.r.Cl.toFixed(2)} / ${current.coeffs.r.Cd.toFixed(2)}`}
        unit={drs ? "(DRS)" : ""}
      />

      {snapshot && (
        <Card
          sx={{
            mt: 2,
            bgcolor: "rgba(30,64,175,0.55)",
            border: "1px solid rgba(191,219,254,0.7)",
            color: "#f8fafc",
            backdropFilter: "blur(6px)"
          }}
        >
          <CardContent>
            <Typography variant="caption" fontWeight="bold" display="block" sx={{ color: "#c3ddff" }}>
              Comparació:
            </Typography>
            <Typography variant="caption" display="block" sx={{ color: "#f8fafc" }}>
              • Càrrega:{" "}
              <b style={{ color: current.L_total - snapshot.result.L_total > 0 ? "#34d399" : "#f87171" }}>
                {((current.L_total - snapshot.result.L_total) / 1000).toFixed(2)} kN
              </b>
            </Typography>
            <Typography variant="caption" display="block" sx={{ color: "#f8fafc" }}>
              • Drag:{" "}
              <b style={{ color: current.D_total - snapshot.result.D_total > 0 ? "#f87171" : "#34d399" }}>
                {((current.D_total - snapshot.result.D_total) / 1000).toFixed(2)} kN
              </b>
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
