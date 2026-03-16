# PR next steps (don’t push yet)

Two separate PRs live in two different repos. Do each in its own branch and repo.

---

## 1. PR for **spotify-controller** (Electron app)

**Repo:** `josephdadams/spotify-controller`  
**Branch suggestion:** `fix/volume-and-queue` or `feature/system-volume-and-reliability`

**Files to stage (from project root, not inside companion-module):**

```bash
cd /Users/tom/Documents/Claude/companion-module-techministry-spotifycontroller
git add api.js package.json util.js .gitignore
# optional: git add yarn.lock  (if you want to lock deps)
# do NOT add: companion-module/ dist/
```

**PR body:** Copy from `docs/PR_spotify-controller.md`.

**If this folder is the spotify-controller repo:** The root is the app; `companion-module/` is a separate clone. Only commit the files listed above.

---

## 2. PR for **companion-module** (Companion module)

**Repo:** `bitfocus/companion-module-techministry-spotifycontroller`  
**Branch suggestion:** `feature/variable-support-and-packaging` or `fix/variables-and-build`

**Files to stage (from inside companion-module):**

```bash
cd /Users/tom/Documents/Claude/companion-module-techministry-spotifycontroller/companion-module
git add src/actions.js package.json companion/manifest.json .gitignore
git add scripts/pack-for-companion.sh   # optional, legacy pack script
# do NOT add: node_modules/ pkg/ *.tgz techministry-spotifycontroller-*.tgz
```

**PR body:** Copy from `docs/PR_companion-module.md` (in the parent folder: `../docs/PR_companion-module.md`).

**Variable testing:** Use `docs/TESTING_VARIABLES.md` (in parent folder) to test **Play Track By ID** and **Play Track In Context By ID** (and position actions) with variables before you push.

---

## Quick reference: two track actions

| Action | Variable fields |
|--------|------------------|
| **Play Track By ID** | Track ID |
| **Play Track In Context By ID** | Track ID, Context ID (playlist/album) |

Both already use `useVariables: true` and `parseVariablesInString`; just confirm with a real variable (e.g. from a sheet or internal variable) before merging.
