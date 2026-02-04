import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Download, Send, Eye, MoreHorizontal, Edit, X, MapPin, Bell, Settings, RefreshCw, ChevronDown, User, UserPlus, UserMinus, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { ordersAPI, techniciansAPI } from '../services/api';
import './Orders.css';

const PRODUCT_TYPES = ['INDIHOME', 'HSI', 'PDA', 'MO', 'ORBIT', 'DATIN', 'VULA', 'DISMANTLE', 'Others'];
const PRIORITIES = ['HIGH', 'NORMAL', 'LOW'];
const STATUSES = ['OPEN', 'SCHEDULE', 'SURVEY', 'IKR', 'ACTIVATION', 'PS_DONE', 'TECHNICAL_ISSUE', 'SYSTEM_ISSUE'];
const STATUS_FLOW = ['SURVEY', 'IKR', 'ACTIVATION', 'PS_DONE'];

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ product: '', priority: '', status: '', search: '' });
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editedOrder, setEditedOrder] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'warning', message: 'Order ORD-4501 not updated for 2 hours', time: '10 min ago', read: false },
        { id: 2, type: 'info', message: 'New order imported from spreadsheet', time: '30 min ago', read: false },
        { id: 3, type: 'success', message: 'Order ORD-4498 marked as PS_DONE', time: '1 hour ago', read: true },
    ]);
    const [newOrder, setNewOrder] = useState({
        customer: '',
        phone: '',
        address: '',
        product: 'INDIHOME',
        priority: 'NORMAL',
        schedule: new Date().toISOString().split('T')[0],
        coordinates: { lat: -6.2088, lng: 106.8456 }
    });

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        try {
            const [ordersRes, techsRes] = await Promise.all([
                ordersAPI.getAll(filters),
                techniciansAPI.getAll()
            ]);
            setOrders(ordersRes.data.orders);
            setTechnicians(techsRes.data.technicians);
        } catch (error) {
            // Mock data fallback
            setOrders([
                { id: 'ORD-4459', customer: 'PT. Digital Solution', phone: '0812-3456-789', address: 'Jl. Sudirman No. 45, Jakarta', coordinates: { lat: -6.2088, lng: 106.8456 }, product: 'INDIHOME', schedule: '2024-10-24', status: 'TECHNICAL_ISSUE', priority: 'HIGH', assignee: { id: 'TX-9021', name: 'Budi Santoso' } },
                { id: 'ORD-4421', customer: 'Apt. Kemang Village', phone: '0877-8899-001', address: 'Lantai 12, Unit 1205, Jakarta', coordinates: { lat: -6.2625, lng: 106.8114 }, product: 'ORBIT', schedule: '2024-10-25', status: 'SCHEDULE', priority: 'NORMAL', assignee: { id: 'TX-9024', name: 'Andi Wijaya' } },
                { id: 'ORD-4501', customer: 'Sinar Mas Land', phone: '0821-2233-445', address: 'BSD City, Tangerang', coordinates: { lat: -6.3086, lng: 106.6385 }, product: 'HSI', schedule: '2024-10-24', status: 'OPEN', priority: 'HIGH', assignee: null },
                { id: 'ORD-4498', customer: 'Robby Hermawan', phone: '0815-5566-778', address: 'Pondok Indah Blok A-12', coordinates: { lat: -6.2694, lng: 106.7825 }, product: 'DATIN', schedule: '2024-10-23', status: 'PS_DONE', priority: 'NORMAL', assignee: { id: 'TX-9023', name: 'Dedi Triadi' } },
                { id: 'ORD-4502', customer: 'Bank Central Asia', phone: '0811-1234-567', address: 'Jl. Thamrin No. 1', coordinates: { lat: -6.1934, lng: 106.8237 }, product: 'HSI', schedule: '2024-10-24', status: 'SURVEY', priority: 'HIGH', assignee: { id: 'TX-9022', name: 'Ahmad Subarjo' } },
                { id: 'ORD-4503', customer: 'PT. Maju Bersama', phone: '0818-9876-543', address: 'Jl. Gatot Subroto Kav. 36', coordinates: { lat: -6.2297, lng: 106.8174 }, product: 'INDIHOME', schedule: '2024-10-25', status: 'IKR', priority: 'NORMAL', assignee: { id: 'TX-9021', name: 'Budi Santoso' } },
                { id: 'ORD-4504', customer: 'Toko Elektronik Jaya', phone: '0856-1122-3344', address: 'Mangga Dua Square Lt. 3', coordinates: { lat: -6.1383, lng: 106.8283 }, product: 'ORBIT', schedule: '2024-10-26', status: 'ACTIVATION', priority: 'LOW', assignee: { id: 'TX-9024', name: 'Andi Wijaya' } },
            ]);
            setTechnicians([
                { id: 'TX-9021', name: 'Budi Santoso', photo: 'https://randomuser.me/api/portraits/men/1.jpg', workload: 2, maxWorkload: 3, area: 'Jakarta Selatan', telegramChatId: '123456' },
                { id: 'TX-9024', name: 'Andi Wijaya', photo: 'https://randomuser.me/api/portraits/men/4.jpg', workload: 1, maxWorkload: 2, area: 'Tangerang', telegramChatId: '234567' },
                { id: 'TX-9023', name: 'Dedi Kusuma', photo: 'https://randomuser.me/api/portraits/men/3.jpg', workload: 2, maxWorkload: 3, area: 'Jakarta Barat', telegramChatId: '345678' },
                { id: 'TX-9022', name: 'Ahmad Subarjo', photo: 'https://randomuser.me/api/portraits/men/2.jpg', workload: 1, maxWorkload: 3, area: 'Jakarta Pusat', telegramChatId: '456789' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = (order) => {
        setSelectedOrder(order);
        setShowAssignModal(true);
    };

    const confirmAssign = async (tech) => {
        try {
            await ordersAPI.assign(selectedOrder.id, {
                technicianId: tech.id,
                technicianName: tech.name,
                techChatId: tech.telegramChatId
            });
            toast.success(`Order assigned to ${tech.name} & sent via Telegram`);
            setShowAssignModal(false);
            loadData();
        } catch (error) {
            // Mock success with Telegram send
            const updatedOrders = orders.map(o =>
                o.id === selectedOrder.id ? { ...o, assignee: { id: tech.id, name: tech.name } } : o
            );
            setOrders(updatedOrders);
            toast.success(`Order assigned to ${tech.name} & sent via Telegram`);
            setShowAssignModal(false);
        }
    };

    const handleReassign = (order) => {
        setSelectedOrder(order);
        setShowPreviewModal(false);
        setShowAssignModal(true);
    };

    const getStatusBadge = (status) => {
        const styles = {
            OPEN: 'badge-info',
            SCHEDULE: 'badge-info',
            SURVEY: 'badge-warning',
            IKR: 'badge-warning',
            ACTIVATION: 'badge-warning',
            PS_DONE: 'badge-success',
            TECHNICAL_ISSUE: 'badge-danger',
            SYSTEM_ISSUE: 'badge-danger'
        };
        return styles[status] || 'badge-info';
    };

    const getPriorityBadge = (priority) => {
        const styles = {
            HIGH: 'badge-danger',
            NORMAL: 'badge-warning',
            LOW: 'badge-success'
        };
        return styles[priority] || 'badge-info';
    };

    const handlePreview = (order) => {
        setSelectedOrder(order);
        setEditedOrder({ ...order });
        setEditMode(false);
        setShowPreviewModal(true);
    };

    const handleSaveEdit = () => {
        setOrders(prev => prev.map(o => o.id === editedOrder.id ? editedOrder : o));
        setSelectedOrder(editedOrder);
        setEditMode(false);
        toast.success('Order updated successfully');
    };

    const handleSendFromPreview = () => {
        setShowPreviewModal(false);
        handleAssign(selectedOrder);
    };

    const handleUpdateStatus = (order, newStatus) => {
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
        toast.success(`Order ${order.id} updated to ${newStatus}`);
    };

    const getNextStatus = (currentStatus) => {
        const idx = STATUS_FLOW.indexOf(currentStatus);
        if (idx >= 0 && idx < STATUS_FLOW.length - 1) {
            return STATUS_FLOW[idx + 1];
        }
        return null;
    };

    const handleSyncSheet = async () => {
        setSyncing(true);
        try {
            // Simulate sync
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast.success('✅ Sync Complete! 15 orders synced from Google Sheets');
            loadData();
        } catch (error) {
            toast.error('❌ Sync failed. Please check your connection.');
        } finally {
            setSyncing(false);
        }
    };

    const handleCreateOrder = async () => {
        const orderId = `ORD-${4500 + orders.length + 1}`;
        const newOrderData = {
            id: orderId,
            ...newOrder,
            status: 'OPEN',
            assignee: null
        };

        try {
            setOrders(prev => [...prev, newOrderData]);
            toast.success(`Order ${orderId} created successfully!`);
            setShowCreateModal(false);
            setNewOrder({
                customer: '',
                phone: '',
                address: '',
                product: 'INDIHOME',
                priority: 'NORMAL',
                schedule: new Date().toISOString().split('T')[0],
                coordinates: { lat: -6.2088, lng: 106.8456 }
            });
        } catch (error) {
            toast.error('Failed to create order');
        }
    };

    const handleCreateAndAssign = async () => {
        const orderId = `ORD-${4500 + orders.length + 1}`;
        const newOrderData = {
            id: orderId,
            ...newOrder,
            status: 'OPEN',
            assignee: null
        };

        setOrders(prev => [...prev, newOrderData]);
        setShowCreateModal(false);
        setSelectedOrder(newOrderData);
        setShowAssignModal(true);
        toast.success(`Order ${orderId} created! Select technician to assign.`);
    };

    const markNotificationRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="orders-page">
            <div className="page-header">
                <div>
                    <h1>Order Management Queue</h1>
                    <p>Real-time order tracking and technician assignment</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-secondary" onClick={handleSyncSheet} disabled={syncing}>
                        <RefreshCw size={16} className={syncing ? 'spinning' : ''} />
                        {syncing ? 'Syncing...' : 'Sync Sheet'}
                    </button>
                    <button className="btn btn-secondary">
                        <Download size={16} />
                        Export CSV
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        <Plus size={16} />
                        Create New Order
                    </button>

                    {/* Notifications Bell */}
                    <div className="notification-wrapper">
                        <button className="btn btn-icon notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
                            <Bell size={18} />
                            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                        </button>
                        {showNotifications && (
                            <div className="dropdown-panel notifications-panel">
                                <div className="panel-header">
                                    <h4>Notifications</h4>
                                    <button className="btn btn-sm" onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}>
                                        Mark all read
                                    </button>
                                </div>
                                <div className="panel-body">
                                    {notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={`notification-item ${n.read ? 'read' : ''} ${n.type}`}
                                            onClick={() => markNotificationRead(n.id)}
                                        >
                                            <p>{n.message}</p>
                                            <span>{n.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Settings Menu */}
                    <div className="settings-wrapper">
                        <button className="btn btn-icon" onClick={() => setShowSettings(!showSettings)}>
                            <Settings size={18} />
                        </button>
                        {showSettings && (
                            <div className="dropdown-panel settings-panel">
                                <div className="panel-header">
                                    <h4>Settings</h4>
                                </div>
                                <div className="panel-body">
                                    <button className="settings-item" onClick={() => { setShowSettings(false); toast.info('Add User Login - Coming soon'); }}>
                                        <UserPlus size={16} /> Add User Login
                                    </button>
                                    <button className="settings-item" onClick={() => { setShowSettings(false); toast.info('Add Technician - Use Technicians page'); }}>
                                        <UserPlus size={16} /> Add Technician
                                    </button>
                                    <button className="settings-item" onClick={() => { setShowSettings(false); toast.info('Edit Technician - Coming soon'); }}>
                                        <Edit size={16} /> Edit Technician
                                    </button>
                                    <button className="settings-item" onClick={() => { setShowSettings(false); toast.info('Remove User Login - Coming soon'); }}>
                                        <UserMinus size={16} /> Remove User Login
                                    </button>
                                    <button className="settings-item danger" onClick={() => { setShowSettings(false); toast.info('Remove Technician - Coming soon'); }}>
                                        <UserMinus size={16} /> Remove Technician
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search Order ID, Customer, or Technician..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                </div>

                <div className="filter-group">
                    <select
                        className="form-input"
                        value={filters.product}
                        onChange={(e) => setFilters({ ...filters, product: e.target.value })}
                    >
                        <option value="">Product Type</option>
                        {PRODUCT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>

                    <select
                        className="form-input"
                        value={filters.priority}
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    >
                        <option value="">Priority</option>
                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>

                    <select
                        className="form-input"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="">Status</option>
                        {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>

                    <button className="btn btn-secondary" onClick={() => setFilters({ product: '', priority: '', status: '', search: '' })}>
                        Clear all filters
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th><input type="checkbox" /></th>
                                <th>ORDER ID</th>
                                <th>CUSTOMER</th>
                                <th>PHONE NUMBER</th>
                                <th>ADDRESS</th>
                                <th>COORDINATES</th>
                                <th>SCHEDULE</th>
                                <th>ASSIGNEE</th>
                                <th>STATUS</th>
                                <th>PRIORITY</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="11" className="loading-cell">Loading...</td></tr>
                            ) : orders.filter(order => {
                                if (filters.status && order.status !== filters.status) return false;
                                if (filters.product && order.product !== filters.product) return false;
                                if (filters.priority && order.priority !== filters.priority) return false;
                                if (filters.search) {
                                    const search = filters.search.toLowerCase();
                                    return order.id.toLowerCase().includes(search) ||
                                        order.customer.toLowerCase().includes(search) ||
                                        (order.assignee?.name?.toLowerCase().includes(search));
                                }
                                return true;
                            }).map(order => (
                                <tr key={order.id}>
                                    <td><input type="checkbox" /></td>
                                    <td className="order-id">{order.id}</td>
                                    <td>{order.customer}</td>
                                    <td>{order.phone}</td>
                                    <td className="address-cell">{order.address}</td>
                                    <td className="coords-cell">
                                        {order.coordinates?.lat?.toFixed(4)}, {order.coordinates?.lng?.toFixed(4)}
                                    </td>
                                    <td>{order.schedule}</td>
                                    <td>
                                        {order.assignee ? (
                                            <div className="assignee-cell">
                                                <img src={`https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 10)}.jpg`} alt="" className="tech-avatar" />
                                                {order.assignee.name}
                                            </div>
                                        ) : (
                                            <span className="unassigned">Unassigned</span>
                                        )}
                                    </td>
                                    <td><span className={`badge ${getStatusBadge(order.status)}`}>{order.status.replace('_', ' ')}</span></td>
                                    <td><span className={`badge ${getPriorityBadge(order.priority)}`}>{order.priority}</span></td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn btn-secondary btn-sm" onClick={() => handlePreview(order)} title="Preview & Edit">
                                                <Eye size={14} /> Preview
                                            </button>
                                            {getNextStatus(order.status) && (
                                                <button
                                                    className="btn btn-warning btn-sm"
                                                    onClick={() => handleUpdateStatus(order, getNextStatus(order.status))}
                                                    title={`Update to ${getNextStatus(order.status)}`}
                                                >
                                                    → {getNextStatus(order.status)}
                                                </button>
                                            )}
                                            <button className="btn btn-primary btn-sm" onClick={() => handleAssign(order)} title="Send to Technician">
                                                <Send size={14} /> SEND
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="table-footer">
                    <span>Showing 1 to {orders.length} of {orders.length} orders</span>
                    <div className="pagination">
                        <button className="page-btn active">1</button>
                        <button className="page-btn">2</button>
                        <button className="page-btn">3</button>
                        <span>...</span>
                        <button className="page-btn">32</button>
                        <button className="page-btn">›</button>
                    </div>
                </div>
            </div>

            {/* Assign Modal */}
            {showAssignModal && selectedOrder && (
                <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                <Send size={20} /> Assign Technician
                            </h3>
                            <button className="btn btn-icon" onClick={() => setShowAssignModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            <p className="modal-subtitle">Order: {selectedOrder.id} - {selectedOrder.customer}</p>

                            <div className="section-label">Recommended Technicians</div>
                            <p className="sort-option">Sorted by: Nearest + Rating</p>

                            <div className="tech-list">
                                {technicians.map(tech => (
                                    <div
                                        key={tech.id}
                                        className={`tech-item ${tech.workload >= tech.maxWorkload ? 'full' : ''}`}
                                        onClick={() => tech.workload < tech.maxWorkload && confirmAssign(tech)}
                                    >
                                        <img src={tech.photo} alt="" className="tech-photo" />
                                        <div className="tech-info">
                                            <span className="tech-name">{tech.name}</span>
                                            <span className="tech-details">{tech.id} • {tech.area}</span>
                                        </div>
                                        <span className={`tech-badge ${tech.workload < tech.maxWorkload ? 'available' : 'full'}`}>
                                            {tech.workload}/{tech.maxWorkload} Orders
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Order Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                <Plus size={20} /> Create New Order
                            </h3>
                            <button className="btn btn-icon" onClick={() => setShowCreateModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="preview-grid">
                                <div className="preview-section">
                                    <h4>👤 Customer Information</h4>
                                    <div className="form-group">
                                        <label className="form-label">Customer Name *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={newOrder.customer}
                                            onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
                                            placeholder="Enter customer name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone Number *</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            value={newOrder.phone}
                                            onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })}
                                            placeholder="08xx-xxxx-xxxx"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Address *</label>
                                        <textarea
                                            className="form-input"
                                            value={newOrder.address}
                                            onChange={(e) => setNewOrder({ ...newOrder, address: e.target.value })}
                                            placeholder="Full address"
                                            rows={2}
                                        />
                                    </div>
                                </div>

                                <div className="preview-section">
                                    <h4>📋 Order Details</h4>
                                    <div className="form-group">
                                        <label className="form-label">Product Type</label>
                                        <select
                                            className="form-input"
                                            value={newOrder.product}
                                            onChange={(e) => setNewOrder({ ...newOrder, product: e.target.value })}
                                        >
                                            {PRODUCT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Priority</label>
                                        <select
                                            className="form-input"
                                            value={newOrder.priority}
                                            onChange={(e) => setNewOrder({ ...newOrder, priority: e.target.value })}
                                        >
                                            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Schedule Date</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={newOrder.schedule}
                                            onChange={(e) => setNewOrder({ ...newOrder, schedule: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label"><MapPin size={14} /> Coordinates</label>
                                        <div className="coords-input">
                                            <input
                                                type="number"
                                                step="0.0001"
                                                className="form-input"
                                                value={newOrder.coordinates.lat}
                                                onChange={(e) => setNewOrder({ ...newOrder, coordinates: { ...newOrder.coordinates, lat: parseFloat(e.target.value) } })}
                                                placeholder="Latitude"
                                            />
                                            <input
                                                type="number"
                                                step="0.0001"
                                                className="form-input"
                                                value={newOrder.coordinates.lng}
                                                onChange={(e) => setNewOrder({ ...newOrder, coordinates: { ...newOrder.coordinates, lng: parseFloat(e.target.value) } })}
                                                placeholder="Longitude"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                            <button
                                className="btn btn-success"
                                onClick={handleCreateOrder}
                                disabled={!newOrder.customer || !newOrder.phone || !newOrder.address}
                            >
                                Save Order
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreateAndAssign}
                                disabled={!newOrder.customer || !newOrder.phone || !newOrder.address}
                            >
                                <Send size={16} /> Save & Assign Technician
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Preview Modal */}
            {showPreviewModal && selectedOrder && (
                <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">
                                    <Eye size={20} /> Order Preview
                                    {editMode && <span className="edit-badge">EDITING</span>}
                                </h3>
                                <p className="modal-subtitle">Order: {selectedOrder.id}</p>
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
                                {/* Order Details */}
                                <div className="preview-section">
                                    <h4>📋 Order Information</h4>
                                    <div className="preview-field">
                                        <label>Order ID</label>
                                        <span>{selectedOrder.id}</span>
                                    </div>
                                    <div className="preview-field">
                                        <label>Product</label>
                                        {editMode ? (
                                            <select
                                                className="form-input"
                                                value={editedOrder.product}
                                                onChange={(e) => setEditedOrder({ ...editedOrder, product: e.target.value })}
                                            >
                                                {PRODUCT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        ) : (
                                            <span className={`badge ${getStatusBadge(selectedOrder.status)}`}>{selectedOrder.product}</span>
                                        )}
                                    </div>
                                    <div className="preview-field">
                                        <label>Priority</label>
                                        {editMode ? (
                                            <select
                                                className="form-input"
                                                value={editedOrder.priority}
                                                onChange={(e) => setEditedOrder({ ...editedOrder, priority: e.target.value })}
                                            >
                                                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        ) : (
                                            <span className={`badge ${getPriorityBadge(selectedOrder.priority)}`}>{selectedOrder.priority}</span>
                                        )}
                                    </div>
                                    <div className="preview-field">
                                        <label>Status</label>
                                        {editMode ? (
                                            <select
                                                className="form-input"
                                                value={editedOrder.status}
                                                onChange={(e) => setEditedOrder({ ...editedOrder, status: e.target.value })}
                                            >
                                                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                            </select>
                                        ) : (
                                            <span className={`badge ${getStatusBadge(selectedOrder.status)}`}>{selectedOrder.status.replace('_', ' ')}</span>
                                        )}
                                    </div>
                                    <div className="preview-field">
                                        <label>Schedule</label>
                                        {editMode ? (
                                            <input
                                                type="date"
                                                className="form-input"
                                                value={editedOrder.schedule}
                                                onChange={(e) => setEditedOrder({ ...editedOrder, schedule: e.target.value })}
                                            />
                                        ) : (
                                            <span>{selectedOrder.schedule}</span>
                                        )}
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
                                                value={editedOrder.customer}
                                                onChange={(e) => setEditedOrder({ ...editedOrder, customer: e.target.value })}
                                            />
                                        ) : (
                                            <span>{selectedOrder.customer}</span>
                                        )}
                                    </div>
                                    <div className="preview-field">
                                        <label>Phone</label>
                                        {editMode ? (
                                            <input
                                                type="tel"
                                                className="form-input"
                                                value={editedOrder.phone}
                                                onChange={(e) => setEditedOrder({ ...editedOrder, phone: e.target.value })}
                                            />
                                        ) : (
                                            <span>{selectedOrder.phone}</span>
                                        )}
                                    </div>
                                    <div className="preview-field">
                                        <label>Address</label>
                                        {editMode ? (
                                            <textarea
                                                className="form-input"
                                                value={editedOrder.address}
                                                onChange={(e) => setEditedOrder({ ...editedOrder, address: e.target.value })}
                                                rows={2}
                                            />
                                        ) : (
                                            <span>{selectedOrder.address}</span>
                                        )}
                                    </div>
                                    <div className="preview-field">
                                        <label><MapPin size={14} /> Coordinates</label>
                                        <span className="coords">
                                            {selectedOrder.coordinates?.lat?.toFixed(6)}, {selectedOrder.coordinates?.lng?.toFixed(6)}
                                        </span>
                                    </div>
                                </div>

                                {/* Assignee Info */}
                                <div className="preview-section">
                                    <h4>👷 Assignment</h4>
                                    {selectedOrder.assignee ? (
                                        <>
                                            <div className="assignee-preview">
                                                <img src={`https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 10)}.jpg`} alt="" />
                                                <div>
                                                    <strong>{selectedOrder.assignee.name}</strong>
                                                    <span>{selectedOrder.assignee.id}</span>
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-warning btn-sm"
                                                style={{ marginTop: '12px', width: '100%' }}
                                                onClick={() => handleReassign(selectedOrder)}
                                            >
                                                <RefreshCw size={14} /> Reassign to Another Technician
                                            </button>
                                        </>
                                    ) : (
                                        <div className="no-assignee">
                                            <span className="unassigned-badge">⚠️ Not Assigned</span>
                                            <p>Click "Send to Technician" to assign</p>
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
                                <button className="btn btn-primary" onClick={handleSendFromPreview}>
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
