const fs = require('fs');
const { chromium } = require('playwright');
const { getPhone, waitForSms } = require('./utils/sms');
const { solveCaptcha } = require('./utils/captcha');
const { getRandomProxy } = require('./utils/proxy');
const { count, accountsFile } = require('./config');

async function createAccount(i) {
  const proxy = getRandomProxy();
  const browser = await chromium.launch({
    headless: false,
    proxy: proxy ? {
      server: `http://${proxy.server}`,
      username: proxy.username,
      password: proxy.password
    } : undefined
  });

  const context = await browser.newContext();
  const page = await context.newPage();
  const username = 'user' + Math.floor(Math.random() * 1e6);

  try {
    const phone = await getPhone();

    await page.goto('https://accounts.google.com/signup');

    await page.fill('input[name="firstName"]', 'Bot');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="Username"]', username);
    await page.fill('input[name="Passwd"]', 'BotPass123!');
    await page.fill('input[name="ConfirmPasswd"]', 'BotPass123!');
    await page.click('button:has-text("Next")');

    await page.fill('input[type="tel"]', phone.phone);
    await page.click('button:has-text("Next")');

    const smsCode = await waitForSms(phone.id);
    await page.fill('input[name="code"]', smsCode);
    await page.click('button:has-text("Verify")');

    // TODO: CAPTCHA-сторінка
    const sitekey = await page.getAttribute('.g-recaptcha', 'data-sitekey');
    if (sitekey) {
      const token = await solveCaptcha(sitekey, page.url());
      await page.evaluate(`document.getElementById("g-recaptcha-response").innerHTML="${token}"`);
      await page.click('button:has-text("Next")');
    }

    // зберігаємо
    const account = {
      username: username + '@gmail.com',
      password: 'BotPass123!',
      phone: phone.phone
    };

    const all = fs.existsSync(accountsFile) ? JSON.parse(fs.readFileSync(accountsFile)) : [];
    all.push(account);
    fs.writeFileSync(accountsFile, JSON.stringify(all, null, 2));

    console.log(`✅ Акаунт #${i + 1} створено: ${account.username}`);
  } catch (e) {
    console.error(`❌ Помилка в акаунті #${i + 1}:`, e.message);
  } finally {
    await browser.close();
  }
}

(async () => {
  for (let i = 0; i < count; i++) {
    await createAccount(i);
  }
})();
