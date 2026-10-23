# Apply Leave

## Application overview

The OrangeHRM Leave module lets an authenticated employee submit a leave
request by selecting a leave type and date range.

## Test scenario

### Submit a one-day leave request

**Seed:** `tests/seed.spec.ts`

**Preconditions:**

- Log in with an account that can apply for leave.
- The selected leave type is available and has a balance of at least one day.
- The requested date is in the future and is not blocked by an existing request.

**Steps:**

1. Log in to OrangeHRM.
2. Open the Leave module and choose Apply.
3. Select `CAN - Personal` (or the leave type configured for the test).
4. Confirm the displayed leave balance is at least one day.
5. Enter `2026-30-10` in both date fields (`yyyy-dd-mm`, or 30 October 2026).
6. Click Apply.

**Expected results:**

- The Apply Leave page displays its leave type, date, comments, and Apply
  controls.
- The selected leave type and both date values are visible in the form, and
  Apply is enabled before submission.
- The form accepts the leave type and date range.
- OrangeHRM displays the `Successfully Saved` confirmation.
- The request is created for the signed-in employee.
- The request appears in My Leave with `Pending Approval` status.

**Notes:**

- The test creates a persistent leave request in the demo account when run.
- To avoid duplicate requests, the test checks My Leave first and verifies an
  existing matching pending request instead of submitting the same dates again.
- Override `ORANGEHRM_LEAVE_TYPE` or `ORANGEHRM_LEAVE_DATE` for a different
  account or date. The date format is `yyyy-dd-mm`.
- The test checks the balance before submitting and fails without clicking
  Apply if fewer than one day is available.
- If OrangeHRM displays `No Leave Types with Leave Balance`, the test is
  reported as skipped because the account cannot exercise the submission flow.
