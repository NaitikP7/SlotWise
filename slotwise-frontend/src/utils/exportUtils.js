import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data as CSV file
 */
export function exportCSV(data, filename = 'export') {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h] ?? '';
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
      }).join(',')
    )
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Export data as Excel file
 */
export function exportExcel(data, filename = 'export', sheetName = 'Sheet1') {
  if (!data || data.length === 0) return;

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Auto-fit column widths
  const colWidths = Object.keys(data[0]).map(key => ({
    wch: Math.max(key.length, ...data.map(row => String(row[key] ?? '').length)) + 2
  }));
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export data as PDF file
 */
export function exportPDF(data, title = 'Report', filename = 'export') {
  if (!data || data.length === 0) return;

  const doc = new jsPDF('l', 'mm', 'a4');

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 15);

  // Subtitle with date
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 22);

  const headers = Object.keys(data[0]);
  const body = data.map(row => headers.map(h => String(row[h] ?? '')));

  autoTable(doc, {
    head: [headers.map(h => h.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim())],
    body,
    startY: 28,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${filename}.pdf`);
}

/**
 * Convert analytics data to flat table format for export
 */
export function flattenForExport(data, mapping) {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.map(item => {
      const flat = {};
      for (const [key, label] of Object.entries(mapping)) {
        flat[label] = item[key] ?? '';
      }
      return flat;
    });
  }
  // Single object — return as single-row
  const flat = {};
  for (const [key, label] of Object.entries(mapping)) {
    flat[label] = data[key] ?? '';
  }
  return [flat];
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
