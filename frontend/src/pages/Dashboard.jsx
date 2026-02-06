import { useState, useEffect } from 'react';
import {
    AlertTriangle, TrendingUp, Clock, CheckCircle,
    UserCheck, Wrench, AlertCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { analyticsAPI } from '../services/api';
import TechnicianMap from '../components/TechnicianMap';
import './Dashboard.css';

const COLORS = ['#22c55e', '#eab308', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#6b7280'];

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        loadData();
        // Defer map rendering to after main stats load
        const timer = setTimeout(() => setShowMap(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const loadData = async () => {
        try {
            const response = await analyticsAPI.getDashboard();
            setStats(response.data);
        } catch (error) {
            // Use mock data if API fails
            setStats({
                pendingActions: 142,
                onFieldFleet: 48,
                avgResponse: 18,
                dailyCompletion: 84,
                guaranteeClaims: 12,
                technicalIssues: 8,
                systemIssues: 3,
                completionRate: 94.2
            });
        } finally {
            setLoading(false);
        }
    };

    const productData = [
        { name: 'Indihome', value: 65, color: '#22c55e' },
        { name: 'Datin', value: 25, color: '#eab308' },
        { name: 'WiFi ID', value: 15, color: '#3b82f6' },
        { name: 'Others', value: 10, color: '#6b7280' }
    ];

    const statCards = [
        {
            label: 'pending_actions',
            title: 'Pending Actions',
            value: stats?.pendingActions || 0,
            subtitle: 'TOTAL ACTIVE ORDERS',
            icon: AlertTriangle,
            color: 'yellow'
        },
        {
            label: 'engineering',
            title: 'On-Field Fleet',
            value: stats?.onFieldFleet || 0,
            subtitle: '/ 52 active',
            icon: Wrench,
            color: 'blue'
        },
        {
            label: 'schedule',
            title: 'Avg Response',
            value: stats?.avgResponse || 0,
            subtitle: 'minutes',
            icon: Clock,
            color: 'green'
        },
        {
            label: 'check_circle',
            title: 'Daily Completion',
            value: stats?.dailyCompletion || 0,
            subtitle: 'Completed',
            icon: CheckCircle,
            color: 'green'
        },
        {
            label: 'verified_user',
            title: 'Guarantee Claims',
            value: stats?.guaranteeClaims || 0,
            subtitle: '√ 2mo PS',
            icon: UserCheck,
            color: 'yellow'
        },
        {
            label: 'technical_issues',
            title: 'Technical Issues',
            value: stats?.technicalIssues || 0,
            subtitle: 'Open tickets',
            icon: Wrench,
            color: 'red'
        },
        {
            label: 'system_issues',
            title: 'System Issues',
            value: stats?.systemIssues || 0,
            subtitle: 'Active alerts',
            icon: AlertCircle,
            color: 'red'
        }
    ];

    if (loading) {
        return <div className="dashboard-loading">Loading...</div>;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Enhanced Dashboard</h1>
                    <p>Monitoring technician lifecycle and order fulfillment health</p>
                </div>
                <div className="dashboard-actions">
                    <span className="date-display">
                        📅 Today: {new Date().toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric'
                        })}
                    </span>
                    <button className="btn btn-primary">
                        Download Export Report
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="stats-grid">
                {statCards.map((card, index) => (
                    <div key={index} className={`stat-card stat-card-${card.color}`}>
                        <div className="stat-card-header">
                            <span className="stat-label">{card.label}</span>
                            <card.icon size={20} />
                        </div>
                        <div className="stat-value">{card.value}</div>
                        <div className="stat-subtitle">{card.subtitle}</div>
                    </div>
                ))}
            </div>

            {/* Live Tracking Map */}
            {showMap && <TechnicianMap />}

            {/* Order Status Summary */}
            <div className="card order-status-card">
                <h3 className="card-title">ORDER STATUS SUMMARY</h3>
                <div className="order-status-grid">
                    <div className="status-item">
                        <span className="status-label">OPEN</span>
                        <span className="status-value">24</span>
                        <TrendingUp size={16} className="status-icon" />
                    </div>
                    <div className="status-item">
                        <span className="status-label">SURVEY</span>
                        <span className="status-value">18</span>
                        <TrendingUp size={16} className="status-icon" />
                    </div>
                    <div className="status-item">
                        <span className="status-label">IKR</span>
                        <span className="status-value">42</span>
                        <TrendingUp size={16} className="status-icon" />
                    </div>
                    <div className="status-item">
                        <span className="status-label">ACTIVATION</span>
                        <span className="status-value">35</span>
                        <TrendingUp size={16} className="status-icon" />
                    </div>
                    <div className="status-item">
                        <span className="status-label">PS DONE</span>
                        <span className="status-value">23</span>
                        <TrendingUp size={16} className="status-icon" />
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Technician Availability Grid */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Technician Availability Grid</h3>
                        <div className="legend">
                            <span className="legend-item"><span className="dot empty"></span> 0 Slots</span>
                            <span className="legend-item"><span className="dot partial"></span> 1 Order</span>
                            <span className="legend-item"><span className="dot full"></span> 2+ Orders</span>
                        </div>
                    </div>
                    <p className="card-subtitle">Real-time workload distribution across fleet</p>

                    <div className="availability-grid">
                        {Array.from({ length: 48 }).map((_, i) => {
                            const status = Math.random() > 0.7 ? 'full' : Math.random() > 0.4 ? 'partial' : 'empty';
                            return <div key={i} className={`grid-cell ${status}`}></div>;
                        })}
                    </div>

                    <div className="grid-footer">
                        <span>Fleet Health Score: <strong>8.4/10</strong></span>
                        <a href="#" className="link">View Detailed Fleet View</a>
                    </div>
                </div>

                {/* Product Distribution */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Product Distribution</h3>
                    </div>
                    <p className="card-subtitle">Order volume with absolute counts</p>

                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={productData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {productData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-center">
                            <span className="chart-total">142</span>
                            <span className="chart-label">TOTAL</span>
                        </div>
                    </div>

                    <div className="product-legend">
                        {productData.map((item, index) => (
                            <div key={index} className="product-item">
                                <span className="product-dot" style={{ background: item.color }}></span>
                                <span className="product-name">{item.name}</span>
                                <span className="product-value">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent High-Priority Orders */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Recent High-Priority Orders</h3>
                    <a href="/orders" className="link">View Full History</a>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ORDER ID</th>
                                <th>PRODUCT</th>
                                <th>TECHNICIAN</th>
                                <th>STATUS</th>
                                <th>TIME ELAPSED</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>#ORD-9902</td>
                                <td><span className="badge badge-success">INDIHOME</span></td>
                                <td>
                                    <div className="tech-cell">
                                        <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="" className="tech-avatar" />
                                        Budi Santoso
                                    </div>
                                </td>
                                <td><span className="badge badge-warning">IKR Progress</span></td>
                                <td>22m</td>
                                <td><a href="#" className="link">visibility</a></td>
                            </tr>
                            <tr>
                                <td>#ORD-9891</td>
                                <td><span className="badge badge-info">DATIN</span></td>
                                <td>
                                    <div className="tech-cell">
                                        <img src="https://randomuser.me/api/portraits/women/1.jpg" alt="" className="tech-avatar" />
                                        Siti Rahma
                                    </div>
                                </td>
                                <td><span className="badge badge-success">Survey Done</span></td>
                                <td>45m</td>
                                <td><a href="#" className="link">visibility</a></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
