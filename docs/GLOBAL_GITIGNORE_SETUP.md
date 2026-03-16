# Optional: global gitignore for all projects

To have Git **everywhere** ignore these files (without editing each project’s `.gitignore`), use a global excludes file.

1. **Create the file** (if it doesn’t exist):
   ```bash
   touch ~/.gitignore_global
   ```

2. **Add these lines** to `~/.gitignore_global`:
   ```
   # Cursor IDE (local only)
   .cursor/

   # Internal / planning docs
   PRIVATE_FORK.md
   docs/PRIVATE_FORK.md
   *plan*.md
   *PLAN*.md
   docs/PR_*.md
   docs/PR_NEXT_STEPS.md
   docs/TESTING_*.md
   ```

3. **Tell Git to use it:**
   ```bash
   git config --global core.excludesfile ~/.gitignore_global
   ```

After that, any repo on this machine will ignore these patterns. To commit such files in a specific repo, use `git add -f path/to/file`.
