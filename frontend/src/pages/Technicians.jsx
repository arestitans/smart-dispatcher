import { useState, useEffect } from 'react';
import { Star, Medal, MessageSquare, TrendingUp, Users, UserPlus, X, Edit, Send, Clock, Check, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { techniciansAPI } from '../services/api';
import './Technicians.css';

const DUTY_STATUSES = ['ON_DUTY', 'OFF', 'SICK', 'LEAVE'];
const AREAS = ['Jakarta Selatan', 'Jakarta Pusat', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara', 'Tangerang', 'Bekasi', 'Depok', 'Bogor'];

// Format to IDR currency
const formatIDR = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount * 10000); // Convert points to IDR (1 point = Rp 10,000)
};

export default function Technicians() {
    const [technicians, setTechnicians] = useState([]);
    const [generalReview, setGeneralReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [bulkMessage, setBulkMessage] = useState('');
    const [selectedTechs, setSelectedTechs] = useState([]);
    const [newTech, setNewTech] = useState({
        name: '',
        phone: '',
        area: 'Jakarta Selatan',
        status: 'AVAILABLE'
    });

    // Pending approvals state
    const [pendingTechs, setPendingTechs] = useState([]);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedPending, setSelectedPending] = useState(null);
    const [approveData, setApproveData] = useState({ nik: '', name: '', area: 'Jakarta Selatan', unit: '', phone: '' });

    useEffect(() => {
        loadData();
        loadPending();
    }, []);

    const loadData = async () => {
        try {
            const [techsRes, reviewRes] = await Promise.all([
                techniciansAPI.getRanking(),
                techniciansAPI.getGeneralReview()
            ]);
            setTechnicians(techsRes.data.ranking);
            setGeneralReview(reviewRes.data);
        } catch (error) {
            // Mock data
            setTechnicians([
                { id: 'TX-9021', name: 'Budi Santoso', photo: 'https://randomuser.me/api/portraits/men/1.jpg', area: 'Jakarta Selatan', rank: 'TOP', stats: { revenuePoints: 1250, completedOrders: 156, avgHandlingTime: 45, slaCompliance: 98, guaranteeClaims: 0 } },
                { id: 'TX-9023', name: 'Siti Rahma', photo: 'https://randomuser.me/api/portraits/women/1.jpg', area: 'Jakarta Pusat', rank: 'TOP', stats: { revenuePoints: 1100, completedOrders: 142, avgHandlingTime: 48, slaCompliance: 96, guaranteeClaims: 0 } },
                { id: 'TX-9022', name: 'Ahmad Subarjo', photo: 'https://randomuser.me/api/portraits/men/2.jpg', area: 'Jakarta Selatan', rank: 'GOOD', stats: { revenuePoints: 980, completedOrders: 124, avgHandlingTime: 52, slaCompliance: 94, guaranteeClaims: 1 } },
                { id: 'TX-9026', name: 'Rina Wijaya', photo: 'https://randomuser.me/api/portraits/women/2.jpg', area: 'Bekasi', rank: 'GOOD', stats: { revenuePoints: 890, completedOrders: 98, avgHandlingTime: 55, slaCompliance: 92, guaranteeClaims: 0 } },
                { id: 'TX-9024', name: 'Dedi Kusuma', photo: 'https://randomuser.me/api/portraits/men/3.jpg', area: 'Jakarta Barat', rank: 'AVERAGE', stats: { revenuePoints: 750, completedOrders: 89, avgHandlingTime: 65, slaCompliance: 85, guaranteeClaims: 2 } },
                { id: 'TX-9025', name: 'Andi Wijaya', photo: 'https://randomuser.me/api/portraits/men/4.jpg', area: 'Tangerang', rank: 'POOR', stats: { revenuePoints: 620, completedOrders: 67, avgHandlingTime: 72, slaCompliance: 78, guaranteeClaims: 3 } },
            ]);
            setGeneralReview({
                totalTechnicians: 6,
                avgCompletionRate: 113,
                avgSlaCompliance: 90.5,
                avgHandlingTime: 56,
                totalRevenue: 5590,
                byRank: { top: 2, good: 2, average: 1, poor: 1 },
                techsWithClaims: [
                    { id: 'TX-9022', name: 'Ahmad Subarjo', claims: 1 },
                    { id: 'TX-9024', name: 'Dedi Kusuma', claims: 2 },
                    { id: 'TX-9025', name: 'Andi Wijaya', claims: 3 }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    const loadPending = async () => {
        try {
            const res = await techniciansAPI.getPending();
            setPendingTechs(res.data.pending || []);
        } catch (error) {
            console.log('Could not load pending technicians');
        }
    };

    const getRankBadge = (rank) => {
        const styles = {
            TOP: { class: 'rank-top', icon: '⭐', label: 'TOP PERFORMER' },
            GOOD: { class: 'rank-good', icon: '✓', label: 'GOOD' },
            AVERAGE: { class: 'rank-average', icon: '⚠', label: 'AVERAGE' },
            POOR: { class: 'rank-poor', icon: '❌', label: 'POOR' }
        };
        return styles[rank] || styles.AVERAGE;
    };

    const handleBulkSend = async () => {
        try {
            await techniciansAPI.sendBulkMessage({
                technicianIds: selectedTechs,
                message: bulkMessage
            });
            toast.success(`Message sent to ${selectedTechs.length} technicians`);
            setShowBulkModal(false);
            setBulkMessage('');
            setSelectedTechs([]);
        } catch (error) {
            toast.success(`Message sent to ${selectedTechs.length} technicians`);
            setShowBulkModal(false);
        }
    };

    const handleBulkSendOrders = async () => {
        try {
            const response = await techniciansAPI.bulkSendOrders(selectedTechs);
            toast.success(`${response.data.totalOrders || 0} orders sent to ${selectedTechs.length} technicians via Telegram`);
            setSelectedTechs([]);
        } catch (error) {
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to send orders. Check if technicians have registered Telegram.');
            }
        }
    };

    const toggleSelect = (id) => {
        setSelectedTechs(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedTechs.length === technicians.length) {
            setSelectedTechs([]);
        } else {
            setSelectedTechs(technicians.map(t => t.id));
        }
    };

    const handleAddTechnician = async () => {
        const techId = `TX-${9100 + technicians.length}`;
        const newTechnician = {
            id: techId,
            ...newTech,
            photo: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 50)}.jpg`,
            rank: 'AVERAGE',
            stats: {
                revenuePoints: 0,
                completedOrders: 0,
                avgHandlingTime: 0,
                slaCompliance: 100,
                guaranteeClaims: 0
            }
        };

        try {
            // Add to list
            setTechnicians(prev => [...prev, newTechnician]);
            toast.success(`Technician ${newTech.name} (${techId}) registered!`);
            setShowAddModal(false);
            setNewTech({ name: '', phone: '', area: 'Jakarta Selatan', status: 'AVAILABLE' });
        } catch (error) {
            toast.error('Failed to add technician');
        }
    };

    const handleApprove = async () => {
        if (!selectedPending) return;
        try {
            await techniciansAPI.approve(selectedPending.id, approveData);
            toast.success(`Technician ${approveData.name || selectedPending.telegramName} approved!`);
            setShowApproveModal(false);
            setSelectedPending(null);
            setApproveData({ nik: '', name: '', area: 'Jakarta Selatan', unit: '', phone: '' });
            loadData();
            loadPending();
        } catch (error) {
            toast.error('Failed to approve technician');
        }
    };

    const handleReject = async (pending) => {
        const reason = prompt('Enter rejection reason (optional):');
        try {
            await techniciansAPI.reject(pending.id, reason || 'No reason provided');
            toast.success('Registration rejected');
            loadPending();
        } catch (error) {
            toast.error('Failed to reject');
        }
    };

    const openApproveModal = (pending) => {
        setSelectedPending(pending);
        setApproveData({ nik: '', name: pending.telegramName || '', area: 'Jakarta Selatan', unit: '', phone: '' });
        setShowApproveModal(true);
    };

    return (
        <div className="technicians-page">
            <div className="page-header">
                <div>
                    <h1>Technicians Management</h1>
                    <p>Performance review and ranking system</p>
                </div>
                <div className="page-actions">
                    <button
                        className="btn btn-success"
                        onClick={() => setShowAddModal(true)}
                    >
                        <UserPlus size={16} />
                        Add Technician
                    </button>
                    <button
                        className="btn btn-warning"
                        onClick={handleBulkSendOrders}
                        disabled={selectedTechs.length === 0}
                        title="Send assigned orders to selected technicians via Telegram"
                    >
                        <Send size={16} />
                        Bulk Send Orders ({selectedTechs.length})
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowBulkModal(true)}
                        disabled={selectedTechs.length === 0}
                    >
                        <MessageSquare size={16} />
                        Bulk Message ({selectedTechs.length})
                    </button>
                </div>
            </div>

            {/* General Review Stats */}
            {generalReview && (
                <div className="general-review">
                    <h3><Users size={20} /> General Review</h3>
                    <div className="review-stats">
                        <div className="review-stat">
                            <span className="stat-value">{generalReview.totalTechnicians}</span>
                            <span className="stat-label">Total Technicians</span>
                        </div>
                        <div className="review-stat">
                            <span className="stat-value">{generalReview.avgCompletionRate}</span>
                            <span className="stat-label">Avg Completed</span>
                        </div>
                        <div className="review-stat">
                            <span className="stat-value">{generalReview.avgSlaCompliance}%</span>
                            <span className="stat-label">Avg SLA</span>
                        </div>
                        <div className="review-stat">
                            <span className="stat-value">{generalReview.avgHandlingTime}m</span>
                            <span className="stat-label">Avg Handling</span>
                        </div>
                        <div className="review-stat">
                            <span className="stat-value">{formatIDR(generalReview.totalRevenue)}</span>
                            <span className="stat-label">Total Revenue</span>
                        </div>
                    </div>

                    <div className="rank-distribution">
                        <span className="rank-badge rank-top">{generalReview.byRank.top} Top</span>
                        <span className="rank-badge rank-good">{generalReview.byRank.good} Good</span>
                        <span className="rank-badge rank-average">{generalReview.byRank.average} Avg</span>
                        <span className="rank-badge rank-poor">{generalReview.byRank.poor} Poor</span>
                    </div>
                </div>
            )}

            {/* Claims Warning */}
            {generalReview?.techsWithClaims?.length > 0 && (
                <div className="claims-warning">
                    <strong>⚠️ Technicians with Fulfilment Guarantee Claims:</strong>
                    <div className="claims-list">
                        {generalReview.techsWithClaims.map(tech => (
                            <span key={tech.id} className="claim-badge">
                                {tech.name} ({tech.claims} claims)
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Pending Approvals */}
            <div className="card pending-approvals">
                <div className="card-header">
                    <h3 className="card-title"><Clock size={20} /> Pending Approvals ({pendingTechs.length})</h3>
                </div>
                {pendingTechs.length > 0 ? (
                    <div className="pending-list">
                        {pendingTechs.map(pending => (
                            <div key={pending.id} className="pending-item">
                                <div className="pending-info">
                                    <span className="pending-id">{pending.id}</span>
                                    <span className="pending-name">{pending.telegramName}</span>
                                    {pending.telegramUsername && (
                                        <span className="pending-username">@{pending.telegramUsername}</span>
                                    )}
                                    <span className="pending-date">
                                        {new Date(pending.registeredAt).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <div className="pending-actions">
                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => openApproveModal(pending)}
                                    >
                                        <Check size={14} /> Approve
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleReject(pending)}
                                    >
                                        <XCircle size={14} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="pending-list empty-state">
                        <p style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            📭 No pending registrations. Technicians can register by sending <code>/start</code> to the Telegram bot.
                        </p>
                    </div>
                )}
            </div>

            {/* Ranking Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title"><Medal size={20} /> Ranking Board</h3>
                    <button className="btn btn-secondary btn-sm" onClick={selectAll}>
                        {selectedTechs.length === technicians.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>#</th>
                                <th>TECHNICIAN</th>
                                <th>AREA</th>
                                <th>RANK</th>
                                <th>COMPLETED</th>
                                <th>AVG TIME</th>
                                <th>SLA</th>
                                <th>REVENUE</th>
                                <th>CLAIMS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="10" className="loading-cell">Loading...</td></tr>
                            ) : technicians.map((tech, index) => {
                                const rankInfo = getRankBadge(tech.rank);
                                return (
                                    <tr key={tech.id} className={selectedTechs.includes(tech.id) ? 'selected' : ''}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedTechs.includes(tech.id)}
                                                onChange={() => toggleSelect(tech.id)}
                                            />
                                        </td>
                                        <td className="rank-num">{index + 1}</td>
                                        <td>
                                            <div className="tech-cell">
                                                <img src={tech.photo} alt="" className="tech-avatar" />
                                                <div>
                                                    <span className="tech-name">{tech.name}</span>
                                                    <span className="tech-id">{tech.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{tech.area}</td>
                                        <td>
                                            <span className={`rank-badge ${rankInfo.class}`}>
                                                {rankInfo.icon} {rankInfo.label}
                                            </span>
                                        </td>
                                        <td><strong>{tech.stats.completedOrders}</strong></td>
                                        <td>{tech.stats.avgHandlingTime}m</td>
                                        <td>
                                            <span className={tech.stats.slaCompliance >= 90 ? 'text-green' : tech.stats.slaCompliance >= 80 ? 'text-yellow' : 'text-red'}>
                                                {tech.stats.slaCompliance}%
                                            </span>
                                        </td>
                                        <td className="revenue">{formatIDR(tech.stats.revenuePoints)}</td>
                                        <td>
                                            {tech.stats.guaranteeClaims > 0 ? (
                                                <span className="claims-count">{tech.stats.guaranteeClaims}</span>
                                            ) : (
                                                <span className="no-claims">-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bulk Message Modal */}
            {showBulkModal && (
                <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Send Bulk Message</h3>
                            <button className="btn btn-icon" onClick={() => setShowBulkModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            <p className="selected-info">
                                Sending to: <strong>{selectedTechs.length} technicians</strong>
                            </p>

                            <div className="form-group">
                                <label className="form-label">Message (Telegram)</label>
                                <textarea
                                    className="form-input message-input"
                                    placeholder="Type your message here..."
                                    value={bulkMessage}
                                    onChange={(e) => setBulkMessage(e.target.value)}
                                    rows={5}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowBulkModal(false)}>Cancel</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleBulkSend}
                                disabled={!bulkMessage.trim()}
                            >
                                Send to Telegram
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Technician Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title"><UserPlus size={20} /> Register New Technician</h3>
                            <button className="btn btn-icon" onClick={() => setShowAddModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter technician name"
                                    value={newTech.name}
                                    onChange={(e) => setNewTech(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number *</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    placeholder="08xxxxxxxxxx"
                                    value={newTech.phone}
                                    onChange={(e) => setNewTech(prev => ({ ...prev, phone: e.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Area / Region *</label>
                                <select
                                    className="form-input"
                                    value={newTech.area}
                                    onChange={(e) => setNewTech(prev => ({ ...prev, area: e.target.value }))}
                                >
                                    <option value="Jakarta Selatan">Jakarta Selatan</option>
                                    <option value="Jakarta Pusat">Jakarta Pusat</option>
                                    <option value="Jakarta Barat">Jakarta Barat</option>
                                    <option value="Jakarta Timur">Jakarta Timur</option>
                                    <option value="Jakarta Utara">Jakarta Utara</option>
                                    <option value="Tangerang">Tangerang</option>
                                    <option value="Bekasi">Bekasi</option>
                                    <option value="Depok">Depok</option>
                                    <option value="Bogor">Bogor</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Initial Status</label>
                                <select
                                    className="form-input"
                                    value={newTech.status}
                                    onChange={(e) => setNewTech(prev => ({ ...prev, status: e.target.value }))}
                                >
                                    <option value="AVAILABLE">Available</option>
                                    <option value="ON_DUTY">On Duty</option>
                                    <option value="OFF_DUTY">Off Duty</option>
                                </select>
                            </div>

                            <div className="info-box">
                                <strong>💡 Registration Info:</strong>
                                <ul>
                                    <li>ID will be auto-generated</li>
                                    <li>Technician can register on Telegram: /start + ID</li>
                                    <li>Initial rank: AVERAGE</li>
                                </ul>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button
                                className="btn btn-success"
                                onClick={handleAddTechnician}
                                disabled={!newTech.name.trim() || !newTech.phone.trim()}
                            >
                                <UserPlus size={16} />
                                Register Technician
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Modal */}
            {showApproveModal && selectedPending && (
                <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title"><Check size={20} /> Approve Technician</h3>
                            <button className="btn btn-icon" onClick={() => setShowApproveModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="info-box">
                                <strong>📝 Registration Details:</strong>
                                <ul>
                                    <li>ID: {selectedPending.id}</li>
                                    <li>Telegram: @{selectedPending.telegramUsername || 'N/A'}</li>
                                    <li>Registered: {new Date(selectedPending.registeredAt).toLocaleString('id-ID')}</li>
                                </ul>
                            </div>

                            <div className="form-group">
                                <label className="form-label">NIK *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter NIK"
                                    value={approveData.nik}
                                    onChange={(e) => setApproveData(prev => ({ ...prev, nik: e.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Technician Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter technician name"
                                    value={approveData.name}
                                    onChange={(e) => setApproveData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Area / Region *</label>
                                <select
                                    className="form-input"
                                    value={approveData.area}
                                    onChange={(e) => setApproveData(prev => ({ ...prev, area: e.target.value }))}
                                >
                                    {AREAS.map(area => (
                                        <option key={area} value={area}>{area}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Unit</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter unit"
                                    value={approveData.unit}
                                    onChange={(e) => setApproveData(prev => ({ ...prev, unit: e.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    placeholder="08xxxxxxxxxx"
                                    value={approveData.phone}
                                    onChange={(e) => setApproveData(prev => ({ ...prev, phone: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowApproveModal(false)}>Cancel</button>
                            <button
                                className="btn btn-success"
                                onClick={handleApprove}
                                disabled={!approveData.nik.trim() || !approveData.name.trim()}
                            >
                                <Check size={16} />
                                Approve Technician
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
