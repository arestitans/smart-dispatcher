import { useState, useEffect } from 'react';
import { Download, Calendar, Filter, TrendingUp, Wifi, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { analyticsAPI } from '../services/api';
import './Reports.css';

export default function Reports() {
    const [loading, setLoading] = useState(true);
    const [trends, setTrends] = useState([]);
    const [revenue, setRevenue] = useState([]);
    const [regional, setRegional] = useState([]);
    const [productivity, setProductivity] = useState({ psDone: 0, total: 0, rate: 0 });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [trendsRes, revenueRes, regionalRes] = await Promise.all([
                analyticsAPI.getTrends(),
                analyticsAPI.getRevenue(),
                analyticsAPI.getRegional()
            ]);
            setTrends(trendsRes.data.trends);
            setRevenue(revenueRes.data.revenue);
            setRegional(regionalRes.data.regions);
        } catch (error) {
            // Mock data
            setTrends([
                { date: '2024-10-18', completed: 32, target: 40 },
                { date: '2024-10-19', completed: 28, target: 40 },
                { date: '2024-10-20', completed: 45, target: 40 },
                { date: '2024-10-21', completed: 38, target: 40 },
                { date: '2024-10-22', completed: 42, target: 40 },
                { date: '2024-10-23', completed: 35, target: 40 },
                { date: '2024-10-24', completed: 48, target: 40 },
            ]);
            setRevenue([
                { product: 'Indihome', value: 425.5, color: '#22c55e' },
                { product: 'Datin', value: 280.2, color: '#eab308' },
                { product: 'Indibiz', value: 155.8, color: '#3b82f6' },
            ]);
            setRegional([
                { region: 'Jakarta Selatan', completedOrders: 84, avgResponse: 32, slaStatus: 'HEALTHY', efficiency: 98 },
                { region: 'Jakarta Pusat', completedOrders: 62, avgResponse: 45, slaStatus: 'MODERATE', efficiency: 86 },
                { region: 'Jakarta Barat', completedOrders: 102, avgResponse: 28, slaStatus: 'HEALTHY', efficiency: 94 },
            ]);
            // Productivity metric = PS_DONE / Total Orders
            setProductivity({
                psDone: 186,
                total: 248,
                rate: (186 / 248).toFixed(2)
            });
        } finally {
            setLoading(false);
        }
    };

    const getSlaColor = (status) => {
        return status === 'HEALTHY' ? 'text-green' : status === 'MODERATE' ? 'text-yellow' : 'text-red';
    };

    return (
        <div className="reports-page">
            <div className="page-header">
                <div>
                    <span className="breadcrumb">Dashboard &gt; OPERATIONAL REPORTS</span>
                    <h1>Operational Analytics</h1>
                    <p>Real-time performance metrics and distribution trends</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-secondary">
                        <Calendar size={16} />
                        Today
                    </button>
                    <button className="btn btn-secondary">
                        <Filter size={16} />
                        Filter
                    </button>
                    <button className="btn btn-primary">
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="overview-stats">
                <div className="overview-stat">
                    <div className="stat-icon blue"><TrendingUp size={20} /></div>
                    <div className="stat-content">
                        <span className="stat-label">TOTAL PLPs TODAY</span>
                        <span className="stat-value">248</span>
                        <span className="stat-change positive">↑ +18.4% vs Yesterday</span>
                    </div>
                </div>

                <div className="overview-stat">
                    <div className="stat-icon green"><Wifi size={20} /></div>
                    <div className="stat-content">
                        <span className="stat-label">DOMINANT PRODUCT CATEGORY</span>
                        <span className="stat-value">Indihome</span>
                        <span className="stat-subtitle">62% of total volume</span>
                    </div>
                </div>

                <div className="overview-stat">
                    <div className="stat-icon yellow"><Clock size={20} /></div>
                    <div className="stat-content">
                        <span className="stat-label">AVG. DURATION PER PRODUCT</span>
                        <span className="stat-value">52 min</span>
                        <span className="stat-change negative">↓ -4m from target</span>
                    </div>
                </div>

                <div className="overview-stat">
                    <div className="stat-icon purple"><TrendingUp size={20} /></div>
                    <div className="stat-content">
                        <span className="stat-label">PRODUCTIVITY RATE</span>
                        <span className="stat-value">{productivity.rate}</span>
                        <span className="stat-subtitle">PS_DONE ({productivity.psDone}) / Total ({productivity.total})</span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="charts-row">
                {/* Daily Completion Trends */}
                <div className="card chart-card">
                    <div className="card-header">
                        <h3 className="card-title">Daily Order Completion Trends</h3>
                        <div className="chart-legend">
                            <span className="legend-item"><span className="dot completed"></span> COMPLETED</span>
                            <span className="legend-item"><span className="dot target"></span> TARGET</span>
                        </div>
                    </div>

                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d5a3d" />
                                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ background: '#1a3d24', border: '1px solid #2d5a3d' }}
                                    labelStyle={{ color: '#9ca3af' }}
                                />
                                <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
                                <Line type="monotone" dataKey="target" stroke="#eab308" strokeWidth={2} strokeDasharray="5 5" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Distribution */}
                <div className="card chart-card">
                    <div className="card-header">
                        <h3 className="card-title">Revenue Distribution by Product</h3>
                        <span className="unit-label">VALUES IN MILLION IDR</span>
                    </div>

                    <div className="revenue-bars">
                        {revenue.map((item, index) => (
                            <div key={index} className="revenue-item">
                                <div className="revenue-label">
                                    <span className="product-dot" style={{ background: item.color }}></span>
                                    {item.product}
                                </div>
                                <div className="revenue-bar-container">
                                    <div
                                        className="revenue-bar"
                                        style={{
                                            width: `${(item.value / 500) * 100}%`,
                                            background: item.color
                                        }}
                                    ></div>
                                </div>
                                <span className="revenue-value">{item.value}M</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Resume Data Section */}
            <div className="card resume-card">
                <div className="resume-content">
                    <h3>Resume Data & Reporting</h3>
                    <p>
                        Consolidate all technician activities, product performance, and revenue metrics into a
                        comprehensive PDF or CSV report. Automated analysis identifies bottlenecks and
                        distribution efficiency for the current operational cycle.
                    </p>
                    <div className="resume-tags">
                        <span className="tag">✓ Technician Load Logs</span>
                        <span className="tag">✓ Productivity KPIs</span>
                        <span className="tag">✓ SLA Compliance</span>
                    </div>
                </div>
                <div className="resume-action">
                    <button className="btn btn-generate">
                        📊 Generate Automatic Report
                    </button>
                    <span className="last-sync">LAST SYNC: 3 MINUTES AGO</span>
                </div>
            </div>

            {/* Regional Performance */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Regional Performance Breakdown</h3>
                    <a href="#" className="link">View All Regions</a>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>REGION</th>
                                <th>COMPLETED ORDERS</th>
                                <th>AVG RESPONSE</th>
                                <th>SLA STATUS</th>
                                <th>EFFICIENCY</th>
                            </tr>
                        </thead>
                        <tbody>
                            {regional.map((region, index) => (
                                <tr key={index}>
                                    <td className="region-name">{region.region}</td>
                                    <td>{region.completedOrders} tasks</td>
                                    <td>{region.avgResponse} mins</td>
                                    <td><span className={getSlaColor(region.slaStatus)}>{region.slaStatus}</span></td>
                                    <td><strong>{region.efficiency}%</strong></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="page-footer">
                © 2024 Smart Dispatcher Systems • Operational Analytics v4.2.0 • Data refreshed in real-time.
            </div>
        </div>
    );
}
