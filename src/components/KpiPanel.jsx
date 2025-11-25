import { Box, Card, CardContent, Typography } from "@mui/material";
import KPI from "./KPI.jsx";

export default function KpiPanel({ current, snapshot, drs }) {
  return (
    <Box sx={{
      width: 240,
      flexShrink: 0,
      overflowY: "auto",
      borderLeft: "1px solid #e5e7eb",
      bgcolor: "#fafafa",
      p: 2
    }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Resultats
      </Typography>

      <KPI title="Càrrega total" value={(current.L_total / 1000).toFixed(1)} unit="kN" />
      <KPI title="Resistència (drag)" value={(current.D_total / 1000).toFixed(1)} unit="kN" />
      <KPI title="Balance davanter" value={`${current.balanceFront.toFixed(0)}%`} unit="" />
      <KPI title="Càrrega terra" value={(current.L_floor / 1000).toFixed(1)} unit="kN" />
      <KPI title="Ala davant Cl/Cd" value={`${current.coeffs.f.Cl.toFixed(2)} / ${current.coeffs.f.Cd.toFixed(2)}`} unit="" />
      <KPI title="Ala posterior Cl/Cd" value={`${current.coeffs.r.Cl.toFixed(2)} / ${current.coeffs.r.Cd.toFixed(2)}`} unit={drs ? "(DRS)" : ""} />

      {snapshot && (
        <Card sx={{ mt: 2, bgcolor: "#e0f2fe", border: "1px solid #0ea5e9" }}>
          <CardContent>
            <Typography variant="caption" fontWeight="bold" display="block" color="primary">
              Comparació:
            </Typography>
            <Typography variant="caption" display="block">
              ΔCàrrega: <b style={{ color: (current.L_total - snapshot.result.L_total) > 0 ? "#10b981" : "#ef4444" }}>
                {((current.L_total - snapshot.result.L_total) / 1000).toFixed(2)} kN
              </b>
            </Typography>
            <Typography variant="caption" display="block">
              ΔDrag: <b style={{ color: (current.D_total - snapshot.result.D_total) > 0 ? "#ef4444" : "#10b981" }}>
                {((current.D_total - snapshot.result.D_total) / 1000).toFixed(2)} kN
              </b>
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
