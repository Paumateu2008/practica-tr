import { Box, Stack, Typography, Slider, Tooltip, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function LabeledSlider({ label, value, setValue, min, max, step, hint }) {
  return (
    <Box sx={{ my: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Typography variant="body2" sx={{ color: "#0f172a" }}>
          {label}: <b>{Number.isInteger(step) ? value : Math.round(value * 100) / 100}</b>
        </Typography>
        {hint && (
          <Tooltip title={hint} placement="top">
            <IconButton size="small">
              <InfoOutlinedIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      <Slider value={value} min={min} max={max} step={step} onChange={(_, v) => setValue(v)} />
    </Box>
  );
}
