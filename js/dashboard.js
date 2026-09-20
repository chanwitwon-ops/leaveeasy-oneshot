/**
 * js/dashboard.js — หน้าแดชบอร์ดสรุป
 *
 * =============== งานที่ต้องทำ ===============
 * 1. นับจำนวนใบลาตามสถานะ 3 ค่า จาก Firestore
 *    - pending-count: นับ status = "รอพิจารณา"
 *    - approved-count: นับ status = "อนุมัติ"
 *    - rejected-count: นับ status = "ไม่อนุมัติ"
 *
 * 2. ดึงใบลา 5 รายการล่าสุด (เรียงตามเวลาจากใหม่ไปเก่า)
 *    - เติมตารางด้วย recent-list
 *    - แต่ละแถวกดไป leave-request-detail.html?id=<leaveRequestId>
 *
 * 3. จัดการ empty state
 *    - ถ้าไม่มีใบลาเลย ให้ซ่อน table และแสดง empty-recent
 *
 * =============== Field Names ใช้ Exact Names ===============
 * - status: "รอพิจารณา" / "อนุมัติ" / "ไม่อนุมัติ"
 * - title, leaveTypeName, requesterName, createdAt, startDate, endDate
 *
 * =============== ผู้ที่จะต่อโค้ดจริง ===============
 * data-auth-engineer (ผู้ช่วยที่ 2)
 *
 * ====== Module 2 (สัปดาห์ที่ 6) ======
 * - อ่านข้อมูลจาก Firestore collection "leaveRequests"
 * - ยังไม่ต้องกรองตามสิทธิ์ของผู้ใช้ (Module 2 ยังไม่มีล็อกอิน)
 *
 * ====== Module 3 (สัปดาห์ที่ 7-8) ======
 * - กรองให้แสดงเฉพาะที่ผู้ใช้คนนั้นมีสิทธิ์เห็น
 *   - employee: เห็นของตัวเองเท่านั้น (requesterId === currentUserId)
 *   - manager/hr: เห็นทั้งหมด
 */

// TODO: เตรียม DOM reference
const pendingCount = document.getElementById('pending-count');
const approvedCount = document.getElementById('approved-count');
const rejectedCount = document.getElementById('rejected-count');
const recentListTable = document.getElementById('recent-list');
const recentListContainer = document.getElementById('recent-list-table');
const emptyRecentState = document.getElementById('empty-recent');

// TODO: ใส่โค้ดอ่านข้อมูลจาก Firestore
async function loadDashboardData() {
  try {
    // 1. ดึงข้อมูลจาก firestore collection leaveRequests
    // 2. นับตามสถานะแต่ละค่า
    // 3. ดึง 5 รายการล่าสุด
    // 4. เติมตัวเลขในกล่องสรุป
    // 5. เติมตารางรายการล่าสุด
    // 6. จัดการ empty state
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

// TODO: จัดการการคลิกที่กล่องตัวเลข (ไปหน้ารายการพร้อมกรองสถานะ)
const pendingStat = document.getElementById('pending-stat');
const approvedStat = document.getElementById('approved-stat');
const rejectedStat = document.getElementById('rejected-stat');

if (pendingStat) {
  pendingStat.addEventListener('click', (e) => {
    e.preventDefault();
    // TODO: ไปหน้า leave-requests.html พร้อมแล้วกรองเฉพาะ status=รอพิจารณา
  });
}

if (approvedStat) {
  approvedStat.addEventListener('click', (e) => {
    e.preventDefault();
    // TODO: ไปหน้า leave-requests.html พร้อมแล้วกรองเฉพาะ status=อนุมัติ
  });
}

if (rejectedStat) {
  rejectedStat.addEventListener('click', (e) => {
    e.preventDefault();
    // TODO: ไปหน้า leave-requests.html พร้อมแล้วกรองเฉพาะ status=ไม่อนุมัติ
  });
}

// โหลดข้อมูลเมื่อหน้าเปิด
document.addEventListener('DOMContentLoaded', loadDashboardData);
