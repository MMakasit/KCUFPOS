// ฟังก์ชันแสดงเมนูอาหาร
function renderMenuItems() {
    const menuContainer = document.getElementById('menu-list');
    menuContainer.innerHTML = '';
    
    for (const [menuName, menuInfo] of Object.entries(menuData)) {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        
        const total = menuInfo.price * menuInfo.count;
        
        menuItem.innerHTML = `
            <button class="delete" onclick="deleteMenu('${menuName}')">ลบ</button>
            <div class="menu-name">${menuName}</div>
            <div class="menu-price">${menuInfo.price} บาท</div>
            <div class="counter">
                <button class="decrease" onclick="decreaseCount('${menuName}')">-</button>
                <span class="count">${menuInfo.count}</span>
                <button onclick="increaseCount('${menuName}')">+</button>
            </div>
            <div class="total">รวม: ${total} บาท</div>
            <button class="edit" onclick="editMenu('${menuName}')">แก้ไข</button>
        `;
        menuContainer.appendChild(menuItem);
    }
}

// ฟังก์ชันเพิ่มจำนวนอาหาร
function increaseCount(menuName) {
    menuData[menuName].count++;
    saveData();
    renderMenuItems();
    updateSummary();
}

// ฟังก์ชันลดจำนวนอาหาร
function decreaseCount(menuName) {
    if (menuData[menuName].count > 0) {
        menuData[menuName].count--;
        saveData();
        renderMenuItems();
        updateSummary();
    }
}

// ฟังก์ชันเพิ่มเมนูใหม่
function addNewMenu() {
    const newMenuName = document.getElementById('new-menu-name').value.trim();
    const newMenuPrice = parseFloat(document.getElementById('new-menu-price').value);
    
    if (newMenuName && !isNaN(newMenuPrice) && newMenuPrice >= 0) {
        if (!menuData.hasOwnProperty(newMenuName)) {
            menuData[newMenuName] = {
                price: newMenuPrice,
                count: 0
            };
            saveData();
            saveMenuList();
            renderMenuItems();
            document.getElementById('new-menu-name').value = '';
            document.getElementById('new-menu-price').value = '';
        } else {
            alert('เมนูนี้มีอยู่แล้ว');
        }
    } else {
        alert('กรุณากรอกชื่อเมนูและราคาให้ถูกต้อง');
    }
}

// ฟังก์ชันลบเมนู
function deleteMenu(menuName) {
    if (confirm(`คุณต้องการลบเมนู "${menuName}" ใช่หรือไม่?`)) {
        delete menuData[menuName];
        saveData();
        saveMenuList();
        renderMenuItems();
        updateSummary();
    }
}

// ฟังก์ชันแก้ไขเมนู
function editMenu(menuName) {
    currentEditingMenu = menuName;
    document.getElementById('edit-menu-name').value = menuName;
    document.getElementById('edit-menu-price').value = menuData[menuName].price;
    document.getElementById('editModal').style.display = 'block';
}

// ฟังก์ชันปิด Modal แก้ไขเมนู
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// ฟังก์ชันบันทึกการแก้ไขเมนู
function saveEditMenu() {
    const newName = document.getElementById('edit-menu-name').value.trim();
    const newPrice = parseFloat(document.getElementById('edit-menu-price').value);
    
    if (newName && !isNaN(newPrice) && newPrice >= 0) {
        // ถ้าเปลี่ยนชื่อ
        if (newName !== currentEditingMenu) {
            // ตรวจสอบว่าชื่อใหม่ซ้ำหรือไม่
            if (menuData.hasOwnProperty(newName)) {
                alert('มีเมนูชื่อนี้อยู่แล้ว');
                return;
            }
            
            // สร้างเมนูใหม่ด้วยข้อมูลเดิม
            menuData[newName] = {
                price: newPrice,
                count: menuData[currentEditingMenu].count
            };
            
            // ลบเมนูเก่า
            delete menuData[currentEditingMenu];
        } else {
            // อัพเดทเฉพาะราคา
            menuData[currentEditingMenu].price = newPrice;
        }
        
        saveData();
        saveMenuList();
        renderMenuItems();
        updateSummary();
        closeEditModal();
    } else {
        alert('กรุณากรอกชื่อเมนูและราคาให้ถูกต้อง');
    }
}

// ฟังก์ชันอัปเดตสรุปยอดรวม
function updateSummary() {
    const summaryContent = document.getElementById('summary-content');
    let totalItems = 0;
    let totalRevenue = 0;
    let summaryHTML = '<ul>';
    
    for (const [menuName, menuInfo] of Object.entries(menuData)) {
        if (menuInfo.count > 0) {
            const menuTotal = menuInfo.price * menuInfo.count;
            summaryHTML += `<li>${menuName}: ${menuInfo.count} รายการ x ${menuInfo.price} บาท = ${menuTotal} บาท</li>`;
            totalItems += menuInfo.count;
            totalRevenue += menuTotal;
        }
    }
    
    summaryHTML += '</ul>';
    summaryHTML += `<p><strong>จำนวนรวมทั้งหมด: ${totalItems} รายการ</strong></p>`;
    summaryHTML += `<p><strong>ยอดเงินรวมทั้งหมด: ${totalRevenue} บาท</strong></p>`;
    
    summaryContent.innerHTML = summaryHTML;
}
