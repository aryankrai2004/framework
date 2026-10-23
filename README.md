# OrangeHRM Playwright framework

A small end-to-end test framework for the OrangeHRM demo site, built with
Playwright Test, TypeScript, and the Page Object Model (POM).

## Requirements

- Node.js 18 or newer
- npm

## Install

```powershell
npm.cmd install
npx.cmd playwright install chromium
```

## Playwright Test agents in VS Code

The workspace includes Playwright's planner, generator, and healer agents under
`.github/agents/`. Use the planner to explore the app and write a test plan in
`specs/`, the generator to create tests from that plan, and the healer to
investigate failing tests. The planner uses `tests/seed.spec.ts` to initialize
the app; it uses the shared workflow to sign in and open My Info.

In VS Code 1.105 or later, select the desired agent in the Chat agent picker.
The Playwright test MCP server is configured in `.vscode/mcp.json`. To refresh
the generated agent definitions after updating Playwright, run:

```powershell
npx.cmd playwright init-agents --loop=vscode
```

## Run tests

By default, tests open a visible Chromium window and run one at a time. Browser
actions are slowed down so you can follow the test flow.

```powershell
npm.cmd test
npm.cmd run test:headed
npm.cmd run test:ui
```

The browser closes when the test run finishes. To follow the run interactively
and control it step by step, use Playwright Inspector:

```powershell
npm.cmd run test:debug
```

The default base URL is `https://opensource-demo.orangehrmlive.com`. Override
it with `BASE_URL` if you need to target another environment. The valid-login test uses
the public demo credentials (`Admin` / `admin123`) by default; override them
with `ORANGEHRM_USERNAME` and `ORANGEHRM_PASSWORD` when needed.
The leave application test uses `CAN - Personal` and 30 October 2026 by
default; override these with `ORANGEHRM_LEAVE_TYPE` and
`ORANGEHRM_LEAVE_DATE` (`yyyy-dd-mm` format). Running that test submits a
persistent leave request to the configured OrangeHRM account.

For example, in PowerShell:

```powershell
$env:ORANGEHRM_USERNAME = "Admin"
$env:ORANGEHRM_PASSWORD = "admin123"
npm.cmd test
```

On Windows PowerShell, use `npm.cmd` and `npx.cmd` if script execution policy
blocks `npm.ps1` or `npx.ps1`. Alternatively, run the commands from Command
Prompt. This is a PowerShell execution-policy issue; it does not require
changing `tsconfig.json`.

## Project layout

```text
pages/
  DashboardPage.ts
  LeaveApplicationPage.ts
  LoginPage.ts
  PersonalDetailsPage.ts
workflows/
  OrangeHrmWorkflow.ts
tests/
  apply-leave.spec.ts
  login.spec.ts
  personal-details.spec.ts
  seed.spec.ts
specs/
  README.md
.github/agents/
  playwright-test-planner.agent.md
  playwright-test-generator.agent.md
  playwright-test-healer.agent.md
playwright.config.ts
tsconfig.json
```

## Framework structure

Tests are written as readable scenarios. They provide test data and call a
business workflow; they should not contain selectors, direct browser actions,
or page-specific assertions.

- `tests/` describes what a user or employee is trying to do.
- `workflows/OrangeHrmWorkflow.ts` coordinates end-to-end business activities
  across pages and adds named steps to the Playwright report.
- `pages/` contains page objects. Each page object owns its locators, UI
  actions, and checks for that page.

For example, a test calls `orangeHrm.updatePersonalDetails(employeeDetails)`.
The workflow handles signing in, navigating to My Info, saving the details,
and verifying the outcome; the page objects handle the OrangeHRM controls.
When adding a new scenario, add or reuse page actions first, coordinate them
in the workflow, then keep the spec focused on the scenario and its data.

The Playwright configuration enables failure screenshots, video, and traces;
the HTML report is written to `playwright-report/`. Open it with
`npm.cmd run report`.

## GitHub Actions CI

The workflow at `.github/workflows/ci.yml` runs on pull requests targeting
`master` and pushes to `master`. It installs dependencies and Chromium,
type-checks the project, runs the Chromium Playwright login and Personal
Details tests in headless mode, and uploads test artifacts.

To require successful CI before merging, enable branch protection or a
repository ruleset for `master` in GitHub and require the
`Type-check and Playwright tests` status check.
