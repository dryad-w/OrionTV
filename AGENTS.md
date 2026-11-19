# OrionTV Agent Guide

This file applies to the entire repository. Follow it in addition to any
more specific `AGENTS.md` found in a subdirectory.

## Project Context

OrionTV is an Expo and React Native TV application targeting Android TV,
Apple TV, mobile, and tablet. The primary interaction model is a TV remote,
so focus order, directional navigation, and predictable initial focus are
product requirements rather than visual polish.

Use the existing architecture and conventions:

- Expo Router screens live in `app/`.
- Shared and TV-specific components live in `components/`.
- Zustand stores live in `stores/`.
- API and persistence integrations live in `services/`.
- Reusable hooks live in `hooks/`.
- Tests live beside the relevant area in `__tests__/`.

## Non-Negotiable Rules

1. **Commit every completed code change.**
   - Do not finish a task with uncommitted files you created or modified.
   - Create one or more focused commits after implementation and verification.
   - Commit only files related to the task. Leave unrelated user changes
     untouched and uncommitted.
   - If the user explicitly asks not to commit, that instruction overrides
     this rule for that task.
   - If a required commit cannot be created, report the exact blocker.

2. **Preserve existing work.**
   - Never discard, reset, or overwrite unrelated changes.
   - Read a dirty file before editing it and work with the existing changes.
   - Use non-interactive Git commands.

3. **Keep changes scoped.**
   - Prefer the smallest code change that satisfies the request.
   - Reuse existing components, stores, utilities, and focus patterns.
   - Do not refactor unrelated code or add dependencies without a concrete
     need.

4. **Verify before committing.**
   - Run the narrowest relevant tests or checks first.
   - Run broader checks when shared behavior or multiple modules are touched.
   - Report pre-existing failures separately from regressions caused by the
     change.

5. **Do not create or start emulators without explicit permission.**
   - Reuse an already-running TV emulator or simulator for debugging when one
     is available.

## Standard Workflow

1. Inspect repository state:

   ```bash
   git status --short
   git branch --show-current
   ```

2. Read the relevant implementation and tests before editing.

3. Make the scoped change using existing project patterns.

4. Run verification appropriate to the change:

   ```bash
   npx eslint <changed-files>
   yarn typecheck
   yarn test-ci --runInBand
   ```

5. For TV interaction, focus, remote-control, or layout changes, inspect an
   already-running device:

   ```bash
   adb devices -l
   xcrun simctl list devices booted
   ```

   If `adb` is not on `PATH`, use
   `$ANDROID_HOME/platform-tools/adb`. For Android TV, verify the app package
   with:

   ```bash
   adb shell pm list packages | rg -i orion
   adb shell dumpsys window | rg "mCurrentFocus|mFocusedApp"
   ```

   Debug the actual focus path using remote key events and runtime logs:

   ```bash
   adb shell input keyevent DPAD_UP
   adb shell input keyevent DPAD_DOWN
   adb shell input keyevent DPAD_CENTER
   adb logcat -d | rg ReactNativeJS
   ```

   Do not boot a new emulator if none is running unless the user asks for it.

6. Review the diff and commit:

   ```bash
   git diff --check
   git diff
   git add <task-files>
   git commit -m "<type>: <summary>"
   ```

7. Confirm the final worktree state with `git status --short`.

## Commit Convention

Use Conventional Commit-style messages consistent with repository history:

- `feat: ...` for user-visible functionality
- `fix: ...` for bug fixes and behavioral corrections
- `perf: ...` for performance improvements
- `refactor: ...` for behavior-preserving structural changes
- `test: ...` for test-only changes
- `chore: ...` for tooling, metadata, or maintenance

Keep commits focused. Do not include unrelated files merely to make the
worktree clean.

## TV Interaction Requirements

- Support TV remote direction keys and select actions.
- Use `hasTVPreferredFocus` for initial/preferred focus where appropriate.
- Combine `hasTVPreferredFocus` with an explicit ref-based `focus()` when
  asynchronous rendering or credential loading affects focus timing.
- Avoid calling focus methods intended for TV on mobile or tablet unless the
  behavior is explicitly safe there.
- Preserve focus when controls appear, disappear, or change disabled state.
- Ensure text and controls remain visible and do not overlap across TV,
  tablet, and mobile layouts.
- Validate both the "no saved credential" and "saved credential" paths when
  changing login or modal focus behavior.

## Verification Notes

- `yarn typecheck` currently includes test files; if it fails only on known
  pre-existing test typing issues, record those exact failures.
- `yarn test-ci --runInBand` requires the existing theme snapshot to match the
  current dark theme configuration. Do not update unrelated snapshots unless
  the task changes that component's expected appearance.
- Native TV behavior cannot be fully validated by unit tests. Use an existing
  TV emulator for focus and remote-control changes when available.

## Repository Hygiene

- Do not commit generated build output, coverage changes, local screenshots,
  emulator data, or temporary files.
- Do not add documentation files unless the user explicitly asks for them.
- Keep source files ASCII unless the surrounding file already uses non-ASCII
  text or Chinese UI copy requires it.
