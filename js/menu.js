// ฟังก์ชันแปลงข้อความเพื่อป้องกัน XSS
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escapeJS(str) {
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

let currentCategory = 'All';

function filterCategory(category) {
    currentCategory = category;
    
    // อัปเดต UI ปุ่ม
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    renderMenuItems();
}

// ฟังก์ชันแสดงเมนูอาหาร
function renderMenuItems() {
    const menuContainer = document.getElementById('menu-list');
    menuContainer.innerHTML = '';
    
    for (const [menuName, menuInfo] of Object.entries(menuData)) {
        // กรองหมวดหมู่
        if (currentCategory !== 'All' && menuInfo.category !== currentCategory) {
            continue;
        }

        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        
        const safeNameHTML = escapeHTML(menuName);
        const safeNameJS = escapeJS(menuName);
        
        menuItem.innerHTML = `
            <button class="delete" onclick="deleteMenu('${safeNameJS}')">ลบ</button>
            <button class="edit" onclick="editMenu('${safeNameJS}')">แก้ไข</button>
            <div class="menu-name">${safeNameHTML}</div>
            <div class="menu-price">${menuInfo.price} บาท</div>
            <div class="counter">
                <button class="decrease" onclick="decreaseCount('${safeNameJS}')">-</button>
                <span class="count">${menuInfo.count}</span>
                <button onclick="increaseCount('${safeNameJS}')">+</button>
            </div>
            ${menuInfo.hasSides ? `<button class="btn-add-side" onclick="openSideDishModal()">➕ เพิ่มเครื่องเคียง</button>` : ''}
        `;
        menuContainer.appendChild(menuItem);
    }
    
    updateCurrentOrderSummary();
}

// ฟังก์ชันอัปเดตรายการอาหารของลูกค้า (หน้าหลัก)
function updateCurrentOrderSummary() {
    const summaryContainer = document.getElementById('current-order-summary');
    const summaryContent = document.getElementById('current-order-content');
    
    if (!summaryContainer || !summaryContent) return;
    
    let totalItems = 0;
    let totalRevenue = 0;
    let summaryHTML = '<ul>';
    
    for (const [menuName, menuInfo] of Object.entries(menuData)) {
        if (menuInfo.count > 0) {
            const menuTotal = menuInfo.price * menuInfo.count;
            summaryHTML += `<li>${escapeHTML(menuName)}: ${menuInfo.count} รายการ x ${menuInfo.price} บาท = ${menuTotal} บาท</li>`;
            totalItems += menuInfo.count;
            totalRevenue += menuTotal;
        }
    }
    
    summaryHTML += '</ul>';
    
    if (totalItems > 0) {
        summaryHTML += `<p><strong>จำนวนรวมทั้งหมด: ${totalItems} รายการ</strong></p>`;
        summaryHTML += `<p><strong>ยอดเงินรวมทั้งหมด: ${totalRevenue} บาท</strong></p>`;
        summaryContent.innerHTML = summaryHTML;
        summaryContainer.style.display = 'block';
    } else {
        summaryContainer.style.display = 'none';
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
    const newMenuCategory = document.querySelector('input[name="new-menu-category"]:checked').value;
    const newMenuHasSides = document.getElementById('new-menu-has-sides').checked;
    
    if (newMenuName && !isNaN(newMenuPrice) && newMenuPrice >= 0) {
        if (!menuData.hasOwnProperty(newMenuName)) {
            menuData[newMenuName] = {
                price: newMenuPrice,
                count: 0,
                category: newMenuCategory,
                hasSides: newMenuHasSides
            };
            saveData();
            saveMenuList();
            renderMenuItems();
            document.getElementById('new-menu-name').value = '';
            document.getElementById('new-menu-price').value = '';
            document.getElementById('new-menu-has-sides').checked = false;
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
    document.getElementById('edit-menu-has-sides').checked = menuData[menuName].hasSides || false;
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
    const newHasSides = document.getElementById('edit-menu-has-sides').checked;
    
    if (newName && !isNaN(newPrice) && newPrice >= 0) {
        // ถ้าเปลี่ยนชื่อ
        if (newName !== currentEditingMenu) {
            // ตรวจสอบว่าชื่อใหม่ซ้ำหรือไม่
            if (menuData.hasOwnProperty(newName)) {
                alert('มีเมนูชื่อนี้อยู่แล้ว');
                return;
            }
            
            // สร้างเมนูใหม่ด้วยข้อมูลเดิม แต่รักษาลำดับเดิม
            const newMenuData = {};
            for (let key in menuData) {
                if (key === currentEditingMenu) {
                    newMenuData[newName] = {
                        price: newPrice,
                        count: menuData[currentEditingMenu].count,
                        category: menuData[currentEditingMenu].category,
                        hasSides: newHasSides
                    };
                } else {
                    newMenuData[key] = menuData[key];
                }
            }
            menuData = newMenuData;
        } else {
            // อัพเดทเฉพาะราคาและเครื่องเคียง
            menuData[currentEditingMenu].price = newPrice;
            menuData[currentEditingMenu].hasSides = newHasSides;
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
    let summaryHTML = '';
    
    // เพิ่มข้อมูลสรุปยอดขายประจำวัน
    const dailySales = loadDailySales();
    summaryHTML += '<h2>สรุปยอดขายประจำวัน</h2>';
    
    if (dailySales.sales.length > 0) {
        // สร้างออบเจ็กต์เก็บยอดรวมของแต่ละเมนูที่ขายในวันนั้น
        let menuTotalSold = {};
        
        // รวมจำนวนอาหารที่ขายในแต่ละรายการ
        dailySales.sales.forEach(sale => {
            if (sale.status === 'voided') return; // ข้ามรายการที่ถูกยกเลิก
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
            summaryHTML += `<li>${escapeHTML(menuName)}: ขายได้ทั้งหมด ${info.count} รายการ = ${info.revenue} บาท</li>`;
        }
        summaryHTML += '</ul>';
        
        // แสดงรายการแต่ละครั้งที่ขาย
        summaryHTML += '<h4>รายการขายแต่ละครั้ง:</h4>';
        summaryHTML += '<ul>';
        dailySales.sales.forEach((sale, index) => {
            const saleTime = new Date(sale.timestamp).toLocaleTimeString();
            let itemsList = Object.entries(sale.items)
                .map(([menuName, itemInfo]) => `${escapeHTML(menuName)} x${itemInfo.count}`)
                .join(', ');
            
            if (sale.status === 'voided') {
                summaryHTML += `<li><del>การขายครั้งที่ ${index + 1} (${saleTime}) - ${itemsList} - ${sale.totalAmount} บาท</del> <span style="color:red;">(ยกเลิกแล้ว)</span></li>`;
            } else {
                summaryHTML += `<li>การขายครั้งที่ ${index + 1} (${saleTime}) - ${itemsList} - ${sale.totalAmount} บาท <button class="btn-void" onclick="confirmVoidSale(${sale.timestamp})">ยกเลิกบิล</button></li>`;
            }
        });
        summaryHTML += '</ul>';
        
        summaryHTML += `<p><strong>จำนวนการขายวันนี้: ${dailySales.sales.length} ครั้ง</strong></p>`;
        summaryHTML += `<p><strong>ยอดเงินรวมประจำวัน: ${dailySales.totalRevenue} บาท</strong></p>`;
    } else {
        summaryHTML += '<p>ยังไม่มีการขายในวันนี้</p>';
    }
    
    summaryContent.innerHTML = summaryHTML;
}

function confirmVoidSale(timestamp) {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการยกเลิกบิลนี้? ยอดเงินจะถูกหักออกทันที")) {
        voidDailySale(timestamp);
        updateSummary();
    }
}

// Side Dish Modal Logic
function openSideDishModal() {
    const modal = document.getElementById('side-dish-modal');
    const list = document.getElementById('side-dish-list');
    list.innerHTML = '';
    
    for (const [menuName, menuInfo] of Object.entries(menuData)) {
        if (menuInfo.category === 'เครื่องเคียง') {
            const safeNameHTML = escapeHTML(menuName);
            const safeNameJS = escapeJS(menuName);
            const item = document.createElement('div');
            item.className = 'side-dish-item';
            item.innerHTML = `
                <div class="menu-name">${safeNameHTML}</div>
                <div class="menu-price">${menuInfo.price} บาท</div>
                <div class="counter">
                    <button class="decrease" onclick="decreaseCount('${safeNameJS}'); event.stopPropagation(); openSideDishModal();">-</button>
                    <span class="count">${menuInfo.count}</span>
                    <button onclick="increaseCount('${safeNameJS}'); event.stopPropagation(); openSideDishModal();">+</button>
                </div>
            `;
            list.appendChild(item);
        }
    }
    
    modal.style.display = 'block';
}

function closeSideDishModal() {
    document.getElementById('side-dish-modal').style.display = 'none';
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
            summaryHTML += `<li>${escapeHTML(menuName)}: ${menuInfo.count} x ${menuInfo.price} = ${menuTotal} บาท</li>`;
            totalPrice += menuTotal;
        }
    }
    
    summaryHTML += '</ul>';
    paymentOrderSummary.innerHTML = summaryHTML;
    totalPriceInput.value = `${totalPrice} บาท`;
    
    // รีเซ็ตช่องรับเงิน
    document.getElementById('receive-amount').value = '';
    document.getElementById('change-amount').value = '';
    document.getElementById('btn-process-payment').disabled = true;
    
    // แสดงโมดัล
    paymentModal.style.display = 'block';
}

// ฟังก์ชันปิดโมดัลชำระเงิน
function closePaymentModal() {
    document.getElementById('payment-modal').style.display = 'none';
}

function addReceiveAmount(amount) {
    const receiveInput = document.getElementById('receive-amount');
    const currentAmount = parseFloat(receiveInput.value) || 0;
    const newAmount = currentAmount + amount;
    
    receiveInput.value = newAmount;
    calculateChange();
}

function resetReceiveAmount() {
    const receiveInput = document.getElementById('receive-amount');
    
    receiveInput.value = '';
    calculateChange();
}

function calculateChange() {
    const totalPrice = parseFloat(document.getElementById('total-price').value.replace(' บาท', ''));
    const receiveAmount = parseFloat(document.getElementById('receive-amount').value) || 0;
    const changeInput = document.getElementById('change-amount');
    const btnProcess = document.getElementById('btn-process-payment');
    
    if (receiveAmount >= totalPrice) {
        changeInput.value = (receiveAmount - totalPrice) + ' บาท';
        btnProcess.disabled = false;
    } else {
        changeInput.value = 'เงินไม่พอ';
        btnProcess.disabled = true;
    }
}

// ฟังก์ชันประมวลผลการชำระเงิน
function processPayment() {
    const totalPriceText = document.getElementById('total-price').value;
    const totalPrice = parseFloat(totalPriceText.replace(' บาท', ''));
    
    const receiveAmount = parseFloat(document.getElementById('receive-amount').value);
    const changeAmount = receiveAmount - totalPrice;
    
    // สร้างข้อมูลการขาย
    const saleData = {
        timestamp: new Date().getTime(),
        items: {},
        totalAmount: totalPrice,
        receiveAmount: receiveAmount,
        changeAmount: changeAmount,
        status: 'completed'
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
    //alert('ชำระเงินสำเร็จ');
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