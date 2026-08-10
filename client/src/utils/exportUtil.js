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

// Formats report items into standard structured columns and rows based on tab context and column selection
export const formatReportData = (dataList = [], tabType = 'accident', visibleColumns = null) => {
  const allCols = [
    { key: 'index', header: '#', getValue: (item, idx) => String(idx + 1) },
    { key: 'id', header: tabType === 'donor' ? 'DONOR ID' : tabType === 'hospital' ? 'HOSPITAL ID' : 'CASE ID', getValue: (item) => item.caseId || item.donorId || item.hospitalId || item._id || 'N/A' },
    { key: 'date', header: 'DATE', getValue: (item) => item.date || (item.createdAt ? formatDate(item.createdAt) : '2026-08-10') },
    { key: 'location', header: 'LOCATION', getValue: (item) => item.location || item.district || 'N/A' },
    { 
      key: 'type', 
      header: tabType === 'accident' ? 'TYPE OF ACCIDENT' :
              tabType === 'disease' ? 'TYPE OF DISEASE' :
              tabType === 'donor' ? 'BLOOD GROUP' :
              tabType === 'hospital' ? 'FACILITY TYPE' : 'TYPE / CATEGORY', 
      getValue: (item) => item.accidentType || item.diseaseType || item.bloodGroup || item.hospitalType || 'N/A' 
    },
    { key: 'severity', header: 'SEVERITY', getValue: (item) => item.severity || 'Minor' },
    { 
      key: 'units', 
      header: tabType === 'accident' ? 'NO. OF INJURED' :
              tabType === 'disease' ? 'UNITS REQUIRED' :
              tabType === 'inventory' ? 'UNITS AVAILABLE' : 'UNITS', 
      getValue: (item) => String(item.injured ?? item.availableUnits ?? 1) 
    },
    { key: 'status', header: 'STATUS', getValue: (item) => item.status || 'Active' }
  ];

  const activeCols = visibleColumns 
    ? allCols.filter(col => visibleColumns[col.key] !== false)
    : allCols;

  const headers = activeCols.map(c => c.header);

  const rows = dataList.map((item, idx) => ({
    cells: activeCols.map(c => c.getValue(item, idx)),
    raw: item
  }));

  return { headers, rows };
};

/**
 * Export data list directly to Excel-compatible CSV format
 */
export const exportToCSV = (dataList = [], fileName = 'LifeFlow_Report.csv', reportTitle = 'MASTER REPORT', tabType = 'accident', visibleColumns = null) => {
  let content = '\uFEFF'; // UTF-8 BOM for Microsoft Excel
  content += `=========================================================================\n`;
  content += `LIFEFLOW MASTER REPORT - ${reportTitle.toUpperCase()}\n`;
  content += `GENERATED ON: ${new Date().toLocaleString()}\n`;
  content += `=========================================================================\n\n`;

  const { headers, rows } = formatReportData(dataList, tabType, visibleColumns);

  content += headers.map(h => `"${h}"`).join(',') + '\n';

  rows.forEach((row) => {
    content += row.cells.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',') + '\n';
  });

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};
