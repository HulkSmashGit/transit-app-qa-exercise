## Bug Report

**Bug 001**

**Title**: Android - Incorrect Work location suggestion prior to 6:00 AM

**Prerequisite**:
Fresh install with no Home or Work locations set.

**Description**:
When neither Home nor Work is configured, the app should suggest adding a Home location between 2:00 PM and 5:59 AM, and Work between 6:00 AM and 1:59 PM. Currently, the app incorrectly prompts for Work starting at 4:00 AM.

**Note**:
Please view attached screenshot.

**Steps to Reproduce**:

1. Launch the Transit App.
2. Set device time between 4:00 AM and 5:59 AM.
3. Reopen app and view suggested location.

**Expected Behaviour**:
The app should be displaying the Home location suggestion between 2:00 PM and 5:59 AM.

**Actual Behaviour**:
The app incorrectly displays the Work location suggestion starting at 4:00 AM.

**Environment**:

- Device: Samsung Galaxy S25 Ultra running Android 15
- App Version: 6.0.3

---

**Bug 002**

**Title**: Android - Incorrect Home location suggestion prior to 2:00 PM

**Prerequisite**:
Fresh install with no Home or Work locations set.

**Description**:
When neither Home nor Work is configured, the app should suggest adding a Home location between 2:00 PM and 5:59 AM, and Work between 6:00 AM and 1:59 PM. Currently, the app incorrectly prompts for Home starting at 1:00 PM.

**Note**:
Please view attached screenshot.

**Steps to Reproduce**:

1. Launch the Transit App.
2. Set device time to 1:00 PM.
3. Reopen app and view suggested location.

**Expected Behaviour**:
The app should be displaying the Work location suggestion between 6:00 AM and 1:59 PM.

**Actual Behaviour**:
The app incorrectly displays the Home location suggestion starting at 1:00 PM.

**Environment**:

- Device: Samsung Galaxy S25 Ultra running Android 15
- App Version: 6.0.3
