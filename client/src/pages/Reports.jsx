import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Plus, RefreshCw, X, FileSpreadsheet } from 'lucide-react';

const Reports = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Generator states
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    type: 'Inventory',
    fromDate: '',
    toDate: ''
  });
  const [generating, setGenerating] = useState(false);

  // Set default date range to last 30 days
  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setForm(prev => ({
      ...prev,
      fromDate: lastMonth.toISOString().split('T')[0],
      toDate: today.toISOString().split('T')[0]
    }));
  }, []);

  const fetchReports = () => {
    setLoading(true);
    fetch('/api/reports', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReports(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setGenerating(true);
    
    fetch('/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(() => {
        setGenerating(false);
        setModalOpen(false);
        fetchReports();
      })
      .catch(err => {
        console.error(err);
        setGenerating(false);
      });
  };

  const handleDownload = (reportId, format) => {
    fetch(`/api/reports/${reportId}/export?format=${format}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.rows) return;

        // Transform table columns and arrays into CSV
        let content = '';
        if (format === 'excel') {
          // Create CSV format
          content += data.headers.join(',') + '\n';
          data.rows.forEach(row => {
            content += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
          });
        } else {
          // Format as structured text document mimicry (PDF preview)
          content += `==============================================\n`;
          content += `               LIFEFLOW SYSTEM REPORT         \n`;
          content += `==============================================\n`;
          content += `REPORT TITLE : ${data.reportName}\n`;
          content += `DATE RANGE   : ${data.dateRange}\n`;
          content += `GENERATED ON : ${new Date(data.generatedOn).toLocaleString()}\n`;
          content += `==============================================\n\n`;
          content += data.headers.join('\t | ') + '\n';
          content += '-'.repeat(80) + '\n';
          data.rows.forEach(row => {
            content += row.join('\t | ') + '\n';
          });
        }

        // Trigger native download
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(err => console.error(err));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>Reports & Analytics</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Export inventory levels, usage logs, and request records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          <span>Generate New Report</span>
        </button>
      </div>

      {/* Reports log list */}
      <div className="dashboard-card" style={{ padding: '0px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading reports archive...</div>
        ) : reports.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No reports generated yet. Click "Generate New Report" to start.</div>
        ) : (
          <div className="table-container" style={{ margin: 0, border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Category Type</th>
                  <th>Data Date Range</th>
                  <th>Generated On</th>
                  <th>Download Options</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={18} color="var(--color-primary)" />
                        <span style={{ fontWeight: 700 }}>{item.reportName}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${item.type === 'Inventory' ? 'success' : item.type === 'Usage' ? 'info' : 'warning'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, fontSize: '0.8rem' }}>{item.dateRange}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {new Date(item.generatedOn).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {/* Excel download */}
                        <button
                          onClick={() => handleDownload(item._id, 'excel')}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <FileSpreadsheet size={12} color="var(--color-success)" />
                          <span>CSV Excel</span>
                        </button>
                        {/* PDF mimic */}
                        <button
                          onClick={() => handleDownload(item._id, 'pdf')}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <FileText size={12} color="var(--color-primary)" />
                          <span>PDF Doc</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generator Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          animation: 'fadeIn var(--transition-fast)'
        }}>
          <div className="dashboard-card animate-scale-up" style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
            <button
              onClick={() => setModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-light)' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', fontFamily: 'Outfit' }}>
              Generate Custom Report Log
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Report Content Category</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="form-control"
                >
                  <option value="Inventory">Inventory stock levels</option>
                  <option value="Usage">Usage analytics & donations</option>
                  <option value="Donor">Donor activity profiles</option>
                  <option value="Requests">Emergency request dispatch logs</option>
                  <option value="Summary">District-wise shortage summaries</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>From Date</label>
                  <input
                    type="date"
                    value={form.fromDate}
                    onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>To Date</label>
                  <input
                    type="date"
                    value={form.toDate}
                    onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="flex-between" style={{ marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={generating}>
                  {generating ? 'Compiling data...' : 'Compile & Export'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
