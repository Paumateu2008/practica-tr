# Formula 1 Aerodynamics Simulator — Educational Edition

An interactive, visual learning tool designed for students to understand F1 aerodynamics. Perfect for research projects (batxillerat) and learning how aerodynamic elements work, their shapes, and how these shapes affect forces. Numbers illustrate trends; it is not an engineering-grade tool.

## Run it locally
- Install Node.js 20+.
- From the repo root: `npm install` once, then `npm run dev` and open the shown local URL.
- `npm run build` produces a production bundle; `npm run preview` serves that bundle.

## What you see
- **Presets**: Monza (low drag), Monaco (high downforce), Wet, Baseline. They set wing angles, ride height, and DRS.
- **Controls** (all in the left card):
  - Speed slider (km/h) drives all forces via V².
  - Front/Rear wing angle of attack sliders: higher angle → more downforce and drag.
  - Ride height slider: lower gives stronger ground effect until you get too low (stall risk).
  - Diffuser efficiency: multiplies floor downforce.
  - **NEW: Diffuser angle**: adjust the diffuser angle (5-25°) to see how it affects ground effect. Optimal range: 10-15°.
  - Air density input (ρ): default 1.225 kg/m³.
  - DRS switch: open reduces rear wing drag and some rear downforce.
  - Snapshot button: save the current setup to compare against later; Reset reloads the default.
- **On-car sketch**: blue arrows show downforce at front/rear, red shows drag. Length is relative to the current total.
- **KPIs**: total downforce, total drag, front balance %, floor downforce, and wing Cl/Cd values (rear shows "DRS" when open).
- **Interactive Tabs**:
  - **Forces vs speed**: line chart of downforce/drag and each axle vs speed; export CSV if you want the numbers.
  - **Ride height map**: downforce and front balance vs ride height at the current speed, with a marker at your setting.
  - **NEW: Interactive diffuser editor**: visualize how the diffuser shape changes with angle, see real-time airflow, and understand the Venturi effect.
  - **NEW: Wing profiles**: see airfoil cross-sections with pressure distribution. Watch how angle of attack and DRS affect the wing shape and forces.
  - **NEW: Force balance**: visual breakdown showing contribution of each aerodynamic element (front wing, floor, rear wing) to total downforce.
  - **NEW: A/B Comparison**: (appears when you save a snapshot) detailed side-by-side comparison with automatic analysis of changes.
  - **Learn**: formulas, suggested investigations, and educational content.
  - **Aero elements**: zoomable view with clickable elements that show detailed explanations of each aerodynamic component.

## How it works (simplified math)
- Dynamic pressure sets the scale: q = ½·ρ·V².
- Lift/downforce and drag use L = q·S·Cl and D = q·S·Cd with reference areas for front wing, rear wing, and floor.
- Wings: Cl ≈ Cl0 + slope·α, Cd ≈ Cd0 + k·Cl² (captures induced drag rise with angle).
- Ground effect floor: downforce grows as ride height drops but is capped and slightly "stalls" if too low; diffuser efficiency and angle multiply it.
- **Diffuser angle effect**: optimal around 10-15° using a Gaussian curve; too steep or too shallow reduces effectiveness.
- DRS: cuts rear-wing Cl to ~75% and Cd to ~65% when open.

## Good starter experiments for learning
1. **Diffuser optimization**: Start in the diffuser editor tab. Change the diffuser angle from 5° to 25° and observe how the floor downforce changes. Explain why 10-15° is optimal using Bernoulli's principle.

2. **Wing profile analysis**: Go to the wing profiles tab. Increase the front wing angle from 5° to 15° and watch the pressure distribution change. Take a snapshot at 8° and compare with 15°. Explain the downforce vs drag trade-off.

3. **Balance experiments**: Keep front balance between 45-55% while changing speed from 120-260 km/h. Use the balance tab to see which element contributes most. What setup keeps it stable?

4. **Circuit comparison**: Save a snapshot with Monza preset, then switch to Monaco. Go to the A/B comparison tab to quantify the differences. How does the 250 km/h drag difference affect lap time?

5. **DRS effect**: Save a snapshot with DRS closed at 250 km/h. Open DRS and check the comparison tab. Use the wing profiles tab to see how the rear wing shape changes. Explain why this helps overtaking.

6. **Ride height sensitivity**: Use the ride height map at 200 km/h. Find the optimal height and explain why it exists using the diffuser editor visualization.

7. **Interactive exploration**: Click on each aerodynamic element in the "Aero elements" tab to learn about its function, then experiment with its settings to verify the explanations.

## Educational features
This simulator is specifically designed for learning:
- **Visual and interactive**: See shapes change in real-time as you adjust parameters
- **Instant feedback**: All forces update immediately when you change settings
- **Guided explanations**: Click on elements to get detailed educational content
- **Comparative analysis**: Save snapshots and get automatic analysis of your changes
- **Multiple perspectives**: View the same concept from different angles (charts, visualizations, formulas)
- **Realistic trade-offs**: Experience the same engineering compromises F1 teams face

## Limits and tips
- Values are illustrative, not validated with real data; use them to discuss trends and trade-offs.
- Change one parameter at a time to see cause and effect.
- Use the snapshot feature frequently to compare different configurations.
- If the UI looks stale, hit Reset or reload the page; snapshots clear only when you reload.
- For research projects: take screenshots of the different tabs to illustrate concepts in your presentation.
