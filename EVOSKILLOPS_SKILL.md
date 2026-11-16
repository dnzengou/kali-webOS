# EvoSkillOps — AI Development Evolution Skill
## Version 1.0 · Portable · LLM-Agnostic · Pairs with DEVFLOW_SKILL.md

> A command-driven discipline for keeping an evolving repository healthy
> under continuous AI-assisted work — grounded in patterns surfaced across
> a working session, not aspirational best-practice.
> Works with: Claude (Code), GPT-4/o, Gemini, Mistral, local LLMs.
> Use as a skill file, system prompt prefix, or context injection.
> **Pair with [DEVFLOW_SKILL.md](DEVFLOW_SKILL.md)** — DevFlow is the per-feature
> loop (B/I/Im/E/C/Bl/P/D); EvoSkillOps is the between-feature discipline
> that keeps PR, branch, and CI state from decaying.

---

## WHEN TO LOAD THIS SKILL

Load EvoSkillOps when any of these are true:

- Open PR count is ≥ 5 (any ecosystem)
- One or more PRs have been open > 7 days
- CI has had the same red check ≥ 3 pushes in a row
- The team's attention has been off this repo for ≥ 2 weeks
- A new release is being prepared and the backlog has not been triaged

DevFlow (B/I/Im/E/C/Bl/P/D) assumes you're writing code into a known-good
baseline. When the baseline itself has decayed, run EvoSkillOps first.

---

## COMMAND REFERENCE

| Command | Full Name              | One-Line Description |
|---------|-----------------------|----------------------|
| `Evo`   | Evolve                | Survey live state; surface the single highest-leverage intervention |
| `Un`    | Unify                 | Fold N stale PRs into one consolidated PR off latest `main` |
| `FxC`   | Fix Critical          | Prod-bundle security sweep — direct bumps, overrides, CI scope match |
| `Op`    | Ops                   | Clean up: close superseded PRs, delete merged branches, tune Dependabot/Renovate |
| `Dc`    | Decision              | Record an accepted-risk decision with reason + evidence |
| `MC`    | Mutation Candidate    | Propose a new rule for this skill's own evolution |
| `Es`    | EvoSkill              | Capture a session's surfaced pattern as a repeatable discipline note |
| `AuA`   | Audit Ambient         | Separate "caused by this PR" red from "ambient on `main`" red |

**Combination syntax:** `Evo+Un+FxC+Op` runs commands left-to-right.
**Pipeline alias:** `evo-full` = `Evo+AuA+Un+FxC+Op+Es+MC`

---

## COMMAND SPECIFICATIONS

### Evo — Evolve
**Purpose:** Audit live state across PRs, branches, and CI; return the single
highest-leverage next move (not a plan — one move).

**Steps:**
1. List open PRs (count + oldest), stale branches with no PR, red CI checks on `main`.
2. Classify each red check: **PR-caused** (diff would plausibly produce it) vs **ambient** (reproduces on `main`).
3. Rank interventions by leverage:
   - A single `Un`-fold that collapses N stale PRs is leverage = N.
   - A single `FxC` that clears a CI red that is blocking M PRs is leverage = M.
   - A per-PR fix is leverage = 1.
4. Return exactly one intervention + why. Do not plan further.

**Quality gates:**
- Surfaces one move, not a backlog.
- Says explicitly whether the problem is PR-local or ambient.

---

### Un — Unify
**Purpose:** Fold N stale PRs — often but not only Dependabot bumps — into
one consolidated PR, so review-cost is paid once instead of N times.

**Trigger rule:** `FIRST-CI-BURST-CHRONIC-DETECTION` — see §Disciplines.

**Steps:**
1. Pick a new branch off latest `origin/main` (e.g. `claude/unify-and-security`).
2. Cherry-pick each stale PR's non-merge commit onto the new branch, in
   oldest-first order. Preserve the original author line.
3. If cherry-pick conflicts: resolve in favor of the newer change, note the
   decision in the commit body.
