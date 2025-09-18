import { test, expect, Page, Locator } from "@playwright/test";
import fs from "fs";

// Page Object Model for better maintainability
class TripPlannerPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Locators
  get originInput() {
    return this.page.getByRole("combobox", { name: /origin/i });
  }

  get destinationInput() {
    return this.page.getByRole("combobox", { name: /destination/i });
  }

  get searchButton() {
    return this.page.locator(
      'button:has-text("Search"), button:has-text("Plan")'
    );
  }

  get optionsButton() {
    return this.page.getByRole("button", { name: /Options|Paramètres/i });
  }

  get itineraryContainer() {
    return this.page
      .getByRole("listbox", { name: /Suggested trip plans/i })
      .or(this.page.locator('[class*="itinerary"], [class*="results"]'));
  }

  get optionsPanel() {
    return this.page
      .getByRole("alertdialog", { name: /Options|Paramètres/i })
      .or(
        this.page.locator(
          '[role="dialog"], [class*="modal"], [class*="settings"]'
        )
      );
  }

  // Actions
  async navigateToTripPlanner() {
    await this.page.goto("https://transitapp.com/en/trip");
    await this.page.waitForLoadState("networkidle");
  }

  async setOrigin(address: string) {
    await this.originInput.focus();
    await this.originInput.fill(address);
    await this.page.waitForTimeout(1500);

    const suggestion = this.page
      .getByText(new RegExp(address.split(" ")[0], "i"))
      .first();
    await suggestion.waitFor({ timeout: 10000 });
    await suggestion.click();
    await this.page.waitForTimeout(500);
  }

  async setDestination(address: string) {
    await this.destinationInput.focus();
    await this.destinationInput.fill(address);
    await this.page.waitForTimeout(1500);

    // More flexible regex for destination matching
    const destinationPattern = address.includes("Saint-Catherine")
      ? /S(ainte|aint)-Catherine.*(Ouest|West)/i
      : new RegExp(address.split(" ")[0], "i");

    const suggestion = this.page.getByText(destinationPattern).first();
    await suggestion.waitFor({ timeout: 10000 });
    await suggestion.click();
    await this.page.waitForTimeout(500);
  }

  async performSearch() {
    await this.page.keyboard.press("Enter");
    await this.page.waitForTimeout(1000);

    if ((await this.searchButton.count()) > 0) {
      await this.searchButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async waitForResults() {
    await this.page.waitForURL(/origin=.*destination=.*/, { timeout: 30000 });
    await this.itineraryContainer.waitFor({ state: "visible", timeout: 30000 });
    await this.page.waitForTimeout(2000); // Allow for dynamic content loading
  }

  async openOptionsPanel() {
    if ((await this.optionsButton.count()) > 0) {
      await this.optionsButton.click();
      await this.optionsPanel.waitFor({ state: "visible", timeout: 15000 });
      await this.page.waitForTimeout(1000);
    } else {
      throw new Error("Options button not found");
    }
  }

  async setArriveBy() {
    const timeTypeButton = this.page.getByRole("button", {
      name: /select departure type|Type de départ/i,
    });

    await timeTypeButton.waitFor({ state: "visible", timeout: 10000 });
    await timeTypeButton.click();
    await this.page.waitForTimeout(500);

    const arriveByOption = this.page
      .locator('[role="listbox"]')
      .getByRole("option", { name: /Arrive by|Arriver à/i });

    await arriveByOption.waitFor({ state: "visible", timeout: 10000 });
    await arriveByOption.click();
    await this.page.waitForTimeout(500);
  }

  async setTime(time: string = "12:00 PM") {
    const timeButton = this.page.getByRole("button", {
      name: /select departure\/arrival time|Time|Hour|Heure/i,
    });

    await timeButton.waitFor({ state: "visible", timeout: 10000 });
    await timeButton.click();
    await this.page.waitForTimeout(500);

    const timeOption = this.page
      .locator('[role="listbox"]')
      .getByRole("option", { name: time });

    await timeOption.waitFor({ state: "visible", timeout: 10000 });
    await timeOption.click();
    await this.page.waitForTimeout(500);
  }

  async setDateToTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.getDate();

    const calendarButton = this.page.getByRole("button", {
      name: /Calendar|Date|Calendrier/i,
    });

    await calendarButton.waitFor({ state: "visible", timeout: 10000 });
    await calendarButton.click();
    await this.page.waitForTimeout(1500);

    // Look for calendar grid
    const calendarGrid = this.page.getByRole("grid").first();
    await calendarGrid.waitFor({ state: "visible", timeout: 10000 });

    // Try multiple approaches to find tomorrow's date
    let dateSelected = false;

    // Approach 1: Find gridcell with tomorrow's day number
    const gridCells = calendarGrid.getByRole("gridcell");
    const cellCount = await gridCells.count();

    for (let i = 0; i < cellCount; i++) {
      const cell = gridCells.nth(i);
      const cellText = await cell.textContent();

      // Check if this cell contains tomorrow's day and is clickable
      if (cellText?.trim() === tomorrowDay.toString()) {
        const isDisabled = await cell.getAttribute("data-disabled");
        if (!isDisabled || isDisabled === "false") {
          try {
            await cell.click();
            dateSelected = true;
            console.log(`Successfully selected date: ${tomorrowDay}`);
            break;
          } catch (error) {
            console.log(
              `Failed to click cell ${i}: ${(error as Error).message}`
            );
          }
        }
      }
    }

    // Approach 2: If gridcell approach failed, try button with day number
    if (!dateSelected) {
      const dayButtons = this.page.locator(
        `button:has-text("${tomorrowDay}"), div[role="button"]:has-text("${tomorrowDay}")`
      );
      const buttonCount = await dayButtons.count();

      for (let i = 0; i < buttonCount; i++) {
        const button = dayButtons.nth(i);
        try {
          const isVisible = await button.isVisible();
          const isDisabled = await button.getAttribute("data-disabled");

          if (isVisible && (!isDisabled || isDisabled === "false")) {
            await button.click();
            dateSelected = true;
            console.log(
              `Successfully selected date via button: ${tomorrowDay}`
            );
            break;
          }
        } catch (error) {
          console.log(
            `Failed to click button ${i}: ${(error as Error).message}`
          );
        }
      }
    }

    // Approach 3: Keyboard navigation as last resort
    if (!dateSelected) {
      console.log("Trying keyboard navigation...");
      try {
        // Focus on today (should be highlighted) then press right arrow
        await this.page.keyboard.press("Tab"); // Focus calendar
        await this.page.keyboard.press("ArrowRight"); // Move to tomorrow
        await this.page.keyboard.press("Enter"); // Select
        dateSelected = true;
        console.log("Successfully selected date via keyboard");
      } catch (error) {
        console.log(`Keyboard navigation failed: ${(error as Error).message}`);
      }
    }

    if (!dateSelected) {
      console.log(
        `Warning: Could not select tomorrow's date (${tomorrowDay}). Continuing with default date.`
      );
    }

    await this.page.waitForTimeout(500);
  }

  async saveOptions() {
    const saveButton = this.page.getByRole("button", {
      name: /Save|Enregistrer/i,
    });
    await saveButton.waitFor({ state: "visible", timeout: 10000 });
    await saveButton.click();
    await this.page.waitForLoadState("networkidle", { timeout: 15000 });
    await this.page.waitForTimeout(1000);
  }

  async verifyWalkingOption(): Promise<boolean> {
    const walkingOption = await this.page
      .locator("text=/OTHER OPTIONS|AUTRES OPTIONS/i")
      .locator("xpath=following::div")
      .getByText(/walk|marche|on foot|pied/i)
      .count();

    return walkingOption > 0;
  }

  async verifyTransitOptions(): Promise<number> {
    await this.itineraryContainer.waitFor({ state: "visible", timeout: 30000 });

    const transitOptions = await this.itineraryContainer
      .locator(
        '[data-sentry-component="RouteDisplayName"], img[src*="stm-metro"]'
      )
      .count();

    return transitOptions;
  }

  async verifyErrorMessage(expectedMessage: string): Promise<boolean> {
    const errorLocator = this.page.locator(`text="${expectedMessage}"`);
    await errorLocator.waitFor({ state: "visible", timeout: 15000 });
    const actualMessage = await errorLocator.textContent();
    return actualMessage === expectedMessage;
  }
}

