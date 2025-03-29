// ฟังก์ชันส่งออกข้อมูลเป็น CSV
function exportDataToCSV() {
    const currentDate = document.getElementById('current-date').value;
    let csvContent = "ชื่อเมนู,ราคา,จำนวน,ยอดรวม\n";
    
    let totalItems = 0;
    let totalRevenue = 0;
    
    for (const [menuName, menuInfo] of Object.entries(menuData)) {
        if (menuInfo.count > 0) {
            const menuTotal = menuInfo.price * menuInfo.count;
            csvContent += `"${menuName}",${menuInfo.price},${menuInfo.count},${menuTotal}\n`;
            totalItems += menuInfo.count;
            totalRevenue += menuTotal;
        }
    }
    
    csvContent += `\nจำนวนรวมทั้งหมด,,${totalItems},${totalRevenue}\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ยอดขาย-${currentDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ฟังก์ชันส่งออกข้อมูลเป็น PDF
function exportDataToPDF() {
    alert("ฟังก์ชันนี้ต้องใช้ไลบรารี PDF เพิ่มเติม เช่น jsPDF\nคุณสามารถดาวน์โหลดและเพิ่มไลบรารีได้จาก: https://github.com/parallax/jsPDF");
    
    // ตัวอย่างโค้ดสำหรับใช้งานกับ jsPDF (ต้องเพิ่ม script ของ jsPDF ก่อน)
    /*
    const currentDate = document.getElementById('current-date').value;
    const doc = new jsPDF();
    
    doc.text(`ยอดขายประจำวันที่ ${currentDate}`, 20, 20);
    doc.setFontSize(12);
    
    let yPosition = 40;
    doc.text("ชื่อเมนู", 20, yPosition);
    doc.text("ราคา", 80, yPosition);
    doc.text("จำนวน", 120, yPosition);
    doc.text("ยอดรวม", 160, yPosition);
    
    yPosition += 10;
    let totalItems = 0;
    let totalRevenue = 0;
    
    for (const [menuName, menuInfo] of Object.entries(menuData)) {
        if (menuInfo.count > 0) {
            const menuTotal = menuInfo.price * menuInfo.count;
            doc.text(menuName, 20, yPosition);
            doc.text(menuInfo.price.toString(), 80, yPosition);
            doc.text(menuInfo.count.toString(), 120, yPosition);
            doc.text(menuTotal.toString(), 160, yPosition);
            yPosition += 10;
            
            totalItems += menuInfo.count;
            totalRevenue += menuTotal;
        }
    }
    
    yPosition += 5;
    doc.setFontStyle('bold');
    doc.text(`จำนวนรวมทั้งหมด: ${totalItems} รายการ`, 20, yPosition);
    yPosition += 10;
    doc.text(`ยอดเงินรวมทั้งหมด: ${totalRevenue} บาท`, 20, yPosition);
    
    doc.save(`ยอดขาย-${currentDate}.pdf`);
    */
}