4. Add any critical fixes the unified set requires (see `FxC`).
5. Open ONE consolidated PR; link it from each superseded PR via a short
   "superseded by #N — cherry-picked verbatim" comment, then **close** the
   superseded PR (don't delete the branch — let auto-delete-head-branches
   or the maintainer do that).

**Quality gates:**
- Diff is reviewable in a single pass (<400 lines excl. lockfile).
- Each superseded PR has a close comment that names the unifying PR by
  number.
- Original authors remain visible in `git log --author`.

**Anti-pattern:** mega-PRs that mix unrelated streams (feature +
dependabot + security). `Un` is for THREADED streams that share a scope.

---

### FxC — Fix Critical
**Purpose:** Make the production bundle clean against the project's defined
severity threshold without breaking the dev inner loop.

**Steps:**
1. Run the production audit: `npm audit --omit=dev --audit-level=high`
   (or ecosystem equivalent). This is the **ground-truth gate**.
2. For each direct production dep flagged: bump the pinned range to the
   smallest version that clears the CVE.
3. For transient dep CVEs (not reachable by direct bump): add a package.json
   `overrides` entry pinning the fixed version.
4. For dev-only CVEs with no fix available: add a `Dc` (Decision) entry
   accepting the risk. Scope the CI gate to match (`--omit=dev` on the audit;
   `exit-code: 0` on scanners that duplicate the gate).
5. Verify: production audit returns zero findings at the threshold.
6. **Do not** run `npm audit fix --force` without reading each breaking
   change first — the force flag's reasoning is per-pkg and often wrong.

**Quality gates:**
- Production audit at project threshold → 0 findings.
- No new breaking changes in direct deps (lockfile-only install stays
  green on `npm run check`).
- Each override has a one-line comment or `Dc` entry naming the CVE it
  pins against.

---

### Op — Ops
**Purpose:** Clean up PRs and branches after a merge wave; tune automated
dep bumps for the next window.

**Steps:**
1. Close any PR still showing "superseded" without actually being closed.
2. Delete merged branches that didn't auto-delete (requires maintainer
   access; a session with proxy-blocked `DELETE /git/refs` must flag the
   list rather than retry).
3. Tune `.github/dependabot.yml` (or Renovate equivalent):
   - Move high-churn ecosystems to **monthly**.
   - Ignore `semver-patch` globally (security patches still fire).
   - Restrict dev-dep groups to `minor`+`major` (patch is noise).
   - Tighten `open-pull-requests-limit` to actual review capacity.
4. For each dependency with a known-no-upstream-fix (e.g. `braces` via
   `tailwindcss <=3.4.19`), add an `ignore` entry with a `# reason:`
   comment referencing the Decision Log.

**Quality gates:**
- No open PR without a next-step (merge / close / assigned reviewer).
- No branch without an open PR, unless maintainer-opted (e.g.
  release-branches).
- Dependabot/Renovate config limits the maximum N-stale under steady state
  to the team's actual pacing.

---

### Dc — Decision
**Purpose:** Record an accepted-risk or structural choice so future
sessions don't re-litigate it.

**Format (one entry per decision; append-only):**

```markdown
### Dc-NN · <short title> — <YYYY-MM-DD>

**Context.** <one sentence on the state that forced the choice>
**Decision.** <what we chose, in one line>
**Rejected alternatives.** <bullets of what we didn't pick + one-line why>
**Trigger to revisit.** <condition under which this should be re-opened>
**Links.** PR #, CVE id, upstream issue, etc.
```

**Where it lives:** `BUILD_BLUEPRINT.md` §Decisions, or (if size grows)
`DECISIONS.md` at repo root.

**Example:**

```markdown
### Dc-01 · Trivy fs + container → report-only — 2026-10-04

**Context.** PR #30 CI stayed red on Trivy fs + container after prod audit went
clean. Both scanners duplicate the `npm audit --omit=dev` gate and
additionally flag dev-only chains (braces via tailwind 3.4.19, moment via
obsidian 0.14.6+) and Rust transitive CVEs in src-tauri — none of which
are a shipped-code risk.
**Decision.** Switch both Trivy jobs to `exit-code: "0"` (report to GitHub
Security tab via SARIF, don't block merge).
**Rejected alternatives.**
- `.trivyignore` per-CVE: brittle, drifts with Trivy DB.
- Upgrade tailwindcss to 4.x: breaking, out of scope for a security PR.
- `--skip-dirs`: hides src-tauri findings that we DO want visible.
**Trigger to revisit.** Trivy adds a native `--omit=dev` or SARIF-only
mode that gates on prod-only HIGH+ findings.
**Links.** PR #30, Dc-01.
```

