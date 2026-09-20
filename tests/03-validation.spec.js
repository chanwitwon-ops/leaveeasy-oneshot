// US-02 เกณฑ์การยอมรับ — เว้นช่องบังคับ (หัวข้อ) แล้วกดบันทึก ต้องไม่บันทึกและมีข้อความเตือน
const { test, expect } = require("@playwright/test");
const { accounts, login } = require("./helpers");

test("กรอกฟอร์มยื่นใบลาโดยเว้นช่องหัวข้อไว้ แล้วกดบันทึก ต้องไม่บันทึกและขึ้นข้อความเตือน", async ({ page }) => {
  await login(page, accounts.employee1);
  await page.goto("/new-leave-request.html");

  // ตั้งใจไม่กรอก #title
  await page.locator("#reason").fill("เหตุผลทดสอบกรอกไม่ครบ");
  await page.locator("#leaveTypeId").selectOption({ label: "ลากิจ" });
  await page.locator("#startDate").fill("2026-11-15");
  await page.locator("#endDate").fill("2026-11-15");
  await page.locator("#submit-btn").click();

  // ต้องยังอยู่หน้าเดิม (ไม่ถูกพาไปหน้ารายการ) และเห็นข้อความเตือน
  await expect(page).toHaveURL(/new-leave-request/);
  const กล่องเตือน = page.locator("#ข้อความเตือน");
  await expect(กล่องเตือน).toBeVisible();
  await expect(กล่องเตือน).toContainText("กรอกไม่ครบ");
});
