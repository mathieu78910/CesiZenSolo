import { before, after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { Builder, Browser, By, until } from "selenium-webdriver";

const SELENIUM_URL = process.env.SELENIUM_URL || "http://localhost:4444/wd/hub";
const BASE_URL = process.env.BASE_URL || "http://localhost";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || "e2e@cesizen.com";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || "Password123!";

const TIMEOUT = 30000;

// Attend qu'un champ soit présent dans le DOM avant d'interagir avec lui
// (le bundle React doit être téléchargé et exécuté avant que le formulaire existe).
const field = (driver, selector) =>
  driver.wait(until.elementLocated(By.css(selector)), TIMEOUT);

describe("Parcours end-to-end CesiZen", () => {
  let driver;

  before(async () => {
    driver = await new Builder()
      .forBrowser(Browser.CHROME)
      .usingServer(SELENIUM_URL)
      .build();
    await driver.manage().setTimeouts({ pageLoad: TIMEOUT });
  });

  after(async () => {
    await driver?.quit();
  });

  it("la page d'accueil redirige vers le formulaire de connexion", async () => {
    await driver.get(BASE_URL);
    await driver.wait(until.urlContains("/login"), TIMEOUT);

    const emailInput = await field(driver, 'input[name="email"]');
    const passwordInput = await field(driver, 'input[name="password"]');

    assert.ok(await emailInput.isDisplayed());
    assert.ok(await passwordInput.isDisplayed());
  });

  it("un nouvel utilisateur peut créer un compte", async () => {
    await driver.get(`${BASE_URL}/register`);

    const uniqueEmail = `e2e-${Date.now()}@cesizen.com`;

    await (await field(driver, 'input[name="firstName"]')).sendKeys("Test");
    await (await field(driver, 'input[name="lastName"]')).sendKeys("E2E");
    await (await field(driver, 'input[name="email"]')).sendKeys(uniqueEmail);
    await (await field(driver, 'input[name="password"]')).sendKeys("Password123!");
    await (await field(driver, 'input[name="confirmPassword"]')).sendKeys("Password123!");
    await (await field(driver, 'button[type="submit"]')).click();

    // Un compte standard est redirigé vers /login après inscription.
    await driver.wait(until.urlContains("/login"), TIMEOUT);
  });

  it("un administrateur peut se connecter et accéder à la console", async () => {
    await driver.get(`${BASE_URL}/login`);

    await (await field(driver, 'input[name="email"]')).sendKeys(ADMIN_EMAIL);
    await (await field(driver, 'input[name="password"]')).sendKeys(ADMIN_PASSWORD);
    await (await field(driver, 'button[type="submit"]')).click();

    await driver.wait(until.urlContains("/admin"), TIMEOUT);

    const body = await field(driver, "body").then((el) => el.getText());
    assert.match(body, /Pilotage des contenus et des comptes/);
  });
});
