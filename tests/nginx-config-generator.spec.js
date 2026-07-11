import { test, expect } from "@playwright/test";

test("NGINX Config Generator loads, reacts to inputs, and exports config", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/nginx-config-generator");

  await page.waitForSelector(".ngx-shell", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("NGINX Config Generator");

  const output = page.locator("#ngx-output");
  await expect(output).toBeAttached();
  const initial = await output.textContent();
  expect(initial).toContain("server {");
  expect(initial).toContain("server_name example.com");
  expect(initial).toContain("listen 80;");
  expect(initial).toContain("listen 443 ssl");
  expect(initial).toContain("listen 443 ssl");

  await page.locator("#ngx-serverName").fill("mysite.test");
  await expect(output).toContainText("server_name mysite.test;");

  await page.locator("#ngx-enableProxy").check();
  await expect(output).toContainText("proxy_pass http://127.0.0.1:3000;");
  await expect(output).toContainText("proxy_set_header Upgrade $http_upgrade;");

  await page.locator("#ngx-enableUpstream").check();
  await page.locator("#ngx-upstreamBackends").fill("http://10.0.0.1:8080\nhttp://10.0.0.2:8080");
  await expect(output).toContainText("upstream backend {");
  await expect(output).toContainText("server http://10.0.0.1:8080;");
  await expect(output).toContainText("server http://10.0.0.2:8080;");

  await page.locator("#ngx-enableSecurityHeaders").check();
  await expect(output).toContainText('X-Frame-Options "SAMEORIGIN"');
  await expect(output).toContainText("Permissions-Policy");

  await page.locator("#ngx-preset").selectOption("wordpress");
  await expect(output).toContainText("fastcgi_pass unix:/run/php/php8.2-fpm.sock;");
  await page.locator("#ngx-serverName").fill("wp.test");
  await expect(output).toContainText("server_name wp.test;");
  await expect(output).toContainText("fastcgi_pass unix:/run/php/php8.2-fpm.sock;");

  const lineBadge = page.locator("#ngx-line-count");
  await expect(lineBadge).toContainText(/lines/);
  const byteBadge = page.locator("#ngx-byte-count");
  await expect(byteBadge).toBeAttached();

  await page.locator("#ngx-reset").click();
  await expect(page.locator("#ngx-preset")).toHaveValue("custom");
  const afterReset = await output.textContent();
  expect(afterReset).toContain("server {");
  expect(afterReset).toContain("listen 80;");

  console.log("✅ NGINX Config Generator loads and reacts correctly");
});
