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
  LoginPage.ts
  PersonalDetailsPage.ts
tests/
  login.spec.ts
  personal-details.spec.ts
playwright.config.ts
tsconfig.json
```

Page objects keep UI locators and interactions separate from test scenarios.
The Playwright configuration enables failure screenshots, video, and traces;
the HTML report is written to `playwright-report/`. Test actions use named
Playwright steps and print started/completed messages, so the workflow is easy
to follow in the terminal and report. The valid-login test also opens
**My Info** and asserts that the authenticated **Personal Details** page is
visible. The Personal Details test updates the employee name, employee ID,
nationality, marital status, and gender, asserts the **Successfully Updated**
confirmation, and verifies the values remain saved after a page reload.

## GitHub Actions CI

The workflow at `.github/workflows/ci.yml` runs on pull requests targeting
`master` and pushes to `master`. It installs dependencies and Chromium,
type-checks the project, runs the Chromium Playwright login and Personal
Details tests in headless mode, and uploads test artifacts.

To require successful CI before merging, enable branch protection or a
repository ruleset for `master` in GitHub and require the
`Type-check and Playwright tests` status check.
