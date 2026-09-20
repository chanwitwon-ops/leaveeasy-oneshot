// ─────────────────────────────────────────────────────────────
// js/new-leave-request.js — หน้าที่ 2 ยื่นใบลาใหม่
// บันทึกใบลาใหม่ลง Firestore collection "leaveRequests" จริง
// ─────────────────────────────────────────────────────────────

(function () {
  var ฟอร์ม = document.getElementById("ฟอร์มใบลา");
  var ช่องประเภท = document.getElementById("leaveTypeId");
  var กล่องเตือน = document.getElementById("ข้อความเตือน");
  var ปุ่มบันทึก = document.getElementById("submit-btn");

  // รายชื่อประเภทการลาจริงจาก Firestore (เติมพร้อมกับ dropdown ด้านล่าง)
  // ใช้ชุดเดียวกันนี้ตรวจสอบผลลัพธ์จาก AI ด้วย — ไม่ query ซ้ำ
  var leaveTypesList = [];

  function เตือน(ข้อความ) {
    กล่องเตือน.textContent = "⚠️ " + ข้อความ;
    กล่องเตือน.classList.remove("hidden");
  }

  function ซ่อนเตือน() {
    กล่องเตือน.classList.add("hidden");
  }

  window.currentUserPromise.then(function (user) {
    if (!user) return; // nav.js กำลังเด้งไปหน้า login.html อยู่แล้ว

    // เติมรายการเลื่อนลงด้วยประเภทการลาที่มีอยู่จริงใน Firestore
    db.collection("leaveTypes").get().then(function (snapshot) {
      snapshot.forEach(function (doc) {
        var ข้อมูล = doc.data();
        leaveTypesList.push({ id: doc.id, name: ข้อมูล.name });

        var ตัวเลือก = document.createElement("option");
        ตัวเลือก.value = doc.id;
        ตัวเลือก.textContent = ข้อมูล.name;
        ช่องประเภท.appendChild(ตัวเลือก);
      });
    }).catch(function (err) {
      console.error("โหลดประเภทการลาไม่สำเร็จ", err);
      เตือน("โหลดรายการประเภทการลาไม่สำเร็จ: " + (err.message || "เกิดข้อผิดพลาด"));
    });

    ฟอร์ม.addEventListener("submit", function (e) {
      e.preventDefault();
      ซ่อนเตือน();

      var ค่า = {
        title: document.getElementById("title").value.trim(),
        reason: document.getElementById("reason").value.trim(),
        leaveTypeId: ช่องประเภท.value,
        startDate: document.getElementById("startDate").value,
        endDate: document.getElementById("endDate").value
      };

      // ตรวจว่ากรอกครบก่อนบันทึก
      if (!ค่า.title || !ค่า.reason || !ค่า.leaveTypeId || !ค่า.startDate || !ค่า.endDate) {
        เตือน("กรอกไม่ครบ — ต้องกรอกทุกช่องก่อนกดบันทึก");
        return;
      }
      if (ค่า.endDate < ค่า.startDate) {
        เตือน("วันที่สิ้นสุดต้องไม่มาก่อนวันที่เริ่มลา");
        return;
      }

      var ตัวเลือกที่เลือก = ช่องประเภท.options[ช่องประเภท.selectedIndex];
      var ชื่อประเภท = ตัวเลือกที่เลือก ? ตัวเลือกที่เลือก.textContent : "";

      ปุ่มบันทึก.disabled = true;

      db.collection("leaveRequests").add({
        title: ค่า.title,
        reason: ค่า.reason,
        status: "รอพิจารณา",                 // ใบใหม่เริ่มที่ รอพิจารณา เสมอ ตั้งอัตโนมัติ เลือกเองไม่ได้
        requesterId: user.uid,                // ผู้ยื่นคือคนที่ล็อกอินอยู่จริงเสมอ
        requesterName: user.name,
        approverId: "",                       // ยังไม่ได้กำหนดผู้อนุมัติ (นอกขอบเขต Module 2)
        approverName: "",
        leaveTypeId: ค่า.leaveTypeId,
        leaveTypeName: ชื่อประเภท,
        startDate: ค่า.startDate,
        endDate: ค่า.endDate,
        createdAt: เวลาตอนนี้()
      }).then(function () {
        location.href = "leave-requests.html";
      }).catch(function (err) {
        console.error("บันทึกใบลาไม่สำเร็จ", err);
        เตือน("บันทึกไม่สำเร็จ: " + (err.message || "เกิดข้อผิดพลาด"));
        ปุ่มบันทึก.disabled = false;
      });
    });
  });

  // ===============================================================
  // สัปดาห์ที่ 8: ปุ่มให้ AI ช่วยจัดประเภทการลา (US-09)
  // ===============================================================
  // เรียก OpenRouter Chat Completions ตรงจาก client-side fetch (ไม่มีเซิร์ฟเวอร์กลาง)
  // คีย์จริงมาจาก js/ai-config.js (ดู js/ai-config.example.js สำหรับต้นแบบ + วิธีตั้งค่า)
  // ผลลัพธ์จาก AI ต้อง "ตกลงใช้" ก่อนถึงจะเติมลง #leaveTypeId เสมอ ไม่ auto-apply

  var aiClassifyBtn = document.getElementById('ai-classify-btn');
  var aiAcceptBtn = document.getElementById('ai-accept-btn');
  var aiSuggestionBox = document.getElementById('ai-suggestion-box');
  var aiSuggestionLabel = document.getElementById('ai-suggestion-label');
  var aiSuggestionText = document.getElementById('ai-suggestion-text');
  var reasonField = document.getElementById('reason');

  var AI_TIMEOUT_MS = 15000; // ครบ 15 วินาทีแล้วต้องไม่ค้างระบบ (ตาม US-09)
  var aiClassifyBtnLabelเดิม = aiClassifyBtn ? aiClassifyBtn.textContent : '';
  var aiSuggestedLeaveTypeId = null; // ผลที่ validate ผ่านแล้ว รอผู้ใช้กด "ตกลงใช้ข้อเสนอนี้"

  function แสดงข้อความAI(ข้อความ) {
    aiSuggestionText.textContent = ข้อความ;
    aiSuggestionBox.classList.remove('hidden');
  }

  function ล้างข้อเสนอAI() {
    aiSuggestedLeaveTypeId = null;
    aiAcceptBtn.classList.add('hidden');
    aiSuggestionLabel.classList.add('hidden');
  }

  // พยายามดึง {"leaveTypeName": "..."} ออกจากคำตอบของโมเดล
  // เผื่อโมเดลตอบมาเป็น markdown code fence หรือมีข้อความอื่นปนมา
  function แกะชื่อประเภทจากคำตอบ(ข้อความดิบ) {
    if (!ข้อความดิบ) return '';
    var ข้อความ = String(ข้อความดิบ).trim();

    var fenced = ข้อความ.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) ข้อความ = fenced[1].trim();

    var jsonMatch = ข้อความ.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        var obj = JSON.parse(jsonMatch[0]);
        if (obj && typeof obj.leaveTypeName === 'string') return obj.leaveTypeName.trim();
      } catch (e) {
        // parse ไม่ได้ ใช้ข้อความดิบด้านล่างแทน
      }
    }
    return ข้อความ;
  }

  // ต้องตรงกับ leaveTypeName ที่มีอยู่จริงในระบบเท่านั้น (จากชุด leaveTypesList ที่โหลดไว้แล้ว)
  function หาประเภทที่ตรงกัน(ชื่อ) {
    if (!ชื่อ) return null;
    var ตรงเป๊ะ = leaveTypesList.filter(function (t) { return t.name === ชื่อ; })[0];
    if (ตรงเป๊ะ) return ตรงเป๊ะ;
    var ชื่อเทียบ = ชื่อ.trim().toLowerCase();
    return leaveTypesList.filter(function (t) { return t.name.trim().toLowerCase() === ชื่อเทียบ; })[0] || null;
  }

  if (aiClassifyBtn) {
    aiClassifyBtn.addEventListener('click', function (e) {
      e.preventDefault();
      ล้างข้อเสนอAI();

      var เหตุผล = reasonField.value.trim();
      if (!เหตุผล) {
        แสดงข้อความAI('กรุณากรอกเหตุผลการลาก่อน แล้วค่อยกดให้ AI ช่วยจัดประเภท');
        return;
      }

      if (typeof OPENROUTER_API_KEY === 'undefined' || !OPENROUTER_API_KEY || OPENROUTER_API_KEY.indexOf('วางคีย์') === 0) {
        แสดงข้อความAI('ยังไม่ได้ตั้งค่าคีย์ AI (js/ai-config.js) — กรุณาเลือกประเภทการลาเอง');
        return;
      }

      if (!leaveTypesList.length) {
        แสดงข้อความAI('ยังโหลดรายการประเภทการลาไม่เสร็จ กรุณารอสักครู่แล้วลองใหม่');
        return;
      }

      aiClassifyBtn.disabled = true;
      aiClassifyBtn.textContent = 'กำลังวิเคราะห์…';
      แสดงข้อความAI('กำลังวิเคราะห์…');

      var controller = new AbortController();
      var หมดเวลา = setTimeout(function () { controller.abort(); }, AI_TIMEOUT_MS);

      var ชื่อประเภททั้งหมด = leaveTypesList.map(function (t) { return t.name; });
      var systemPrompt = 'คุณคือผู้ช่วยจัดประเภทใบลางาน ให้เลือกประเภทการลาที่ตรงกับเหตุผลที่ผู้ใช้พิมพ์มากที่สุด ' +
        'โดยต้องเลือกจากรายชื่อนี้เท่านั้น ห้ามแต่งชื่อใหม่ ห้ามแปลภาษา ต้องสะกดตรงตัวทุกตัวอักษรตามที่ให้มา: ' +
        JSON.stringify(ชื่อประเภททั้งหมด) + ' ' +
        'ตอบกลับเป็น JSON object เดียวเท่านั้น รูปแบบ {"leaveTypeName": "<ชื่อประเภทที่เลือก>"} ห้ามมีข้อความอื่นนอกจาก JSON นี้';

      fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': 'Bearer ' + OPENROUTER_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: (typeof OPENROUTER_MODEL !== 'undefined' && OPENROUTER_MODEL) ? OPENROUTER_MODEL : 'openai/gpt-4o-mini',
          temperature: 0,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'เหตุผลการลา: ' + เหตุผล }
          ]
        })
      }).then(function (res) {
        if (!res.ok) throw new Error('เรียก AI ไม่สำเร็จ (HTTP ' + res.status + ')');
        return res.json();
      }).then(function (ข้อมูลตอบกลับ) {
        var เนื้อหา = ข้อมูลตอบกลับ && ข้อมูลตอบกลับ.choices &&
          ข้อมูลตอบกลับ.choices[0] && ข้อมูลตอบกลับ.choices[0].message &&
          ข้อมูลตอบกลับ.choices[0].message.content;

        var ชื่อที่AIเลือก = แกะชื่อประเภทจากคำตอบ(เนื้อหา);
        var ประเภทที่ตรงกัน = หาประเภทที่ตรงกัน(ชื่อที่AIเลือก);

        if (!ประเภทที่ตรงกัน) {
          console.warn('AI ตอบชื่อประเภทที่ไม่ตรงกับระบบ:', ชื่อที่AIเลือก);
          แสดงข้อความAI('จัดประเภทให้ไม่ได้ กรุณาเลือกเอง');
          return;
        }

        aiSuggestedLeaveTypeId = ประเภทที่ตรงกัน.id;
        aiSuggestionLabel.classList.remove('hidden');
        แสดงข้อความAI('ประเภทการลาที่ AI แนะนำ: ' + ประเภทที่ตรงกัน.name);
        aiAcceptBtn.classList.remove('hidden');
      }).catch(function (err) {
        console.error('เรียก AI จัดประเภทการลาไม่สำเร็จ', err);
        var ข้อความ = (err && err.name === 'AbortError')
          ? 'หมดเวลารอ (เกิน 15 วินาที) กรุณาลองใหม่หรือเลือกเอง'
          : 'เรียก AI ไม่สำเร็จ กรุณาลองใหม่หรือเลือกเอง';
        แสดงข้อความAI(ข้อความ);
      }).finally(function () {
        clearTimeout(หมดเวลา);
        aiClassifyBtn.disabled = false;
        aiClassifyBtn.textContent = aiClassifyBtnLabelเดิม;
      });
    });
  }

  if (aiAcceptBtn) {
    aiAcceptBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (!aiSuggestedLeaveTypeId) return;

      ช่องประเภท.value = aiSuggestedLeaveTypeId; // ผู้ใช้ยังแก้เองได้ตามปกติหลังจากนี้เสมอ
      aiSuggestionBox.classList.add('hidden');
      ล้างข้อเสนอAI();
    });
  }
})();
