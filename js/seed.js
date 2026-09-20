// ─────────────────────────────────────────────────────────────
// js/seed.js — ใส่ข้อมูลตัวอย่างลง Firestore ตามหัวข้อ 7 ของสเปค
// ใช้ครั้งเดียวตอนตั้งค่าโปรเจกต์ใหม่ (เรียกจาก seed.html)
//
// ⚠️ ต้องรันตอนที่ Firestore ยังเปิดกว้าง (โหมดทดสอบ หรือยังไม่ deploy
// firestore.rules ที่เข้มงวด) เพราะกฎเข้มงวดห้ามเขียนทับ users/leaveRequests
// ของคนอื่นที่ไม่ใช่ uid ของตัวเอง — ข้อมูลตัวอย่าง u001/u002/u003 ไม่ใช่ uid จริง
// ─────────────────────────────────────────────────────────────

(function () {
  var ปุ่มSeed = document.getElementById("seed-btn");
  var บันทึกSeed = document.getElementById("seed-log");

  function log(ข้อความ) {
    var บรรทัด = document.createElement("div");
    บรรทัด.textContent = ข้อความ;
    บันทึกSeed.appendChild(บรรทัด);
  }

  async function seed() {
    ปุ่มSeed.disabled = true;
    บันทึกSeed.innerHTML = "";

    try {
      // 📁 users — ผู้ใช้ 3 คน 3 บทบาท
      log("กำลังใส่ข้อมูล users…");
      var users = {
        u001: { name: "สมชาย ใจดี", email: "somchai@example.com", role: "employee" },
        u002: { name: "สมหญิง รักงาน", email: "somying@example.com", role: "manager" },
        u003: { name: "สมศรี ตั้งใจ", email: "somsri@example.com", role: "hr" }
      };
      for (var uid in users) {
        await db.collection("users").doc(uid).set(users[uid]);
      }
      log("เสร็จ users (3 คน)");

      // 📁 leaveTypes — ประเภทการลา 3 แบบ
      log("กำลังใส่ข้อมูล leaveTypes…");
      var leaveTypes = {
        lt001: { name: "ลาพักร้อน" },
        lt002: { name: "ลาป่วย" },
        lt003: { name: "ลากิจ" }
      };
      for (var ltid in leaveTypes) {
        await db.collection("leaveTypes").doc(ltid).set(leaveTypes[ltid]);
      }
      log("เสร็จ leaveTypes (3 ประเภท)");

      // 📁 leaveRequests — ใบขอลา 5 ใบ
      log("กำลังใส่ข้อมูล leaveRequests…");
      var leaveRequests = {
        lr001: {
          title: "ลาพักร้อนไปเที่ยวกับครอบครัว",
          reason: "วางแผนเดินทางไปต่างจังหวัดกับครอบครัว จองที่พักไว้ล่วงหน้าแล้ว",
          status: "รอพิจารณา",
          requesterId: "u001", requesterName: "สมชาย ใจดี",
          approverId: "u002", approverName: "สมหญิง รักงาน",
          leaveTypeId: "lt001", leaveTypeName: "ลาพักร้อน",
          startDate: "2026-09-07", endDate: "2026-09-09",
          createdAt: "2026-09-01 09:15"
        },
        lr002: {
          title: "ลาป่วยไข้หวัดใหญ่",
          reason: "มีไข้สูงและไอมาก แพทย์แนะนำให้พักอยู่บ้าน 2 วัน",
          status: "อนุมัติ",
          requesterId: "u001", requesterName: "สมชาย ใจดี",
          approverId: "u002", approverName: "สมหญิง รักงาน",
          leaveTypeId: "lt002", leaveTypeName: "ลาป่วย",
          startDate: "2026-08-24", endDate: "2026-08-25",
          createdAt: "2026-08-24 08:05"
        },
        lr003: {
          title: "ลากิจไปทำบัตรประชาชน",
          reason: "บัตรประชาชนหมดอายุ ต้องไปทำที่สำนักงานเขตในวันทำการ",
          status: "รอพิจารณา",
          requesterId: "u003", requesterName: "สมศรี ตั้งใจ",
          approverId: "", approverName: "",
          leaveTypeId: "lt003", leaveTypeName: "ลากิจ",
          startDate: "2026-09-15", endDate: "2026-09-15",
          createdAt: "2026-09-10 16:30"
        },
        lr004: {
          title: "ลาพักร้อนช่วงวันหยุดยาว",
          reason: "อยากต่อวันหยุดยาวไปพักผ่อนกับครอบครัวอีก 3 วัน",
          status: "ไม่อนุมัติ",
          requesterId: "u003", requesterName: "สมศรี ตั้งใจ",
          approverId: "u002", approverName: "สมหญิง รักงาน",
          leaveTypeId: "lt001", leaveTypeName: "ลาพักร้อน",
          startDate: "2026-10-12", endDate: "2026-10-16",
          createdAt: "2026-09-20 11:00"
        },
        lr005: {
          title: "ลาป่วยไปพบแพทย์ตามนัด",
          reason: "มีนัดตรวจติดตามอาการกับแพทย์ในช่วงเช้า",
          status: "รอพิจารณา",
          requesterId: "u001", requesterName: "สมชาย ใจดี",
          approverId: "u002", approverName: "สมหญิง รักงาน",
          leaveTypeId: "lt002", leaveTypeName: "ลาป่วย",
          startDate: "2026-09-22", endDate: "2026-09-22",
          createdAt: "2026-09-18 14:45"
        }
      };
      for (var lrid in leaveRequests) {
        await db.collection("leaveRequests").doc(lrid).set(leaveRequests[lrid]);
      }
      log("เสร็จ leaveRequests (5 ใบ)");

      // 📁 leaveRequests/{id}/approvals — ความเห็นการอนุมัติ
      log("กำลังใส่ข้อมูล approvals…");
      var approvals = {
        lr001: {
          ap001: { authorId: "u002", authorName: "สมหญิง รักงาน", message: "รับเรื่องแล้ว ขอดูตารางงานของทีมช่วงนั้นก่อนนะครับ", createdAt: "2026-09-01 13:40" },
          ap002: { authorId: "u003", authorName: "สมศรี ตั้งใจ", message: "ตรวจแล้ว วันลาพักร้อนคงเหลือครอบคลุมช่วงที่ขอ ไม่ติดขัดฝั่งฝ่ายบุคคล", createdAt: "2026-09-02 10:05" }
        },
        lr002: {
          ap003: { authorId: "u002", authorName: "สมหญิง รักงาน", message: "อนุมัติแล้ว พักผ่อนให้เต็มที่ งานที่ค้างไว้เดี๋ยวทีมช่วยดูให้", createdAt: "2026-08-24 09:20" }
        },
        lr004: {
          ap004: { authorId: "u002", authorName: "สมหญิง รักงาน", message: "ช่วงนั้นทีมมีงานส่งมอบพอดี ขอเลื่อนเป็นสัปดาห์ถัดไปได้ไหมครับ", createdAt: "2026-09-20 15:10" }
        }
        // lr003 และ lr005 ไม่มีความเห็น — ตรงกับสถานะ รอพิจารณา ที่ยังไม่มีใครพิจารณา
      };
      for (var parentId in approvals) {
        for (var apId in approvals[parentId]) {
          await db.collection("leaveRequests").doc(parentId).collection("approvals").doc(apId).set(approvals[parentId][apId]);
        }
      }
      log("เสร็จ approvals (4 รายการ)");

      log("");
      log("🎉 ใส่ข้อมูลตัวอย่างครบตามหัวข้อ 7 ของสเปคแล้ว");
      log("ไปเปิดหน้า leave-requests.html หรือ Firebase Console เพื่อตรวจสอบได้เลย");
    } catch (err) {
      log("เกิดข้อผิดพลาด: " + (err && err.message ? err.message : err));
      if (err && err.code === "permission-denied") {
        log("→ Firestore กำลังใช้กฎเข้มงวด (firestore.rules) อยู่ ให้ปลดเป็นโหมดทดสอบชั่วคราว หรือ seed ก่อน deploy กฎ แล้วค่อยลองใหม่");
      }
    } finally {
      ปุ่มSeed.disabled = false;
    }
  }

  if (ปุ่มSeed) ปุ่มSeed.addEventListener("click", seed);
})();
