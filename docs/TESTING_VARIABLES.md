# Testing variable inputs

Use this while verifying variable support before opening the companion-module PR.

## Two track actions

| Action | What it does | Fields that accept variables |
|--------|----------------|------------------------------|
| **Play Track By ID** | Starts playback of a single track by Spotify track ID (e.g. `spotify:track:xxx`). | **Track ID** |
| **Play Track In Context By ID** | Plays a specific track inside a context (playlist or album). | **Track ID**, **Context ID** (playlist/album ID) |

Both resolve variables at the time the button is pressed, then send the resolved values to spotify-controller.

## How to test

1. **Play Track By ID**
   - Create a variable (e.g. in a Google Sheets module or internal variable) that holds a full track ID, e.g. `spotify:track:4iV5W9uYEdYUVa79Axb7Rh`.
   - In Companion, add the action **Play Track By ID** and set Track ID to `$(yourmodule:yourvariable)`.
   - Trigger the action; the resolved track should play.

2. **Play Track In Context By ID**
   - Use two variables (or one variable and one fixed ID): one for the track ID, one for the context (e.g. playlist ID `spotify:playlist:xxx` or album ID `spotify:album:xxx`).
   - Set **Track ID** and **Context ID** to your variable expressions.
   - Trigger the action; the track should play in that playlist/album context.

3. **Move Player Position / Set Player Position**
   - Set Seconds to a variable (e.g. `$(internal:some_number)` or a cell that contains a number).
   - Trigger the action; seek/position should use the resolved value (in seconds).

## If something doesn’t resolve

- Confirm the variable exists and has a value in Companion’s variable list.
- In the module config, enable **Verbose** and check the log when you press the button to see what’s being sent.
