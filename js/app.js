// เริ่มต้นกำหนดวันที่ปัจจุบัน
document.getElementById('current-date').valueAsDate = new Date();

// ตั้งค่าการฟังเหตุการณ์เมื่อเปลี่ยนวันที่
document.getElementById('current-date').addEventListener('change', loadMenuData);

// ปุ่มส่งออกข้อมูล
document.getElementById('export-csv').addEventListener('click', exportDataToCSV);
document.getElementById('export-pdf').addEventListener('click', exportDataToPDF);

// สร้างตัวแปรเก็บข้อมูลเมนูอาหาร
let menuData = {};
let currentEditingMenu = "";

// โหลดข้อมูลเมนูเมื่อเริ่มต้น
loadMenuData();

// ฟังก์ชันตรวจสอบสถานะการเชื่อมต่อ
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
    const offlineNotification = document.getElementById('offline-notification');
    if (!navigator.onLine) {
        offlineNotification.classList.remove('hidden');
    } else {
        offlineNotification.classList.add('hidden');
    }
}

// ตรวจสอบสถานะการเชื่อมต่อเมื่อเริ่มต้น
updateOnlineStatus();

// ปิด modal เมื่อคลิกนอก modal
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target == modal) {
        closeEditModal();
    }
}

// ฟังก์ชันสลับหน้าต่าง (Tabs)
function switchTab(tabId, btnElement) {
    // ซ่อนเนื้อหาทุกแท็บ
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active-tab'));
    
    // เอาคลาส active ออกจากทุกปุ่มบน navbar
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));
    
    // แสดงแท็บที่เลือก
    document.getElementById(tabId).classList.add('active-tab');
    
    // ใส่คลาส active ให้กับปุ่มที่กด
    if(btnElement) {
        btnElement.classList.add('active');
    }
}