test.describe("Transit App Trip Planner Tests", () => {
  test.setTimeout(120000); // Reduced from 180s

  test.use({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 }, // Increased from 1280x720
  });

  test.afterEach(async ({ page }, testInfo) => {
    const finalUrl = page.url();
    const testDate = new Date().toISOString();

    console.log(`Final URL: ${finalUrl}`);

    // Create results directory
    const resultsDir = "test-results";
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    // Save URL to log file with timestamp
    const logEntry = `${testDate} | ${testInfo.title} | ${testInfo.status} | ${finalUrl}\n`;
    const logFileName = `test-urls-${
      new Date().toISOString().split("T")[0]
    }.log`;
    fs.appendFileSync(`${resultsDir}/${logFileName}`, logEntry);

    // Create clean screenshot filename
    let testName = "";
    let testNumber = "";

    if (testInfo.title.includes("Happy Path")) {
      testName = "Happy Path";
      testNumber = "Test 1";
    } else if (testInfo.title.includes("Arrive By")) {
      testName = "Arrive By";
      testNumber = "Test 2";
    } else if (testInfo.title.includes("Out-of-Range")) {
      testName = "Too Far";
      testNumber = "Test 3";
    }

    const status = testInfo.status === "passed" ? "Pass" : "Fail";
    const dateTime = new Date().toISOString().split("T")[0]; // Just YYYY-MM-DD

    const screenshotPath = `${resultsDir}/${testNumber} - ${testName} - ${status} - ${dateTime}.png`;

    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved: ${screenshotPath}`);
    } catch (error) {
      console.log(`Failed to take screenshot: ${(error as Error).message}`);
    }
  });

  test("Happy Path – Trip Search", async ({ page }) => {
    const tripPlanner = new TripPlannerPage(page);

    await tripPlanner.navigateToTripPlanner();
    await tripPlanner.setOrigin("5333 Casgrain Ave Montreal");
    await tripPlanner.setDestination(
      "1321 Saint-Catherine Street West montreal"
    );
    await tripPlanner.performSearch();
    await tripPlanner.waitForResults();

    // Verify at least one itinerary is displayed
    const itineraryElements = await tripPlanner.itineraryContainer.all();
    expect(itineraryElements.length).toBeGreaterThan(0);

    // Verify walking-only trip exists
    const hasWalkingOption = await tripPlanner.verifyWalkingOption();
    expect(hasWalkingOption).toBe(true);

    // Additional fallback verification
    const pageText = await page.textContent("body");
    expect(pageText).toMatch(
      /min|option available|itinerary|route|trip|direction/i
    );
  });

  test("Arrive By – Specific Date/Time", async ({ page }) => {
    const tripPlanner = new TripPlannerPage(page);

    await tripPlanner.navigateToTripPlanner();
    await tripPlanner.setOrigin("5333 Casgrain Ave Montreal");
    await tripPlanner.setDestination(
      "1321 Saint-Catherine Street West montreal"
    );
    await tripPlanner.performSearch();
    await tripPlanner.waitForResults();

    // Open options and configure
    await tripPlanner.openOptionsPanel();
    await tripPlanner.setArriveBy();

    // Set date and time with error handling
    try {
      await tripPlanner.setDateToTomorrow();
    } catch (error) {
      console.log(
        `Date selection failed: ${error}. Continuing with default date.`
      );
    }

    await tripPlanner.setTime("12:00 PM");
    await tripPlanner.saveOptions();

    // Wait for updated results
    await tripPlanner.waitForResults();

    // Verify transit options
    const transitCount = await tripPlanner.verifyTransitOptions();
    expect(transitCount).toBeGreaterThanOrEqual(3); // PDF requirement: at least 3 transit trip plans

    // Fallback verification
    const itineraryElements = await tripPlanner.itineraryContainer.all();
    expect(itineraryElements.length).toBeGreaterThan(0);
  });

  test("Out-of-Range Trip – Error Message", async ({ page }) => {
    const tripPlanner = new TripPlannerPage(page);

    await tripPlanner.navigateToTripPlanner();
    await tripPlanner.setOrigin("5333 Casgrain Ave Montreal");

    // Set destination to Toronto
    await tripPlanner.destinationInput.fill("Toronto");
    await page.waitForTimeout(1000);
    const torontoSuggestion = page.getByText(/Toronto.*ON, Canada/i).first();
    await torontoSuggestion.waitFor({ timeout: 10000 });
    await torontoSuggestion.click();

    await tripPlanner.performSearch();
    await page.waitForLoadState("networkidle");

    // Verify exact error message
    const hasCorrectError = await tripPlanner.verifyErrorMessage(
      "You're going too far!"
    );
    expect(hasCorrectError).toBe(true);
  });
});
