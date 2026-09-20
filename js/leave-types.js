// ─────────────────────────────────────────────────────────────
// js/leave-types.js — หน้าที่ 4 จัดการประเภทการลา
// เพิ่ม/แก้/ลบ ลง Firestore collection "leaveTypes" จริง
//
// หน้านี้ซ่อนปุ่มเพิ่ม/แก้/ลบจากคนที่ไม่ใช่ hr (สัปดาห์ที่ 8 ตามหัวข้อ 4 หน้าที่ 4)
// ฝั่งข้อมูลบังคับจริงอีกชั้นผ่าน firestore.rules (เขียนได้เฉพาะ hr เท่านั้น)
// ─────────────────────────────────────────────────────────────

(function () {
  var ที่วางตาราง = document.getElementById("ตารางประเภท");
  var ช่องชื่อใหม่ = document.getElementById("ชื่อประเภทใหม่");
  var กล่องเตือน = document.getElementById("เตือนประเภท");
  var การ์ดเพิ่มประเภท = document.getElementById("การ์ดเพิ่มประเภท");
  var เป็นฝ่ายบุคคล = false;

  function เตือน(ข้อความ) {
    กล่องเตือน.textContent = "⚠️ " + ข้อความ;
    กล่องเตือน.classList.remove("hidden");
  }
  function ซ่อนเตือน() {
    กล่องเตือน.classList.add("hidden");
  }

  window.currentUserPromise.then(function (user) {
    if (!user) return; // nav.js กำลังเด้งไปหน้า login.html อยู่แล้ว

    เป็นฝ่ายบุคคล = user.role === "hr";
    การ์ดเพิ่มประเภท.classList.toggle("hidden", !เป็นฝ่ายบุคคล);

    โหลดและวาด();
    document.getElementById("ปุ่มเพิ่ม").addEventListener("click", เพิ่มประเภท);
  });

  function โหลดและวาด() {
    db.collection("leaveTypes").get().then(function (snapshot) {
      var รายการ = [];
      snapshot.forEach(function (doc) {
        รายการ.push(Object.assign({ id: doc.id }, doc.data()));
      });
      วาดตาราง(รายการ);
    }).catch(function (err) {
      console.error("โหลดประเภทการลาไม่สำเร็จ", err);
      ที่วางตาราง.innerHTML = "<p>โหลดข้อมูลไม่สำเร็จ: " + esc(err.message || "เกิดข้อผิดพลาด") + "</p>";
    });
  }

  function วาดตาราง(รายการ) {
    if (รายการ.length === 0) {
      ที่วางตาราง.innerHTML = "<p>ยังไม่มีประเภทการลาในระบบ</p>";
      return;
    }

    var html = "<table><thead><tr><th>ชื่อประเภทการลา</th>" +
      (เป็นฝ่ายบุคคล ? "<th>จัดการ</th>" : "") + "</tr></thead><tbody>";
    รายการ.forEach(function (ประเภท) {
      html += "<tr><td>" + esc(ประเภท.name) + "</td>";
      if (เป็นฝ่ายบุคคล) {
        html += "<td>" +
          '<button type="button" class="btn-ghost" data-edit="' + esc(ประเภท.id) + '">แก้ไข</button> ' +
          '<button type="button" class="btn-danger" data-del="' + esc(ประเภท.id) + '">ลบ</button>' +
          "</td>";
      }
      html += "</tr>";
    });
    html += "</tbody></table>";
    ที่วางตาราง.innerHTML = html;

    if (!เป็นฝ่ายบุคคล) return; // ไม่ใช่ hr ไม่ต้องผูกปุ่มแก้/ลบ (ไม่มีปุ่มให้กดอยู่แล้ว)

    ที่วางตาราง.querySelectorAll("[data-edit]").forEach(function (ปุ่ม) {
      ปุ่ม.addEventListener("click", function () {
        var ประเภท = รายการ.find(function (t) { return t.id === ปุ่ม.dataset.edit; });
        แก้ประเภท(ประเภท);
      });
    });
    ที่วางตาราง.querySelectorAll("[data-del]").forEach(function (ปุ่ม) {
      ปุ่ม.addEventListener("click", function () {
        var ประเภท = รายการ.find(function (t) { return t.id === ปุ่ม.dataset.del; });
        ลบประเภท(ประเภท);
      });
    });
  }

  function เพิ่มประเภท() {
    var ชื่อ = ช่องชื่อใหม่.value.trim();
    if (!ชื่อ) {
      เตือน("พิมพ์ชื่อประเภทการลาก่อน จึงจะเพิ่มได้");
      return;
    }
    ซ่อนเตือน();

    db.collection("leaveTypes").add({ name: ชื่อ }).then(function () {
      ช่องชื่อใหม่.value = "";
      โหลดและวาด();
    }).catch(function (err) {
      console.error("เพิ่มประเภทการลาไม่สำเร็จ", err);
      เตือน("เพิ่มไม่สำเร็จ: " + (err.message || "ไม่มีสิทธิ์ทำรายการนี้ (เฉพาะฝ่ายบุคคล)"));
    });
  }

  function แก้ประเภท(ประเภท) {
    var ชื่อใหม่ = prompt("แก้ชื่อประเภทการลา", ประเภท.name);
    if (ชื่อใหม่ === null) return; // กดยกเลิก
    if (!ชื่อใหม่.trim()) {
      alert("ชื่อประเภทการลาว่างเปล่าไม่ได้");
      return;
    }

    db.collection("leaveTypes").doc(ประเภท.id).update({ name: ชื่อใหม่.trim() })
      .then(โหลดและวาด)
      .catch(function (err) {
        console.error("แก้ไขประเภทการลาไม่สำเร็จ", err);
        alert("แก้ไขไม่สำเร็จ: " + (err.message || "ไม่มีสิทธิ์ทำรายการนี้ (เฉพาะฝ่ายบุคคล)"));
      });
  }

  function ลบประเภท(ประเภท) {
    if (!confirm('ยืนยันการลบประเภท "' + ประเภท.name + '" หรือไม่')) return;

    db.collection("leaveTypes").doc(ประเภท.id).delete()
      .then(โหลดและวาด)
      .catch(function (err) {
        console.error("ลบประเภทการลาไม่สำเร็จ", err);
        alert("ลบไม่สำเร็จ: " + (err.message || "ไม่มีสิทธิ์ทำรายการนี้ (เฉพาะฝ่ายบุคคล)"));
      });
  }
})();
