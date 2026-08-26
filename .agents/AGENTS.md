# Workspace Agent Rules & Guidelines

## 1. Universal Automatic Skill Activation Protocol
The workspace has access to a comprehensive library of specialized agent skills (Global, Superpowers, Science, UI/UX, and Customizations). Before executing ANY user request or coding task, the agent MUST automatically identify and activate the relevant skill(s) across the entire ecosystem:

### 📚 Comprehensive Skill Ecosystem & Semantic Mapping:
1. **Frontend, UI/UX & Styling:**
   - `frontend-ui-engineering`: Production UI architecture, accessible components, clean design systems.
   - `ui-ux-pro-max`: Advanced UX patterns, layout aesthetics, and design craft.
2. **Software Architecture, Interface & Spec:**
   - `api-and-interface-design`: Module boundaries, public APIs, strict type contracts.
   - `spec-driven-development`: Capability mapping, domain models, and specs.
   - `source-driven-development`: Grounding decisions in official framework documentation.
3. **Logic Implementation & Testing:**
   - `test-driven-development`: Red-Green-Refactor, automated test coverage before code.
   - `doubt-driven-development`: Adversarial review of critical logic & assertions.
4. **Debugging, Recovery & Diagnostics:**
   - `systematic-debugging` / `debugging-and-error-recovery`: Root-cause analysis before fixing.
   - `observability-and-instrumentation`: Production metrics, telemetry, and structured logging.
5. **Code Refactoring & Quality:**
   - `code-simplification`: Eliminating bloat, enhancing readability and maintainability.
   - `code-review-and-quality`: Multi-axis code reviews and quality audits.
6. **Ideation, Brainstorming & Requirements:**
   - `brainstorming`: Divergent thinking and exploration before implementation.
   - `interview-me` / `idea-refine`: Clarifying underspecified user intent.
7. **Planning & Multi-Agent Execution:**
   - `writing-plans` / `planning-and-task-breakdown`: Creating step-by-step implementation plans.
   - `executing-plans` / `subagent-driven-development`: Disciplined plan execution with review gates.
8. **Performance, Hardening & Release:**
   - `performance-optimization`: Frontend rendering, memory, query, and bundle optimization.
   - `security-and-hardening`: Input validation, session management, and vulnerability hardening.
   - `ci-cd-and-automation` / `shipping-and-launch`: Release preparation and deployment pipelines.
9. **Git & Workspace Control:**
   - `git-workflow-and-versioning` / `using-git-worktrees` / `finishing-a-development-branch`.
10. **Verification & Completion:**
    - `verification-before-completion`: Mandatory automated test verification before claiming completion.
11. **Scientific, Life Sciences & Biological Databases:**
    - `pubmed_database`, `literature_search_*`, `ncbi_sequence_fetch`, `uniprot_database`, `protein_sequence_*`, etc.

### ⚡ Mandatory Execution Steps:
1. **Automatic Skill Selection**: Select 1–2 best matching skills from the entire ecosystem for every turn.
2. **Mandatory SKILL.md Reading (`view_file`)**: Read the relevant `SKILL.md` before drafting plans or writing code.
3. **Explicit Notification**: Inform the user of the active skill being applied and the rationale.

## 2. Browser Verification Protocol
Do NOT perform browser verification subagents (`browser_subagent`) or capture browser screenshots automatically after completing tasks, UNLESS explicitly requested by the user. Rely on terminal build/typecheck commands (`npx tsc --noEmit`, `npm run build`, `npx vitest run --pool=forks`, etc.) for code validation instead.

## 3. Strict Execution Protocol
1. **Mandatory Confirmation**: You MUST ALWAYS ask for user (Wisman) confirmation and approval before executing any plan, making any code changes, or performing refactoring (even if minor). DILARANG KERAS mengeksekusi secara sepihak.
2. **Implementation Plan Requirement**: Use the Planning Mode workflow (create `implementation_plan.md` artifact) and wait for the user to say "Approved" or "Proceed" before taking any destructive/modifying action on the source code.
3. **Produksi vs Lab Boundary**: The separation between Produksi and Lab domains is strictly established as per the PDF documentation. 
   - Produksi modules (e.g. `produksiBroodstock.ts`, `produksiRearing.ts`) handle data entry that originates from Petugas Produksi.
   - Lab modules (`lab.ts`) handle microbiological, PCR, and pathogen data from the Laboratory.
   - Verified 100% compliant. Do NOT randomly add/guess parameters without consulting the PDF source of truth.


