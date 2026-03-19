# Companion module changelog

All entries below are shipped as **module version 2.4.0** (manifest / `package.json` unchanged from that number).

## 2.4.0

- **Variables:** `volume` (0–100), `volume_percent` (e.g. `72%`); volume reflects macOS **system output** when the host app reports it.
- **Feedbacks:** `Volume: below`, `Volume: between`, `Volume: above` — stack multiple instances; each has color pickers, text size, alignment, top bar, and optional button text.
- **Preset:** “Volume Level” uses the three volume feedbacks plus `volume_percent` in the label.

Host app (`spotify-controller`): after each state refresh on macOS, system output volume is read so Companion stays aligned with volume actions.
