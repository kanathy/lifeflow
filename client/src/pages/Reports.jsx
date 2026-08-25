import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { exportToCSV } from '../utils/exportUtil';
import PdfPreviewModal from '../components/PdfPreviewModal';
import SearchWithSuggestions from '../components/SearchWithSuggestions';
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
  AlertTriangle,
  Droplet,
  Heart,
  Activity,
  Layers,
  Users,
  Hourglass,
  CheckCircle,
  Target,
  ShieldCheck,
  TrendingUp,
  Clock,
  Zap,
  Trash2,
  RefreshCw,
  UserPlus,
  UserCheck,
  UserX,
  Award
} from 'lucide-react';

// --- SVG Chart Components for Pixel-Perfect Visuals matching Screenshot 1 ---

// 1. Line Chart Component
const CustomLineChart = ({ color = '#e11d48', timeRange = 'Daily' }) => {
  const points = [
    { x: 30, y: 70, val: 5, date: 'May 1' },
    { x: 60, y: 95, val: 3, date: 'May 4' },
    { x: 90, y: 80, val: 4, date: 'May 8' },
    { x: 120, y: 105, val: 2, date: 'May 11' },
    { x: 150, y: 70, val: 5, date: 'May 15' },
    { x: 180, y: 90, val: 3, date: 'May 18' },
    { x: 210, y: 65, val: 6, date: 'May 22' },
    { x: 240, y: 80, val: 4, date: 'May 25' },
    { x: 270, y: 70, val: 5, date: 'May 27' },
    { x: 300, y: 85, val: 3, date: 'May 29' },
  ];

  const pathD = "M " + points.map(p => `${p.x},${p.y}`).join(" L ");
  const areaD = `${pathD} L 300,130 L 30,130 Z`;

  return (
    <div style={{ width: '100%', height: '180px', position: 'relative' }}>
      <svg width="100%" height="100%" viewBox="0 0 330 150" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[30, 55, 80, 105, 130].map((y, idx) => (
          <line key={idx} x1="25" y1={y} x2="310" y2={y} stroke="var(--border-color, #E5E7EB)" strokeDasharray="3 3" strokeWidth="1" />
        ))}

        {/* Area fill under line */}
        <path d={areaD} fill="url(#chartGradient)" />

        {/* Smooth line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r="4" fill={color} stroke="#FFFFFF" strokeWidth="2" />
          </g>
        ))}
      </svg>

      {/* Y-Axis Labels */}
      <div style={{ position: 'absolute', left: 0, top: '10px', bottom: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
        <span>8</span>
        <span>6</span>
        <span>4</span>
        <span>2</span>
        <span>0</span>
      </div>

      {/* X-Axis Labels */}
      <div style={{ position: 'absolute', bottom: 0, left: '25px', right: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
        <span>May 1</span>
        <span>May 8</span>
        <span>May 15</span>
        <span>May 22</span>
        <span>May 29</span>
      </div>
    </div>
  );
};

// 2. Donut Chart Component
const CustomDonutChart = ({ segments = [], centerTitle = 'Total', centerValue = '3' }) => {
  // segments = [{ name: 'Minor', percentage: 66.7, count: '2', color: '#F59E0B' }, ...]
  const radius = 36;
  const circumference = 2 * Math.PI * radius; // ~226.19

  let accumulatedPercent = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-around' }}>
      {/* SVG Donut */}
      <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
        <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#F3F4F6" strokeWidth="16" />
          
          {segments.map((seg, idx) => {
            const strokeDash = (seg.percentage / 100) * circumference;
            const strokeOffset = (accumulatedPercent / 100) * circumference;
            accumulatedPercent += seg.percentage;

            return (
              <circle
                key={idx}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth="16"
                strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
                strokeDashoffset={-strokeOffset}
                style={{ transition: 'all 0.5s ease' }}
              />
            );
          })}
        </svg>

        {/* Donut Center Text */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{centerTitle}</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{centerValue}</span>
        </div>
      </div>

      {/* Legend List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem', width: '100%' }}>
        {segments.map((seg, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: seg.color, display: 'inline-block' }} />
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{seg.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{seg.percentage}%</span>
              {seg.count && <span style={{ color: 'var(--text-secondary)' }}>({seg.count})</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


const Reports = ({ user }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'accident';
  
  // Tabs state: 'accident' | 'disease' | 'donor' | 'hospital' | 'inventory'
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [accidentCases, setAccidentCases] = useState([]);
  const [diseaseCases, setDiseaseCases] = useState([]);
  const [donorRecords, setDonorRecords] = useState([]);
  const [hospitalRecords, setHospitalRecords] = useState([]);
  const [inventoryRecords, setInventoryRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All Severity');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [timeRange, setTimeRange] = useState('Daily');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals & Toast state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // PDF Export Preview Modal State
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfExportData, setPdfExportData] = useState([]);
  const [pdfExportTitle, setPdfExportTitle] = useState('DAILY REPORT SUMMARY');

  // Direct Date Range Pickers (No Modal Popup) & Column Selector State
  const startDateInputRef = useRef(null);
  const endDateInputRef = useRef(null);
  const columnMenuRef = useRef(null);

  const [startDate, setStartDate] = useState('2025-05-01');
  const [endDate, setEndDate] = useState('2025-05-31');

  // Column Selector menu state & column visibility preferences
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    index: true,
    id: true,
    date: true,
    location: true,
    type: true,
    severity: true,
    units: true,
    status: true,
    actions: true
  });

  // Click outside listener for column menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(e.target)) {
        setColumnMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showSuccessToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Form state
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

  // Sync state with URL search params if navigated from sidebar
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['accident', 'disease', 'donor', 'hospital', 'inventory'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
    setCurrentPage(1);
    setSearchTerm('');
    setSeverityFilter('All Severity');
    setLocationFilter('All Locations');
  };

  // Format date for display
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).replace(/,/g, '');
  };

  // Helper to convert date strings to YYYY-MM-DD format for HTML5 date inputs
  const formatDateForPicker = (dateStr) => {
    if (!dateStr) return '2025-05-31';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
    return '2025-05-31';
  };



  // Fetch Data from APIs or local fallbacks
  const fetchAllData = () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${user?.token || ''}` };

    // Fetch Accidents
    fetch('/api/reports/accidents', { headers })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setAccidentCases(data); })
      .catch(err => console.error('Accidents fetch error:', err));

    // Fetch Diseases
    fetch('/api/reports/diseases', { headers })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setDiseaseCases(data); })
      .catch(err => console.error('Diseases fetch error:', err));

    // Fetch Donors
    fetch('/api/donors', { headers })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setDonorRecords(data); })
      .catch(err => console.error('Donors fetch error:', err));

    // Fetch Hospitals
    fetch('/api/hospitals', { headers })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setHospitalRecords(data); })
      .catch(err => console.error('Hospitals fetch error:', err));

    // Fetch Inventory
    fetch('/api/inventory', { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setInventoryRecords(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Inventory fetch error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  // Demo Fallback Lists if API records are empty
  const defaultAccidents = [
    { _id: '1', caseId: 'ACC-2025-002', date: 'May 29, 2025', location: 'Gampaha Site B', accidentType: 'Machinery Injury', severity: 'Minor', injured: 1, status: 'Closed', patientName: 'Saman Silva', hospital: 'Gampaha Base Hospital' },
    { _id: '2', caseId: 'ACC-2025-003', date: 'May 27, 2025', location: 'Kandy Warehouse', accidentType: 'Vehicle Collision', severity: 'Major', injured: 2, status: 'Open', patientName: 'Kasun Rajitha', hospital: 'Kandy General Hospital' },
    { _id: '3', caseId: 'ACC-2025-004', date: 'May 25, 2025', location: 'Colombo Site A', accidentType: 'Slip and Fall', severity: 'Minor', injured: 1, status: 'Closed', patientName: 'Anil Kumara', hospital: 'Colombo National Hospital' },
    { _id: '4', caseId: 'ACC-2025-005', date: 'May 22, 2025', location: 'Jaffna Depot', accidentType: 'Chemical Exposure', severity: 'Fatal', injured: 1, status: 'Closed', patientName: 'S. Thevan', hospital: 'Jaffna Teaching Hospital' },
    { _id: '5', caseId: 'ACC-2025-006', date: 'May 18, 2025', location: 'Galle Port Area', accidentType: 'Structural Collapse', severity: 'Major', injured: 3, status: 'Open', patientName: 'Ruwan Perera', hospital: 'Galle Karapitiya Hospital' }
  ];

  const defaultDiseases = [
    { _id: 'd1', caseId: 'DIS-2025-001', date: 'May 28, 2025', location: 'Colombo', diseaseType: 'Dengue Fever', severity: 'Major', injured: 4, status: 'Open', patientName: 'Nipuni Perera', hospital: 'Colombo National Hospital' },
    { _id: 'd2', caseId: 'DIS-2025-002', date: 'May 26, 2025', location: 'Kandy', diseaseType: 'Thalassemia Critical', severity: 'Fatal', injured: 2, status: 'Closed', patientName: 'Mahesh Gunasekara', hospital: 'Kandy General Hospital' },
    { _id: 'd3', caseId: 'DIS-2025-003', date: 'May 24, 2025', location: 'Gampaha', diseaseType: 'Acute Anemia', severity: 'Minor', injured: 1, status: 'Closed', patientName: 'Chathuri Fernando', hospital: 'Gampaha Base Hospital' },
    { _id: 'd4', caseId: 'DIS-2025-004', date: 'May 21, 2025', location: 'Jaffna', diseaseType: 'Leukemia Transfusion', severity: 'Major', injured: 3, status: 'Open', patientName: 'K. Balan', hospital: 'Jaffna Teaching Hospital' },
    { _id: 'd5', caseId: 'DIS-2025-005', date: 'May 17, 2025', location: 'Galle', diseaseType: 'Severe Dengue', severity: 'Fatal', injured: 5, status: 'Closed', patientName: 'Tharindu Silva', hospital: 'Galle National Hospital' }
  ];

  const defaultDonors = [
    { _id: 'dn1', caseId: 'DON-2025-101', date: 'May 28, 2025', location: 'Colombo', name: 'Kamal Perera', bloodGroup: 'O+', contact: '0771234567', status: 'Active', injured: 1, severity: 'Minor' },
    { _id: 'dn2', caseId: 'DON-2025-102', date: 'May 25, 2025', location: 'Kandy', name: 'Sunil Shantha', bloodGroup: 'A-', contact: '0719876543', status: 'Active', injured: 1, severity: 'Major' },
    { _id: 'dn3', caseId: 'DON-2025-103', date: 'May 22, 2025', location: 'Gampaha', name: 'Dilani Silva', bloodGroup: 'B+', contact: '0754567890', status: 'Eligible', injured: 1, severity: 'Minor' },
    { _id: 'dn4', caseId: 'DON-2025-104', date: 'May 19, 2025', location: 'Jaffna', name: 'Nimal Fernando', bloodGroup: 'AB+', contact: '0782345678', status: 'Deferred', injured: 0, severity: 'Fatal' },
    { _id: 'dn5', caseId: 'DON-2025-105', date: 'May 15, 2025', location: 'Galle', name: 'Anusha Wickramasinghe', bloodGroup: 'O-', contact: '0703456789', status: 'Active', injured: 1, severity: 'Minor' }
  ];

  const defaultHospitals = [
    { _id: 'hp1', caseId: 'HSP-2025-01', date: 'May 29, 2025', location: 'Colombo', name: 'Colombo National Hospital', hospitalType: 'Government', contact: '0112691111', status: 'Active', severity: 'Major', injured: 24 },
    { _id: 'hp2', caseId: 'HSP-2025-02', date: 'May 27, 2025', location: 'Kandy', name: 'Kandy General Hospital', hospitalType: 'Government', contact: '0812222261', status: 'Active', severity: 'Major', injured: 18 },
    { _id: 'hp3', caseId: 'HSP-2025-03', date: 'May 24, 2025', location: 'Colombo', name: 'Nawaloka Hospital', hospitalType: 'Private', contact: '0115577111', status: 'Active', severity: 'Minor', injured: 8 },
    { _id: 'hp4', caseId: 'HSP-2025-04', date: 'May 20, 2025', location: 'Gampaha', name: 'Gampaha Base Hospital', hospitalType: 'Government', contact: '0332222271', status: 'Critical', severity: 'Fatal', injured: 12 },
    { _id: 'hp5', caseId: 'HSP-2025-05', date: 'May 16, 2025', location: 'Jaffna', name: 'Jaffna Teaching Hospital', hospitalType: 'Teaching', contact: '0212222261', status: 'Active', severity: 'Major', injured: 15 }
  ];

  const defaultInventory = [
    { _id: 'inv1', caseId: 'BCH-2025-801', date: 'May 29, 2025', location: 'Colombo Central', bloodGroup: 'O+', rhFactor: '+', availableUnits: 450, expiryDays: 32, status: 'Closed', severity: 'Minor', injured: 450 },
    { _id: 'inv2', caseId: 'BCH-2025-802', date: 'May 26, 2025', location: 'Kandy Main', bloodGroup: 'A-', rhFactor: '-', availableUnits: 120, expiryDays: 14, status: 'Open', severity: 'Major', injured: 120 },
    { _id: 'inv3', caseId: 'BCH-2025-803', date: 'May 23, 2025', location: 'Gampaha Station', bloodGroup: 'B+', rhFactor: '+', availableUnits: 380, expiryDays: 28, status: 'Closed', severity: 'Minor', injured: 380 },
    { _id: 'inv4', caseId: 'BCH-2025-804', date: 'May 19, 2025', location: 'Jaffna Regional', bloodGroup: 'O-', rhFactor: '-', availableUnits: 65, expiryDays: 5, status: 'Open', severity: 'Fatal', injured: 65 },
    { _id: 'inv5', caseId: 'BCH-2025-805', date: 'May 14, 2025', location: 'Galle Hub', bloodGroup: 'AB+', rhFactor: '+', availableUnits: 210, expiryDays: 22, status: 'Closed', severity: 'Minor', injured: 210 }
  ];

  // Resolve current active tab dataset
  const getActiveList = () => {
    if (activeTab === 'accident') return accidentCases.length > 0 ? accidentCases : defaultAccidents;
    if (activeTab === 'disease') return diseaseCases.length > 0 ? diseaseCases : defaultDiseases;
    if (activeTab === 'donor') return donorRecords.length > 0 ? donorRecords : defaultDonors;
    if (activeTab === 'hospital') return hospitalRecords.length > 0 ? hospitalRecords : defaultHospitals;
    if (activeTab === 'inventory') return inventoryRecords.length > 0 ? inventoryRecords : defaultInventory;
    return defaultAccidents;
  };

  const currentList = getActiveList();

  // Filtered dataset based on search term, filters, and date range
  const filteredList = currentList.filter(item => {
    const loc = item.location || item.district || '';
    const idVal = item.caseId || item.donorId || item.hospitalId || '';
    const typeVal = item.accidentType || item.diseaseType || item.bloodGroup || item.name || '';

    const matchesSearch =
      idVal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      typeVal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.patientName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      severityFilter === 'All Severity' || item.severity === severityFilter || item.status === severityFilter;

    const matchesLocation =
      locationFilter === 'All Locations' || loc.toLowerCase().includes(locationFilter.toLowerCase());

    // Date range filter — parse item date and compare against selected range
    let matchesDate = true;
    if (item.date && startDate && endDate) {
      const itemDate = new Date(item.date);
      const rangeStart = new Date(startDate + 'T00:00:00');
      const rangeEnd = new Date(endDate + 'T23:59:59');
      if (!isNaN(itemDate.getTime())) {
        matchesDate = itemDate >= rangeStart && itemDate <= rangeEnd;
      }
    }

    return matchesSearch && matchesSeverity && matchesLocation && matchesDate;
  });


  // Pagination calculations
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedItems = filteredList.slice(startIndex, startIndex + itemsPerPage);

  // --- Dynamic Tab Configurations & Metadata ---
  const tabConfigs = {
    accident: {
      title: 'Accident Reports',
      breadcrumb: 'Accident Reports',
      kpiTitle: 'Accident Summary',
      tableTitle: 'Accident Cases Records',
      addLabel: 'Add New Accident',
      cards: [
        { title: 'Total Accident Cases', count: filteredList.length || 3, color: '#e11d48', bg: '#FFF5F5', border: '#FFE4E6', icon: Car },
        { title: 'Minor Cases', count: 2, color: '#D97706', bg: '#FFFBEB', border: '#FEF3C7', icon: User },
        { title: 'Major Cases', count: 1, color: '#2563EB', bg: '#EFF6FF', border: '#DBEAFE', icon: Building2 },
        { title: 'Fatal Cases', count: 4, color: '#16A34A', bg: '#F0FDF4', border: '#DCFCE7', icon: AlertOctagon },
      ],
      donut1: {
        title: 'Accidents by Severity',
        centerTitle: 'Total',
        centerValue: String(filteredList.length || 3),
        segments: [
          { name: 'Minor', percentage: 66.7, count: '2', color: '#F59E0B' },
          { name: 'Major', percentage: 33.3, count: '1', color: '#3B82F6' },
          { name: 'Fatal', percentage: 0, count: '0', color: '#10B981' }
        ]
      },
      donut2: {
        title: 'Accidents by Location (Top 5)',
        centerTitle: 'Top 5',
        centerValue: 'Sites',
        segments: [
          { name: 'Gampaha Site B', percentage: 33.3, count: '', color: '#E11D48' },
          { name: 'Kandy Warehouse', percentage: 33.3, count: '', color: '#3B82F6' },
          { name: 'Colombo Site A', percentage: 33.3, count: '', color: '#F59E0B' },
          { name: 'Other', percentage: 0, count: '', color: '#9CA3AF' }
        ]
      },
      miniKPIs: [
        { label: 'Total Injured', val: '4', trend: '↑ 33.3% from Apr', icon: Users, theme: 'red' },
        { label: 'Open Cases', val: '1', trend: '↑ 100% from Apr', icon: Hourglass, theme: 'amber' },
        { label: 'Closed Cases', val: '2', trend: '↑ 100% from Apr', icon: CheckCircle, theme: 'green' },
        { label: 'Avg. Injured / Case', val: '1.33', trend: '↑ 11.1% from Apr', icon: Users, theme: 'purple' },
        { label: 'Closure Rate', val: '66.7%', trend: '↑ 33.3% from Apr', icon: Target, theme: 'blue' }
      ]
    },
    disease: {
      title: 'Disease Reports',
      breadcrumb: 'Disease Reports',
      kpiTitle: 'Disease Summary',
      tableTitle: 'Disease Cases Records',
      addLabel: 'Add New Disease',
      cards: [
        { title: 'Total Disease Cases', count: 18, color: '#e11d48', bg: '#FFF5F5', border: '#FFE4E6', icon: BriefcaseMedical },
        { title: 'Outbreak Cases', count: 5, color: '#D97706', bg: '#FFFBEB', border: '#FEF3C7', icon: AlertTriangle },
        { title: 'Chronic Cases', count: 8, color: '#2563EB', bg: '#EFF6FF', border: '#DBEAFE', icon: Activity },
        { title: 'Critical Cases', count: 5, color: '#16A34A', bg: '#F0FDF4', border: '#DCFCE7', icon: AlertOctagon },
      ],
      donut1: {
        title: 'Diseases by Severity',
        centerTitle: 'Total',
        centerValue: '18',
        segments: [
          { name: 'Minor', percentage: 44.4, count: '8', color: '#F59E0B' },
          { name: 'Major', percentage: 38.9, count: '7', color: '#3B82F6' },
          { name: 'Critical', percentage: 16.7, count: '3', color: '#E11D48' }
        ]
      },
      donut2: {
        title: 'Diseases by Region (Top 5)',
        centerTitle: 'Top 5',
        centerValue: 'Districts',
        segments: [
          { name: 'Colombo District', percentage: 40.0, count: '', color: '#E11D48' },
          { name: 'Kandy Region', percentage: 25.0, count: '', color: '#3B82F6' },
          { name: 'Gampaha Base', percentage: 20.0, count: '', color: '#F59E0B' },
          { name: 'Jaffna Hub', percentage: 15.0, count: '', color: '#10B981' }
        ]
      },
      miniKPIs: [
        { label: 'Total Affected', val: '48', trend: '↑ 12.5% from Apr', icon: Activity, theme: 'red' },
        { label: 'Active Outbreaks', val: '3', trend: '↓ 25.0% from Apr', icon: AlertTriangle, theme: 'amber' },
        { label: 'Recovered Patients', val: '35', trend: '↑ 40.0% from Apr', icon: CheckCircle, theme: 'green' },
        { label: 'Avg. Units / Case', val: '2.1', trend: '↑ 5.0% from Apr', icon: Droplet, theme: 'purple' },
        { label: 'Recovery Rate', val: '72.9%', trend: '↑ 15.0% from Apr', icon: TrendingUp, theme: 'blue' }
      ]
    },
    donor: {
      title: 'Donor Reports',
      breadcrumb: 'Donor Reports',
      kpiTitle: 'Donor Overview Summary',
      tableTitle: 'Registered Donor Activity Records',
      addLabel: 'Add New Donor',
      cards: [
        { title: 'Total Donors', count: '1,248', color: '#e11d48', bg: '#FFF5F5', border: '#FFE4E6', icon: Heart },
        { title: 'Active Donors', count: '856', color: '#D97706', bg: '#FFFBEB', border: '#FEF3C7', icon: UserCheck },
        { title: 'New This Month', count: '124', color: '#2563EB', bg: '#EFF6FF', border: '#DBEAFE', icon: UserPlus },
        { title: 'Eligible Donors', count: '680', color: '#16A34A', bg: '#F0FDF4', border: '#DCFCE7', icon: Award },
      ],
      donut1: {
        title: 'Donors by Status',
        centerTitle: 'Total',
        centerValue: '1,248',
        segments: [
          { name: 'Active', percentage: 68.6, count: '856', color: '#10B981' },
          { name: 'Eligible', percentage: 22.4, count: '280', color: '#3B82F6' },
          { name: 'Deferred', percentage: 9.0, count: '112', color: '#F59E0B' }
        ]
      },
      donut2: {
        title: 'Donors by Blood Group',
        centerTitle: 'Groups',
        centerValue: '8 Types',
        segments: [
          { name: 'O+ Donors', percentage: 38.0, count: '', color: '#E11D48' },
          { name: 'A+ Donors', percentage: 26.0, count: '', color: '#3B82F6' },
          { name: 'B+ Donors', percentage: 20.0, count: '', color: '#F59E0B' },
          { name: 'Universal O-', percentage: 16.0, count: '', color: '#10B981' }
        ]
      },
      miniKPIs: [
        { label: 'Regular Donors', val: '840', trend: '↑ 8.2% from Apr', icon: Heart, theme: 'red' },
        { label: 'First Time Donors', val: '112', trend: '↑ 14.0% from Apr', icon: UserPlus, theme: 'amber' },
        { label: 'Turnout Rate', val: '88.5%', trend: '↑ 5.0% from Apr', icon: TrendingUp, theme: 'green' },
        { label: 'Deferred Donors', val: '45', trend: '↓ 10.0% from Apr', icon: UserX, theme: 'purple' },
        { label: 'Retention Rate', val: '91.2%', trend: '↑ 3.0% from Apr', icon: Award, theme: 'blue' }
      ]
    },
    hospital: {
      title: 'Hospital Reports',
      breadcrumb: 'Hospital Reports',
      kpiTitle: 'Hospital Demand & Network Summary',
      tableTitle: 'Hospital Request Records',
      addLabel: 'Add Hospital Record',
      cards: [
        { title: 'Total Hospitals', count: '42', color: '#e11d48', bg: '#FFF5F5', border: '#FFE4E6', icon: Building2 },
        { title: 'Urgent Requests', count: '15', color: '#D97706', bg: '#FFFBEB', border: '#FEF3C7', icon: Zap },
        { title: 'Delivered Units', count: '1,450', color: '#2563EB', bg: '#EFF6FF', border: '#DBEAFE', icon: Droplet },
        { title: 'Critical Stock Level', count: '6', color: '#16A34A', bg: '#F0FDF4', border: '#DCFCE7', icon: AlertOctagon },
      ],
      donut1: {
        title: 'Requests by Hospital Tier',
        centerTitle: 'Facilities',
        centerValue: '42',
        segments: [
          { name: 'National/Teaching', percentage: 52.4, count: '22', color: '#3B82F6' },
          { name: 'District Base', percentage: 33.3, count: '14', color: '#F59E0B' },
          { name: 'Private Clinics', percentage: 14.3, count: '6', color: '#10B981' }
        ]
      },
      donut2: {
        title: 'Top Demanding Districts',
        centerTitle: 'Top 5',
        centerValue: 'Hubs',
        segments: [
          { name: 'Colombo District', percentage: 45.0, count: '', color: '#E11D48' },
          { name: 'Kandy Region', percentage: 25.0, count: '', color: '#3B82F6' },
          { name: 'Gampaha Area', percentage: 18.0, count: '', color: '#F59E0B' },
          { name: 'Jaffna / Galle', percentage: 12.0, count: '', color: '#10B981' }
        ]
      },
      miniKPIs: [
        { label: 'Participating Network', val: '38', trend: '↑ 2.5% from Apr', icon: Building2, theme: 'red' },
        { label: 'Emergency Demands', val: '28', trend: '↑ 18.0% from Apr', icon: Zap, theme: 'amber' },
        { label: 'Avg Response Time', val: '24m', trend: '↓ 15.0% from Apr', icon: Clock, theme: 'green' },
        { label: 'High Priority', val: '12', trend: '↑ 8.0% from Apr', icon: AlertTriangle, theme: 'purple' },
        { label: 'Fulfillment Rate', val: '98.1%', trend: '↑ 1.5% from Apr', icon: CheckCircle, theme: 'blue' }
      ]
    },
    inventory: {
      title: 'Blood Inventory Reports',
      breadcrumb: 'Blood Inventory Reports',
      kpiTitle: 'Blood Inventory & Batch Summary',
      tableTitle: 'Blood Bank Inventory Batches',
      addLabel: 'Add Stock Batch',
      cards: [
        { title: 'Total Blood Units', count: '2,840', color: '#e11d48', bg: '#FFF5F5', border: '#FFE4E6', icon: Droplet },
        { title: 'Available Stock', count: '1,920', color: '#D97706', bg: '#FFFBEB', border: '#FEF3C7', icon: Layers },
        { title: 'Reserved Units', count: '650', color: '#2563EB', bg: '#EFF6FF', border: '#DBEAFE', icon: ShieldCheck },
        { title: 'Expiring Soon (<7d)', count: '270', color: '#16A34A', bg: '#F0FDF4', border: '#DCFCE7', icon: AlertTriangle },
      ],
      donut1: {
        title: 'Inventory Stock Status',
        centerTitle: 'Total Units',
        centerValue: '2,840',
        segments: [
          { name: 'Available', percentage: 67.6, count: '1,920', color: '#10B981' },
          { name: 'Reserved', percentage: 22.9, count: '650', color: '#3B82F6' },
          { name: 'Expiring', percentage: 9.5, count: '270', color: '#E11D48' }
        ]
      },
      donut2: {
        title: 'Stock by Blood Type',
        centerTitle: 'Types',
        centerValue: '8 Types',
        segments: [
          { name: 'O Positive (O+)', percentage: 35.0, count: '', color: '#E11D48' },
          { name: 'A Positive (A+)', percentage: 28.0, count: '', color: '#3B82F6' },
          { name: 'B Positive (B+)', percentage: 22.0, count: '', color: '#F59E0B' },
          { name: 'Rare (O-, AB-)', percentage: 15.0, count: '', color: '#10B981' }
        ]
      },
      miniKPIs: [
        { label: 'Fresh Units', val: '1,850', trend: '↑ 6.4% from Apr', icon: Droplet, theme: 'red' },
        { label: 'Testing Phase', val: '310', trend: '↑ 12.0% from Apr', icon: ShieldCheck, theme: 'amber' },
        { label: 'Expired / Discarded', val: '18', trend: '↓ 35.0% from Apr', icon: Trash2, theme: 'green' },
        { label: 'Shelf Turnover', val: '4.2 days', trend: '↓ 8.0% from Apr', icon: RefreshCw, theme: 'purple' },
        { label: 'Buffer Health', val: '94.8%', trend: '↑ 4.0% from Apr', icon: Activity, theme: 'blue' }
      ]
    }
  };

  const activeConfig = tabConfigs[activeTab] || tabConfigs.accident;

  // Single Record Export
  const handleSingleExport = (item, format) => {
    if (format === 'excel') {
      exportToCSV([item], `${item.caseId || item.donorId || 'Record'}_Record.csv`, `${activeConfig.title} Record`, activeTab, visibleColumns);
    } else {
      setPdfExportData([item]);
      setPdfExportTitle(`${item.caseId || item.donorId || item.hospitalId || 'SINGLE'} RECORD SUMMARY`);
      setPdfModalOpen(true);
    }
  };

  // Bulk Excel Export
  const handleExportAllExcel = () => {
    const fileName = `LifeFlow_${activeTab.toUpperCase()}_Master_Report_${new Date().toISOString().slice(0,10)}.csv`;
    exportToCSV(filteredList, fileName, activeConfig.title, activeTab, visibleColumns);
  };

  // Bulk PDF / Preview Export matching reference screenshot
  const handleExportAllPDF = () => {
    setPdfExportData(filteredList);
    setPdfExportTitle(`DAILY ${activeConfig.title.toUpperCase()} SUMMARY`);
    setPdfModalOpen(true);
  };


  // Submit Handler for Modal
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const count = currentList.length + 1;
    const prefix = activeTab === 'accident' ? 'ACC-2025-' : activeTab === 'disease' ? 'DIS-2025-' : activeTab === 'donor' ? 'DON-2025-' : activeTab === 'hospital' ? 'HSP-2025-' : 'BCH-2025-';
    const newId = `${prefix}${String(count).padStart(3, '0')}`;

    const newRecord = {
      _id: Date.now().toString(),
      caseId: newId,
      date: caseForm.date || 'May 31, 2025',
      location: caseForm.location,
      accidentType: caseForm.type,
      diseaseType: caseForm.type,
      bloodGroup: caseForm.bloodGroup,
      severity: caseForm.severity,
      injured: Number(caseForm.injured),
      availableUnits: Number(caseForm.injured),
      status: caseForm.status,
      patientName: caseForm.patientName || 'Record Item',
      name: caseForm.patientName || 'Entity Record',
      hospital: caseForm.hospital,
      district: caseForm.district
    };

    if (activeTab === 'accident' || activeTab === 'disease') {
      const endpoint = activeTab === 'accident' ? '/api/reports/accidents' : '/api/reports/diseases';
      const payload = {
        caseId: newId,
        date: newRecord.date,
        location: newRecord.location,
        severity: newRecord.severity,
        injured: newRecord.injured,
        status: newRecord.status,
        patientName: newRecord.patientName,
        bloodGroup: newRecord.bloodGroup,
        hospital: newRecord.hospital,
        district: newRecord.district,
        ...(activeTab === 'accident'
          ? { accidentType: caseForm.type }
          : { diseaseType: caseForm.type })
      };

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token || ''}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Error saving case');
        }

        const savedRecord = await response.json();
        if (activeTab === 'accident') {
          setAccidentCases(prev => [savedRecord, ...prev]);
          showSuccessToast(`Accident case record (${savedRecord.caseId}) created successfully!`);
        } else {
          setDiseaseCases(prev => [savedRecord, ...prev]);
          showSuccessToast(`Disease case record (${savedRecord.caseId}) registered successfully!`);
        }
        setAddModalOpen(false);
      } catch (error) {
        console.error('Case save error:', error);
        showSuccessToast(`Error: ${error.message}`);
      }
      return;
    }

    if (activeTab === 'accident') {
      setAccidentCases(prev => [newRecord, ...prev]);
      showSuccessToast(`Accident case record (${newId}) created successfully!`);
    } else if (activeTab === 'disease') {
      setDiseaseCases(prev => [newRecord, ...prev]);
      showSuccessToast(`Disease case record (${newId}) registered successfully!`);
    } else if (activeTab === 'donor') {
      setDonorRecords(prev => [newRecord, ...prev]);
      showSuccessToast(`New donor details (${newId}) added successfully!`);
    } else if (activeTab === 'hospital') {
      setHospitalRecords(prev => [newRecord, ...prev]);
      showSuccessToast(`New hospital record (${newId}) registered successfully!`);
    } else {
      setInventoryRecords(prev => [newRecord, ...prev]);
      showSuccessToast(`Blood stock batch (${newId}) created successfully!`);
    }

    setAddModalOpen(false);
  };

  // Submit Handler for Edit Modal
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedCase) return;

    const updatedItem = {
      ...selectedCase,
      location: caseForm.location,
      accidentType: caseForm.type,
      diseaseType: caseForm.type,
      bloodGroup: caseForm.bloodGroup || caseForm.type,
      hospitalType: caseForm.type,
      severity: caseForm.severity,
      injured: Number(caseForm.injured),
      availableUnits: Number(caseForm.injured),
      status: caseForm.status,
      patientName: caseForm.patientName,
      name: caseForm.patientName
    };

    if (activeTab === 'accident') {
      setAccidentCases(prev => prev.map(c => (c._id === selectedCase._id || c.caseId === selectedCase.caseId) ? updatedItem : c));
    } else if (activeTab === 'disease') {
      setDiseaseCases(prev => prev.map(c => (c._id === selectedCase._id || c.caseId === selectedCase.caseId) ? updatedItem : c));
    } else if (activeTab === 'donor') {
      setDonorRecords(prev => prev.map(c => (c._id === selectedCase._id || c.caseId === selectedCase.caseId) ? updatedItem : c));
    } else if (activeTab === 'hospital') {
      setHospitalRecords(prev => prev.map(c => (c._id === selectedCase._id || c.caseId === selectedCase.caseId) ? updatedItem : c));
    } else if (activeTab === 'inventory') {
      setInventoryRecords(prev => prev.map(c => (c._id === selectedCase._id || c.caseId === selectedCase.caseId) ? updatedItem : c));
    }

    setEditModalOpen(false);
    showSuccessToast(`Record ${selectedCase.caseId || selectedCase.donorId || selectedCase.hospitalId || ''} updated successfully`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'Inter, sans-serif', position: 'relative' }}>
      
      {/* Floating Success Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: '#10B981',
          color: '#FFFFFF',
          padding: '14px 22px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.95rem',
          fontWeight: 700,
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <CheckCircle size={22} color="#FFFFFF" />
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} style={{ background: 'none', border: 'none', color: '#FFFFFF', marginLeft: '12px', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* 1. Header Bar & Date Range Selector */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: 0 }}>
            {activeConfig.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            <span>Report</span>
            <span>/</span>
            <span style={{ color: '#e11d48', fontWeight: 600 }}>{activeConfig.breadcrumb}</span>
          </div>
        </div>

        {/* Right Header Toolbar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleExportAllPDF}
            className="btn btn-secondary"
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <FileText size={16} color="#e11d48" />
            <span>Export Report PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Top Navigation Tabs Switcher (Accident | Disease | Donor | Hospital | Blood Inventory) */}
      <div style={{
        display: 'flex',
        gap: '24px',
        borderBottom: '2px solid var(--border-color)',
        paddingBottom: '2px',
        overflowX: 'auto'
      }}>
        {/* Tab 1: Accident */}
        <button
          onClick={() => handleTabChange('accident')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'accident' ? '#e11d48' : 'var(--text-secondary)',
            borderBottom: activeTab === 'accident' ? '3px solid #e11d48' : '3px solid transparent',
            marginBottom: '-2px',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        >
          <Car size={18} color={activeTab === 'accident' ? '#e11d48' : 'var(--text-secondary)'} />
          <span>Accident</span>
        </button>

        {/* Tab 2: Disease */}
        <button
          onClick={() => handleTabChange('disease')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'disease' ? '#e11d48' : 'var(--text-secondary)',
            borderBottom: activeTab === 'disease' ? '3px solid #e11d48' : '3px solid transparent',
            marginBottom: '-2px',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        >
          <BriefcaseMedical size={18} color={activeTab === 'disease' ? '#e11d48' : 'var(--text-secondary)'} />
          <span>Disease</span>
        </button>

        {/* Tab 3: Donor */}
        <button
          onClick={() => handleTabChange('donor')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'donor' ? '#e11d48' : 'var(--text-secondary)',
            borderBottom: activeTab === 'donor' ? '3px solid #e11d48' : '3px solid transparent',
            marginBottom: '-2px',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        >
          <Heart size={18} color={activeTab === 'donor' ? '#e11d48' : 'var(--text-secondary)'} />
          <span>Donor</span>
        </button>

        {/* Tab 4: Hospital */}
        <button
          onClick={() => handleTabChange('hospital')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'hospital' ? '#e11d48' : 'var(--text-secondary)',
            borderBottom: activeTab === 'hospital' ? '3px solid #e11d48' : '3px solid transparent',
            marginBottom: '-2px',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        >
          <Building2 size={18} color={activeTab === 'hospital' ? '#e11d48' : 'var(--text-secondary)'} />
          <span>Hospital</span>
        </button>

        {/* Tab 5: Blood Inventory */}
        <button
          onClick={() => handleTabChange('inventory')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'inventory' ? '#e11d48' : 'var(--text-secondary)',
            borderBottom: activeTab === 'inventory' ? '3px solid #e11d48' : '3px solid transparent',
            marginBottom: '-2px',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        >
          <Droplet size={18} color={activeTab === 'inventory' ? '#e11d48' : 'var(--text-secondary)'} />
          <span>Blood Inventory</span>
        </button>
      </div>

      {/* 3. Top Summary KPI Cards Grid (4 Cards matching Screenshot 1 colors) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
        <div className="flex-between">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: 0 }}>
            {activeConfig.kpiTitle}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>Month: May 2025</span>
            <Calendar size={14} />
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {activeConfig.cards.map((c, idx) => {
            const CardIcon = c.icon;
            return (
              <div key={idx} style={{
                backgroundColor: c.bg,
                borderRadius: '16px',
                padding: '20px',
                border: `1px solid ${c.border}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px'
              }}>
                <div className="flex-between">
                  <div>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: c.color, margin: 0 }}>
                      {c.title}
                    </p>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: c.color, marginTop: '4px', margin: 0, lineHeight: 1 }}>
                      {c.count}
                    </h2>
                  </div>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: c.border,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: c.color
                  }}>
                    <CardIcon size={22} />
                  </div>
                </div>
                <button 
                  onClick={() => setSeverityFilter('All Severity')}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: c.color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    width: 'fit-content',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                >
                  <span>View Details</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Three Side-by-Side Analytics Charts (Exact Match to Screenshot 1) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '4px' }}>
        
        {/* Chart 1: Over Time Line Chart */}
        <div className="dashboard-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-between">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: 0 }}>
              {activeTab === 'accident' ? 'Accidents Over Time' :
               activeTab === 'disease' ? 'Diseases Over Time' :
               activeTab === 'donor' ? 'Donations Over Time' :
               activeTab === 'hospital' ? 'Hospital Requests Over Time' :
               'Stock Trends Over Time'}
            </h4>
            
            {/* Daily Dropdown */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          <CustomLineChart color="#e11d48" timeRange={timeRange} />
        </div>

        {/* Chart 2: Donut Chart 1 (Severity / Category) */}
        <div className="dashboard-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: 0 }}>
            {activeConfig.donut1.title}
          </h4>

          <CustomDonutChart
            segments={activeConfig.donut1.segments}
            centerTitle={activeConfig.donut1.centerTitle}
            centerValue={activeConfig.donut1.centerValue}
          />
        </div>

        {/* Chart 3: Donut Chart 2 (Location / Region) */}
        <div className="dashboard-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: 0 }}>
            {activeConfig.donut2.title}
          </h4>

          <CustomDonutChart
            segments={activeConfig.donut2.segments}
            centerTitle={activeConfig.donut2.centerTitle}
            centerValue={activeConfig.donut2.centerValue}
          />
        </div>

      </div>

      {/* 5. Mini KPI Stat Widgets Horizontal Bar (5 Cards matching Screenshot 1 middle section) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginTop: '4px' }}>
        {activeConfig.miniKPIs.map((kpi, idx) => {
          const KpiIcon = kpi.icon;
          const themeColors = {
            red: { bg: '#FFF5F5', iconBg: '#FFE4E6', text: '#E11D48' },
            amber: { bg: '#FFFBEB', iconBg: '#FEF3C7', text: '#D97706' },
            green: { bg: '#F0FDF4', iconBg: '#DCFCE7', text: '#16A34A' },
            purple: { bg: '#F3E8FF', iconBg: '#E9D5FF', text: '#9333EA' },
            blue: { bg: '#EFF6FF', iconBg: '#DBEAFE', text: '#2563EB' }
          }[kpi.theme] || { bg: '#FFF5F5', iconBg: '#FFE4E6', text: '#E11D48' };

          return (
            <div key={idx} className="dashboard-card" style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              borderRadius: '12px'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: themeColors.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: themeColors.text,
                flexShrink: 0
              }}>
                <KpiIcon size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{kpi.label}</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, marginTop: '2px' }}>{kpi.val}</span>
                <span style={{ fontSize: '0.68rem', color: '#16A34A', fontWeight: 700, marginTop: '4px' }}>{kpi.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. Main Data Table Section */}
      <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: 0 }}>
            {activeConfig.tableTitle}
          </h3>

          {/* Date Picker Pill & Column Selector in Table Header (Marked location in screenshot) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Date Picker Pill with dual calendar icons - Direct click picker (No Modal Popup) */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '8px 16px',
                borderRadius: '50px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative'
              }}
            >
              {/* Hidden HTML5 Native Date Pickers */}
              <input 
                ref={startDateInputRef}
                type="date" 
                value={startDate} 
                onChange={(e) => { if (e.target.value) { setStartDate(e.target.value); setCurrentPage(1); } }}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
              />
              <input 
                ref={endDateInputRef}
                type="date" 
                value={endDate} 
                onChange={(e) => { if (e.target.value) { setEndDate(e.target.value); setCurrentPage(1); } }}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
              />

              {/* Left Calendar Icon & Start Date */}
              <button
                type="button"
                onClick={() => {
                  if (startDateInputRef.current?.showPicker) {
                    startDateInputRef.current.showPicker();
                  } else {
                    startDateInputRef.current?.focus();
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  color: 'inherit',
                  font: 'inherit'
                }}
                title="Click to select Start Date"
              >
                <Calendar size={15} color="var(--text-secondary)" />
                <span>{formatDateDisplay(startDate)}</span>
              </button>

              <span style={{ color: 'var(--text-light)', fontWeight: 700 }}>-</span>

              {/* Right Calendar Icon & End Date */}
              <button
                type="button"
                onClick={() => {
                  if (endDateInputRef.current?.showPicker) {
                    endDateInputRef.current.showPicker();
                  } else {
                    endDateInputRef.current?.focus();
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  color: 'inherit',
                  font: 'inherit'
                }}
                title="Click to select End Date"
              >
                <span>{formatDateDisplay(endDate)}</span>
                <Calendar size={15} color="var(--text-secondary)" />
              </button>
            </div>

            {/* Column Selector Filter Button & Floating Dropdown */}
            <div style={{ position: 'relative' }} ref={columnMenuRef}>
              <button 
                onClick={() => setColumnMenuOpen(!columnMenuOpen)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: columnMenuOpen ? '#FFF5F5' : 'var(--bg-secondary)',
                  color: columnMenuOpen ? '#e11d48' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Select Table Columns to Display"
              >
                <Filter size={16} />
              </button>

              {/* Column Selection Dropdown Menu */}
              {columnMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '230px',
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                  padding: '12px 14px',
                  zIndex: 9999
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '8px',
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    <span>Select Columns</span>
                    <button 
                      onClick={() => setVisibleColumns({
                        index: true, id: true, date: true, location: true, type: true, severity: true, units: true, status: true, actions: true
                      })}
                      style={{ background: 'none', border: 'none', color: '#e11d48', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Reset
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                    {[
                      { key: 'index', label: '# (Index)' },
                      { 
                        key: 'id', 
                        label: activeTab === 'donor' ? 'Donor ID' :
                               activeTab === 'hospital' ? 'Hospital ID' :
                               activeTab === 'inventory' ? 'Batch ID' : 'Case ID'
                      },
                      { key: 'date', label: 'Date' },
                      { key: 'location', label: activeTab === 'inventory' ? 'Location / Hub' : 'Location / District' },
                      { 
                        key: 'type', 
                        label: activeTab === 'accident' ? 'Type of Accident' :
                               activeTab === 'disease' ? 'Type of Disease' :
                               activeTab === 'donor' ? 'Blood Group' :
                               activeTab === 'hospital' ? 'Facility Type' : 'Blood Group'
                      },
                      { key: 'severity', label: 'Severity' },
                      { 
                        key: 'units', 
                        label: activeTab === 'accident' ? 'No. of Injured' :
                               activeTab === 'disease' ? 'Units Required' :
                               activeTab === 'donor' ? 'Units Donated' :
                               activeTab === 'hospital' ? 'Capacity / Units' : 'Units Available'
                      },
                      { key: 'status', label: 'Status' },
                      { key: 'actions', label: 'Actions' }
                    ].map(col => (
                      <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', color: 'var(--text-primary)' }}>
                        <input 
                          type="checkbox"
                          checked={visibleColumns[col.key]}
                          onChange={(e) => setVisibleColumns(prev => ({ ...prev, [col.key]: e.target.checked }))}
                          style={{ accentColor: '#e11d48', width: '14px', height: '14px', cursor: 'pointer' }}
                        />
                        <span>{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Search Field with Suggestions */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <SearchWithSuggestions
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by case ID, location, person..."
              suggestions={Array.from(new Set(
                currentList.flatMap(item => [
                  item.caseId || item.donorId || item.hospitalId,
                  item.location || item.district,
                  item.patientName || item.name,
                  item.accidentType || item.diseaseType || item.bloodGroup || item.hospitalType
                ]).filter(Boolean)
              )).map(val => ({
                label: String(val),
                category: activeConfig.title ? activeConfig.title.replace(' Reports', '') : 'Record'
              }))}
            />
          </div>

          {/* Severity Filter */}
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
            <option value="Active">Active</option>
          </select>

          {/* Location Filter */}
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
          </select>

          {/* Add Button */}
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
            <span>{activeConfig.addLabel}</span>
          </button>
        </div>

        {/* Styled Data Table */}
        <div className="table-container" style={{ margin: 0, border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
          <table className="custom-table" style={{ width: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', fontSize: '0.8rem', textTransform: 'none' }}>
                {visibleColumns.index && <th style={{ width: '40px' }}>#</th>}
                {visibleColumns.id && <th>CASE ID</th>}
                {visibleColumns.date && <th>DATE</th>}
                {visibleColumns.location && <th>LOCATION</th>}
                {visibleColumns.type && (
                  <th>
                    {activeTab === 'accident' ? 'TYPE OF ACCIDENT' :
                     activeTab === 'disease' ? 'TYPE OF DISEASE' :
                     activeTab === 'donor' ? 'BLOOD GROUP' :
                     activeTab === 'hospital' ? 'FACILITY TYPE' : 'BLOOD GROUP'}
                  </th>
                )}
                {visibleColumns.severity && <th>SEVERITY</th>}
                {visibleColumns.units && (
                  <th>
                    {activeTab === 'accident' ? 'NO. OF INJURED' :
                     activeTab === 'disease' ? 'UNITS REQUIRED' :
                     activeTab === 'inventory' ? 'UNITS AVAILABLE' : 'UNITS / CAPACITY'}
                  </th>
                )}
                {visibleColumns.status && <th>STATUS</th>}
                {visibleColumns.actions && <th style={{ textAlign: 'center' }}>ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length || 1} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    Loading records...
                  </td>
                </tr>
              ) : displayedItems.length === 0 ? (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length || 1} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No records found matching filters.
                  </td>
                </tr>
              ) : (
                displayedItems.map((item, idx) => (
                  <tr key={item._id || idx} style={{ fontSize: '0.85rem' }}>
                    {visibleColumns.index && <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{startIndex + idx + 1}</td>}
                    {visibleColumns.id && <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.caseId || item.donorId || item.hospitalId || `REC-${idx+1}`}</td>}
                    {visibleColumns.date && <td style={{ color: 'var(--text-secondary)' }}>{item.date || 'May 28, 2025'}</td>}
                    {visibleColumns.location && <td style={{ fontWeight: 500 }}>{item.location || item.district || 'Colombo'}</td>}
                    {visibleColumns.type && <td>{item.accidentType || item.diseaseType || item.bloodGroup || item.hospitalType || 'N/A'}</td>}
                    {visibleColumns.severity && (
                      <td>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '50px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor:
                            (item.severity === 'Major' || item.severity === 'High') ? '#EFF6FF' :
                            (item.severity === 'Minor' || item.severity === 'Normal') ? '#FFFBEB' : '#FFE4E6',
                          color:
                            (item.severity === 'Major' || item.severity === 'High') ? '#2563EB' :
                            (item.severity === 'Minor' || item.severity === 'Normal') ? '#D97706' : '#E11D48',
                          border: `1px solid ${
                            (item.severity === 'Major' || item.severity === 'High') ? '#BFDBFE' :
                            (item.severity === 'Minor' || item.severity === 'Normal') ? '#FDE68A' : '#FECDD3'
                          }`
                        }}>
                          {item.severity || 'Minor'}
                        </span>
                      </td>
                    )}
                    {visibleColumns.units && <td style={{ fontWeight: 700, textAlign: 'center' }}>{item.injured || item.availableUnits || 1}</td>}
                    {visibleColumns.status && (
                      <td>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '50px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: (item.status === 'Closed' || item.status === 'Active' || item.status === 'Optimal') ? '#F0FDF4' : '#FFFBEB',
                          color: (item.status === 'Closed' || item.status === 'Active' || item.status === 'Optimal') ? '#16A34A' : '#D97706',
                          border: `1px solid ${(item.status === 'Closed' || item.status === 'Active' || item.status === 'Optimal') ? '#BBF7D0' : '#FDE68A'}`
                        }}>
                          {item.status || 'Open'}
                        </span>
                      </td>
                    )}
                    {visibleColumns.actions && (
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                          <button
                            onClick={() => { setSelectedCase(item); setViewModalOpen(true); }}
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            title="View Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => { 
                              setSelectedCase(item); 
                              setCaseForm({ 
                                caseId: item.caseId || item.donorId || item.hospitalId || '',
                                date: item.date || 'May 31, 2025',
                                location: item.location || item.district || '',
                                type: item.accidentType || item.diseaseType || item.bloodGroup || item.hospitalType || '',
                                severity: item.severity || 'Minor',
                                injured: item.injured ?? item.availableUnits ?? 1,
                                status: item.status || 'Open',
                                patientName: item.patientName || item.name || '',
                                bloodGroup: item.bloodGroup || 'O+',
                                hospital: item.hospital || '',
                                district: item.district || item.location || ''
                              }); 
                              setEditModalOpen(true); 
                            }}
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            title="Edit Record"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleSingleExport(item, 'pdf')}
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #16A34A', backgroundColor: 'transparent', color: '#16A34A', cursor: 'pointer' }}
                            title="Download PDF"
                          >
                            <Download size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 7. Pagination Matching Screenshot 1 */}
        <div className="flex-between" style={{ marginTop: '4px', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredList.length)} of {filteredList.length} records
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

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
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
                  fontSize: '0.85rem',
                  cursor: 'pointer'
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

      {/* 8. Export Master Report Box */}
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
            Download the {activeTab} master report for the selected month.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Green Export Excel */}
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
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={18} color="#16A34A" />
            <span>Export to Excel</span>
          </button>

          {/* Solid Red Export PDF */}
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
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <FileText size={18} color="#ffffff" />
            <span>Export to PDF</span>
          </button>
        </div>
      </div>

      {/* 9. Modal: Add New Record */}
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
              style={{ position: 'absolute', top: '18px', right: '18px', color: 'var(--text-light)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Outfit', marginBottom: '20px' }}>
              {activeConfig.addLabel}
            </h3>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Location / District</label>
                  <select
                    className="form-control"
                    value={caseForm.location}
                    onChange={(e) => setCaseForm({ ...caseForm, location: e.target.value })}
                    required
                  >
                    <option value="">Select district</option>
                    {['Ampara','Anuradhapura','Badulla','Batticaloa','Colombo','Galle','Gampaha','Hambantota','Jaffna','Kalutara','Kandy','Kegalle','Kilinochchi','Kurunegala','Mannar','Matale','Matara','Monaragala','Mullaitivu','Nuwara Eliya','Polonnaruwa','Puttalam','Ratnapura','Trincomalee','Vavuniya'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formatDateForPicker(caseForm.date)}
                    onChange={(e) => setCaseForm({ ...caseForm, date: e.target.value })}
                    required
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Type / Category</label>
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
                  <label>No. of Injured / Units</label>
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
                  <label>Status</label>
                  <select
                    className="form-control"
                    value={caseForm.status}
                    onChange={(e) => setCaseForm({ ...caseForm, status: e.target.value })}
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="Active">Active</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Patient / Entity Name (Optional)</label>
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

      {/* 10. Modal: View Details */}
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
              style={{ position: 'absolute', top: '18px', right: '18px', color: 'var(--text-light)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Outfit', marginBottom: '16px' }}>
              Record Details: {selectedCase.caseId || selectedCase.donorId || selectedCase.hospitalId || 'Record'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Date:</span>
                <span style={{ fontWeight: 700 }}>{selectedCase.date || 'May 28, 2025'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Location:</span>
                <span style={{ fontWeight: 700 }}>{selectedCase.location || selectedCase.district}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Type / Group:</span>
                <span style={{ fontWeight: 700 }}>{selectedCase.accidentType || selectedCase.diseaseType || selectedCase.bloodGroup || selectedCase.hospitalType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Severity:</span>
                <span style={{ fontWeight: 700, color: '#e11d48' }}>{selectedCase.severity || 'Minor'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Injured / Units:</span>
                <span style={{ fontWeight: 700 }}>{selectedCase.injured || selectedCase.availableUnits || 1}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <span style={{ fontWeight: 700, color: (selectedCase.status === 'Closed' || selectedCase.status === 'Active') ? '#16A34A' : '#D97706' }}>{selectedCase.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Entity / Name:</span>
                <span style={{ fontWeight: 700 }}>{selectedCase.patientName || selectedCase.name || 'N/A'}</span>
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

      {/* Modal: Edit Record */}
      {editModalOpen && selectedCase && (
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
              onClick={() => setEditModalOpen(false)}
              style={{ position: 'absolute', top: '18px', right: '18px', color: 'var(--text-light)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Outfit', marginBottom: '20px' }}>
              Edit Record: {selectedCase.caseId || selectedCase.donorId || selectedCase.hospitalId || 'Record'}
            </h3>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Location / District</label>
                  <select
                    className="form-control"
                    value={caseForm.location}
                    onChange={(e) => setCaseForm({ ...caseForm, location: e.target.value })}
                    required
                  >
                    <option value="">Select district</option>
                    {['Ampara','Anuradhapura','Badulla','Batticaloa','Colombo','Galle','Gampaha','Hambantota','Jaffna','Kalutara','Kandy','Kegalle','Kilinochchi','Kurunegala','Mannar','Matale','Matara','Monaragala','Mullaitivu','Nuwara Eliya','Polonnaruwa','Puttalam','Ratnapura','Trincomalee','Vavuniya'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formatDateForPicker(caseForm.date)}
                    onChange={(e) => setCaseForm({ ...caseForm, date: e.target.value })}
                    required
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Type / Category</label>
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
                  <label>No. of Injured / Units</label>
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
                  <label>Status</label>
                  <select
                    className="form-control"
                    value={caseForm.status}
                    onChange={(e) => setCaseForm({ ...caseForm, status: e.target.value })}
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="Active">Active</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Patient / Entity Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={caseForm.patientName}
                  onChange={(e) => setCaseForm({ ...caseForm, patientName: e.target.value })}
                />
              </div>

              <div className="flex-between" style={{ marginTop: '14px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#e11d48', borderColor: '#e11d48' }}>
                  Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Export Preview Modal matching screenshot */}
      <PdfPreviewModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        data={pdfExportData}
        title={pdfExportTitle}
        activeTab={activeTab}
        visibleColumns={visibleColumns}
        filters={{
          fromDate: startDate,
          toDate: endDate,
          category: severityFilter !== 'All Severity' ? severityFilter : 'All'
        }}
      />



    </div>

  );
};

export default Reports;
