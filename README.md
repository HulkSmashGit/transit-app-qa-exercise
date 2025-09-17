# Transit App E2E Tests

## My Approach to This Project

As I mentioned in the interview, I'm a manual QA at heart. But I know exactly what I want automated and how it should work. Every test case, every scenario, and every validation in this project came from my head. I told Claude AI precisely what needed to happen, and together we built these automated tests.

While I may not write the code myself, I understand the logic, I designed the test strategy, and I made every decision about what to test and how to handle edge cases. The code is just the implementation of my ideas.

## What These Tests Do

The exercise specified three test scenarios to implement:

1. **Basic Trip Search**: Plan a trip from 5333 Casgrain Avenue to 1321 Rue Ste-Catherine O, make sure walking options show up
2. **Arrive By Time**: Same route but arriving by 12:00 PM, checking for at least 3 transit options
3. **Error Handling**: Try Montreal to Toronto and confirm it shows "You're going too far!"

My contribution was figuring out how to make these work reliably in the real world.

## Getting This Running

You'll need Node.js installed (version 14 or newer should work fine).

First, get the dependencies:

```bash
npm install
```

Then install the browsers Playwright needs:

```bash
npx playwright install
```

## Running the Tests

To see the tests actually running in a browser window:

```bash
npx playwright test tests/transit-trip-planner.spec.ts --headed
```

## Why I Chose This Tech Stack

I went with TypeScript + Playwright because:

- **It handles modern web apps properly** - Transit apps are dynamic and load content asynchronously, so I needed something that could wait for things to actually load
- **Cross-browser testing** - Users don't all use the same browser, so tests should work everywhere
- **Type safety** - Even though I don't code, I understand that catching errors before running tests saves time
- **Built-in screenshots and logging** - When tests fail, I want to see exactly what went wrong
- **Industry standard** - I researched what real QA teams use for this kind of testing

## How I Structured This

I insisted on using a Page Object Model approach. Here's why that made sense to me:

The `TripPlannerPage` class contains all the ways to interact with the Transit app - finding elements, clicking buttons, filling forms. This means:

- If the UI changes, we only fix the locators in one place
- Each test focuses on what it's testing, not how to click buttons
- It's easier to add new tests because the building blocks already exist

This wasn't the programmer's idea - I specifically asked for this structure because I've seen how maintenance becomes a nightmare when every test duplicates the same interactions.

## What You Get After Running Tests

I made sure every test run produces useful artifacts in the `test-results/` folder:

- **Screenshots** with clear naming: `Test 1 - Happy Path - Pass - 2025-09-17.png`
- **URL logs** that track where each test ended up, with timestamps

When something goes wrong, you'll have visual proof and can trace exactly what happened.

## The Real-World Challenges I Planned For

I specifically thought through the problems these tests would face:

### Calendar Date Selection

The exercise specifies arriving by 12:00 PM, but doesn't mention which day. I realized that if you run the test after noon on the same day, the 12:00 PM option will not be available. So I had Claude code it to always try selecting tomorrow's date first, then fall back to today if needed.

I also told Claude to build multiple fallback approaches because I know how flaky date pickers can be. The test tries several methods to select tomorrow's date, and if all else fails, it continues with today's date rather than failing completely. This approach minimizes failures, though the test could still fail if all fallbacks fail and it's run after noon on the same day.

### Waiting for things to load

No sleep statements or crossing fingers. The tests wait for specific elements and for pages to actually finish loading.

### Flexible Text Matching

I knew the app might have slight text variations or support multiple languages, so I made sure the tests use flexible patterns instead of expecting exact matches.

### Graceful Degradation

When non critical steps fail (like selecting a specific date), the test logs what happened but continues. I'd rather get partial results than no results.

## What I'd Suggest to the Development Team (If My Lead Agreed)

If I were working with the developers and my QA Lead thought it would be valuable, I'd suggest these improvements to make testing easier:

### Add Test-Friendly Attributes

```html
<button data-testid="search-trip">Search</button>
<div data-testid="trip-results">...</div>
<span data-testid="error-message">You're going too far!</span>
```

### Keep Selectors Stable

- Don't change `data-testid` attributes without warning the QA team
- Avoid auto-generated class names in production
- Maintain semantic HTML structure

### Consider API Testing Endpoints

- Expose the trip planning API for faster, more reliable tests
- Provide test data endpoints for consistent scenarios
- Add feature flags for test-specific behaviour

## How I Used AI and What I Validated

As requested in the exercise instructions, here's exactly how I used Claude AI and what I contributed:

**What I Used Claude For:**

- Writing the actual TypeScript/Playwright code based on my specifications
- Implementing the Page Object Model structure I requested
- Coding the fallback logic I designed for calendar interactions
- Formatting and syntax for proper Playwright test structure

**What I Wrote and Decided Myself:**

- Every test scenario and what it should validate
- All error handling strategies and fallback approaches
- The decision to use Page Object Model architecture
- Requirements for screenshot naming and URL logging
- What constitutes a passing vs failing test for each case
- All wait strategies and timeout approaches

**How I Validated the results:**

- Ran each test multiple times to ensure reliability
- Manually tested each scenario to verify the automated tests matched expected behavior
- Reviewed all locator strategies against the actual Transit app UI
- Verified that fallback approaches worked when primary methods failed
- Tested edge cases like calendar navigation and error handling

The code implements my vision, but every strategic decision about what to test and how to handle problems came from my analysis of the requirements and user workflows.

I may not code, but I can design a test strategy and communicate exactly what needs to happen. The programming is just one piece of the puzzle.

---

_This project demonstrates that you don't need to be a programmer to design effective test automation. You need to understand your users, think through edge cases, and communicate clearly about requirements. The code is just the tool to execute the vision._
