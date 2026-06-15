// ฟังก์ชันส่งออกข้อมูลเป็น CSV
function exportDataToCSV() {
    const currentDate = document.getElementById('current-date').value;
    const dailySales = loadDailySales();
    
    let csvContent = "ข้อมูลยอดขายประจำวันที่ " + currentDate + "\n\n";
    
    // รายการปัจจุบัน
    csvContent += "รายการปัจจุบัน:\n";
    csvContent += "ชื่อเมนู,ราคา,จำนวน,ยอดรวม\n";
    
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
    
    csvContent += `\nจำนวนรวมทั้งหมด,,${totalItems},${totalRevenue}\n\n`;
    
    // ยอดขายประจำวัน
    csvContent += "ยอดขายประจำวันที่ " + currentDate + ":\n";
    csvContent += "เวลา,รายการ,ยอดรวม\n";
    
    if (dailySales.sales.length > 0) {
        dailySales.sales.forEach((sale) => {
            const saleTime = new Date(sale.timestamp).toLocaleTimeString();
            let itemsList = "";
            
            for (const [menuName, itemInfo] of Object.entries(sale.items)) {
                itemsList += `${menuName} x${itemInfo.count}, `;
            }
            
            itemsList = itemsList.slice(0, -2); // ตัดเครื่องหมาย ", " ตัวสุดท้ายออก
            
            csvContent += `"${saleTime}","${itemsList}",${sale.totalAmount}\n`;
        });
        
        csvContent += `\nจำนวนการขายทั้งหมด,${dailySales.sales.length} ครั้ง\n`;
        csvContent += `ยอดเงินรวมประจำวัน,,${dailySales.totalRevenue} บาท\n`;
    } else {
        csvContent += "ไม่มีการขายในวันนี้\n";
    }
    
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
    if (!window.jspdf) {
        alert("ไม่พบไลบรารี jsPDF กรุณารอโหลดสักครู่ หรือเช็คการเชื่อมต่ออินเทอร์เน็ต");
        return;
    }

    const { jsPDF } = window.jspdf;
    const currentDate = document.getElementById('current-date').value;
    const doc = new jsPDF();
    
    doc.addFont("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");
    
    doc.text(`Daily Sales: ${currentDate}`, 20, 20);
    doc.setFontSize(12);
    
    let yPosition = 40;
    doc.text("Menu Name", 20, yPosition);
    doc.text("Price", 80, yPosition);
    doc.text("Count", 120, yPosition);
    doc.text("Total", 160, yPosition);
    
    yPosition += 10;
    let totalItems = 0;
    let totalRevenue = 0;
    
    for (const [menuName, menuInfo] of Object.entries(menuData)) {
        if (menuInfo.count > 0) {
            const menuTotal = menuInfo.price * menuInfo.count;
            // jsPDF default font may not support Thai characters well without custom font.
            // Converting menuName might be needed, but we output it directly.
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
    doc.setFont('Helvetica', 'bold');
    doc.text(`Total Items: ${totalItems}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Total Revenue: ${totalRevenue} THB`, 20, yPosition);
    
    doc.save(`Sales-${currentDate}.pdf`);
}
