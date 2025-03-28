// ฟังก์ชันโหลดข้อมูลเมนูตามวันที่
function loadMenuData() {
    const currentDate = document.getElementById('current-date').value;
    
    // โหลดข้อมูลจาก localStorage
    const savedData = localStorage.getItem(`food-counter-${currentDate}`);
    
    if (savedData) {
        menuData = JSON.parse(savedData);
    } else {
        // ถ้าไม่มีข้อมูลเดิม ให้โหลดเฉพาะรายชื่อเมนู
        const menuList = localStorage.getItem('food-counter-menu-list');
        if (menuList) {
            menuData = JSON.parse(menuList);
            // ตั้งค่าจำนวนเป็น 0 สำหรับทุกเมนู
            for (const menuName in menuData) {
                menuData[menuName].count = 0;
            }
        } else {
            // ถ้าไม่มีรายชื่อเมนูที่บันทึกไว้ ให้สร้างเมนูเริ่มต้น
            menuData = {
                "ข้าวผัดกระเพรา": { price: 50, count: 0 },
                "ข้าวผัด": { price: 45, count: 0 },
                "ผัดซีอิ๊ว": { price: 50, count: 0 },
                "ผัดไทย": { price: 60, count: 0 },
                "ต้มยำกุ้ง": { price: 80, count: 0 }
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
