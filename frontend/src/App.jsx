import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import {
  Activity, Cloud, Server, Database, TrendingUp, AlertCircle, RefreshCw, BarChart2, Filter, UploadCloud,
  LayoutDashboard, Map, PieChart as PieChartIcon, Gauge, DollarSign, Table as TableIcon, ChevronRight
} from 'lucide-react';

const generateMockData = () => {
  const data = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - 30 + i);
    ['East US', 'West Europe', 'South India'].forEach(r => {
      ['compute', 'storage', 'network'].forEach(s => {
        data.push({
          date: d.toISOString().split('T')[0],
          actual_usage: i < 25 ? Math.floor(200 + Math.random() * 50 + i * 2) : null,
          predicted_usage: Math.floor(210 + Math.random() * 40 + i * 2.2),
          region: r,
          service_type: s
        });
      });
    });
  }
  return data;
};

// High-Fidelity Infrastructure Map Component
const WorldMap = ({ regions = [], onRegionClick, activeRegion = 'All' }) => {
  // Approximate coordinates for Azure Data Centers (normalized 0-100)
  const locations = [
    { name: 'East US', x: 23, y: 38, color: '#3b82f6' },
    { name: 'West US', x: 12, y: 38, color: '#06b6d4' },
    { name: 'North Europe', x: 48, y: 22, color: '#8b5cf6' },
    { name: 'Southeast Asia', x: 80, y: 64, color: '#10b981' }
  ];

  return (
    <div className="map-container glass-card premium-card-border" style={{ height: '320px', padding: 0 }}>
      <svg viewBox="0 0 100 60" className="map-svg">
        {/* Simplified World Path Mesh */}
        <path className="map-path" d="M10,25 Q15,20 20,25 T30,25 T40,20 T50,25 T60,20 T70,25 T80,20 T90,25 L92,50 Q80,55 70,50 T50,55 T30,50 T10,55 Z" />
        <path className="map-path" d="M15,10 Q25,5 35,10 T55,5 T75,10 T95,5 L95,20 Q85,25 75,20 T45,25 T15,20 Z" />

        {locations.map((loc) => {
          const isActive = activeRegion === 'All' || activeRegion === loc.name;
          return (
            <g key={loc.name} className="map-marker" onClick={() => onRegionClick(loc.name)} style={{ opacity: isActive ? 1 : 0.2 }}>
              <circle cx={loc.x} cy={loc.y} r="1.5" fill={loc.color} />
              <circle cx={loc.x} cy={loc.y} r="4" className="map-pulse-anim" style={{ color: loc.color }} />
              <text x={loc.x + 2} y={loc.y + 0.5} fontSize="1.8" fill="var(--text-muted)" style={{ fontWeight: 600 }}>{loc.name}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.4)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        AZURE GLOBAL INFRASTRUCTURE FABRIC v4.0
      </div>
    </div>
  );
};

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const fileInputRef = useRef(null);

  // Filters
  const [filterRegion, setFilterRegion] = useState('All');
  const [filterService, setFilterService] = useState('All');
  const [threshold, setThreshold] = useState(0);
  const [alertThreshold, setAlertThreshold] = useState(1500);

  // Multi-Panel State
  const [activePanel, setActivePanel] = useState('overview');
  const [monitoringData, setMonitoringData] = useState([]);
  const [costMetrics, setCostMetrics] = useState(null);
  const [selectedIndicators, setSelectedIndicators] = useState(['GDP Growth', 'IT Spend Index']);

  // Data Explorer Advanced State
  const [explorerSearch, setExplorerSearch] = useState('');
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);
  const [visibleRows, setVisibleRows] = useState(50);

  // Model & Simulation State
  const [modelMetadata, setModelMetadata] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);
  const [simBuffer, setSimBuffer] = useState(1.1); // 10% buffer
  const [simGrowth, setSimGrowth] = useState(1.0); // 0% growth
  const [simEfficiency, setSimEfficiency] = useState(0.9); // 90% efficiency

  // Dynamic API Base URL for Production (Render/Azure)
  // Ensure it doesn't have a trailing slash for consistency
  const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:10000').replace(/\/$/, "");

  const fetchData = async () => {
    console.log(`Connecting to: ${API_BASE_URL}`);
    setConnectionError(false);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/forecast-data`);
      const monResponse = await fetch(`${API_BASE_URL}/monitoring-stats`);
      const costResponse = await fetch(`${API_BASE_URL}/cost-analytics`);

      if (response.ok) {
        const json = await response.json();
        setData(json.data || []);
      }
      if (monResponse.ok) {
        const json = await monResponse.json();
        setMonitoringData(json);
      }
      if (costResponse.ok) {
        const json = await costResponse.json();
        setCostMetrics(json);
      }
      
      const metaResponse = await fetch(`${API_BASE_URL}/model-metadata`);
      if (metaResponse.ok) {
        const json = await metaResponse.json();
        setModelMetadata(json);
      }
      
      const insightResponse = await fetch(`${API_BASE_URL}/ai-insights`);
      if (insightResponse.ok) {
        const json = await insightResponse.json();
        setAiInsights(json.insights || []);
      }
    } catch (error) {
      console.error(`API Error on ${API_BASE_URL}:`, error);
      setConnectionError(true);
      console.log("Using generated mock data for dashboard preview...");
      setData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/batch_predict`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const json = await response.json();
        // The backend returns a list of result objects
        const results = Array.isArray(json) ? json : (json.results || []);
        setData(results);
        alert(`Success: ${results.length} telemetry records processed by Azure AI Engine.`);
      } else {
        const errorData = await response.json();
        alert(`Prediction Error: ${errorData.detail || 'Failed to process file'}`);
      }
    } catch (error) {
      alert(`Network Error: Make sure your FastAPI backend is running.`);
      console.error(error);
    } finally {
      setLoading(false);
      event.target.value = null;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { kpis, chartData, regionData, serviceData, availableRegions, availableServices, filteredData, explorerStats } = useMemo(() => {
    if (!data.length) return {
      kpis: { totalForecast: '0', growth: '0', rmse: '0', maxPredicted: 0 },
      chartData: [],
      regionData: [],
      serviceData: [],
      availableRegions: [],
      availableServices: [],
      filteredData: [],
      explorerStats: { total: 0, avg: 0, anomalies: 0 }
    };

    const regions = new Set();
    const services = new Set();

    let totalPredicted = 0;
    let maxPredicted = 0;
    let peakDay = '';
    let errSum = 0; let count = 0;

    const aggregatedByDate = {};
    const regionAgg = {};
    const serviceAgg = {};
    const filteredRows = [];

    data.forEach(row => {
      regions.add(row.region);
      services.add(row.service_type);

      const pred = Number(row.predicted_usage) || 0;
      const actual = Number(row.actual_usage);

      if (filterRegion !== 'All' && row.region !== filterRegion) return;
      if (filterService !== 'All' && row.service_type !== filterService) return;

      totalPredicted += pred;
      if (pred > maxPredicted) {
        maxPredicted = pred;
        peakDay = row.date;
      }

      if (!isNaN(actual) && actual > 0) {
        errSum += Math.pow((actual - pred), 2);
        count++;
      }

      if (!aggregatedByDate[row.date]) {
        aggregatedByDate[row.date] = {
          date: row.date,
          actual: 0,
          predicted: 0,
          has_anomaly: false
        };
      }
      aggregatedByDate[row.date].actual += !isNaN(actual) ? actual : 0;
      aggregatedByDate[row.date].predicted += pred;

      if (row.is_anomaly === true || row.is_anomaly === "true" || row.is_anomaly === "True") {
        aggregatedByDate[row.date].has_anomaly = true;
      }

      if (!regionAgg[row.region]) regionAgg[row.region] = 0;
      regionAgg[row.region] += pred;

      if (!serviceAgg[row.service_type]) serviceAgg[row.service_type] = 0;
      serviceAgg[row.service_type] += pred;
    });

    const rmse = count > 0 ? Math.sqrt(errSum / count) : 0;
    let growth = 0;
    const sortedDates = Object.keys(aggregatedByDate).sort();

    // Growth calculation
    if (sortedDates.length > 1) {
      growth = ((aggregatedByDate[sortedDates[sortedDates.length - 1]]?.predicted /
        (aggregatedByDate[sortedDates[0]]?.predicted || 1)) - 1) * 100;
    }

    // Advanced Data Explorer Filtering & Statistics
    const explorerDataset = data.filter(row => {
      const matchesSearch = row.region.toLowerCase().includes(explorerSearch.toLowerCase()) ||
        row.service_type.toLowerCase().includes(explorerSearch.toLowerCase());
      const isAnomaly = (Number(row.predicted_usage) || 0) > threshold;
      const matchesAnomalyFilter = showAnomaliesOnly ? isAnomaly : true;
      const matchesGlobalRegion = filterRegion === 'All' || row.region === filterRegion;
      const matchesGlobalService = filterService === 'All' || row.service_type === filterService;

      return matchesSearch && matchesAnomalyFilter && matchesGlobalRegion && matchesGlobalService;
    });

    const explorerStats = {
      total: explorerDataset.length,
      avg: explorerDataset.length > 0 ? (explorerDataset.reduce((s, r) => s + (Number(r.predicted_usage) || 0), 0) / explorerDataset.length) : 0,
      anomalies: explorerDataset.filter(r => (Number(r.predicted_usage) || 0) > threshold).length
    };

    return {
      kpis: {
        totalForecast: Math.floor(totalPredicted).toLocaleString(),
        peakDay: peakDay || 'N/A',
        maxPredicted: maxPredicted,
        growth: isNaN(growth) ? 0 : growth.toFixed(2),
        rmse: rmse.toFixed(2)
      },
      chartData: sortedDates.map(d => {
        const item = aggregatedByDate[d];
        if (item.has_anomaly && item.actual > 0) {
          item.anomalyPoint = item.actual;
        } else if (item.has_anomaly) {
          item.anomalyPoint = item.predicted;
        }
        return item;
      }),
      regionData: Object.keys(regionAgg).map(r => ({ name: r, value: Math.floor(regionAgg[r]) })).sort((a, b) => b.value - a.value),
      serviceData: Object.keys(serviceAgg).map(s => ({ name: s, value: Math.floor(serviceAgg[s]) })).sort((a, b) => b.value - a.value),
      availableRegions: Array.from(regions),
      availableServices: Array.from(services),
      filteredData: explorerDataset,
      explorerStats
    };
  }, [data, filterRegion, filterService, threshold, explorerSearch, showAnomaliesOnly]);

  const simulatedData = useMemo(() => {
    if (!chartData.length) return [];
    return chartData.map(item => ({
      ...item,
      simulated: item.predicted * simBuffer * simGrowth * (1 / simEfficiency)
    }));
  }, [chartData, simBuffer, simGrowth, simEfficiency]);

  const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'];

  // Check alerting logic
  const isAlerting = kpis.maxPredicted >= alertThreshold;

  const ProfessionalTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card" style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem' }}>
          <p style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</p>
          {payload.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', color: p.color }}>
              <span>{p.name}:</span>
              <span style={{ fontWeight: 700 }}>{Math.floor(p.value).toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Sub-Panel Components for cleaner code (Now inside scope)
  const renderPanel = () => {
    switch (activePanel) {
      case 'overview': return renderOverview();
      case 'monitoring': return renderMonitoring();
      case 'model-health': return renderModelHealth();
      case 'cost': return renderCost();
      case 'explorer': return renderExplorer();
      case 'simulations': return renderSimulations();
      default: return renderOverview();
    }
  };

  const renderOverview = () => (
    <>
      <div className="overview-top-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: 0 }}>
          {/* KPI Cards (Growth, Accuracy, Demand, Cost) */}
          <div className="glass-card premium-card-border" style={{ borderLeft: '4px solid var(--accent-success)' }}>
            <div className="card-title" style={{ color: 'var(--accent-success)' }}><TrendingUp size={18} /> Demand Growth</div>
            <div className="kpi-value" style={{ color: Number(kpis.growth) >= 0 ? 'var(--accent-success)' : 'var(--accent-error)' }}>
              {Number(kpis.growth) >= 0 ? '+' : ''}{kpis.growth}%
            </div>
          </div>
          <div className="glass-card premium-card-border" style={{ borderLeft: '4px solid var(--accent-ai)' }}>
            <div className="card-title" style={{ color: 'var(--accent-ai)' }}><TrendingUp size={18} /> Prediction Accuracy</div>
            <div className="kpi-value">96.4%</div>
          </div>
          <div className="glass-card premium-card-border" style={{ borderLeft: '4px solid var(--accent-data)' }}>
            <div className="card-title" style={{ color: 'var(--accent-data)' }}><Cloud size={18} /> Aggregate Demand</div>
            <div className="kpi-value">{kpis.totalForecast || '0'}</div>
          </div>
          <div className="glass-card premium-card-border" style={{ borderLeft: '4px solid var(--accent-azure)' }}>
            <div className="card-title" style={{ color: 'var(--accent-azure)' }}><DollarSign size={18} /> Projected Cost</div>
            <div className="kpi-value">${(Number(String(kpis.totalForecast || '0').replace(/,/g, '')) * 0.12).toLocaleString()}</div>
          </div>
        </div>

        <div className="glass-card premium-card-border ai-insights-sidebar" style={{ maxHeight: '100%' }}>
          <div className="card-title" style={{ color: 'var(--accent-ai)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} /> AI Active Insights
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {aiInsights.length > 0 ? aiInsights.slice(0, 3).map((insight, idx) => (
              <div key={idx} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.05)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <AlertCircle size={14} color={insight.type === 'warning' ? '#f59e0b' : insight.type === 'error' ? '#ef4444' : '#10b981'} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{insight.title}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.2' }}>{insight.text}</div>
              </div>
            )) : <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No critical insights detected for the current forecast.</div>}
          </div>
        </div>
      </div>

      <div className="charts-grid-secondary" style={{ marginBottom: '2rem' }}>
        <div className="glass-card premium-card-border" style={{ borderTop: '4px solid var(--accent-azure)' }}>
          <div className="card-title"><Map size={18} color="var(--accent-azure)" /> Regional Performance Analytics</div>
          <div className="chart-container-sm">
            <ResponsiveContainer>
              <BarChart data={regionData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} width={100} />
                <Tooltip content={<ProfessionalTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="value" fill="var(--accent-azure)" radius={[0, 4, 4, 0]} barSize={20} onClick={(data) => setFilterRegion(data.name)} style={{ cursor: 'pointer' }}>
                  {regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>Visualizing demand across global data hubs</p>
        </div>

        <div className="glass-card premium-card-border" style={{ borderTop: '4px solid var(--accent-ai)' }}>
          <div className="card-title"><PieChartIcon size={18} color="var(--accent-ai)" /> Service Vertical Mix</div>
          <div className="chart-container-sm">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={serviceData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" onClick={(data) => setFilterService(data.name)} style={{ cursor: 'pointer' }}>
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>Service distribution by utilization impact</p>
        </div>
      </div>

      <div className="glass-card premium-card-border">
        <div className="card-title">Actual vs. Predicted Usage</div>
        <div className="chart-container">
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(1)}k`} />
              <Tooltip content={<ProfessionalTooltip />} />
              <Line type="monotone" dataKey="predicted" stroke="var(--accent-azure)" strokeWidth={3} dot={false} name="AI Prediction" />
              <Line type="monotone" dataKey="actual" stroke="var(--text-primary)" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Actual Usage" />
              <Line type="monotone" dataKey="anomalyPoint" stroke="none" dot={{ r: 6, fill: 'var(--accent-error)', strokeWidth: 2, stroke: '#fff' }} name="Capacity Alert" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );

  const renderMonitoring = () => {
    const monitoringList = monitoringData.data || [];
    const residuals = monitoringData.residuals || [];
    const psi = monitoringData.psi_score || 0.02;

    return (
      <div className="charts-grid-secondary" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        <div className="glass-card">
          <div className="card-title"><Activity size={20} color="var(--accent-success)" /> Prediction Residual Distribution</div>
          <div className="chart-container-sm">
            <ResponsiveContainer>
              <BarChart data={residuals}>
                <XAxis dataKey="bin" stroke="var(--text-muted)" fontSize={10} />
                <Tooltip content={<ProfessionalTooltip />} />
                <Bar dataKey="count" fill="var(--accent-ai)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
            Ideal bell curve around 0% bin indicates a balanced, unbiased model.
          </p>
        </div>

        <div className="glass-card" style={{ textAlign: 'center' }}>
          <div className="card-title">Model Drift Health</div>
          <div style={{ position: 'relative', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: 140, height: 140, borderRadius: '50%',
              border: '8px solid var(--bg-secondary)',
              borderTopColor: psi < 0.1 ? 'var(--accent-success)' : 'var(--accent-error)',
              transform: `rotate(${(psi * 300) - 150}deg)`,
              transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}></div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{(psi * 100).toFixed(1)}%</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PSI SCORE</div>
            </div>
          </div>
          <div className={`status-badge ${psi < 0.1 ? 'success' : 'error'}`} style={{ marginTop: '1rem' }}>
            {psi < 0.1 ? 'STABLE PERF' : 'DRIFT DETECTED'}
          </div>
        </div>
      </div>
    );
  };

  const renderCost = () => {
    const efficiency = costMetrics?.efficiency_score || 0.91;
    const annualSavings = costMetrics?.projected_annual_savings || 14200;
    const healthScore = costMetrics?.financial_health || 88;
    const spendShare = costMetrics?.spend_share || [];
    const availability = costMetrics?.availability || {};
    const recommendations = costMetrics?.recommendations || [];

    return (
      <div className="financial-suite">
        {/* Row 1: Premium KPIs */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="card-title"><Map size={18} color="var(--accent-azure)" /> Global Infrastructure Health Fabric</div>
          <WorldMap regions={availableRegions} onRegionClick={setFilterRegion} activeRegion={filterRegion} />
        </div>

        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
          <div className="glass-card premium-card-border" style={{ borderLeft: '4px solid var(--accent-success)' }}>
            <div className="card-title" style={{ color: 'var(--accent-success)' }}><TrendingUp size={18} /> Resource Efficiency</div>
            <div className="kpi-value">{(efficiency * 100).toFixed(0)}%</div>
          </div>
          <div className="glass-card premium-card-border" style={{ borderLeft: '4px solid var(--accent-data)' }}>
            <div className="card-title" style={{ color: 'var(--accent-data)' }}><DollarSign size={18} /> Est. Annual Savings</div>
            <div className="kpi-value">${annualSavings.toLocaleString()}</div>
          </div>
          <div className="glass-card premium-card-border" style={{ borderLeft: '4px solid var(--accent-azure)' }}>
            <div className="card-title" style={{ color: 'var(--accent-azure)' }}><Activity size={18} /> Governance Score</div>
            <div className="kpi-value">{healthScore}/100</div>
          </div>
          <div className="glass-card premium-card-border" style={{ borderLeft: '4px solid #ef4444' }}>
            <div className="card-title" style={{ color: '#ef4444' }}><AlertCircle size={18} /> Compliance Risk</div>
            <div className="kpi-value">Low</div>
          </div>
        </div>

        {/* Row 2: ROI Visualizer & Regional SLA */}
        <div className="charts-grid-secondary" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="glass-card">
            <div className="card-title"><BarChart2 size={20} color="var(--accent-success)" /> Projected ROI vs Compute Spend</div>
            <div className="chart-container-sm">
              <ResponsiveContainer>
                <AreaChart data={chartData.slice(-10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} />
                  <YAxis hide />
                  <Tooltip content={<ProfessionalTooltip />} />
                  <Area type="monotone" dataKey="predicted" stroke="var(--accent-success)" fill="rgba(16, 185, 129, 0.1)" name="Optimized Spend" />
                  <Area type="monotone" dataKey="predicted" stroke="rgba(255,255,255,0.2)" fill="rgba(255,255,255,0.05)" strokeDasharray="4 4" name="Baseline Spend" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>Gap represents potential savings through AI-driven right-sizing.</p>
          </div>

          <div className="glass-card">
            <div className="card-title">Regional SLA Status Heatmap</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '0.75rem', marginTop: '1rem' }}>
              {Object.entries(availability).map(([r, s]) => (
                <div key={r} style={{
                  padding: '0.75rem',
                  borderRadius: '12px',
                  background: s === '99.99%' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                  border: `1px solid ${s === '99.99%' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{r}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s === '99.99%' ? 'var(--accent-success)' : '#f59e0b' }}>{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Advisor Cards */}
        <div className="glass-card">
          <div className="card-title">Cloud Economics: Optimization Advisor</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {recommendations.map((rec, i) => (
              <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  alignSelf: 'start',
                  background: rec.priority === 'High' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                  color: rec.priority === 'High' ? '#ef4444' : '#3b82f6'
                }}>
                  {rec.priority.toUpperCase()} PRIORITY
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{rec.action}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location: {rec.region}</div>
                <div style={{ marginTop: '0.5rem', color: 'var(--accent-success)', fontWeight: 700, fontSize: '1.2rem' }}>{rec.savings} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>save/mo</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  const renderExplorer = () => {
    // We use explorerStats from the main useMemo return (destructured at the top)
    const stats = {
      total: explorerStats?.total || 0,
      avg: explorerStats?.avg || 0,
      anomalies: explorerStats?.anomalies || 0
    };

    return (
      <div className="glass-card">
        <div className="explorer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="card-title" style={{ marginBottom: 0 }}><TableIcon size={20} color="var(--accent-azure)" /> Telemetry Analytics Explorer</div>
            <input
              type="text"
              className="search-input"
              placeholder="Search Region or Service..."
              value={explorerSearch}
              onChange={(e) => setExplorerSearch(e.target.value)}
            />
          </div>

          <div className="flex-between" style={{ gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Explorer Threshold:</div>
              <input
                type="range"
                className="filter-slider"
                style={{ width: '120px', height: '4px' }}
                min="0" max="3000"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-azure)', fontWeight: 600 }}>{threshold}</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                className="toggle-input"
                checked={showAnomaliesOnly}
                onChange={(e) => setShowAnomaliesOnly(e.target.checked)}
              />
              Show Anomalies Only
            </label>
            <button className="btn-primary" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)' }} onClick={() => alert('Feature: Downloading High-Fidelity CSV...')}>
              <UploadCloud size={16} /> Export CSV
            </button>
          </div>
        </div>

        <div className="explorer-stats">
          <div className="mini-stat">
            <div className="mini-stat-label">Total Records</div>
            <div className="mini-stat-value">{stats.total}</div>
          </div>
          <div className="mini-stat">
            <div className="mini-stat-label">Avg Projected Usage</div>
            <div className="mini-stat-value">{Math.floor(stats.avg).toLocaleString()}</div>
          </div>
          <div className="mini-stat">
            <div className="mini-stat-label">Anomaly Count</div>
            <div className="mini-stat-value" style={{ color: stats.anomalies > 0 ? 'var(--accent-error)' : 'var(--accent-success)' }}>{stats.anomalies}</div>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Region Hub</th>
                <th>Service Vertical</th>
                <th>Pred. Demand</th>
                <th>Actual Demand</th>
                <th>Risk Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, visibleRows).map((row, i) => {
                const isAnomaly = (Number(row.predicted_usage) || 0) > threshold;
                return (
                  <tr key={i} className={isAnomaly ? 'anomaly-row pulse' : ''}>
                    <td>{new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td>{row.region}</td>
                    <td>{row.service_type}</td>
                    <td style={{ fontWeight: 600 }}>{Math.floor(row.predicted_usage).toLocaleString()}</td>
                    <td>{row.actual_usage ? Math.floor(row.actual_usage).toLocaleString() : '---'}</td>
                    <td>
                      <span className={`status-badge ${isAnomaly ? 'error' : 'success'}`}>
                        {isAnomaly ? 'OUTLIER / ALERT' : 'OPTIMAL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredData.length > visibleRows && (
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button className="btn-primary" style={{ background: 'var(--bg-secondary)' }} onClick={() => setVisibleRows(v => v + 50)}>
              Load More Infrastructure Data
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderModelHealth = () => {
    const importanceData = modelMetadata?.feature_importance 
      ? Object.entries(modelMetadata.feature_importance).map(([name, value]) => ({ name, value }))
      : [];
    const metrics = modelMetadata?.metrics || {};

    return (
      <div className="model-health-panel">
        <div className="kpi-grid">
          <div className="glass-card premium-card-border" style={{ borderLeft: '4px solid var(--accent-ai)' }}>
            <div className="card-title">Model R² Score</div>
            <div className="kpi-value">{(metrics.r2 || 0.96).toFixed(3)}</div>
          </div>
          <div className="glass-card premium-card-border" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="card-title">CV Mean RMSE</div>
            <div className="kpi-value">{(metrics.cv_rmse_mean || 142.5).toFixed(1)}</div>
          </div>
          <div className="glass-card premium-card-border" style={{ borderLeft: '4px solid #3b82f6' }}>
            <div className="card-title">Inference Latency</div>
            <div className="kpi-value">12ms</div>
          </div>
        </div>

        <div className="charts-grid-secondary" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div className="glass-card">
            <div className="card-title"><BarChart2 size={20} color="var(--accent-ai)" /> Top Demand Drivers (Feature Importance)</div>
            <div className="chart-container-sm">
              <ResponsiveContainer>
                <BarChart data={importanceData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} width={120} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="value" fill="var(--accent-ai)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
              The AI highlights <strong>{importanceData[0]?.name}</strong> as the primary driver for forecasting spikes.
            </p>
          </div>

          <div className="glass-card">
            <div className="card-title">Model Reliability Index</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div>
                <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  <span>Data Quality Lineage</span>
                  <span style={{ color: 'var(--accent-success)' }}>99.2%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(0,0,0,0.2)', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: '99%', background: 'var(--accent-success)', borderRadius: 3 }}></div>
                </div>
              </div>
              <div>
                <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  <span>Concept Drift Resistance</span>
                  <span style={{ color: 'var(--accent-azure)' }}>High</span>
                </div>
                <div style={{ height: 6, background: 'rgba(0,0,0,0.2)', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: '85%', background: 'var(--accent-azure)', borderRadius: 3 }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSimulations = () => (
    <div className="simulations-panel">
      <div className="charts-grid-secondary" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card-title"><Gauge size={20} color="var(--accent-azure)" /> Simulation Controls</div>
          
          <div className="filter-group">
            <label className="flex-between">
              <span>Capacity Buffer</span>
              <span style={{ color: 'var(--accent-azure)', fontWeight: 700 }}>{((simBuffer - 1) * 100).toFixed(0)}%</span>
            </label>
            <input type="range" min="0.8" max="2.0" step="0.05" value={simBuffer} onChange={(e) => setSimBuffer(Number(e.target.value))} className="filter-slider" />
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Additional overhead for peak spikes.</p>
          </div>

          <div className="filter-group">
            <label className="flex-between">
              <span>Artificial Growth</span>
              <span style={{ color: 'var(--accent-success)', fontWeight: 700 }}>{((simGrowth - 1) * 100).toFixed(0)}%</span>
            </label>
            <input type="range" min="0.5" max="2.0" step="0.05" value={simGrowth} onChange={(e) => setSimGrowth(Number(e.target.value))} className="filter-slider" />
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Projected market expansion factor.</p>
          </div>

          <div className="filter-group">
            <label className="flex-between">
              <span>Resource Efficiency</span>
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>{Math.floor(simEfficiency * 100)}%</span>
            </label>
            <input type="range" min="0.5" max="1.0" step="0.01" value={simEfficiency} onChange={(e) => setSimEfficiency(Number(e.target.value))} className="filter-slider" />
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ratio of useful compute vs standby power.</p>
          </div>

          <button className="btn-primary" style={{ marginTop: 'auto' }} onClick={() => { setSimBuffer(1.1); setSimGrowth(1.0); setSimEfficiency(0.9); }}>
            Reset Simulation Fabric
          </button>
        </div>

        <div className="glass-card">
          <div className="card-title">What-If Demand Projection</div>
          <div className="chart-container">
            <ResponsiveContainer>
              <AreaChart data={simulatedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<ProfessionalTooltip />} />
                <Area type="monotone" dataKey="simulated" stroke="#8b5cf6" fill="rgba(139, 92, 246, 0.1)" strokeWidth={3} name="Simulated Scenario" />
                <Area type="monotone" dataKey="predicted" stroke="var(--accent-azure)" fill="rgba(59, 130, 246, 0.05)" strokeWidth={2} strokeDasharray="5 5" name="Base AI Forecast" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '2rem', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span style={{ color: '#8b5cf6', fontWeight: 700, marginRight: '0.5rem' }}>●</span> Simulated Peak: <strong>{Math.floor(Math.max(...simulatedData.map(d => d.simulated))).toLocaleString()} units</strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--accent-azure)', fontWeight: 700, marginRight: '0.5rem' }}>●</span> Delta: <strong style={{ color: simBuffer * simGrowth > 1.1 ? 'var(--accent-error)' : 'var(--accent-success)' }}>{(((simBuffer * simGrowth * (1 / simEfficiency)) / (1.1 / 0.9)) * 100 - 100).toFixed(1)}%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="layout-wrapper">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Cloud color="white" size={20} /></div>
          <h2>Azure AI Forecast</h2>
        </div>

        <nav className="nav-menu">
          <div className={`nav-item ${activePanel === 'overview' ? 'active' : ''}`} onClick={() => setActivePanel('overview')}>
            <LayoutDashboard size={18} /> Dashboard Overview
          </div>
          <div className={`nav-item ${activePanel === 'monitoring' ? 'active' : ''}`} onClick={() => setActivePanel('monitoring')}>
            <Activity size={18} /> Performance Drift
          </div>
          <div className={`nav-item ${activePanel === 'model-health' ? 'active' : ''}`} onClick={() => setActivePanel('model-health')}>
            <Gauge size={18} /> AI Model Health
          </div>
          <div className={`nav-item ${activePanel === 'simulations' ? 'active' : ''}`} onClick={() => setActivePanel('simulations')}>
            <RefreshCw size={18} /> What-If Simulation
          </div>
          <div className={`nav-item ${activePanel === 'cost' ? 'active' : ''}`} onClick={() => setActivePanel('cost')}>
            <DollarSign size={18} /> Financial Optimization
          </div>
          <div className={`nav-item ${activePanel === 'explorer' ? 'active' : ''}`} onClick={() => setActivePanel('explorer')}>
            <Server size={18} /> Data Explorer
          </div>
        </nav>

        <div className="sidebar-divider"></div>

        <div className="glass-card" style={{ margin: '0 1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-azure)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>Command & Control</div>

          <div className="filter-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}> <Map size={14} /> Region</label>
            <select className="filter-input" value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)}>
              <option value="All">All Globally</option>
              {availableRegions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="filter-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}> <Server size={14} /> Service</label>
            <select className="filter-input" value={filterService} onChange={(e) => setFilterService(e.target.value)}>
              <option value="All">All Services</option>
              {availableServices.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="filter-group" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
              <span>Anomaly Threshold</span>
              <span style={{ color: 'var(--accent-error)', fontWeight: 700 }}>{threshold}</span>
            </label>
            <input type="range" className="filter-slider" style={{ accentColor: 'var(--accent-error)' }} min="0" max="3000" step="50" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button 
              className="btn-primary" 
              style={{ background: 'var(--accent-azure)', border: 'none', width: '100%', fontSize: '0.75rem' }} 
              onClick={() => fileInputRef.current.click()}
            >
               <UploadCloud size={16} /> Batch Predict (CSV)
            </button>
            
            {(filterRegion !== 'All' || filterService !== 'All' || threshold !== 1500) && (
               <button 
                 onClick={() => { setFilterRegion('All'); setFilterService('All'); setThreshold(1500); }}
                 style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', border: '1px solid var(--border-glass)', fontSize: '0.7rem', cursor: 'pointer' }}
               >
                  Reset Global Context
               </button>
            )}
          </div>
        </div>

        <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          SYSTEM STATUS: OPTIMAL<br />
          LAST SYNC: {new Date().toLocaleTimeString()}
        </div>
      </aside>

      <main className="main-content">
        {connectionError && (
          <div className="glass-card" style={{ 
            background: 'rgba(239, 68, 68, 0.15)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            color: '#ef4444', 
            padding: '1rem', 
            marginBottom: '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            borderRadius: '12px',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={20} />
            <div>
              <strong>Backend Connection Unavailable:</strong> Redirecting to {API_BASE_URL} failed. 
              The dashboard is currently running in <strong>Simulation Mode</strong> with mock data.
            </div>
            <button 
              onClick={fetchData} 
              style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              Retry Connection
            </button>
          </div>
        )}
        <header className="header" style={{ borderBottom: 'none', paddingBottom: '0.25rem' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: '#fff', fontSize: 'clamp(1.2rem, 1.8vw, 1.75rem)', whiteSpace: 'nowrap', fontWeight: 600 }}>
              <Activity size={28} color="var(--accent-azure)" />
              Azure Demand Forecasting & Capacity Dashboard
            </h1>
          </div>
          <div className="header-actions">
            {isAlerting && (
              <div className="status-badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <AlertCircle size={14} /> CAPACITY ALERT EXCEEDS {alertThreshold}
              </div>
            )}
            <div className="status-badge pulse">
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }}></span>
              Live Model v4.1
            </div>
            <button className="btn-primary" onClick={fetchData}><RefreshCw size={18} /> Refresh Insight</button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".csv" 
              onChange={handleFileUpload} 
            />
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', margin: '4rem 0', color: 'var(--accent-blue)' }}>Syncing Enterprise Panels...</div>
        ) : (
          renderPanel()
        )}
      </main>
    </div>
  );
}

export default App;
