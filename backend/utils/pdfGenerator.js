const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

const generateApprovalPDF = async (booking, stream) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(stream);

    // Generate QR code as data URL
    const qrData = JSON.stringify({
        bookingId: booking._id,
        event: booking.eventName,
        hall: booking.hall?.name,
        date: booking.date,
        timeSlot: booking.timeSlot,
        status: booking.status,
    });

    const qrImageDataUrl = await QRCode.toDataURL(qrData, { width: 150 });
    const qrImageBuffer = Buffer.from(qrImageDataUrl.split(',')[1], 'base64');

    // ── Header ──
    doc.rect(0, 0, doc.page.width, 120).fill('#1e40af');

    doc.fontSize(28).fillColor('#ffffff').font('Helvetica-Bold')
        .text('HALL BOOKING', 50, 30, { align: 'center' });
    doc.fontSize(14).fillColor('#bfdbfe').font('Helvetica')
        .text('APPROVAL LETTER', 50, 65, { align: 'center' });

    doc.fontSize(10).fillColor('#93c5fd')
        .text(`Reference: HB-${booking._id.toString().slice(-8).toUpperCase()}`, 50, 90, { align: 'center' });

    // ── Body ──
    let y = 145;

    // Status Badge
    doc.roundedRect(200, y, 195, 30, 5).fill('#16a34a');
    doc.fontSize(14).fillColor('#ffffff').font('Helvetica-Bold')
        .text('✓ APPROVED', 200, y + 8, { width: 195, align: 'center' });

    y += 55;

    // Approval date
    const approvalDate = booking.reviewedAt
        ? new Date(booking.reviewedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.fontSize(10).fillColor('#6b7280').font('Helvetica')
        .text(`Date of Approval: ${approvalDate}`, 50, y);

    y += 30;

    // ── Event Details Section ──
    doc.rect(50, y, doc.page.width - 100, 1).fill('#e5e7eb');
    y += 15;

    doc.fontSize(14).fillColor('#1e40af').font('Helvetica-Bold')
        .text('Event Details', 50, y);
    y += 25;

    const details = [
        ['Event Name', booking.eventName],
        ['Requested By', `${booking.requestedBy?.name || 'N/A'} (${booking.requestedBy?.clubName || 'N/A'})`],
        ['College ID', booking.requestedBy?.collegeId || 'N/A'],
        ['Hall', booking.hall?.name || 'N/A'],
        ['Location', booking.hall?.location || 'N/A'],
        ['Date', booking.date],
        ['Time Slot', booking.timeSlot],
        ['Expected Attendance', String(booking.expectedAttendance)],
        ['Requirements', booking.requirements || 'None specified'],
    ];

    details.forEach(([label, value]) => {
        doc.fontSize(10).fillColor('#6b7280').font('Helvetica-Bold')
            .text(`${label}:`, 70, y, { continued: false });
        doc.fontSize(10).fillColor('#1f2937').font('Helvetica')
            .text(value, 220, y);
        y += 22;
    });

    y += 15;

    // ── Approval Section ──
    doc.rect(50, y, doc.page.width - 100, 1).fill('#e5e7eb');
    y += 15;

    doc.fontSize(14).fillColor('#1e40af').font('Helvetica-Bold')
        .text('Approval Authority', 50, y);
    y += 25;

    doc.fontSize(10).fillColor('#6b7280').font('Helvetica-Bold')
        .text('Approved By:', 70, y);
    doc.fontSize(10).fillColor('#1f2937').font('Helvetica')
        .text(`${booking.reviewedBy?.name || 'Faculty'} (${booking.reviewedBy?.email || 'N/A'})`, 220, y);
    y += 22;

    if (booking.facultyComments) {
        doc.fontSize(10).fillColor('#6b7280').font('Helvetica-Bold')
            .text('Comments:', 70, y);
        doc.fontSize(10).fillColor('#1f2937').font('Helvetica')
            .text(booking.facultyComments, 220, y, { width: 300 });
        y += 30;
    }

    y += 10;

    // ── Digital Signature Line ──
    doc.rect(50, y, doc.page.width - 100, 1).fill('#e5e7eb');
    y += 20;

    doc.fontSize(12).fillColor('#1e40af').font('Helvetica-Bold')
        .text('Digital Signature', 50, y);
    y += 20;

    doc.fontSize(18).fillColor('#1e40af').font('Helvetica-Bold')
        .text(booking.reviewedBy?.name || 'Authorized Faculty', 70, y);
    y += 20;

    doc.moveTo(70, y).lineTo(250, y).strokeColor('#1e40af').lineWidth(1).stroke();
    y += 5;
    doc.fontSize(8).fillColor('#6b7280').font('Helvetica')
        .text('Authorized Signatory', 70, y);

    // ── QR Code ──
    y += 30;
    doc.fontSize(10).fillColor('#6b7280').font('Helvetica')
        .text('Scan to verify:', 50, y);
    y += 15;
    doc.image(qrImageBuffer, 50, y, { width: 120, height: 120 });

    // ── Footer ──
    doc.fontSize(8).fillColor('#9ca3af').font('Helvetica')
        .text(
            'This is a system-generated approval letter. For any queries, please contact the administration.',
            50, doc.page.height - 50,
            { align: 'center', width: doc.page.width - 100 }
        );

    doc.end();
};

module.exports = { generateApprovalPDF };
