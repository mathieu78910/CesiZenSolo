import { before, after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { Builder, Browser, By, until } from "selenium-webdriver";

const SELENIUM_URL = process.env.SELENIUM_URL || "http://localhost:4444/wd/hub";
const BASE_URL = process.env.BASE_URL || "http://localhost";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || "e2e@cesizen.com";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || "Password123!";
const USER_EMAIL = process.env.E2E_USER_EMAIL || "e2e-user@cesizen.com";
const USER_PASSWORD = process.env.E2E_USER_PASSWORD || "Password123!";

const TIMEOUT = 30000;

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

    assert.ok(await (await field(driver, 'input[name="email"]')).isDisplayed());
    assert.ok(await (await field(driver, 'input[name="password"]')).isDisplayed());
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

    await driver.wait(until.urlContains("/login"), TIMEOUT);
  });

  it("un administrateur peut se connecter et accéder à la console", async () => {
    await driver.get(`${BASE_URL}/login`);

    await (await field(driver, 'input[name="email"]')).sendKeys(ADMIN_EMAIL);
    await (await field(driver, 'input[name="password"]')).sendKeys(ADMIN_PASSWORD);
    await (await field(driver, 'button[type="submit"]')).click();

    await driver.wait(until.urlContains("/admin"), TIMEOUT);

    const body = await (await field(driver, "body")).getText();
    assert.match(body, /Pilotage des contenus et des comptes/);
  });

  it("un mauvais mot de passe affiche un message d'erreur", async () => {
    await driver.get(`${BASE_URL}/login`);

    await (await field(driver, 'input[name="email"]')).sendKeys(ADMIN_EMAIL);
    await (await field(driver, 'input[name="password"]')).sendKeys("MauvaisMotDePasse!");
    await (await field(driver, 'button[type="submit"]')).click();

    // L'erreur s'affiche dans un <p> avec une class contenant "errorText"
    const errorEl = await driver.wait(
      until.elementLocated(By.css('[class*="errorText"]')),
      TIMEOUT
    );
    const errorText = await errorEl.getText();
    assert.ok(errorText.length > 0, "Un message d'erreur doit être affiché");
    // On reste sur /login (pas de redirection)
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes("/login"));
  });

  it("un utilisateur standard ne peut pas accéder à la console admin", async () => {
    await driver.get(`${BASE_URL}/login`);

    await (await field(driver, 'input[name="email"]')).sendKeys(USER_EMAIL);
    await (await field(driver, 'input[name="password"]')).sendKeys(USER_PASSWORD);
    await (await field(driver, 'button[type="submit"]')).click();

    // Le guard RequireAdmin redirige les non-admin vers /login
    await driver.wait(until.urlContains("/login"), TIMEOUT);

    // Tentative d'accès direct à /admin → toujours redirigé vers /login
    await driver.get(`${BASE_URL}/admin`);
    await driver.wait(until.urlContains("/login"), TIMEOUT);
  });

  it("un administrateur peut se déconnecter", async () => {
    await driver.get(`${BASE_URL}/login`);

    await (await field(driver, 'input[name="email"]')).sendKeys(ADMIN_EMAIL);
    await (await field(driver, 'input[name="password"]')).sendKeys(ADMIN_PASSWORD);
    await (await field(driver, 'button[type="submit"]')).click();

    await driver.wait(until.urlContains("/admin"), TIMEOUT);

    // Clic sur "Se déconnecter"
    const logoutBtn = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(text(),'Se déconnecter')]")),
      TIMEOUT
    );
    await logoutBtn.click();

    await driver.wait(until.urlContains("/login"), TIMEOUT);
  });
});
