import { useState, useEffect } from 'react';
import { FileWarning, Download, Plus, Eye, Clock, Send, Edit, X, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { claimsAPI } from '../services/api';
import './Claims.css';

const PRODUCTS = ['INDIHOME', 'DATIN', 'HSI', 'ORBIT', 'PDA'];
const CLAIM_STATUSES = ['INVESTIGATION', 'PENDING', 'RECTIFICATION', 'RESOLVED'];

export default function Claims() {
    const [claims, setClaims] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editedClaim, setEditedClaim] = useState(null);
    const [technicians, setTechnicians] = useState([
        { id: 'TX-9021', name: 'Budi Santoso', telegramChatId: '123456' },
        { id: 'TX-9022', name: 'Ahmad Subarjo', telegramChatId: '234567' },
        { id: 'TX-9023', name: 'Siti Rahma', telegramChatId: '345678' },
        { id: 'TX-9024', name: 'Dedi Kusuma', telegramChatId: '456789' },
    ]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await claimsAPI.getAll();
            setClaims(response.data.claims);
            setStats(response.data.stats);
        } catch (error) {
            // Mock data
            setClaims([
                { id: 'CLM-1001', orderId: 'ORD-8742', customer: 'Hendra Setiawan', technician: { id: 'TX-9022', name: 'Ahmad Subarjo' }, product: 'INDIHOME', originalPsDate: '2023-10-24', claimDate: '2023-11-12', remainingDays: 14, status: 'INVESTIGATION' },
                { id: 'CLM-1002', orderId: 'ORD-9912', customer: 'Rina Wijaya', technician: { id: 'TX-9023', name: 'Siti Rahma' }, product: 'DATIN', originalPsDate: '2023-11-02', claimDate: '2023-11-05', remainingDays: 57, status: 'PENDING' },
                { id: 'CLM-1003', orderId: 'ORD-8512', customer: 'Budi Cahyadi', technician: { id: 'TX-9024', name: 'Dedi Kusuma' }, product: 'INDIHOME', originalPsDate: '2023-10-15', claimDate: '2023-10-28', remainingDays: -5, status: 'RECTIFICATION' },
            ]);
            setStats({
                total: 124,
                within30Days: 42,
                within60Days: 82,
                needsReview: 42
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            INVESTIGATION: 'badge-info',
            PENDING: 'badge-warning',
            RECTIFICATION: 'badge-danger',
            RESOLVED: 'badge-success'
        };
        return styles[status] || 'badge-info';
    };

    const handlePreview = (claim) => {
        setSelectedClaim(claim);
        setEditedClaim({ ...claim });
        setEditMode(false);
        setShowPreviewModal(true);
    };

    const handleSaveEdit = () => {
        setClaims(prev => prev.map(c => c.id === editedClaim.id ? editedClaim : c));
        setSelectedClaim(editedClaim);
        setEditMode(false);
        toast.success('Claim updated successfully');
    };

    const handleSendToTech = (claim) => {
        toast.success(`Order sent to ${claim.technician.name} via Telegram!`);
    };

    const handleReassignTech = (techId) => {
        const tech = technicians.find(t => t.id === techId);
        if (tech) {
            setEditedClaim({ ...editedClaim, technician: { id: tech.id, name: tech.name } });
        }
    };

    return (
        <div className="claims-page">
            <div className="page-header">
                <div>
                    <h1>Fulfilment Guarantee Claims List</h1>
                    <p>Monitor and manage post-installation claims and guarantee periods</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-secondary">
                        <Download size={16} />
                        Export CSV
                    </button>
                    <button className="btn btn-primary">
                        <Plus size={16} />
                        Log New Claim
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="claims-stats">
                    <div className="stat-card stat-card-blue">
                        <div className="stat-card-header">
                            <FileWarning size={20} />
                        </div>
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">TOTAL ACTIVE CLAIMS</div>
                        <div className="stat-change positive">+12% FROM LAST WEEK</div>
                    </div>

                    <div className="stat-card stat-card-red">
                        <div className="stat-card-header">
                            <Clock size={20} />
                        </div>
                        <div className="stat-value">{stats.within30Days}</div>
                        <div className="stat-label">CLAIMS WITHIN 30 DAYS</div>
                        <div className="stat-subtitle">NEEDS URGENT REVIEW</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-header">
                            <Clock size={20} />
                        </div>
                        <div className="stat-value">{stats.within60Days}</div>
                        <div className="stat-label">CLAIMS WITHIN 60 DAYS</div>
                        <div className="stat-subtitle">WITHIN REGULAR WINDOW</div>
                    </div>
                </div>
            )}

            {/* Filter Bar */}
            <div className="filter-bar">
                <input
                    type="text"
                    className="form-input search-input"
                    placeholder="Search by Order ID, Customer, or Technician..."
                />
                <select className="form-input">
                    <option value="">All Product Types</option>
                    <option value="INDIHOME">INDIHOME</option>
                    <option value="DATIN">DATIN</option>
                    <option value="HSI">HSI</option>
                </select>
            </div>

            {/* Claims Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ORDER ID</th>
                                <th>CUSTOMER</th>
                                <th>TECHNICIAN (PS)</th>
                                <th>ORIGINAL PS DATE</th>
                                <th>CLAIM DATE</th>
                                <th>REMAINING PERIOD</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="loading-cell">Loading...</td></tr>
                            ) : claims.map(claim => (
                                <tr key={claim.id}>
                                    <td>
                                        <div className="order-info">
                                            <span className="order-id">{claim.orderId}</span>
                                            <span className="product-tag">{claim.product}</span>
                                        </div>
                                    </td>
                                    <td>{claim.customer}</td>
                                    <td>
                                        <div className="tech-cell">
                                            <img
                                                src={`https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 10)}.jpg`}
                                                alt=""
                                                className="tech-avatar"
                                            />
                                            {claim.technician.name}
                                        </div>
                                    </td>
                                    <td>{claim.originalPsDate}</td>
                                    <td>{claim.claimDate}</td>
                                    <td>
                                        <span className={`days-badge ${claim.remainingDays <= 0 ? 'expired' : claim.remainingDays <= 30 ? 'urgent' : 'normal'}`}>
                                            {claim.remainingDays <= 0 ? 'Expired' : `${claim.remainingDays} days left`}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(claim.status)}`}>
                                            {claim.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handlePreview(claim)}
                                                title="Preview & Edit"
                                            >
                                                <Eye size={14} /> Preview
                                            </button>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleSendToTech(claim)}
                                                title="Send to Technician"
                                            >
                                                <Send size={14} /> Send
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="table-footer">
                    <span>Showing 1-10 of {stats?.total || 0} claims</span>
                    <div className="pagination">
                        <button className="page-btn active">1</button>
                        <button className="page-btn">2</button>
                        <button className="page-btn">3</button>
                        <span>...</span>
                        <button className="page-btn">13</button>
                        <button className="page-btn">›</button>
                    </div>
                </div>
            </div>

            {/* Claim Preview Modal */}
            {showPreviewModal && selectedClaim && (
                <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">
                                    <Eye size={20} /> Claim Preview
                                    {editMode && <span className="edit-badge">EDITING</span>}
                                </h3>
                                <p className="modal-subtitle">Claim: {selectedClaim.id} | Order: {selectedClaim.orderId}</p>
                            </div>
                            <div className="modal-header-actions">
                                <button
                                    className={`btn btn-sm ${editMode ? 'btn-secondary' : 'btn-warning'}`}
                                    onClick={() => setEditMode(!editMode)}
                                >
                                    <Edit size={14} /> {editMode ? 'Cancel Edit' : 'Edit'}
                                </button>
                                <button className="btn btn-icon" onClick={() => setShowPreviewModal(false)}>×</button>
                            </div>
                        </div>

                        <div className="modal-body">
                            <div className="preview-grid">
                                {/* Claim Details */}
                                <div className="preview-section">
                                    <h4>📋 Claim Information</h4>
                                    <div className="preview-field">
                                        <label>Claim ID</label>
                                        <span>{selectedClaim.id}</span>
                                    </div>
                                    <div className="preview-field">
                                        <label>Order ID</label>
                                        <span>{selectedClaim.orderId}</span>
                                    </div>
                                    <div className="preview-field">
                                        <label>Product</label>
                                        {editMode ? (
                                            <select
                                                className="form-input"
                                                value={editedClaim.product}
                                                onChange={(e) => setEditedClaim({ ...editedClaim, product: e.target.value })}
                                            >
                                                {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        ) : (
                                            <span className="badge badge-info">{selectedClaim.product}</span>
                                        )}
                                    </div>
                                    <div className="preview-field">
                                        <label>Status</label>
                                        {editMode ? (
                                            <select
                                                className="form-input"
                                                value={editedClaim.status}
                                                onChange={(e) => setEditedClaim({ ...editedClaim, status: e.target.value })}
                                            >
                                                {CLAIM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        ) : (
                                            <span className={`badge ${getStatusBadge(selectedClaim.status)}`}>{selectedClaim.status}</span>
                                        )}
                                    </div>
                                    <div className="preview-field">
                                        <label>Original PS Date</label>
                                        <span>{selectedClaim.originalPsDate}</span>
                                    </div>
                                    <div className="preview-field">
                                        <label>Claim Date</label>
                                        <span>{selectedClaim.claimDate}</span>
                                    </div>
                                    <div className="preview-field">
                                        <label>Remaining Period</label>
                                        <span className={`days-badge ${selectedClaim.remainingDays <= 0 ? 'expired' : selectedClaim.remainingDays <= 30 ? 'urgent' : 'normal'}`}>
                                            {selectedClaim.remainingDays <= 0 ? 'Expired' : `${selectedClaim.remainingDays} days left`}
                                        </span>
                                    </div>
                                </div>

                                {/* Customer Details */}
                                <div className="preview-section">
                                    <h4>👤 Customer Information</h4>
                                    <div className="preview-field">
                                        <label>Customer Name</label>
                                        {editMode ? (
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editedClaim.customer}
                                                onChange={(e) => setEditedClaim({ ...editedClaim, customer: e.target.value })}
                                            />
                                        ) : (
                                            <span>{selectedClaim.customer}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Technician Assignment */}
                                <div className="preview-section">
                                    <h4>👷 Technician (PS)</h4>
                                    <div className="assignee-preview">
                                        <img src={`https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 10)}.jpg`} alt="" />
                                        <div>
                                            <strong>{editMode ? editedClaim.technician.name : selectedClaim.technician.name}</strong>
                                            <span>{editMode ? editedClaim.technician.id : selectedClaim.technician.id}</span>
                                        </div>
                                    </div>
                                    {editMode && (
                                        <div className="reassign-section" style={{ marginTop: '12px' }}>
                                            <label className="form-label">Reassign to:</label>
                                            <select
                                                className="form-input"
                                                value={editedClaim.technician.id}
                                                onChange={(e) => handleReassignTech(e.target.value)}
                                            >
                                                {technicians.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowPreviewModal(false)}>Close</button>
                            {editMode ? (
                                <button className="btn btn-success" onClick={handleSaveEdit}>
                                    Save Changes
                                </button>
                            ) : (
                                <button className="btn btn-primary" onClick={() => handleSendToTech(selectedClaim)}>
                                    <Send size={16} /> Send to Technician
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

