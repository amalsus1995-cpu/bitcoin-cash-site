// اختيار أسهل للعناصر
const $ = s => document.querySelector(s);

// كلمة مرور المدير
const ADMIN_PASSWORD = "Alihlal166.";

// فحص كلمة المرور
function loginAdmin() {
  const pass = $("#adminPassword").value.trim();

  if (pass === ADMIN_PASSWORD) {
    // إظهار لوحة التحكم وإخفاء صفحة تسجيل الدخول
    $("#loginSection").classList.add("hidden");
    $("#adminPanel").classList.remove("hidden");
  } else {
    $("#adminLoginStatus").textContent = "❌ كلمة المرور غير صحيحة";
  }
}

// عند الضغط على زر الدخول
document.addEventListener("DOMContentLoaded", () => {
  $("#adminLoginBtn").addEventListener("click", loginAdmin);
});
