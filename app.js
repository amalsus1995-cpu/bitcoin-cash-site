// اختيار سهل للعناصر
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// الحد الأدنى للاستثمار
const MIN_AMOUNT = 10;
const MIN_DAYS = 20;

// نسب الربح حسب المدة
const PROFIT_MAP = {
  20: 0.80,
  30: 0.90,
  60: 1.20,
  90: 1.50
};

// الانتقال بين الشاشات
function switchScreen(id) {
  $$(".screen").forEach(sc => sc.classList.remove("active"));
  $("#" + id).classList.add("active");

  $$(".nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.target === id);
  });
}

// حساب الربح المتوقع
function updateExpected() {
  const amount = parseFloat($("#amountInput").value);
  const days = parseInt($("#durationSelect").value);

  if (!amount || amount < MIN_AMOUNT) {
    $("#expectedProfit").textContent = "0$";
    $("#totalReturn").textContent = "0$";
    return;
  }

  const rate = PROFIT_MAP[days];
  const profit = amount * rate;
  const total = amount + profit;

  $("#expectedProfit").textContent = profit.toFixed(2) + "$";
  $("#totalReturn").textContent = total.toFixed(2) + "$";
}

// حفظ بيانات المستخدم
function saveProfile() {
  const username = $("#profileUsername").value.trim();
  const email = $("#profileEmail")?.value.trim() || "";

  localStorage.setItem("bc_profile", JSON.stringify({ username, email }));
  alert("تم حفظ معلوماتك بنجاح");
}

// تحميل بيانات المستخدم
function loadProfile() {
  const data = JSON.parse(localStorage.getItem("bc_profile") || "{}");
  if (data.username) {
    $("#usernameInput").value = data.username;
    $("#profileUsername").value = data.username;
  }
  if (data.email) $("#profileEmail").value = data.email;
}

// بدأ عملية الاستثمار (الخطوة الأولى)
function startInvest() {
  const username = $("#usernameInput").value.trim();
  const amount = parseFloat($("#amountInput").value);
  const days = parseInt($("#durationSelect").value);

  if (!username) return alert("الرجاء كتابة اسم المستخدم");
  if (amount < MIN_AMOUNT) return alert("أقل مبلغ هو 10 دولار");
  if (days < MIN_DAYS) return alert("أقل مدة للاستثمار هي 20 يوم");

  alert(
    "خطوة 1: رجاءً قم بتحويل مبلغ الاستثمار إلى محفظة الموقع:\n\n" +
    "USDT TRC20 Address:\n" +
    "TPNoGerv1EMBSdrs9Yca93eCQUVsoNiRvq\n\n" +
    "بعد التحويل، سيتم تأكيد الطلب من قبل الإدارة."
  );
}

// تحميل بيانات المحفظة
function loadWallet() {
  const data = JSON.parse(localStorage.getItem("bc_wallet") || "{}");

  $("#walletBalance").textContent = (data.balance || 0) + "$";
  $("#lockedBalance").textContent = (data.locked || 0) + "$";
}

// إرسال طلب سحب
function requestWithdraw() {
  const amount = parseFloat($("#withdrawAmount").value);
  const wallet = $("#withdrawWallet").value.trim();

  if (!amount || amount <= 0) return alert("أدخل مبلغ صحيح");
  if (!wallet) return alert("أدخل عنوان محفظتك");

  alert("تم إرسال طلب السحب، وسيتم معالجته من قبل الإدارة.");
}

// عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  updateExpected();

  // التنقل بين الشاشات
  $$(".nav-item").forEach(btn =>
    btn.addEventListener("click", () =>
      switchScreen(btn.dataset.target)
    )
  );

  // أحداث الأزرار
  $("#saveProfileBtn").addEventListener("click", saveProfile);
  $("#startInvestBtn").addEventListener("click", startInvest);
  $("#withdrawBtn").addEventListener("click", requestWithdraw);
  $("#amountInput").addEventListener("input", updateExpected);
  $("#durationSelect").addEventListener("change", updateExpected);

  // أزرار الخطط الجاهزة
  $$(".plan-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".plan-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      $("#amountInput").value = btn.dataset.amount;
      updateExpected();
    });
  });
});
