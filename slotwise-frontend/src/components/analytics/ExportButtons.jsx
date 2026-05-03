/**
 * Export buttons group for CSV, Excel, PDF
 */
export default function ExportButtons({ onExportCSV, onExportExcel, onExportPDF, disabled }) {
  return (
    <div className="export-btn-group" id="analytics-export-buttons">
      <button className="btn btn-secondary btn-sm export-btn" onClick={onExportCSV} disabled={disabled} title="Export as CSV">
        <span className="material-symbols-outlined">csv</span>
        CSV
      </button>
      <button className="btn btn-secondary btn-sm export-btn" onClick={onExportExcel} disabled={disabled} title="Export as Excel">
        <span className="material-symbols-outlined">table_view</span>
        Excel
      </button>
      <button className="btn btn-secondary btn-sm export-btn" onClick={onExportPDF} disabled={disabled} title="Export as PDF">
        <span className="material-symbols-outlined">picture_as_pdf</span>
        PDF
      </button>
    </div>
  );
}
