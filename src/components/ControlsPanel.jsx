import {
  Box,
  Typography,
  Stack,
  Button,
  Switch,
  Divider,
  TextField
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import LabeledSlider from "./LabeledSlider.jsx";

export default function ControlsPanel({
  speed,
  setSpeed,
  frontAoA,
  setFrontAoA,
  rearAoA,
  setRearAoA,
  rideHeight,
  setRideHeight,
  diffuserEff,
  setDiffuserEff,
  diffuserAngle,
  setDiffuserAngle,
  drs,
  setDrs,
  rho,
  setRho,
  setPreset,
  saveSnapshot
}) {
  return (
    <Box sx={{
      width: 300,
      flexShrink: 0,
      overflowY: "auto",
      borderRight: "1px solid #e5e7eb",
      bgcolor: "#fafafa",
      p: 2
    }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Paràmetres
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant="outlined" size="small" fullWidth onClick={() => setPreset("Monza")}>Monza</Button>
        <Button variant="outlined" size="small" fullWidth onClick={() => setPreset("Monaco")}>Monaco</Button>
      </Stack>

      <LabeledSlider label="Velocitat (km/h)" value={speed} setValue={setSpeed} min={60} max={360} step={5} hint="Afecta totes les forces via V²." />
      <LabeledSlider label="Ala davanter (°)" value={frontAoA} setValue={setFrontAoA} min={0} max={20} step={1} hint="Més angle → més càrrega i drag." />
      <LabeledSlider label="Ala posterior (°)" value={rearAoA} setValue={setRearAoA} min={0} max={22} step={1} hint="Similar a l'ala davanter." />
      <LabeledSlider label="Alçada terra (mm)" value={rideHeight} setValue={setRideHeight} min={20} max={80} step={1} hint="Més baix → més efecte terra." />
      <LabeledSlider label="Efic. difusor (×)" value={diffuserEff} setValue={setDiffuserEff} min={0.5} max={1.5} step={0.01} hint="Multiplica càrrega terra." />
      <LabeledSlider label="Angle difusor (°)" value={diffuserAngle} setValue={setDiffuserAngle} min={5} max={25} step={0.5} hint="Òptim: 10-15°" />

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2, mb: 2 }}>
        <Switch checked={drs} onChange={(e) => setDrs(e.target.checked)} />
        <Typography variant="body2">DRS {drs ? "obert" : "tancat"}</Typography>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" display="block" gutterBottom>Densitat aire ρ (kg/m³)</Typography>
        <TextField
          type="number"
          size="small"
          fullWidth
          value={rho}
          onChange={(e) => setRho(parseFloat(e.target.value || "1.225"))}
          inputProps={{ step: 0.005 }}
        />
      </Box>

      <Stack direction="row" spacing={1}>
        <Button variant="contained" size="small" fullWidth onClick={saveSnapshot} startIcon={<SaveAltIcon />}>
          Guardar
        </Button>
        <Button variant="outlined" size="small" onClick={() => window.location.reload()} startIcon={<ReplayIcon />}>
          Reset
        </Button>
      </Stack>
    </Box>
  );
}
