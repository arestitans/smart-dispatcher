import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import { useEffect, useState } from 'react';
import { ChevronDown, MapPin, Filter, Eye } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './TechnicianMap.css';

// Custom technician marker
const createTechIcon = (status) => {
    const colors = {
        ACTIVE: '#22c55e',
        IN_PROGRESS: '#22c55e',
        BUSY: '#eab308',
        AVAILABLE: '#3b82f6',
        IDLE: '#3b82f6',
        OFFLINE: '#6b7280',
        NOT_UPDATED: '#f97316',
        ISSUE: '#ef4444'
    };

    return divIcon({
        className: 'custom-marker',
        html: `<div class="tech-marker" style="background: ${colors[status] || colors.AVAILABLE}">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

// Custom order marker
const createOrderIcon = (priority, status) => {
    const colors = {
        HIGH: '#ef4444',
        NORMAL: '#eab308',
        LOW: '#22c55e'
    };

    // Override color for issues
    let bgColor = colors[priority] || colors.NORMAL;
    if (status === 'SYSTEM_ISSUE') bgColor = '#7c3aed';
    if (status === 'TECHNICAL_ISSUE') bgColor = '#ef4444';

    return divIcon({
        className: 'custom-marker',
        html: `<div class="order-marker" style="background: ${bgColor}">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
    });
};

// Mock technician locations with enhanced statuses
const mockTechnicians = [
    { id: 'TX-9021', name: 'Budi Santoso', status: 'IN_PROGRESS', lat: -6.2088, lng: 106.8456, currentOrder: 'ORD-4501', lastUpdate: '5 min ago' },
    { id: 'TX-9022', name: 'Ahmad Subarjo', status: 'IN_PROGRESS', lat: -6.2250, lng: 106.8200, currentOrder: 'ORD-4502', lastUpdate: '10 min ago' },
    { id: 'TX-9023', name: 'Siti Rahma', status: 'IDLE', lat: -6.1890, lng: 106.8550, currentOrder: null, lastUpdate: '2 min ago' },
    { id: 'TX-9024', name: 'Dedi Kusuma', status: 'NOT_UPDATED', lat: -6.2400, lng: 106.8100, currentOrder: 'ORD-4503', lastUpdate: '2 hours ago' },
    { id: 'TX-9025', name: 'Rina Wijaya', status: 'ISSUE', lat: -6.2600, lng: 106.7900, currentOrder: null, lastUpdate: '30 min ago', issueNote: 'Vehicle breakdown' },
];

// Mock order locations with enhanced statuses
const mockOrders = [
    { id: 'ORD-4501', customer: 'PT. Digital Solution', priority: 'HIGH', lat: -6.2150, lng: 106.8500, status: 'ON_PROGRESS', schedule: '2024-10-24 09:00' },
    { id: 'ORD-4502', customer: 'Apt. Kemang Village', priority: 'NORMAL', lat: -6.2300, lng: 106.8250, status: 'SYSTEM_ISSUE', schedule: '2024-10-24 10:00' },
    { id: 'ORD-4503', customer: 'Sinar Mas Land', priority: 'HIGH', lat: -6.2450, lng: 106.8050, status: 'TECHNICAL_ISSUE', schedule: '2024-10-24 11:00' },
    { id: 'ORD-4504', customer: 'Robby Hermawan', priority: 'LOW', lat: -6.1950, lng: 106.8400, status: 'SCHEDULED', schedule: '2024-10-25 09:00' },
    { id: 'ORD-4505', customer: 'Bank Central Asia', priority: 'HIGH', lat: -6.2000, lng: 106.8300, status: 'RESCHEDULED', schedule: '2024-10-26 14:00' },
    { id: 'ORD-4506', customer: 'PT. Maju Bersama', priority: 'NORMAL', lat: -6.2200, lng: 106.8150, status: 'NOT_UPDATED', schedule: '2024-10-24 08:00' },
    { id: 'ORD-4507', customer: 'Toko Elektronik Jaya', priority: 'NORMAL', lat: -6.1800, lng: 106.8650, status: 'IN_QUEUE', schedule: '2024-10-24 15:00' },
];

