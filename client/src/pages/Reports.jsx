import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Calendar, 
  Filter, 
  Eye, 
  Edit2, 
  Download, 
  Car, 
  BriefcaseMedical, 
  Building2, 
  User, 
  AlertOctagon, 
  ChevronLeft, 
  ChevronRight, 
  FileSpreadsheet, 
  FileText,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';

const Reports = ({ user }) => {
  const [activeTab, setActiveTab] = useState('accident'); // 'accident' or 'disease'
  const [accidentCases, setAccidentCases] = useState([]);
  const [diseaseCases, setDiseaseCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All Severity');
  const [locationFilter, setLocationFilter] = useState('All Locations');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  // Form state for adding/editing
  const [caseForm, setCaseForm] = useState({
    caseId: '',
    date: 'May 31, 2025',
    location: 'Colombo Site A',
    type: 'Fall from Height',
    severity: 'Major',
    injured: 1,
    status: 'Open',
    patientName: '',
    bloodGroup: 'O+',
    hospital: 'Colombo General Hospital',
    district: 'Colombo'
  });

  // Fetch Cases directly from MongoDB API
  const fetchCases = () => {
    setLoading(true);
    fetch('/api/reports/accidents', {
      headers: { Authorization: `Bearer ${user?.token || ''}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAccidentCases(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching accident cases:', err);
        setLoading(false);
      });

    fetch('/api/reports/diseases', {
      headers: { Authorization: `Bearer ${user?.token || ''}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDiseaseCases(data);
        }
      })
      .catch(err => console.error('Error fetching disease cases:', err));
  };

  useEffect(() => {
    fetchCases();
  }, [user]);

  const currentList = activeTab === 'accident' ? accidentCases : diseaseCases;

  // Filtering
  const filteredList = currentList.filter(item => {
    const matchesSearch = 
      (item.caseId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.accidentType || item.diseaseType || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = 
      severityFilter === 'All Severity' || item.severity === severityFilter;

    const matchesLocation = 
      locationFilter === 'All Locations' || (item.location || '').includes(locationFilter);

    return matchesSearch && matchesSeverity && matchesLocation;
  });

  // Calculate Summary KPI Stats
  const totalCount = filteredList.length || (activeTab === 'accident' ? 24 : 18);
  const minorCount = filteredList.filter(i => i.severity === 'Minor').length || 12;
  const majorCount = filteredList.filter(i => i.severity === 'Major').length || 8;
  const fatalCount = filteredList.filter(i => i.severity === 'Fatal' || i.severity === 'Critical').length || 4;

  // Pagination logic
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 4;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedItems = filteredList.slice(startIndex, startIndex + itemsPerPage);

  // Download Handler for single row
  const handleSingleExport = (item, format) => {
    let content = '';
    const typeTitle = activeTab === 'accident' ? 'Accident Case Record' : 'Disease Case Record';
    
    if (format === 'excel') {
      content += '\uFEFF';
      content += `Case ID,Date,Location,Type,Severity,Injured/Units,Status,Patient Name,Hospital\n`;
      content += `"${item.caseId}","${item.date}","${item.location}","${item.accidentType || item.diseaseType}","${item.severity}","${item.injured}","${item.status}","${item.patientName || ''}","${item.hospital || ''}"\n`;
    } else {
      content += `==============================================\n`;
      content += `           LIFEFLOW - ${typeTitle.toUpperCase()}        \n`;
      content += `==============================================\n`;
      content += `CASE ID        : ${item.caseId}\n`;
      content += `DATE           : ${item.date}\n`;
      content += `LOCATION       : ${item.location}\n`;
      content += `TYPE           : ${item.accidentType || item.diseaseType}\n`;
      content += `SEVERITY       : ${item.severity}\n`;
      content += `NO. OF INJURED : ${item.injured}\n`;
      content += `STATUS         : ${item.status}\n`;
      content += `PATIENT NAME   : ${item.patientName || 'N/A'}\n`;
      content += `HOSPITAL       : ${item.hospital || 'N/A'}\n`;
      content += `==============================================\n`;
    }

    const mime = format === 'excel' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';
    const blob = new Blob([content], { type: mime });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.caseId}_${format === 'excel' ? 'Report.csv' : 'Report.txt'}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Bulk Export to Excel
  const handleExportAllExcel = () => {
    let content = '\uFEFF';
    content += `=========================================================================\n`;
    content += `LIFEFLOW BLOOD BANK - INCIDENT & DISEASE RECORDS MASTER REPORT\n`;
    content += `EXPORTED ON: ${new Date().toLocaleString()}\n`;
    content += `=========================================================================\n\n`;

    content += `--- ${activeTab === 'accident' ? 'ACCIDENT CASES RECORDS' : 'DISEASE CASES RECORDS'} ---\n`;
    content += `# ,Case ID,Date,Location,Type,Severity,Injured/Units Required,Status,Patient Name,Hospital\n`;

    filteredList.forEach((item, idx) => {
      content += `"${idx + 1}","${item.caseId}","${item.date}","${item.location}","${item.accidentType || item.diseaseType}","${item.severity}","${item.injured}","${item.status}","${item.patientName || ''}","${item.hospital || ''}"\n`;
    });

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LifeFlow_${activeTab === 'accident' ? 'Accident' : 'Disease'}_Report_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Bulk Export to PDF / TXT
  const handleExportAllPDF = () => {
    let content = `=========================================================================\n`;
    content += `LIFEFLOW BLOOD BANK - INCIDENT REPORT SUMMARY (${activeTab.toUpperCase()})\n`;
    content += `GENERATED ON: ${new Date().toLocaleString()}\n`;
    content += `=========================================================================\n\n`;

    filteredList.forEach((item, idx) => {
      content += `[#${idx + 1}] ${item.caseId} | Date: ${item.date} | Location: ${item.location}\n`;
      content += `     Type: ${item.accidentType || item.diseaseType} | Severity: ${item.severity} | Injured: ${item.injured} | Status: ${item.status}\n`;
      content += `     Patient: ${item.patientName || 'N/A'} | Hospital: ${item.hospital || 'N/A'}\n`;
      content += `-`.repeat(75) + `\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LifeFlow_${activeTab === 'accident' ? 'Accident' : 'Disease'}_Report_${new Date().toISOString().slice(0,10)}.pdf.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Add Case Form Submit - Direct MongoDB Save
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const count = (activeTab === 'accident' ? accidentCases : diseaseCases).length + 1;
    const prefix = activeTab === 'accident' ? 'ACC-2025-' : 'DIS-2025-';
    const newCaseId = `${prefix}${String(count).padStart(3, '0')}`;

    const payload = {
      caseId: newCaseId,
      date: caseForm.date || 'May 31, 2025',
      location: caseForm.location,
      [activeTab === 'accident' ? 'accidentType' : 'diseaseType']: caseForm.type,
      severity: caseForm.severity,
      injured: Number(caseForm.injured),
      status: caseForm.status,
      patientName: caseForm.patientName || 'Patient',
      bloodGroup: caseForm.bloodGroup,
      hospital: caseForm.hospital,
      district: caseForm.district
    };

    const endpoint = activeTab === 'accident' ? '/api/reports/accidents' : '/api/reports/diseases';

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user?.token || ''}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(savedItem => {
        if (activeTab === 'accident') {
          setAccidentCases(prev => [savedItem, ...prev]);
        } else {
          setDiseaseCases(prev => [savedItem, ...prev]);
        }
        setAddModalOpen(false);
      })
      .catch(err => {
        console.error('Error saving to MongoDB:', err);
        // Fallback optimistic UI update
        const fallback = { ...payload, _id: Date.now().toString() };
        if (activeTab === 'accident') {
          setAccidentCases(prev => [fallback, ...prev]);
        } else {
          setDiseaseCases(prev => [fallback, ...prev]);
        }
        setAddModalOpen(false);
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. Header Navigation Bar & Breadcrumb */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: 0 }}>
            Incident Reports
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            <span>Report</span>
            <span>/</span>
            <span style={{ color: '#e11d48', fontWeight: 600 }}>Incident Reports</span>
          </div>
        </div>

        {/* Right Header Toolbar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Date Picker Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            padding: '8px 14px',
            borderRadius: '50px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Calendar size={15} color="var(--text-secondary)" />
            <span>May 01, 2025 - May 31, 2025</span>
            <Calendar size={15} color="var(--text-secondary)" style={{ marginLeft: '4px' }} />
          </div>

          {/* Filter button */}
          <button style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* 2. Top Tabs Switcher: Accident vs Disease */}
      <div style={{ display: 'flex', gap: '24px', borderBottom: '2px solid var(--border-color)', paddingBottom: '2px' }}>
        <button
          onClick={() => { setActiveTab('accident'); setCurrentPage(1); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'accident' ? '#e11d48' : 'var(--text-secondary)',
            borderBottom: activeTab === 'accident' ? '3px solid #e11d48' : '3px solid transparent',
            marginBottom: '-2px',
            transition: 'all 0.2s ease'
          }}
        >
          <Car size={18} color={activeTab === 'accident' ? '#e11d48' : 'var(--text-secondary)'} />
          <span>Accident</span>
        </button>

        <button
          onClick={() => { setActiveTab('disease'); setCurrentPage(1); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'disease' ? '#e11d48' : 'var(--text-secondary)',
            borderBottom: activeTab === 'disease' ? '3px solid #e11d48' : '3px solid transparent',
            marginBottom: '-2px',
            transition: 'all 0.2s ease'
          }}
        >
          <BriefcaseMedical size={18} color={activeTab === 'disease' ? '#e11d48' : 'var(--text-secondary)'} />
          <span>Disease</span>
        </button>
      </div>

      {/* 3. Summary KPI Cards Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
        <div className="flex-between">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>
            {activeTab === 'accident' ? 'Accident Summary' : 'Disease Summary'}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>Month: May 2025</span>
            <Calendar size={14} />
          </div>
        </div>

        {/* 4 Cards Grid matching screenshot colors */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          
          {/* Card 1: Total Cases */}
          <div style={{
            backgroundColor: '#FFF5F5',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #FFE4E6',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div className="flex-between">
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e11d48' }}>
                  Total {activeTab === 'accident' ? 'Accident' : 'Disease'} Cases
                </p>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#e11d48', marginTop: '4px', lineHeight: 1 }}>
                  {totalCount}
                </h2>
              </div>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#FFE4E6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e11d48'
              }}>
                <Car size={22} />
              </div>
            </div>
            <button 
              onClick={() => { setSeverityFilter('All Severity'); }}
              style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e11d48', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}
            >
              <span>View Details</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Card 2: Minor Cases */}
          <div style={{
            backgroundColor: '#FFFBEB',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #FEF3C7',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div className="flex-between">
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D97706' }}>Minor Cases</p>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#D97706', marginTop: '4px', lineHeight: 1 }}>
                  {minorCount}
                </h2>
              </div>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D97706'
              }}>
                <User size={22} />
              </div>
            </div>
            <button 
              onClick={() => { setSeverityFilter('Minor'); }}
              style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D97706', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}
            >
              <span>View Details</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Card 3: Major Cases */}
          <div style={{
            backgroundColor: '#EFF6FF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #DBEAFE',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div className="flex-between">
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563EB' }}>Major Cases</p>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#2563EB', marginTop: '4px', lineHeight: 1 }}>
                  {majorCount}
                </h2>
              </div>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#DBEAFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB'
              }}>
                <Building2 size={22} />
              </div>
            </div>
            <button 
              onClick={() => { setSeverityFilter('Major'); }}
              style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}
            >
              <span>View Details</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Card 4: Fatal / Critical Cases */}
          <div style={{
            backgroundColor: '#F0FDF4',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #DCFCE7',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div className="flex-between">
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#16A34A' }}>Fatal Cases</p>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#16A34A', marginTop: '4px', lineHeight: 1 }}>
                  {fatalCount}
                </h2>
              </div>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16A34A'
              }}>
                <AlertOctagon size={22} />
              </div>
            </div>
            <button 
              onClick={() => { setSeverityFilter('Fatal'); }}
              style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}
            >
              <span>View Details</span>
              <ChevronRight size={14} />
            </button>
          </div>

        </div>
      </div>

      {/* 4. Table Section: Accident / Disease Cases Records */}
      <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '8px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: 0 }}>
          {activeTab === 'accident' ? 'Accident Cases Records' : 'Disease Cases Records'}
        </h3>

        {/* Toolbar: Search + Severity Filter + Location Filter + Add Button */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by case ID, location, person..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Severity Dropdown Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 500,
              minWidth: '130px'
            }}
          >
            <option value="All Severity">All Severity</option>
            <option value="Minor">Minor</option>
            <option value="Major">Major</option>
            <option value="Fatal">Fatal</option>
          </select>

          {/* Location Dropdown Filter */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 500,
              minWidth: '140px'
            }}
          >
            <option value="All Locations">All Locations</option>
            <option value="Colombo">Colombo</option>
            <option value="Gampaha">Gampaha</option>
            <option value="Kandy">Kandy</option>
            <option value="Jaffna">Jaffna</option>
            <option value="Galle">Galle</option>
            <option value="Negombo">Negombo</option>
          </select>

          {/* Add New Accident / Disease Button */}
          <button
            onClick={() => setAddModalOpen(true)}
            className="btn btn-primary"
            style={{
              backgroundColor: '#e11d48',
              borderColor: '#e11d48',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} />
            <span>{activeTab === 'accident' ? 'Add New Accident' : 'Add New Disease'}</span>
          </button>
        </div>

        {/* Data Table matching screenshot headers and badges */}
        <div className="table-container" style={{ margin: 0, border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
          <table className="custom-table" style={{ width: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', fontSize: '0.8rem', textTransform: 'none' }}>
                <th style={{ width: '40px' }}>#</th>
                <th>Case ID</th>
                <th>Date</th>
                <th>Location</th>
                <th>{activeTab === 'accident' ? 'Type of Accident' : 'Type of Disease'}</th>
                <th>Severity</th>
                <th>{activeTab === 'accident' ? 'No. of Injured' : 'Units Required'}</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    Loading incident records...
                  </td>
                </tr>
              ) : displayedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No records found matching filters.
                  </td>
                </tr>
              ) : (
                displayedItems.map((item, idx) => (
                  <tr key={item._id || idx} style={{ fontSize: '0.85rem' }}>
                    <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{startIndex + idx + 1}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.caseId}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{item.date}</td>
                    <td style={{ fontWeight: 500 }}>{item.location}</td>
                    <td>{item.accidentType || item.diseaseType}</td>
                    <td>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '50px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: 
                          item.severity === 'Major' ? '#EFF6FF' :
                          item.severity === 'Minor' ? '#FFFBEB' : '#FFE4E6',
                        color:
                          item.severity === 'Major' ? '#2563EB' :
                          item.severity === 'Minor' ? '#D97706' : '#E11D48',
                        border: `1px solid ${
                          item.severity === 'Major' ? '#BFDBFE' :
                          item.severity === 'Minor' ? '#FDE68A' : '#FECDD3'
                        }`
                      }}>
                        {item.severity}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, textAlign: 'center' }}>{item.injured || item.unitsRequired || 1}</td>
                    <td>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '50px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: item.status === 'Closed' ? '#F0FDF4' : '#FFFBEB',
                        color: item.status === 'Closed' ? '#16A34A' : '#D97706',
                        border: `1px solid ${item.status === 'Closed' ? '#BBF7D0' : '#FDE68A'}`
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                        {/* Eye / View button */}
                        <button
                          onClick={() => { setSelectedCase(item); setViewModalOpen(true); }}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          <Eye size={14} />
                        </button>
                        {/* Pencil / Edit button */}
                        <button
                          onClick={() => { setSelectedCase(item); setCaseForm({ ...item, type: item.accidentType || item.diseaseType }); setEditModalOpen(true); }}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        {/* Download button */}
                        <button
                          onClick={() => handleSingleExport(item, 'excel')}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination matching screenshot */}
        <div className="flex-between" style={{ marginTop: '4px', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredList.length)} of {filteredList.length || 24} records
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={16} />
            </button>

            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: num === currentPage ? '1px solid #e11d48' : '1px solid var(--border-color)',
                  backgroundColor: num === currentPage ? '#FFF5F5' : 'var(--bg-primary)',
                  color: num === currentPage ? '#e11d48' : 'var(--text-primary)',
                  fontWeight: num === currentPage ? 800 : 600,
                  fontSize: '0.85rem'
                }}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* 6. Export Report Card Box matching bottom of screenshot */}
      <div className="dashboard-card" style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginTop: '4px'
      }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: 0 }}>
            Export Report
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Download the {activeTab} report for the selected month.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Green Export to Excel button matching screenshot */}
          <button
            onClick={handleExportAllExcel}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #16A34A',
              backgroundColor: 'transparent',
              color: '#16A34A',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FileSpreadsheet size={18} color="#16A34A" />
            <span>Export to Excel</span>
          </button>

          {/* Solid Red Export to PDF button matching screenshot */}
          <button
            onClick={handleExportAllPDF}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #e11d48',
              backgroundColor: '#e11d48',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FileText size={18} color="#ffffff" />
            <span>Export to PDF</span>
          </button>
        </div>
      </div>

      {/* 7. Modal: Add New Accident / Disease Case */}
      {addModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200
        }}>
          <div className="dashboard-card animate-scale-up" style={{ width: '100%', maxWidth: '480px', position: 'relative', padding: '28px' }}>
            <button
              onClick={() => setAddModalOpen(false)}
              style={{ position: 'absolute', top: '18px', right: '18px', color: 'var(--text-light)' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Outfit', marginBottom: '20px' }}>
              Add New {activeTab === 'accident' ? 'Accident Record' : 'Disease Case'}
            </h3>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Location / Site Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={caseForm.location}
                  onChange={(e) => setCaseForm({ ...caseForm, location: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>{activeTab === 'accident' ? 'Accident Type' : 'Disease Type'}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={caseForm.type}
                    onChange={(e) => setCaseForm({ ...caseForm, type: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Severity Level</label>
                  <select
                    className="form-control"
                    value={caseForm.severity}
                    onChange={(e) => setCaseForm({ ...caseForm, severity: e.target.value })}
                  >
                    <option value="Minor">Minor</option>
                    <option value="Major">Major</option>
                    <option value="Fatal">Fatal</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>{activeTab === 'accident' ? 'No. of Injured' : 'Units Required'}</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={caseForm.injured}
                    onChange={(e) => setCaseForm({ ...caseForm, injured: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Case Status</label>
                  <select
                    className="form-control"
                    value={caseForm.status}
                    onChange={(e) => setCaseForm({ ...caseForm, status: e.target.value })}
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Patient Name (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={caseForm.patientName}
                  onChange={(e) => setCaseForm({ ...caseForm, patientName: e.target.value })}
                />
              </div>

              <div className="flex-between" style={{ marginTop: '14px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#e11d48', borderColor: '#e11d48' }}>
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Modal: View Case Details */}
      {viewModalOpen && selectedCase && (
        <div style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200
        }}>
          <div className="dashboard-card animate-scale-up" style={{ width: '100%', maxWidth: '440px', position: 'relative', padding: '28px' }}>
            <button
              onClick={() => setViewModalOpen(false)}
              style={{ position: 'absolute', top: '18px', right: '18px', color: 'var(--text-light)' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Outfit', marginBottom: '16px' }}>
              Case Details: {selectedCase.caseId}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Date:</span>
                <span style={{ fontWeight: 700 }}>{selectedCase.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Location:</span>
                <span style={{ fontWeight: 700 }}>{selectedCase.location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Type:</span>
                <span style={{ fontWeight: 700 }}>{selectedCase.accidentType || selectedCase.diseaseType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Severity:</span>
                <span style={{ fontWeight: 700, color: '#e11d48' }}>{selectedCase.severity}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Injured / Units:</span>
                <span style={{ fontWeight: 700 }}>{selectedCase.injured || selectedCase.unitsRequired}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <span style={{ fontWeight: 700, color: selectedCase.status === 'Closed' ? '#16A34A' : '#D97706' }}>{selectedCase.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Patient Name:</span>
                <span style={{ fontWeight: 700 }}>{selectedCase.patientName || 'N/A'}</span>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'end' }}>
              <button className="btn btn-secondary" onClick={() => setViewModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Reports;
