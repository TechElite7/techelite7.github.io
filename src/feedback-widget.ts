(() => {
  if (typeof document === 'undefined' || document.getElementById('te-feedback-root')) return;

  const style = document.createElement('style');
  style.textContent = `
    #te-feedback-btn {
      position: fixed;
      bottom: 18px;
      left: 18px;
      z-index: 9990;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 15px;
      border-radius: 999px;
      border: 1px solid rgba(99, 102, 241, 0.35);
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
      color: #fff;
      font-family: inherit;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.28);
      transition: transform .18s ease, box-shadow .18s ease;
      direction: rtl;
    }
    #te-feedback-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(49, 46, 129, 0.4);
    }
    #te-feedback-backdrop {
      position: fixed;
      inset: 0;
      z-index: 9995;
      background: rgba(15, 23, 42, 0.58);
      backdrop-filter: blur(4px);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      direction: rtl;
    }
    #te-feedback-backdrop.open { display: flex; }
    #te-feedback-modal {
      width: 100%;
      max-width: 430px;
      background: #0f172a;
      color: #f8fafc;
      border: 1px solid rgba(148, 163, 184, 0.22);
      border-radius: 18px;
      padding: 20px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
      font-family: inherit;
    }
    #te-feedback-modal h3 {
      margin: 0 0 6px;
      font-size: 17px;
      font-weight: 800;
      color: #fff;
    }
    #te-feedback-modal p {
      margin: 0 0 14px;
      font-size: 12.5px;
      color: #94a3b8;
      line-height: 1.55;
    }
    .te-fb-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 10px;
    }
    .te-fb-field {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 10px;
    }
    .te-fb-field label {
      font-size: 12px;
      font-weight: 700;
      color: #cbd5e1;
    }
    .te-fb-field select,
    .te-fb-field input,
    .te-fb-field textarea {
      width: 100%;
      box-sizing: border-box;
      border-radius: 10px;
      border: 1px solid rgba(148, 163, 184, 0.25);
      background: #1e293b;
      color: #f8fafc;
      padding: 9px 11px;
      font-family: inherit;
      font-size: 13px;
      outline: none;
    }
    .te-fb-field select:focus,
    .te-fb-field input:focus,
    .te-fb-field textarea:focus {
      border-color: #6366f1;
    }
    .te-fb-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 14px;
    }
    .te-fb-cancel {
      padding: 9px 14px;
      border-radius: 10px;
      border: 1px solid rgba(148, 163, 184, 0.25);
      background: transparent;
      color: #cbd5e1;
      font-family: inherit;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    .te-fb-submit {
      padding: 9px 18px;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      color: #fff;
      font-family: inherit;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    .te-fb-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    #te-fb-status {
      margin-top: 10px;
      font-size: 12.5px;
      font-weight: 700;
      min-height: 18px;
    }
    @media (max-width: 520px) {
      #te-feedback-btn { bottom: 14px; left: 12px; padding: 9px 12px; font-size: 12px; }
    }
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'te-feedback-root';
  root.innerHTML = `
    <button id="te-feedback-btn" type="button" aria-label="إرسال مشكلة أو اقتراح">
      <span>💬</span>
      <span>مشكلة أو اقتراح</span>
    </button>
    <div id="te-feedback-backdrop" role="dialog" aria-modal="true">
      <div id="te-feedback-modal">
        <h3>📩 إرسال مشكلة أو اقتراح للإدارة</h3>
        <p>تصل رسالتك مباشرة إلى فريق Tech Elite على تيليجرام لمتابعتها وحلها في أسرع وقت.</p>
        <div class="te-fb-row">
          <div class="te-fb-field">
            <label for="te-fb-kind">نوع الرسالة</label>
            <select id="te-fb-kind">
              <option value="مشكلة تقنية في الموقع">مشكلة تقنية في الموقع</option>
              <option value="رابط ملزمة أو اختبار معطل">رابط ملزمة أو اختبار معطل</option>
              <option value="اقتراح ميزة أو تحسين">اقتراح ميزة أو تحسين</option>
              <option value="ملاحظة أكاديمية">ملاحظة أكاديمية</option>
            </select>
          </div>
          <div class="te-fb-field">
            <label for="te-fb-major">التخصص</label>
            <select id="te-fb-major">
              <option value="تقنية المعلومات (IT)">تقنية المعلومات (IT)</option>
              <option value="علوم الحاسوب (CS)">علوم الحاسوب (CS)</option>
              <option value="عام / للجميع">عام / للجميع</option>
            </select>
          </div>
        </div>
        <div class="te-fb-field">
          <label for="te-fb-name">اسمك (اختياري)</label>
          <input id="te-fb-name" type="text" maxlength="50" placeholder="مثال: أحمد - مستوى ثاني" />
        </div>
        <div class="te-fb-field">
          <label for="te-fb-msg">تفاصيل المشكلة أو الاقتراح *</label>
          <textarea id="te-fb-msg" rows="4" maxlength="1400" placeholder="اكتب تفاصيل المشكلة أو اسم المادة والرابط المتعطل..."></textarea>
        </div>
        <div id="te-fb-status"></div>
        <div class="te-fb-actions">
          <button type="button" class="te-fb-cancel" id="te-fb-cancel">إغلاق</button>
          <button type="button" class="te-fb-submit" id="te-fb-submit">إرسال للإدارة 🚀</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const btn = document.getElementById('te-feedback-btn')!;
  const backdrop = document.getElementById('te-feedback-backdrop')!;
  const cancelBtn = document.getElementById('te-fb-cancel')!;
  const submitBtn = document.getElementById('te-fb-submit') as HTMLButtonElement;
  const statusEl = document.getElementById('te-fb-status')!;
  const msgEl = document.getElementById('te-fb-msg') as HTMLTextAreaElement;
  const nameEl = document.getElementById('te-fb-name') as HTMLInputElement;
  const kindEl = document.getElementById('te-fb-kind') as HTMLSelectElement;
  const majorEl = document.getElementById('te-fb-major') as HTMLSelectElement;

  const openModal = () => {
    statusEl.textContent = '';
    backdrop.classList.add('open');
    setTimeout(() => msgEl.focus(), 50);
  };
  const closeModal = () => backdrop.classList.remove('open');

  btn.addEventListener('click', openModal);
  cancelBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  submitBtn.addEventListener('click', async () => {
    const message = msgEl.value.trim();
    if (message.length < 4) {
      statusEl.style.color = '#f87171';
      statusEl.textContent = '⚠️ يرجى كتابة تفاصيل المشكلة أو الاقتراح أولاً.';
      return;
    }
    submitBtn.disabled = true;
    statusEl.style.color = '#93c5fd';
    statusEl.textContent = '⏳ جارٍ الإرسال إلى الإدارة...';

    try {
      const res = await fetch('/api/bot/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: kindEl.value,
          major: majorEl.value,
          name: nameEl.value.trim(),
          message,
          page: window.location.hash || window.location.pathname || '/',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        statusEl.style.color = '#4ade80';
        statusEl.textContent = '✅ تم إرسال رسالتك بنجاح! ستصل للإدارة فوراً.';
        msgEl.value = '';
        setTimeout(closeModal, 1500);
      } else {
        throw new Error(data?.error || 'فشل الإرسال');
      }
    } catch {
      statusEl.style.color = '#f87171';
      statusEl.textContent = '❌ تعذر الإرسال حالياً، تأكد من الاتصال وحاول مجدداً.';
    } finally {
      submitBtn.disabled = false;
    }
  });
})();