**Quality gates:**
- Every accepted-risk override, every CI exit-code=0, and every
  `--omit=dev` scoping choice has a matching Dc entry.
- `Trigger to revisit` is a concrete condition, not "when we have time."

---

### MC — Mutation Candidate
**Purpose:** Propose a new rule for THIS skill — meta-evolution. If a pattern
fired twice in two sessions, consider promoting it to a Discipline.

**Format (append to §Mutation Candidates below):**

```markdown
### MC-NN · <rule name> — <YYYY-MM-DD>

**Observed in.** <session or PR numbers>
**Pattern.** <what keeps happening>
**Proposed rule.** <when to fire + what to do>
**Promote to Discipline?** <yes / no + reason>
```

---

### Es — EvoSkill
**Purpose:** Promote a Mutation Candidate that has survived observation
into a Discipline. Edit this file (§Disciplines) and bump the version
header at top.

**Steps:**
1. Pick an MC with ≥ 2 confirmed firings.
2. Write the Discipline rule in the standard form (name · trigger · action
   · exit condition).
3. Remove the MC entry.
4. Bump this skill's version (semver: patch for clarification, minor for
   new rule, major for removed rule).

---

### AuA — Audit Ambient
**Purpose:** Prevent chasing phantom bugs. Decide whether a CI red is
caused by the PR under review or is already-broken on `main`.

**Steps:**
1. For each failing check on a PR, re-run (or check the latest run of) the
   same job on `main`.
2. If the job fails on `main` too → **ambient**, do not block the PR.
3. If the job fails only on the PR → **PR-caused**, fix in-PR.
4. Document ambient reds that persist as a Dc entry so they don't surface
   again.

**Quality gate:** No PR is blocked on an ambient red without the author
and reviewer explicitly agreeing to pre-fix it in that PR.

---

## DISCIPLINES

Rules that have graduated out of Mutation Candidates. Each has: **name ·
trigger · action · exit condition**.

### D-01 · FIRST-CI-BURST-CHRONIC-DETECTION
**Trigger.** N > 3 Dependabot/Renovate PRs open > 7 days after the
dependency-update window was announced or expected.
**Action.** Run `Un` (fold them) and `Op` (tune automation to prevent
recurrence).
**Exit.** Open PR count returns to ≤ 2 and the automation config caps the
steady-state at that count.
**First surfaced.** Closed PR #16 cascade audit.

### D-02 · SCAN-SCOPE-MATCH
**Trigger.** Any CI gate's severity report doesn't match the shipped-code
risk model (e.g. `npm audit` includes dev deps; Trivy flags src-tauri
Rust CVEs for a web deploy).
**Action.** Scope the gate: `--omit=dev` for npm audit; `exit-code: 0`
for scanners whose findings belong in the Security tab, not the merge
gate. Add a Dc entry.
**Exit.** The gate's green/red state tracks the shipped-code risk.

### D-03 · SUPERSEDE-PATTERN
**Trigger.** You open a PR whose diff supersedes one or more existing open
PRs.
**Action.** On each superseded PR: post a short comment naming the new PR
("Superseded by #N — cherry-picked verbatim") and set state → closed. Do
not delete the branch; let auto-delete-head-branches or the maintainer do
it.
**Exit.** Each superseded PR is in state `closed`, carries one explanatory
comment, and preserves its original author in `git log`.

### D-04 · AMBIENT-RED-NON-BLOCKING
**Trigger.** A CI red on a PR is reproduced on `main` by the same job
(see `AuA`).
**Action.** Do not add fixes to that PR for the ambient red. If the ambient
red matters, open a separate PR targeting it; otherwise record it in Dc.
**Exit.** The red either becomes PR-caused (and gets fixed) or becomes a
Dc entry.

