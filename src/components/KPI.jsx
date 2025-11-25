import { Card, CardContent, Typography } from "@mui/material";

export default function KPI({ title, value, unit }) {
  return (
    <Card sx={{ mb: 1 }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {title}
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          {value} <Typography component="span" variant="caption" color="text.secondary">{unit}</Typography>
        </Typography>
      </CardContent>
    </Card>
  );
}
