# Manual Test Cases - Transit App Location Suggestions

## Context

The Transit app suggests adding frequent destinations (home/work) based on time and user location. The suggestion logic follows these rules:

- **If user has neither work or home configured:**
  - Between 6:00 AM and 1:59 PM → Suggest adding **work**
  - Between 2:00 PM and 5:59 AM → Suggest adding **home**
- **If user has home configured, but no work, and user is at home** → Suggest adding **work**
- **If user has work configured, but no home, and user is at work** → Suggest adding **home**

---

## Test Case 1: Time-Based Suggestions for Users with No Configured Locations

**Objective**: Verify correct location suggestions based on time boundaries for users with neither home nor work configured

**Prerequisites**:

- User has neither home or work location configured
- User has location permissions enabled
- Device allows system time modification

**Test Steps**:

**Scenario A: Work Hours - Lower Boundary**

1. Set device time to 6:00 AM exactly
2. Open the Transit app
3. Navigate to main screen with search bar
4. Observe suggestion button/prompt

**Scenario B: Work Hours - Upper Boundary**

1. Set device time to 1:59 PM
2. Open the Transit app
3. Navigate to main screen with search bar
4. Observe suggestion button/prompt

**Scenario C: Home Hours - Lower Boundary**

1. Set device time to 2:00 PM exactly
2. Open the Transit app
3. Navigate to main screen with search bar
4. Observe suggestion button/prompt

**Scenario D: Home Hours - Upper Boundary**

1. Set device time to 5:59 AM
2. Open the Transit app
3. Navigate to main screen with search bar
4. Observe suggestion button/prompt

**Expected Results**:

- **6:00 AM (Scenario A)**: App suggests adding **work location**
- **1:59 PM (Scenario B)**: App suggests adding **work location**
- **2:00 PM (Scenario C)**: App suggests adding **home location**
- **5:59 AM (Scenario D)**: App suggests adding **home location**

**Status**:
Fail - View Bugs 001 and 002 in bugs.md

---

## Test Case 2: Location-Based Suggestions - Home Configured Only

**Objective**: Verify work location is suggested when user with only home configured is physically at home

**Prerequisites**:

- User has **home location configured** in app settings
- User has **no work location configured**
- User is physically present at configured home address
- Location permissions enabled and GPS accurate

**Test Steps**:

1. Configure home location in app settings
2. Verify work location is not configured (remove if present)
3. Travel to and remain at the configured home address
4. Confirm GPS shows current location matches home address
5. Open the Transit app
6. Observe suggestion button/prompt
7. Test this for every hour of the day

**Expected Result**:

- App displays suggestion to add **work location**
- Suggestion appears regardless of time of day
- Location detection overrides time-based logic

**Status**:
Pass

---

## Test Case 3: Location-Based Suggestions - Work Configured Only

**Objective**: Verify home location is suggested when user with only work configured is physically at work

**Prerequisites**:

- User has **work location configured** in app settings
- User has **no home location configured**
- User is physically present at configured work address
- Location permissions enabled and GPS accurate

**Test Steps**:

1. Configure work location in app settings
2. Verify home location is not configured (remove if present)
3. Travel to and remain at the configured work address
4. Confirm GPS shows current location matches work address
5. Open the Transit app
6. Observe suggestion button/prompt
7. Test this for every hour of the day

**Expected Result**:

- App displays suggestion to add **home location**
- Suggestion appears regardless of time of day
- Location detection overrides time-based logic

**Status**:
Pass

---

## Testing Notes

**Time Boundary Testing**: Critical edge cases are exactly 6:00 AM, 1:59 PM, 2:00 PM, and 5:59 AM. Test both sides of each boundary to verify inclusive/exclusive behavior.

**Device Time Modification**: Tests can be conducted by changing device system time rather than waiting for specific times of day.

**App State Management**: Between tests, wipe app data to maintain test isolation.

**Additional Edge Cases to Monitor**:

- Behavior when both home and work are configured (should show no suggestions)
- Behavior when location services are disabled
- Behavior when GPS cannot determine location accurately
- App behavior during time zone changes
