# Simulador d'Aerodinàmica de F1 — Edició Educativa

Eina interactiva pensada per a entendre les bases de l'aerodinàmica d'un monoplaça. Mostra de manera visual com cada element (alerons, difusor, terra, DRS…) influeix en les forces. Els valors són il·lustratius i serveixen per explicar tendències, no per a disseny d'enginyeria.

## Execució local
- Instal·la Node.js 20 o superior.
- Des del directori del projecte: `npm install` una vegada i, després, `npm run dev` per obrir l'URL local que aparegui al terminal.
- `npm run build` genera el paquet de producció i `npm run preview` el serveix per fer una comprovació final.

## Què veuràs
- **Presets** (esquerra): Monza (baix drag), Monaco (alta càrrega), Wet i Baseline. Ajusten angles d'ala, alçada i estat del DRS.
- **Panell de control**:
  - *Velocitat (km/h)*: totes les forces escalen amb V².
  - *Angles de les ales davantera i posterior*: més angle = més càrrega però també més drag.
  - *Alçada al terra*: l'efecte terra creix quan baixes, però es pot “ofegar” si vas massa baix.
  - *Eficiència i angle del difusor (nou)*: ha estat ampliat amb un control d'angle (5‑25°) per veure com canvia l'efecte Venturi; la zona òptima continua entre 10‑15°.
  - *Densitat de l'aire (ρ)* editable i *interruptor DRS*.
  - *Instantània* per comparar configuracions i *Reset* per tornar al punt inicial.
- **Visualització del cotxe**: fons blanc opac i llegenda/etiquetes en blau fosc per garantir contrast (“Blau: càrrega · Vermell: resistència”). Les fletxes blaves mostren downforce a cada eix, la vermella el drag.
- **KPIs a la dreta**: càrrega/drag totals, balanç davant %, contribució del terra i coeficients de les ales (amb estat del DRS).
- **Pestanyes centrals**:
  - *Visualització*: esquema del vehicle amb vectorització de forces.
  - *Gràfiques*: corbes de càrrega i resistència segons velocitat, exportables en CSV.
  - *Mapa d'alçada*: variació de la càrrega i del balanç en funció de l'alçada actual.
  - *Simulació de pista*: perfils de volta i de corba per veure grip disponible vs necessari.
  - *Editor de difusor (nou)*: forma interactiva, flux animat i explicació del Venturi.
  - *Perfils d'ales (nou)*: seccions d'ales amb distribució de pressions i efecte del DRS.
  - *Balanceig de forces (nou)*: desglossa la contribució de cada element (ala davanter, terra, ala posterior).
  - *Comparació A/B (nou)*: apareix quan guardes una instantània; mostra diferències numèriques i en percentatge.
  - *Aprendre*: fórmules, conceptes i propostes d'investigació guiades.
  - *Elements aero*: vista amb zoom i punts d'informació detallats.

## Matemàtica simplificada
- Pressió dinàmica: `q = ½ · ρ · V²`.
- Downforce i drag: `L = q · S · Cl` i `D = q · S · Cd` amb àrees de referència per ala davantera, posterior i terra.
- Ales: `Cl = Cl0 + slope · α`, `Cd = Cd0 + k · Cl²`, capturant l'augment de drag induït.
- Terra (efecte terra): creix quan l'alçada baixa, però es limita i pot “stallar” si toques massa a prop. L'eficiència del difusor i el seu angle multipliquen l'efecte.
- DRS: redueix aproximadament al 75% el Cl de l'ala posterior i al 65% el seu Cd quan és obert.

## Propostes d'experimentació
1. **Optimització del difusor**: a la pestanya “Editor difusor” canvia l'angle de 5° a 25° i descriu per què 10‑15° és l'interval ideal.
2. **Perfils d'ala**: puja l'angle de l'ala davantera de 5° a 15°, guarda instantànies i compara el compromís càrrega/drag.
3. **Estudi del balanç**: mantén el balanç davanter entre 45‑55% mentre varies la velocitat (120‑260 km/h). Identifica quin element desestabilitza l'equilibri.
4. **Comparació de circuits**: guarda Monza, passa a Monaco i usa la comparació A/B per quantificar el drag a 250 km/h i comentar l'impacte en el temps de volta.
5. **Efecte DRS**: compara instantànies amb el DRS tancat i obert a 250 km/h. Explica per què ajuda en els avanços segons les gràfiques i els perfils d'ala.
6. **Sensibilitat a l'alçada**: a 200 km/h, fes un sweep d'alçada al mapa i relaciona la zona òptima amb el que es veu a l'editor de difusor.
7. **Exploració guiada**: a la pestanya “Elements aero”, obre cada element i comprova experimentalment el que s'explica.

## Funcionalitats educatives
- Visualitzacions en temps real i animacions que reforcen conceptes.
- Actualització instantània de les mètriques quan canvies un paràmetre.
- Contingut explicatiu contextuat (tooltips, targetes “Aprendre”, punts clicables).
- Sistema d'instantànies per fer comparatives i justificar conclusions.
- Diverses perspectives del mateix fenomen (gràfiques, models, fórmules, textos).
- Contrast millorat (fons principal blanc i etiquetes en blau fosc) per llegir fàcilment dades i llegendes.

## Límits i consells
- Les magnituds són aproximacions qualitatives; utilitza-les per parlar de tendències i compromisos.
- Canvia un sol paràmetre cada vegada per entendre causa/efecte.
- Desa instantànies sovint per documentar comparatives al teu informe.
- Si la interfície queda fora de to, fes clic a Reset o recarrega (les instantànies es buiden només quan recarregues).
- Per a presentacions o treballs escrits, captura pantalles de les diferents pestanyes i cita els gràfics per explicar els resultats.
