// ฟังก์ชันโหลดข้อมูลเมนูตามวันที่
function loadMenuData() {
    const currentDate = document.getElementById('current-date').value;
    
    // โหลดข้อมูลจาก localStorage
    const savedData = localStorage.getItem(`food-counter-${currentDate}`);
    
    if (savedData) {
        menuData = JSON.parse(savedData);
        // ตรวจสอบและเพิ่มหมวดหมู่ให้ข้อมูลเก่า
        for(let key in menuData) {
            if(!menuData[key].category) menuData[key].category = 'หมูสะเต๊ะ';
        }
    } else {
        // ถ้าไม่มีข้อมูลเดิม ให้โหลดเฉพาะรายชื่อเมนู
        const menuList = localStorage.getItem('food-counter-menu-list');
        if (menuList) {
            menuData = JSON.parse(menuList);
            // ตั้งค่าจำนวนเป็น 0 สำหรับทุกเมนู
            for (const menuName in menuData) {
                menuData[menuName].count = 0;
                if(!menuData[menuName].category) menuData[menuName].category = 'หมูสะเต๊ะ';
            }
        } else {
            // ถ้าไม่มีรายชื่อเมนูที่บันทึกไว้ ให้สร้างเมนูเริ่มต้น
            menuData = {
                "หมูสะเต๊ะชุดเล็ก": { price: 50, count: 0, category: 'หมูสะเต๊ะ' },
                "หมูสะเต๊ะชุดใหญ่": { price: 100, count: 0, category: 'หมูสะเต๊ะ' },
                "หอยทอดกระทะร้อน": { price: 50, count: 0, category: 'หอยทอด' },
                "ผัดไทยกุ้งสด": { price: 60, count: 0, category: 'ผัดไทย' },
                "ขนมปังปิ้ง": { price: 15, count: 0, category: 'เครื่องเคียง' }
            };
            // บันทึกรายชื่อเมนู
            saveMenuList();
        }
    }
    
    renderMenuItems();
    updateSummary();
}

// ฟังก์ชันบันทึกรายชื่อเมนู
function saveMenuList() {
    localStorage.setItem('food-counter-menu-list', JSON.stringify(menuData));
}

// ฟังก์ชันบันทึกข้อมูล
function saveData() {
    const currentDate = document.getElementById('current-date').value;
    localStorage.setItem(`food-counter-${currentDate}`, JSON.stringify(menuData));
}

// เพิ่มในไฟล์ storage.js - สร้างฟังก์ชันสำหรับบันทึกการขายที่เสร็จสมบูรณ์
function saveDailySales(saleData) {
    const currentDate = document.getElementById('current-date').value;
    let dailySales = localStorage.getItem(`food-counter-sales-${currentDate}`);
    
    if (dailySales) {
        dailySales = JSON.parse(dailySales);
        dailySales.sales.push(saleData);
        dailySales.totalRevenue += saleData.totalAmount;
    } else {
        dailySales = {
            sales: [saleData],
            totalRevenue: saleData.totalAmount
        };
    }
    
    localStorage.setItem(`food-counter-sales-${currentDate}`, JSON.stringify(dailySales));
    return dailySales;
}

// เพิ่มในไฟล์ storage.js - สร้างฟังก์ชันสำหรับโหลดยอดขายรายวัน
function loadDailySales() {
    const currentDate = document.getElementById('current-date').value;
    const dailySales = localStorage.getItem(`food-counter-sales-${currentDate}`);
    
    if (dailySales) {
        return JSON.parse(dailySales);
    } else {
        return {
            sales: [],
            totalRevenue: 0
        };
    }
}

// ฟังก์ชันยกเลิกบิล
function voidDailySale(timestamp) {
    const currentDate = document.getElementById('current-date').value;
    let dailySales = localStorage.getItem(`food-counter-sales-${currentDate}`);
    
    if (dailySales) {
        dailySales = JSON.parse(dailySales);
        const sale = dailySales.sales.find(s => s.timestamp === timestamp);
        if (sale && sale.status !== 'voided') {
            sale.status = 'voided';
            dailySales.totalRevenue -= sale.totalAmount;
            localStorage.setItem(`food-counter-sales-${currentDate}`, JSON.stringify(dailySales));
        }
    }
}