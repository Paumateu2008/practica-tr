import { Card, CardContent, Typography } from "@mui/material";

export default function KPI({ title, value, unit, dark = false }) {
  return (
    <Card
      sx={{
        mb: 1,
        bgcolor: dark ? "rgba(11,31,77,0.75)" : "#fff",
        border: dark ? "1px solid rgba(125,162,255,0.35)" : "1px solid rgba(226,232,240,0.8)",
        color: dark ? "#f1f5f9" : "inherit",
        backdropFilter: dark ? "blur(6px)" : "none"
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Typography
          variant="caption"
          display="block"
          sx={{ color: dark ? "#c7d2fe" : "text.secondary" }}
        >
          {title}
        </Typography>
        <Typography variant="h6" fontWeight={700} sx={{ color: dark ? "#f8fafc" : "inherit" }}>
          {value}{" "}
          <Typography
            component="span"
            variant="caption"
            sx={{ color: dark ? "#e0e7ff" : "text.secondary" }}
          >
            {unit}
          </Typography>
        </Typography>
      </CardContent>
    </Card>
  );
}
