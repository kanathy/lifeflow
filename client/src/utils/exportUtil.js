/**
 * exportUtil.js
 * Utility functions for exporting LifeFlow data to Excel/CSV and PDF formats.
 */

// Helper to format date strings cleanly
export const formatDate = (dateStr) => {
  if (!dateStr) return new Date().toISOString().slice(0, 10);
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
  } catch (e) {
    // fallback
  }
  return String(dateStr);
};

// Formats report items into standard structured columns and rows based on tab context
export const formatReportData = (dataList = [], tabType = 'accident') => {
  let headers = [];
  
  if (tabType === 'accident') {
    headers = ['DATE', 'CASE ID', 'LOCATION / DISTRICT', 'ACCIDENT TYPE', 'SEVERITY / STATUS'];
  } else if (tabType === 'disease') {
    headers = ['DATE', 'CASE ID', 'LOCATION', 'DISEASE TYPE', 'STATUS'];
  } else if (tabType === 'donor') {
    headers = ['DATE', 'DONOR ID', 'DISTRICT', 'BLOOD GROUP', 'STATUS'];
  } else if (tabType === 'hospital') {
    headers = ['DATE', 'HOSPITAL ID', 'DISTRICT', 'HOSPITAL TYPE', 'STATUS'];
  } else {
    headers = ['DATE', 'ID / CODE', 'LOCATION / DISTRICT', 'TYPE / CATEGORY', 'SEVERITY / STATUS'];
  }

  const rows = dataList.map((item) => {
    const date = item.date || (item.createdAt ? formatDate(item.createdAt) : '2026-08-10');
    const id = item.caseId || item.donorId || item.hospitalId || item._id || 'N/A';
    const location = item.location || item.district || 'N/A';
    const category = item.accidentType || item.diseaseType || item.bloodGroup || item.hospitalType || 'N/A';
    const status = item.severity || item.status || 'Active';

    return {
      cells: [date, id, location, category, status],
      raw: item
    };
  });

  return { headers, rows };
};

/**
 * Export data list directly to Excel-compatible CSV format
 */
export const exportToCSV = (dataList = [], fileName = 'LifeFlow_Report.csv', reportTitle = 'MASTER REPORT', tabType = 'accident') => {
  let content = '\uFEFF'; // UTF-8 BOM for Microsoft Excel
  content += `=========================================================================\n`;
  content += `LIFEFLOW MASTER REPORT - ${reportTitle.toUpperCase()}\n`;
  content += `GENERATED ON: ${new Date().toLocaleString()}\n`;
  content += `=========================================================================\n\n`;

  content += `# ,ID/Code,Date,Location/District,Type/Category,Severity/Status,Units/Count,Patient/Contact,Hospital\n`;

  dataList.forEach((item, idx) => {
    const date = item.date || 'N/A';
    const id = item.caseId || item.donorId || item.hospitalId || '';
    const loc = item.location || item.district || '';
    const type = item.accidentType || item.diseaseType || item.bloodGroup || item.hospitalType || '';
    const status = item.severity || item.status || '';
    const units = item.injured ?? item.availableUnits ?? 1;
    const name = item.patientName || item.name || '';
    const hosp = item.hospital || '';

    content += `"${idx + 1}","${id}","${date}","${loc}","${type}","${status}","${units}","${name}","${hosp}"\n`;
  });

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};
