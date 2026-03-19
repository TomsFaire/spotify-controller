# Tech Ministry Spotify Controller

This module allows you to control and view the status of Spotify running on a Mac or Windows computer.

Requires the free [spotify-controller](http://github.com/josephdadams/spotify-controller) app.

## Important Notes

- **Mac support (full control):**  
  Supports full playback control, seeking, volume, shuffle, repeat, etc.

- **Windows support (limited control):**  
  The module uses Spotify deep links on Windows to open the app and start specific tracks or albums.  
  Some features like pause, next/previous, seek, and volume control are not available on Windows.

## Configuration

- Enter the IP address of the computer running `spotify-controller`.
- Default port: **8801**.

## Available Actions

| Action                      | Mac | Windows |
| --------------------------- | :-: | :-----: |
| Play/Pause/Toggle           | ✅  |   ❌    |
| Play Track by ID            | ✅  |   ✅    |
| Play Track by ID in Context | ✅  |   ✅    |
| Next/Previous               | ✅  |   ❌    |
| Set Player Position (Seek)  | ✅  |   ❌    |
| Volume Up/Down/Set/Ramp     | ✅  |   ❌    |
| Mute/Unmute                 | ✅  |   ❌    |
| Repeat On/Off/Toggle        | ✅  |   ❌    |
| Shuffle On/Off/Toggle       | ✅  |   ❌    |

## Available Variables

_(All available on Mac; limited on Windows)_

- **Information/Status**
- **Version**
- **Current Song Name**
- **Current Album**
- **Current Artist**
- **Current Track Duration**
- **Current Track Playback Position**
- **Track ID**
- **Player State**
- **Volume (0–100)** — numeric level from macOS system output _(Mac; matches Set Volume actions)_
- **Volume with % (e.g. 72%)** — same value with a % suffix for button labels

## Available Feedbacks

- Change button color if playback is in **X** state (Playing, Paused, Stopped) _(Mac only)_
- **Volume: below** — when volume is strictly below a threshold, apply your chosen style (colors, text size, alignment, optional text, top bar) _(Mac only)_
- **Volume: between** — when volume is between two values (inclusive), apply style _(Mac only)_
- **Volume: above** — when volume is strictly above a threshold, apply style _(Mac only)_  
  Stack several of these on one button for multi-zone styling (e.g. green / orange / red bands).

## Available Presets

- Play/Pause (with icons)
- Volume Up/Down/50%/100%
- Volume Level on Button (with zone colors) _(Mac only)_
- Current Track Name on Button
