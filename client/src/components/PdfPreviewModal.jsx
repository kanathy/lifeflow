import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  X, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  MessageSquare, 
  Edit3, 
  Image as ImageIcon, 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';
import { formatReportData } from '../utils/exportUtil';

const PdfPreviewModal = ({ 
  isOpen, 
  onClose, 
  data = [], 
  title = 'DAILY SALES SUMMARY', 
  activeTab = 'accident',
  visibleColumns = null,
  filters = { fromDate: '2026-07-01', toDate: '2026-08-10', category: 'All' }
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const printRef = useRef(null);

  if (!isOpen) return null;

  const { headers, rows } = formatReportData(data, activeTab, visibleColumns);

  // Generate standard filename
  const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const currentDateStr = new Date().toISOString().slice(0, 10);
  const fileName = `${sanitizedTitle}_${currentDateStr}.pdf`;
  const generatedTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  // Download PDF Functionality using Browser High-Precision Print-to-PDF Window
  const handleDownloadPDF = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      alert('Please allow popups to download the PDF preview.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fileName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800;900&display=swap');
            
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }

            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .pdf-container {
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px 0;
            }

            .red-top-bar {
              height: 4px;
              background-color: #991b1b !important;
              margin-bottom: 24px;
              width: 100%;
            }

            .header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }

            .header-left {
              text-align: left;
              vertical-align: top;
            }

            .brand-name {
              font-family: 'Outfit', sans-serif;
              font-size: 24px;
              font-weight: 900;
              color: #991b1b !important;
              letter-spacing: 0.5px;
              margin: 0 0 2px 0;
              text-transform: uppercase;
            }

            .brand-tagline {
              font-size: 10px;
              font-weight: 700;
              color: #64748b;
              letter-spacing: 1.2px;
              text-transform: uppercase;
              margin: 0;
            }

            .header-right {
              text-align: right;
              vertical-align: top;
            }

            .report-title {
              font-family: 'Outfit', sans-serif;
              font-size: 18px;
              font-weight: 800;
              color: #0f172a;
              margin: 0 0 4px 0;
              text-transform: uppercase;
            }

            .meta-date {
              font-size: 11px;
              color: #64748b;
              margin: 0;
            }

            .filters-box {
              background-color: #f8fafc !important;
              border: 1px dashed #cbd5e1 !important;
              border-radius: 8px;
              padding: 14px 18px;
              margin-bottom: 24px;
              font-size: 12px;
              color: #334155;
            }

            .filters-box span {
              font-weight: 700;
            }

            .data-table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              margin-top: 10px;
            }

            .data-table th {
              background-color: #991b1b !important;
              color: #ffffff !important;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              padding: 12px 14px;
              text-align: left;
            }

            .data-table th:first-child {
              border-top-left-radius: 6px;
            }

            .data-table th:last-child {
              border-top-right-radius: 6px;
            }

            .data-table tr:nth-child(even) {
              background-color: #f8fafc !important;
            }

            .data-table tr:nth-child(odd) {
              background-color: #ffffff !important;
            }

            .data-table td {
              font-size: 12px;
              color: #1e293b;
              padding: 12px 14px;
              border-bottom: 1px solid #e2e8f0;
            }

            .text-right {
              text-align: right;
            }

            .text-center {
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="pdf-container">
            ${content.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Modal Main Box */}
      <div style={{
        width: '920px',
        maxWidth: '95vw',
        maxHeight: '92vh',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* 1. Modal Top Header Bar matching screenshot */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Left File Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={20} color="#b91c1c" />
            </div>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#0f172a',
                fontFamily: 'Outfit, sans-serif',
                letterSpacing: '0.3px',
                textTransform: 'uppercase'
              }}>
                {title}
              </h3>
              <p style={{
                margin: '2px 0 0 0',
                fontSize: '0.78rem',
                color: '#64748b',
                fontFamily: 'monospace'
              }}>
                {fileName}
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleDownloadPDF}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                backgroundColor: '#b91c1c',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(185, 28, 28, 0.25)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#991b1b'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
            >
              <Download size={16} color="#ffffff" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onClose}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #e2e8f0',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            >
              <X size={16} />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* 2. PDF Viewer Controls Bar matching screenshot */}
        <div style={{
          backgroundColor: '#334155',
          color: '#cbd5e1',
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          borderBottom: '1px solid #1e293b'
        }}>
          {/* Page indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#94a3b8' }}>Page</span>
            <span style={{
              backgroundColor: '#1e293b',
              padding: '2px 8px',
              borderRadius: '4px',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.75rem'
            }}>1</span>
            <span>of 1</span>
          </div>

          {/* Zoom controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => setZoomLevel(prev => Math.max(75, prev - 10))}
              style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <ZoomOut size={16} />
            </button>
            <select
              value={`${zoomLevel}%`}
              onChange={(e) => setZoomLevel(parseInt(e.target.value))}
              style={{
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: '1px solid #475569',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              <option value="100%">Automatic Zoom</option>
              <option value="75%">75%</option>
              <option value="100%">100%</option>
              <option value="125%">125%</option>
            </select>
            <button 
              onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
              style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <ZoomIn size={16} />
            </button>
          </div>

          {/* Quick tool icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Printer size={16} style={{ cursor: 'pointer' }} onClick={handleDownloadPDF} title="Print Document" />
            <Download size={16} style={{ cursor: 'pointer' }} onClick={handleDownloadPDF} title="Download PDF" />
          </div>
        </div>

        {/* 3. PDF Canvas Display Viewport */}
        <div style={{
          backgroundColor: '#475569',
          flex: 1,
          overflowY: 'auto',
          padding: '32px 20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}>
          {/* Styled Document Sheet (A4 Proportion) */}
          <div 
            ref={printRef}
            style={{
              backgroundColor: '#ffffff',
              width: '100%',
              maxWidth: '780px',
              minHeight: '850px',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.3)',
              borderRadius: '3px',
              padding: '44px 48px',
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
              boxSizing: 'border-box'
            }}
          >
            {/* Top Red Bar Rule */}
            <div className="red-top-bar" style={{
              height: '4px',
              backgroundColor: '#991b1b',
              marginBottom: '24px',
              width: '100%'
            }} />

            {/* Document Header Section */}
            <table className="header-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
              <tbody>
                <tr>
                  <td className="header-left" style={{ textLeft: 'left', verticalAlign: 'top' }}>
                    <h1 className="brand-name" style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '24px',
                      fontWeight: 900,
                      color: '#991b1b',
                      letterSpacing: '0.5px',
                      margin: '0 0 2px 0',
                      textTransform: 'uppercase'
                    }}>
                      LIFEFLOW GROUP
                    </h1>
                    <p className="brand-tagline" style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#64748b',
                      letterSpacing: '1.2px',
                      textTransform: 'uppercase',
                      margin: 0
                    }}>
                      BLOOD BANK & HEALTHCARE WORKFLOWS
                    </p>
                  </td>
                  <td className="header-right" style={{ textAlign: 'right', verticalAlign: 'top' }}>
                    <h2 className="report-title" style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '18px',
                      fontWeight: 800,
                      color: '#0f172a',
                      margin: '0 0 4px 0',
                      textTransform: 'uppercase'
                    }}>
                      {title}
                    </h2>
                    <p className="meta-date" style={{
                      fontSize: '11px',
                      color: '#64748b',
                      margin: 0
                    }}>
                      Generated: {generatedTimestamp}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Applied Filters Container */}
            <div className="filters-box" style={{
              backgroundColor: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '8px',
              padding: '14px 18px',
              marginBottom: '24px',
              fontSize: '12px',
              color: '#334155'
            }}>
              <strong>Filters Applied:</strong> &nbsp; From Date: <span style={{ fontWeight: 700 }}>{filters.fromDate || '2026-07-01'}</span> &nbsp;|&nbsp; To Date: <span style={{ fontWeight: 700 }}>{filters.toDate || '2026-08-10'}</span> &nbsp;|&nbsp; Category: <span style={{ fontWeight: 700 }}>{filters.category || 'All'}</span>
            </div>

            {/* Structured PDF Data Table */}
            <table className="data-table" style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              marginTop: '10px'
            }}>
              <thead>
                <tr>
                  {headers.map((head, idx) => (
                    <th 
                      key={idx}
                      style={{
                        backgroundColor: '#991b1b',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        padding: '12px 14px',
                        textAlign: idx === 0 ? 'left' : (head.includes('SALES') || head.includes('COUNT') || head.includes('UNITS') || head.includes('VALUE') ? 'right' : 'left'),
                        borderTopLeftRadius: idx === 0 ? '6px' : 0,
                        borderTopRightRadius: idx === headers.length - 1 ? '6px' : 0
                      }}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((row, idx) => (
                    <tr 
                      key={idx}
                      style={{
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc'
                      }}
                    >
                      {row.cells.map((cell, cIdx) => (
                        <td 
                          key={cIdx} 
                          style={{ 
                            fontSize: '12px', 
                            color: '#1e293b', 
                            padding: '12px 14px', 
                            borderBottom: '1px solid #e2e8f0', 
                            fontWeight: cIdx === 0 || cIdx === row.cells.length - 1 ? 700 : 400,
                            textAlign: cIdx === row.cells.length - 1 ? 'right' : 'left'
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={headers.length} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                      No records found for the selected parameters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal;
