# Private fork – track our changes

You have **two separate repos** in this workspace. Do the following for each one you want in a private fork.

---

## 1. Create the private repo on GitHub

- Go to [GitHub → New repository](https://github.com/new).
- **Repository name:** e.g. `spotify-controller` (for the app) or `companion-module-techministry-spotifycontroller` (for the module).
- Set visibility to **Private**.
- **Do not** add a README, .gitignore, or license (you already have a local repo).
- Create the repo and copy its URL, e.g. `https://github.com/YOUR_USER/spotify-controller.git`.

Repeat for the companion module if you want a separate private fork for that too.

---

## 2. Spotify-controller (Electron app)

**From the project root** (not inside `companion-module/`):

```bash
cd /Users/tom/Documents/Claude/companion-module-techministry-spotifycontroller

# Rename current origin to upstream (keeps link to original repo)
git remote rename origin upstream

# Add your new private repo as origin
git remote add origin https://github.com/YOUR_USER/spotify-controller.git

# Push your branch to the private fork (creates it on GitHub)
git push -u origin main
```

If you use a different branch name (e.g. `our-changes`), push that instead:

```bash
git push -u origin our-changes
```

Later, to pull updates from the original repo:

```bash
git fetch upstream
git merge upstream/main
```

---

## 3. Companion module

**From the companion-module folder:**

```bash
cd /Users/tom/Documents/Claude/companion-module-techministry-spotifycontroller/companion-module

git remote rename origin upstream
git remote add origin https://github.com/YOUR_USER/companion-module-techministry-spotifycontroller.git

git push -u origin main
```

Same idea: use your real GitHub username and repo URL. To pull from the original later: `git fetch upstream` then `git merge upstream/main`.

---

## 4. Summary

| Repo              | Original (upstream)                    | Your private fork (origin)     |
|-------------------|----------------------------------------|---------------------------------|
| spotify-controller| josephdadams/spotify-controller         | YOUR_USER/spotify-controller    |
| companion-module  | bitfocus/companion-module-techministry-spotifycontroller | YOUR_USER/companion-module-techministry-spotifycontroller |

After this, `git push` and `git pull` use your private repo. Use `upstream` when you want to fetch or merge from the original project.
