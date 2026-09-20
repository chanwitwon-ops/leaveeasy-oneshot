// US-01 + US-02 — ยื่นใบลาใหม่แล้วต้องเห็นในรายการ พร้อมข้อมูลถูกต้อง และอยู่ทนหลังรีเฟรช
const { test, expect } = require("@playwright/test");
const { accounts, login } = require("./helpers");

test("ยื่นใบลาใหม่แล้วเห็นในรายการใบลา พร้อมชื่อ/ประเภท/สถานะถูกต้อง", async ({ page }) => {
  await login(page, accounts.employee1);

  const หัวข้อทดสอบ = "ทดสอบ Playwright " + Date.now();

  await page.goto("/new-leave-request.html");
  await page.locator("#title").fill(หัวข้อทดสอบ);
  await page.locator("#reason").fill("เหตุผลสำหรับเทสต์อัตโนมัติ");
  await page.locator("#leaveTypeId").selectOption({ label: "ลาป่วย" });
  await page.locator("#startDate").fill("2026-11-01");
  await page.locator("#endDate").fill("2026-11-02");
  await page.locator("#submit-btn").click();

  await page.waitForURL(/leave-requests(\.html)?$/);

  const แถว = page.locator("tr", { hasText: หัวข้อทดสอบ });
  await expect(แถว).toBeVisible();
  await expect(แถว).toContainText("ลาป่วย");
  await expect(แถว).toContainText("รอพิจารณา");
  await expect(แถว).toContainText(accounts.employee1.name);

  // รีเฟรชหน้า แล้วข้อมูลต้องยังอยู่ (อ่านจาก Firestore จริง ไม่ใช่ state ชั่วคราวในหน่วยความจำ)
  await page.reload();
  await expect(page.locator("tr", { hasText: หัวข้อทดสอบ })).toBeVisible();
});
