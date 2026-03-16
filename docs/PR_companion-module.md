# PR: Variable support for Track ID, Context ID, and seek position

## Summary

Adds Bitfocus Companion variable support (`$(module:variable)` e.g. `$(google-sheets:D3)`) for:

- **Play Track By ID** – Track ID field  
- **Play Track In Context By ID** – Track ID and Context ID (playlist/album) fields  
- **Move Player Position** – Seconds field  
- **Set Player Position** – Seconds field  

Also switches packaging to the official `companion-module-build` so the built `.tgz` loads correctly in Companion 3.

## Changes

### 1. Variable support in actions

- **`src/actions.js`**
  - **Play Track By ID**: `track` already had `useVariables: true` and `await self.parseVariablesInString(action.options.track)` — left as-is.
  - **Play Track In Context By ID**: `track` and `context` already had `useVariables: true` and are resolved with `parseVariablesInString` before `sendCommand('playtrackincontext', track, context)` — left as-is.
  - **Move Player Position**: Seconds field changed from `type: 'number'` to `type: 'textinput'` with `useVariables: true` and default `'10'`. Callback parses the resolved string with `parseFloat`, NaN fallback to 0, then `sendCommand('movePlayerPosition', seconds)`.
  - **Set Player Position**: Same as Move: `type: 'textinput'`, `useVariables: true`, default `'0'`, resolve → parseFloat → send.

Tooltips updated to mention variable support (e.g. `$(google-sheets:D3)`).

### 2. Packaging and manifest

- **`package.json`**: Version set to **2.4.0**. `"pack:companion": "companion-module-build"` so `npm run pack:companion` produces a Companion-3–compatible `.tgz`. Optional `"pack:companion:legacy": "bash scripts/pack-for-companion.sh"` kept for the old manual pack.
- **`companion/manifest.json`**: `version` set to `"2.4.0"` (was `"0.0.0"`).
- **`scripts/pack-for-companion.sh`**: Kept for reference; now includes `npm install --production` in the pack dir so a legacy manual pack would include deps. Primary build path is `companion-module-build`.
- **`.gitignore`**: Added `dist-pack/`. Built `.tgz` and `pkg/` are not committed.

## Testing (recommended before merge)

- [ ] **Play Track By ID** with a variable (e.g. `$(internal:custom_var)` or a sheet cell): resolves and plays the correct track.
- [ ] **Play Track In Context By ID** with variables for both Track ID and Context ID: both resolve and play in the right context (playlist/album).
- [ ] **Move Player Position** / **Set Player Position** with a variable for seconds: value resolves and seek/position updates as expected.

No other behavior changed; only variable support and packaging.

## Checklist

- [x] Track ID and Context ID use `useVariables: true` and `parseVariablesInString` (already present)
- [x] Move/Set Player Position use textinput + variables + parseFloat
- [x] pack:companion uses companion-module-build; manifest version 2.4.0
- [ ] Manual test: Play Track By ID with variable
- [ ] Manual test: Play Track In Context By ID with variables
- [ ] Manual test: Move/Set position with variable