### D-05 · PROD-AUDIT-IS-GROUND-TRUTH
**Trigger.** Multiple security scanners disagree on what blocks a merge.
**Action.** Treat `<package-manager> audit --omit=dev --audit-level=<team
threshold>` as the single blocking gate. Everything else reports (`Dc-01`
pattern).
**Exit.** One blocking gate; others upload findings to the Security tab.

---

## MUTATION CANDIDATES

Rules under observation. Promote to a Discipline (via `Es`) after ≥ 2
confirmed firings.

### MC-01 · UNIFY-OVER-REBASE
**Observed in.** PR #30 (fold of #10, #29) — unifying was lower-cost than
rebasing each PR individually onto a security-fix PR, because each would
have needed its own security-fix merge.
**Pattern.** When N PRs are blocked on the same ambient red, the cost to
unblock each individually is N × (merge + CI + re-review); the cost to
unify them is 1 × that.
**Proposed rule.** When N > 2 PRs are blocked on the same ambient CI red,
prefer `Un` + inline the fix, over per-PR rebases.
**Promote to Discipline?** Wait for one more firing in a different repo
shape (e.g. a monorepo with workspace PRs) before promoting.

### MC-02 · LOCKFILE-ONLY-REGENERATES-WORKSPACES
**Observed in.** PR #30 — `npm install --package-lock-only` left workspace
`node_modules/<pkg>` entries pinned at the pre-override version even
after root overrides were applied; required a scripted scrub of stale
workspace lockfile entries + a second lockfile-only install.
**Pattern.** `npm install --package-lock-only` with aggressive overrides
can leave orphaned workspace entries in the lockfile.
**Proposed rule.** After adding overrides, scrub stale workspace
`node_modules/<pkg>` entries and re-run `--package-lock-only
--legacy-peer-deps`. Verify with: paths-of-pkg-X across the lockfile
return a single hoisted entry.
**Promote to Discipline?** Not yet — this may be a transient npm bug
(seen on npm 10.x). Re-test on npm 11.

---

## PIPELINE ALIASES

### `evo-full` = `Evo+AuA+Un+FxC+Op+Es+MC`

Full between-feature maintenance sweep. Order matters:

1. **Evo** — see what's actually there (not what you remember).
2. **AuA** — classify reds before you touch anything.
3. **Un** — collapse stale PR count.
4. **FxC** — make the production audit clean so the unified PR goes green.
5. **Op** — clean up branches + automation config for the next window.
6. **Es** — promote any MCs that fired this round into Disciplines.
7. **MC** — capture any new patterns surfaced this round.

Expected cadence: once per release, or when any `Evo` trigger fires (see
§WHEN TO LOAD THIS SKILL).

---

## INTEGRATION NOTES

### With DevFlow (B/I/Im/E/C/Bl/P/D)

- `Bl` (Blueprint) is the per-feature architectural note. `Dc` (Decision)
  is the per-decision log. They are additive, not alternatives.
- `E` (Evaluate) catches issues in the PR under review. `AuA` catches
  issues already on `main` that are being blamed on the PR.
- `CI` (Continuous Improve pipeline) is the per-feature full loop.
  `evo-full` is the between-feature full loop.

### With Dependabot / Renovate

- EvoSkillOps assumes an automation-driven dep landscape. If you're on
  manual deps, swap `Op`'s dependabot.yml tuning for your actual process.

### With a monorepo / workspaces

- `Un` cherry-picks preserve workspace boundaries; conflicts between
  workspaces during a unify fold are a signal to split into two unified
  PRs, one per boundary.
- `FxC` overrides go on the root `package.json` for npm workspaces;
  per-workspace direct bumps still happen in-situ.

---

## VERSION HISTORY

- **1.0 — 2026-10-23** · Initial release. Commands: Evo, Un, FxC, Op, Dc,
  MC, Es, AuA. Disciplines: D-01…D-05. Mutation Candidates: MC-01, MC-02.
  Grounded in session work culminating in PR #30 (unify + security + Trivy
  report-only).