export default function TechnicianMap({ onSelectTech, onSelectOrder }) {
    const [view, setView] = useState('all'); // 'all', 'technicians', 'orders'
    const [techFilter, setTechFilter] = useState('all'); // 'all', 'in_progress', 'idle', 'not_updated', 'issue'
    const [orderFilter, setOrderFilter] = useState('all'); // 'all', 'on_progress', 'system_issue', etc.
    const [showOrderPreview, setShowOrderPreview] = useState(null);
    const [showTechDropdown, setShowTechDropdown] = useState(false);
    const [showOrderDropdown, setShowOrderDropdown] = useState(false);

    const handleTechClick = (tech) => {
        if (onSelectTech) onSelectTech(tech);
    };

    const handleOrderClick = (order) => {
        setShowOrderPreview(order);
        if (onSelectOrder) onSelectOrder(order);
    };

    // Filter technicians
    const filteredTechnicians = mockTechnicians.filter(tech => {
        if (techFilter === 'all') return true;
        if (techFilter === 'in_progress') return tech.status === 'IN_PROGRESS';
        if (techFilter === 'idle') return tech.status === 'IDLE';
        if (techFilter === 'not_updated') return tech.status === 'NOT_UPDATED';
        if (techFilter === 'issue') return tech.status === 'ISSUE';
        return true;
    });

    // Filter orders
    const filteredOrders = mockOrders.filter(order => {
        if (orderFilter === 'all') return true;
        if (orderFilter === 'on_progress') return order.status === 'ON_PROGRESS';
        if (orderFilter === 'system_issue') return order.status === 'SYSTEM_ISSUE';
        if (orderFilter === 'technical_issue') return order.status === 'TECHNICAL_ISSUE';
        if (orderFilter === 'scheduled') return order.status === 'SCHEDULED';
        if (orderFilter === 'rescheduled') return order.status === 'RESCHEDULED';
        if (orderFilter === 'not_updated') return order.status === 'NOT_UPDATED';
        if (orderFilter === 'in_queue') return order.status === 'IN_QUEUE';
        return true;
    });

    const getStatusLabel = (status) => {
        const labels = {
            IN_PROGRESS: '🟢 In Progress',
            IDLE: '🔵 Idle',
            NOT_UPDATED: '🟠 Not Updated',
            ISSUE: '🔴 Issue',
            ON_PROGRESS: '🟢 On Progress',
            SYSTEM_ISSUE: '🟣 System Issue',
            TECHNICAL_ISSUE: '🔴 Technical Issue',
            SCHEDULED: '📅 Scheduled',
            RESCHEDULED: '📆 Rescheduled',
            IN_QUEUE: '📋 In Queue'
        };
        return labels[status] || status;
    };

    return (
        <div className="map-container">
            <div className="map-header">
                <h3>🗺️ Live Tracking Map</h3>
                <div className="map-controls">
                    <button
                        className={`map-btn ${view === 'all' ? 'active' : ''}`}
                        onClick={() => setView('all')}
                    >
                        All
                    </button>

                    {/* Technicians Dropdown */}
                    <div className="filter-dropdown">
                        <button
                            className={`map-btn ${view === 'technicians' ? 'active' : ''}`}
                            onClick={() => { setView('technicians'); setShowTechDropdown(!showTechDropdown); }}
                        >
                            👷 Technicians <ChevronDown size={14} />
                        </button>
                        {showTechDropdown && view === 'technicians' && (
                            <div className="dropdown-menu">
                                <div className="dropdown-item" onClick={() => { setTechFilter('all'); setShowTechDropdown(false); }}>
                                    All Technicians
                                </div>
                                <div className="dropdown-item" onClick={() => { setTechFilter('in_progress'); setShowTechDropdown(false); }}>
                                    🟢 Order in Progress
                                </div>
                                <div className="dropdown-item" onClick={() => { setTechFilter('idle'); setShowTechDropdown(false); }}>
                                    🔵 Idle
                                </div>
                                <div className="dropdown-item" onClick={() => { setTechFilter('not_updated'); setShowTechDropdown(false); }}>
                                    🟠 Not Updated
                                </div>
                                <div className="dropdown-item" onClick={() => { setTechFilter('issue'); setShowTechDropdown(false); }}>
                                    🔴 Issue
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Orders Dropdown */}
                    <div className="filter-dropdown">
                        <button
                            className={`map-btn ${view === 'orders' ? 'active' : ''}`}
                            onClick={() => { setView('orders'); setShowOrderDropdown(!showOrderDropdown); }}
                        >
                            📦 Orders <ChevronDown size={14} />
                        </button>
                        {showOrderDropdown && view === 'orders' && (
                            <div className="dropdown-menu">
                                <div className="dropdown-item" onClick={() => { setOrderFilter('all'); setShowOrderDropdown(false); }}>
                                    All Orders
                                </div>
                                <div className="dropdown-item" onClick={() => { setOrderFilter('on_progress'); setShowOrderDropdown(false); }}>
                                    🟢 On Progress
                                </div>
                                <div className="dropdown-item" onClick={() => { setOrderFilter('system_issue'); setShowOrderDropdown(false); }}>
                                    🟣 System Issue
                                </div>
                                <div className="dropdown-item" onClick={() => { setOrderFilter('technical_issue'); setShowOrderDropdown(false); }}>
                                    🔴 Technical Issue
                                </div>
                                <div className="dropdown-item" onClick={() => { setOrderFilter('scheduled'); setShowOrderDropdown(false); }}>
                                    📅 Scheduled
                                </div>
                                <div className="dropdown-item" onClick={() => { setOrderFilter('rescheduled'); setShowOrderDropdown(false); }}>
                                    📆 Rescheduled
                                </div>
                                <div className="dropdown-item" onClick={() => { setOrderFilter('not_updated'); setShowOrderDropdown(false); }}>
                                    🟠 Not Updated
                                </div>
                                <div className="dropdown-item" onClick={() => { setOrderFilter('in_queue'); setShowOrderDropdown(false); }}>
                                    📋 Orders in Queue
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Active Filter Indicator */}
            {(techFilter !== 'all' || orderFilter !== 'all') && (
                <div className="active-filter">
                    <Filter size={14} />
                    <span>Filter: {techFilter !== 'all' ? `Techs: ${techFilter}` : ''} {orderFilter !== 'all' ? `Orders: ${orderFilter}` : ''}</span>
                    <button onClick={() => { setTechFilter('all'); setOrderFilter('all'); }}>Clear</button>
                </div>
            )}

            <MapContainer
                center={[-6.2088, 106.8456]}
                zoom={13}
                className="leaflet-map"
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Technician Markers */}
                {(view === 'all' || view === 'technicians') && filteredTechnicians.map(tech => (
                    <Marker
                        key={tech.id}
                        position={[tech.lat, tech.lng]}
                        icon={createTechIcon(tech.status)}
                        eventHandlers={{
                            click: () => handleTechClick(tech)
                        }}
                    >
                        <Popup>
                            <div className="popup-content">
                                <strong>{tech.name}</strong>
                                <span className="popup-id">{tech.id}</span>
                                <span className={`popup-status status-${tech.status.toLowerCase()}`}>
                                    {getStatusLabel(tech.status)}
                                </span>
                                <span className="popup-update">Last update: {tech.lastUpdate}</span>
                                {tech.currentOrder && (
                                    <span className="popup-order">Current: {tech.currentOrder}</span>
                                )}
                                {tech.issueNote && (
                                    <span className="popup-issue">⚠️ {tech.issueNote}</span>
                                )}
                                <span className="popup-coords">
                                    <MapPin size={12} /> {tech.lat.toFixed(6)}, {tech.lng.toFixed(6)}
                                </span>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Order Markers */}
                {(view === 'all' || view === 'orders') && filteredOrders.map(order => (
                    <Marker
                        key={order.id}
                        position={[order.lat, order.lng]}
                        icon={createOrderIcon(order.priority, order.status)}
                        eventHandlers={{
                            click: () => handleOrderClick(order)
                        }}
                    >
                        <Popup>
                            <div className="popup-content">
                                <strong>{order.id}</strong>
                                <span className="popup-customer">{order.customer}</span>
                                <span className={`popup-priority priority-${order.priority.toLowerCase()}`}>
                                    {order.priority} Priority
                                </span>
                                <span className="popup-status">{getStatusLabel(order.status)}</span>
                                <span className="popup-schedule">📅 {order.schedule}</span>
                                <span className="popup-coords">
                                    <MapPin size={12} /> {order.lat.toFixed(6)}, {order.lng.toFixed(6)}
                                </span>
                                <button className="popup-preview-btn" onClick={() => setShowOrderPreview(order)}>
                                    <Eye size={12} /> Preview Order
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Order Preview Popup */}
            {showOrderPreview && (
                <div className="order-preview-overlay" onClick={() => setShowOrderPreview(null)}>
                    <div className="order-preview-card" onClick={e => e.stopPropagation()}>
                        <div className="preview-header">
                            <h4>{showOrderPreview.id}</h4>
                            <button onClick={() => setShowOrderPreview(null)}>×</button>
                        </div>
                        <div className="preview-body">
                            <p><strong>Customer:</strong> {showOrderPreview.customer}</p>
                            <p><strong>Status:</strong> {getStatusLabel(showOrderPreview.status)}</p>
                            <p><strong>Priority:</strong> {showOrderPreview.priority}</p>
                            <p><strong>Schedule:</strong> {showOrderPreview.schedule}</p>
                            <p><strong>Coordinates:</strong> {showOrderPreview.lat.toFixed(6)}, {showOrderPreview.lng.toFixed(6)}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="map-legend">
                <span className="legend-title">Legend:</span>
                <span className="legend-item"><span className="dot in-progress"></span> In Progress</span>
                <span className="legend-item"><span className="dot idle"></span> Idle</span>
                <span className="legend-item"><span className="dot not-updated"></span> Not Updated</span>
                <span className="legend-item"><span className="dot issue"></span> Issue</span>
            </div>
        </div>
    );
}

