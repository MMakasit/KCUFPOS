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
// ฟังก์ชันอัปเดตสรุปยอดรวม
function updateSummary() {
    const summaryContent = document.getElementById('summary-content');
    let totalItems = 0;
    let totalRevenue = 0;
    let summaryHTML = '<h3>รายการปัจจุบัน</h3><ul>';
    
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
    
    // เพิ่มข้อมูลสรุปยอดขายประจำวัน
    const dailySales = loadDailySales();
    summaryHTML += '<hr/>';
    summaryHTML += '<h3>สรุปยอดขายประจำวัน</h3>';
    
    if (dailySales.sales.length > 0) {
        // สร้างออบเจ็กต์เก็บยอดรวมของแต่ละเมนูที่ขายในวันนั้น
        let menuTotalSold = {};
        
        // รวมจำนวนอาหารที่ขายในแต่ละรายการ
        dailySales.sales.forEach(sale => {
            for (const [menuName, itemInfo] of Object.entries(sale.items)) {
                if (!menuTotalSold[menuName]) {
                    menuTotalSold[menuName] = {
                        count: 0,
                        revenue: 0
                    };
                }
                menuTotalSold[menuName].count += itemInfo.count;
                menuTotalSold[menuName].revenue += itemInfo.total;
            }
        });
        
        // แสดงสรุปยอดรวมของแต่ละเมนูที่ขายในวันนั้น
        summaryHTML += '<h4>ยอดรวมอาหารแต่ละรายการ:</h4>';
        summaryHTML += '<ul>';
        for (const [menuName, info] of Object.entries(menuTotalSold)) {
            summaryHTML += `<li>${menuName}: ขายได้ทั้งหมด ${info.count} รายการ = ${info.revenue} บาท</li>`;
        }
        summaryHTML += '</ul>';
        
        // แสดงรายการแต่ละครั้งที่ขาย
        summaryHTML += '<h4>รายการขายแต่ละครั้ง:</h4>';
        summaryHTML += '<ul>';
        dailySales.sales.forEach((sale, index) => {
            const saleTime = new Date(sale.timestamp).toLocaleTimeString();
            let itemsList = '';
            for (const [menuName, itemInfo] of Object.entries(sale.items)) {
                itemsList += `${menuName} x${itemInfo.count}, `;
            }
            itemsList = itemsList.slice(0, -2); // ตัดเครื่องหมาย ", " ตัวสุดท้ายออก
            summaryHTML += `<li>การขายครั้งที่ ${index + 1} (${saleTime}) - ${itemsList} - ${sale.totalAmount} บาท</li>`;
        });
        summaryHTML += '</ul>';
        
        summaryHTML += `<p><strong>จำนวนการขายวันนี้: ${dailySales.sales.length} ครั้ง</strong></p>`;
        summaryHTML += `<p><strong>ยอดเงินรวมประจำวัน: ${dailySales.totalRevenue} บาท</strong></p>`;
    } else {
        summaryHTML += '<p>ยังไม่มีการขายในวันนี้</p>';
    }
    
    summaryContent.innerHTML = summaryHTML;
}

// ฟังก์ชันเปิดโมดัลชำระเงิน
function openPaymentModal() {
    const paymentModal = document.getElementById('payment-modal');
    const paymentOrderSummary = document.getElementById('payment-order-summary');
    const totalPriceInput = document.getElementById('total-price');
    
    // คำนวณยอดรวม
    let totalPrice = 0;
    let summaryHTML = '<ul>';
    
    for (const [menuName, menuInfo] of Object.entries(menuData)) {
        if (menuInfo.count > 0) {
            const menuTotal = menuInfo.price * menuInfo.count;
            summaryHTML += `<li>${menuName}: ${menuInfo.count} x ${menuInfo.price} = ${menuTotal} บาท</li>`;
            totalPrice += menuTotal;
        }
    }
    
    summaryHTML += '</ul>';
    paymentOrderSummary.innerHTML = summaryHTML;
    totalPriceInput.value = `${totalPrice} บาท`;
    
    // แสดงโมดัล
    paymentModal.style.display = 'block';
}

// ฟังก์ชันปิดโมดัลชำระเงิน
function closePaymentModal() {
    document.getElementById('payment-modal').style.display = 'none';
}

// ฟังก์ชันประมวลผลการชำระเงิน
function processPayment() {
    const totalPriceText = document.getElementById('total-price').value;
    const totalPrice = parseFloat(totalPriceText.replace(' บาท', ''));
    const customerPaid = parseFloat(document.getElementById('customer-paid').value);
    const changeInput = document.getElementById('change');
    
    if (isNaN(customerPaid) || customerPaid < totalPrice) {
        alert('กรุณากรอกจำนวนเงินให้ถูกต้อง');
        return;
    }
    
    const change = customerPaid - totalPrice;
    changeInput.value = `${change} บาท`;
    
    // สร้างข้อมูลการขาย
    const saleData = {
        timestamp: new Date().getTime(),
        items: {},
        totalAmount: totalPrice,
        customerPaid: customerPaid,
        change: change
    };
    
    // บันทึกรายการอาหารที่ขาย
    for (const [menuName, menuInfo] of Object.entries(menuData)) {
        if (menuInfo.count > 0) {
            saleData.items[menuName] = {
                price: menuInfo.price,
                count: menuInfo.count,
                total: menuInfo.price * menuInfo.count
            };
        }
    }
    
    // บันทึกการขาย
    saveDailySales(saleData);
    
    // รีเซ็ตจำนวนเมนู
    for (const menuName in menuData) {
        menuData[menuName].count = 0;
    }
    
    // บันทึกข้อมูลเมนูที่อัปเดตแล้ว
    saveData();
    
    // อัปเดต UI
    renderMenuItems();
    updateSummary();
    
    // ปิดโมดัล
    alert('ชำระเงินสำเร็จ');
    closePaymentModal();
}

// ฟังก์ชันเปิดโมดัลเมื่อคลิกปุ่มชำระเงิน
function initPaymentButton() {
    const paymentButton = document.createElement('button');
    paymentButton.textContent = 'ชำระเงิน';
    paymentButton.className = 'payment-btn';
    paymentButton.onclick = openPaymentModal;
    
    // เปลี่ยนจาก .summary เป็น .payment-button-container
    const paymentContainer = document.querySelector('.payment-button-container');
    if (paymentContainer) {
        // ล้างเนื้อหาเดิม (ถ้ามี) และเพิ่มปุ่มใหม่
        paymentContainer.innerHTML = '';
        paymentContainer.appendChild(paymentButton);
    }
}

// เรียกใช้ฟังก์ชันเมื่อโหลดหน้าเว็บ
document.addEventListener('DOMContentLoaded', initPaymentButton);