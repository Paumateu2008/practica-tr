import { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Switch,
  Divider,
  TextField,
  IconButton,
  Collapse
} from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
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
  saveSnapshot,
  onCollapse,
  isMobile = false
}) {
  const [showPresetInfo, setShowPresetInfo] = useState(false);

  return (
    <Box
      sx={{
        width: isMobile ? "100%" : 320,
        flexShrink: 0,
        borderRight: isMobile ? "none" : "1px solid #e5e7eb",
        borderBottom: isMobile ? "1px solid #e5e7eb" : "none",
        bgcolor: "#f8fafc",
        p: 2,
        display: "flex",
        flexDirection: "column",
        borderRadius: isMobile ? 2 : 0,
        boxShadow: isMobile ? "0 8px 18px rgba(15,23,42,0.08)" : "none"
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="h6" fontWeight={600} sx={{ color: "#0b1f4d" }}>
          {"Par\u00E0metres"}
        </Typography>
        {onCollapse && !isMobile && (
          <IconButton size="small" onClick={onCollapse} sx={{ color: "#1d4ed8" }}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Box
        sx={{
          flex: isMobile ? "0 0 auto" : 1,
          overflowY: isMobile ? "visible" : "auto",
          pr: isMobile ? 0 : 1
        }}
      >
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button variant="outlined" size="small" fullWidth onClick={() => setPreset("Monza")}>
            Monza
          </Button>
          <Button variant="outlined" size="small" fullWidth onClick={() => setPreset("Monaco")}>
            Monaco
          </Button>
        </Stack>

        <Box
          sx={{
            mb: 2,
            p: 1.5,
            bgcolor: "#e0f2fe",
            border: "1px solid #bae6fd",
            borderRadius: 1
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="caption" sx={{ color: "#0f172a", fontWeight: 600 }}>
              Per què varien les configuracions?
            </Typography>
            <IconButton
              size="small"
              onClick={() => setShowPresetInfo((v) => !v)}
              sx={{ color: "#0f172a" }}
            >
              {showPresetInfo ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          </Stack>
          <Collapse in={showPresetInfo}>
            <Typography variant="caption" sx={{ color: "#0f172a", lineHeight: 1.5 }}>
              Monza té rectes llargues i busca minimitzar el drag (ales més planes, DRS obert). Monaco és
              tot corbes lentes, així que necessites més càrrega, angles més alts i el DRS tancat per maximitzar
              el grip.
            </Typography>
          </Collapse>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={saveSnapshot}
              startIcon={<SaveAltIcon />}
            >
              Guardar
            </Button>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => window.location.reload()}
              startIcon={<ReplayIcon />}
            >
              Reset
            </Button>
          </Stack>
        </Box>

        <LabeledSlider
          label="Velocitat (km/h)"
          value={speed}
          setValue={setSpeed}
          min={60}
          max={360}
          step={5}
          hint="Afecta totes les forces via V²."
        />
        <LabeledSlider
          label="Aleró davanter (°)"
          value={frontAoA}
          setValue={setFrontAoA}
          min={0}
          max={20}
          step={1}
          hint="Més angle → més càrrega i drag."
        />
        <LabeledSlider
          label="Aleró posterior (°)"
          value={rearAoA}
          setValue={setRearAoA}
          min={0}
          max={22}
          step={1}
          hint="Similar a l'ala davantera."
        />
        <LabeledSlider
          label="Alçada terra (mm)"
          value={rideHeight}
          setValue={setRideHeight}
          min={20}
          max={80}
          step={1}
          hint="Més baix → més efecte terra."
        />
        <LabeledSlider
          label="Angle difusor (°)"
          value={diffuserAngle}
          setValue={setDiffuserAngle}
          min={5}
          max={25}
          step={0.5}
          hint="Òptim entre 10-15°."
        />

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2, mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
            <Switch checked={drs} onChange={(e) => setDrs(e.target.checked)} />
            <Typography variant="body2" sx={{ color: "#0f172a" }}>
              DRS {drs ? "obert" : "tancat"}
            </Typography>
          </Stack>
          <TextField
            type="number"
            size="small"
            label="Densitat aire (kg/m^3)"
            value={rho}
            onChange={(e) => setRho(parseFloat(e.target.value || "1.225"))}
            inputProps={{ step: 0.005 }}
            sx={{ width: isMobile ? "55%" : 160, "& .MuiInputBase-input": { color: "#0f172a" } }}
          />
        </Stack>

        {!isMobile && <Divider sx={{ my: 2 }} />}
      </Box>
    </Box>
  );
}
