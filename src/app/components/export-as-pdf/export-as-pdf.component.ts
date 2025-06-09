import { Component, Input } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-export-as-pdf',
  standalone: true,
  template: `<button class="btn btn-warning mt-3" (click)="exportPDF()">Export as PDF</button>`,
})
export class ExportAsPdfComponent {
  @Input() entries: any[] = [];
  @Input() scoreTypes: string[] = [];
  @Input() totals: { [key: string]: number | null } = {};
  @Input() averages: { [key: string]: number | null } = {};
  @Input() classes: { [key: string]: string | null } = {};
  @Input() stationName: string = '';
  @Input() latitude: string = '';
  @Input() longitude: string = '';
  @Input() sampleDate: string = '';
  @Input() sampleTime: string = '';

  exportPDF() {
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const title = 'River Health Bio Assessment Report';
      const pageWidth = doc.internal.pageSize.getWidth();
      const textWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - textWidth) / 2, 20);

      let startY = 40;

      // Date and Time
      const safeDate = this.sanitizeText(this.sampleDate || 'N/A');
      const safeTime = this.sanitizeText(this.sampleTime || 'N/A');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Date:', 14, startY);
      doc.text('Time:', 145, startY);
      doc.setFont('helvetica', 'normal');
      doc.text(safeDate, 25, startY);
      doc.text(safeTime, 146 + doc.getTextWidth('Time:') + 2, startY);

      startY += 8;

      doc.setFont('helvetica', 'bold');
      doc.text('Station Name:', 14, startY);
      doc.setFont('helvetica', 'normal');
      doc.text(this.sanitizeText(this.stationName), 15 + doc.getTextWidth('Station Name:') + 2, startY);

      startY += 8;

      doc.setFont('helvetica', 'bold');
      doc.text('Longitude:', 14, startY);
      doc.setFont('helvetica', 'normal');
      doc.text(this.sanitizeText(this.longitude), 15 + doc.getTextWidth('Longitude:') + 2, startY);

      startY += 8;

      doc.setFont('helvetica', 'bold');
      doc.text('Latitude:', 14, startY);
      doc.setFont('helvetica', 'normal');
      doc.text(this.sanitizeText(this.latitude), 15 + doc.getTextWidth('Latitude:') + 2, startY);

      startY += 12;

      // Table
      const tableColumns = ['Family', ...this.scoreTypes];
      const tableBody = this.entries.map(entry => [
        this.sanitizeText(entry.Family),
        ...this.scoreTypes.map(type =>
          entry[type] !== '' && entry[type] != null ? String(entry[type]) : '-'
        )
      ]);

      // Footer rows
      tableBody.push(new Array(tableColumns.length).fill(''));
      tableBody.push(['Total', ...this.scoreTypes.map(t => this.formatNumber(this.totals[t]))]);
      tableBody.push(['Average', ...this.scoreTypes.map(t => this.formatNumber(this.averages[t]))]);
      tableBody.push(['Class', ...this.scoreTypes.map(t => this.sanitizeText(this.classes[t]))]);

      autoTable(doc, {
        startY,
        head: [tableColumns],
        body: tableBody,
        theme: 'grid',
        styles: { fontSize: 10, halign: 'center', textColor: [0, 0, 0] },
        headStyles: { fillColor: [22, 160, 133], fontStyle: 'bold' },
        columnStyles: { 0: { halign: 'left' } },
        didParseCell: (data) => {
          const footerStartIndex = tableBody.length - 3;
          if (data.section === 'head' && data.column.index === 0) {
            data.cell.styles.halign = 'left';
            data.cell.styles.fontStyle = 'bold';
          }
          if (data.section === 'body' && data.row.index >= footerStartIndex && data.column.index === 0) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.halign = 'left';
          }
        },
        didDrawPage: (data) => {
          const footerText = '© 2025, River Health Bio Assessment System. All rights reserved.';
          const pageHeight = doc.internal.pageSize.getHeight();
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
      });

      // Safe image loading
      const image = new Image();
      image.src = 'assets/images/RiverHealthIndex.webp';
      image.onload = () => {
        const tableBottom = (doc as any).lastAutoTable.finalY;
        const imageTitle = 'Reference Table';
        const titleY = tableBottom + 15;
        const imageY = titleY + 3;
        const pageHeight = doc.internal.pageSize.getHeight();

        const imgWidth = 180;
        const imgHeight = (image.height * imgWidth) / image.width;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');

        if (imageY + imgHeight > pageHeight) {
          doc.addPage();
          doc.text(imageTitle, 14, 20);
          doc.addImage(image, 'WEBP', 15, 25, imgWidth, imgHeight);
        } else {
          doc.text(imageTitle, 14, titleY);
          doc.addImage(image, 'WEBP', 15, imageY, imgWidth, imgHeight);
        }

        // Filename safety
        const safeDateForFile = safeDate.replace(/[^\w-]/g, '-');
        const safeTimeForFile = safeTime.replace(/[^\w-]/g, '-');
        doc.save(`River-Health-Report-${safeDateForFile}-${safeTimeForFile}.pdf`);
      };

      image.onerror = () => {
        alert('Failed to load the reference image for the PDF.');
        // Save the document anyway without the image
        doc.save(`River-Health-Report-${safeDate.replace(/[^\w-]/g, '-')}-${safeTime.replace(/[^\w-]/g, '-')}.pdf`);
      };
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('An error occurred while generating the PDF.');
    }
  }

  private sanitizeText(value: any): string {
    return value != null ? String(value).replace(/[<>]/g, '') : '-';
  }

  private formatNumber(value: number | null): string {
    return value != null && !isNaN(value) ? value.toFixed(2) : '-';
  }
}
