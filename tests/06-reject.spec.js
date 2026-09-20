// US-04/05 (กรณีไม่อนุมัติ) — กฎหัวข้อ 6 ของสเปค:
// "การเปลี่ยนสถานะเป็น ไม่อนุมัติ ต้องเขียนความเห็นอย่างน้อย 1 รายการก่อน"
const { test, expect } = require("@playwright/test");
const { accounts, login, logout } = require("./helpers");

test("manager กดไม่อนุมัติโดยไม่มีความเห็น ต้องถูกปฏิเสธ ไม่เปลี่ยนสถานะ", async ({ page }) => {
  const หัวข้อทดสอบ = "ทดสอบไม่อนุมัติไม่มีความเห็น " + Date.now();

  // สร้างใบลาใหม่ด้วยบัญชี employee ก่อน
  await login(page, accounts.employee1);
  await page.goto("/new-leave-request.html");
  await page.locator("#title").fill(หัวข้อทดสอบ);
  await page.locator("#reason").fill("เหตุผลสำหรับเทสต์ไม่อนุมัติแบบไม่มีความเห็น");
  await page.locator("#leaveTypeId").selectOption({ label: "ลากิจ" });
  await page.locator("#startDate").fill("2026-11-15");
  await page.locator("#endDate").fill("2026-11-15");
  await page.locator("#submit-btn").click();
  await page.waitForURL(/leave-requests(\.html)?$/);
  await logout(page);

  // ล็อกอินเป็นผู้อนุมัติ เปิดใบลานั้น แล้วกดไม่อนุมัติทันทีโดยไม่เขียนความเห็น
  await login(page, accounts.manager);
  await page.goto("/leave-requests.html");
  await page.locator("tr", { hasText: หัวข้อทดสอบ }).click();
  await expect(page.locator("#detail-container")).toContainText("รอพิจารณา");

  let ข้อความแจ้งเตือน = "";
  page.once("dialog", async (dialog) => {
    ข้อความแจ้งเตือน = dialog.message();
    await dialog.accept();
  });
  await page.locator("#reject-btn").click();

  // ต้องมี alert เตือนให้เขียนความเห็นก่อน และสถานะต้องไม่เปลี่ยน
  await expect.poll(() => ข้อความแจ้งเตือน).toContain("ความเห็น");
  await expect(page.locator("#detail-container")).toContainText("รอพิจารณา");
  await expect(page.locator("#reject-btn")).toBeVisible();

  // รีเฟรชแล้วสถานะต้องยังเป็นรอพิจารณา (ไม่ได้ถูกเขียนลงฐานข้อมูลจริง)
  await page.reload();
  await expect(page.locator("#detail-container")).toContainText("รอพิจารณา");
});

test("manager เขียนความเห็นก่อนแล้วกดไม่อนุมัติ สถานะเปลี่ยนเป็นไม่อนุมัติจริง ทนต่อรีเฟรช และปุ่มเปลี่ยนสถานะหายไป", async ({ page }) => {
  const หัวข้อทดสอบ = "ทดสอบไม่อนุมัติมีความเห็น " + Date.now();

  // สร้างใบลาใหม่ด้วยบัญชี employee ก่อน (ใบใหม่ ไม่ใช้ใบเดิมที่ใบอื่นอนุมัติ/ไม่อนุมัติไปแล้ว)
  await login(page, accounts.employee1);
  await page.goto("/new-leave-request.html");
  await page.locator("#title").fill(หัวข้อทดสอบ);
  await page.locator("#reason").fill("เหตุผลสำหรับเทสต์ไม่อนุมัติแบบมีความเห็น");
  await page.locator("#leaveTypeId").selectOption({ label: "ลากิจ" });
  await page.locator("#startDate").fill("2026-11-16");
  await page.locator("#endDate").fill("2026-11-16");
  await page.locator("#submit-btn").click();
  await page.waitForURL(/leave-requests(\.html)?$/);
  await logout(page);

  // ล็อกอินเป็นผู้อนุมัติ เปิดใบลานั้น เขียนความเห็นก่อน แล้วค่อยกดไม่อนุมัติ
  await login(page, accounts.manager);
  await page.goto("/leave-requests.html");
  await page.locator("tr", { hasText: หัวข้อทดสอบ }).click();
  await expect(page.locator("#detail-container")).toContainText("รอพิจารณา");

  const ข้อความความเห็น = "ช่วงนั้นทีมมีงานเยอะ ขอไม่อนุมัติก่อนนะครับ";
  await page.locator("#comment-input").fill(ข้อความความเห็น);
  await page.locator("#submit-comment-btn").click();
  await expect(page.locator("#comments-list")).toContainText(ข้อความความเห็น);

  // ครั้งนี้ไม่ควรมี dialog เตือนขึ้น เพราะมีความเห็นแล้ว
  page.once("dialog", async (dialog) => {
    throw new Error("ไม่ควรมี alert ขึ้นอีก เพราะมีความเห็นแล้ว: " + dialog.message());
  });
  await page.locator("#reject-btn").click();

  await expect(page.locator("#detail-container")).toContainText("ไม่อนุมัติ");
  await expect(page.locator("#approve-btn")).toBeHidden();
  await expect(page.locator("#reject-btn")).toBeHidden();

  // เปิดหน้าใหม่ (จำลอง "ปิดแล้วเปิดใหม่") แล้วสถานะและการซ่อนปุ่มต้องยังคงอยู่
  await page.reload();
  await expect(page.locator("#detail-container")).toContainText("ไม่อนุมัติ");
  await expect(page.locator("#approve-btn")).toBeHidden();
  await expect(page.locator("#reject-btn")).toBeHidden();
});
