// Mock Data for Smart Dispatcher

// Product Categories
export const PRODUCT_TYPES = [
    'INDIHOME', 'HSI', 'PDA', 'MO', 'ORBIT', 'DATIN', 'VULA', 'DISMANTLE', 'Others'
];

// Order Statuses
export const ORDER_STATUS = {
    OPEN: 'OPEN',
    SURVEY: 'SURVEY',
    IKR: 'IKR',
    ACTIVATION: 'ACTIVATION',
    PS_DONE: 'PS_DONE',
    TECHNICAL_ISSUE: 'TECHNICAL_ISSUE',
    RESCHEDULE: 'RESCHEDULE'
};

// Sample Jakarta Areas
const AREAS = [
    'Jakarta Selatan', 'Jakarta Pusat', 'Jakarta Barat',
    'Jakarta Timur', 'Jakarta Utara', 'Tangerang', 'Bekasi'
];

// Generate random coordinates around Jakarta
const generateCoordinates = () => ({
    lat: -6.2 + (Math.random() * 0.2 - 0.1),
    lng: 106.8 + (Math.random() * 0.2 - 0.1)
});

// Generate random phone number
const generatePhone = () => {
    const prefix = ['0812', '0813', '0821', '0822', '0857', '0858'][Math.floor(Math.random() * 6)];
    return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// Sample Technicians - Cleared for fresh testing
export const technicians = [];

// Sample Customers
const customers = [
    { name: 'PT. Digital Solution', type: 'corporate' },
    { name: 'Hendra Setiawan', type: 'personal' },
    { name: 'Apt. Kemang Village', type: 'corporate' },
    { name: 'Sinar Mas Land', type: 'corporate' },
    { name: 'Robby Hermawan', type: 'personal' },
    { name: 'CV. Maju Jaya', type: 'corporate' },
    { name: 'Dewi Lestari', type: 'personal' },
    { name: 'PT. Telekomunikasi', type: 'corporate' },
    { name: 'Ahmad Fadli', type: 'personal' },
    { name: 'Ruko Mangga Dua', type: 'corporate' }
];

// Generate Orders
export const generateOrders = (count = 50) => {
    const orders = [];
    const statuses = Object.values(ORDER_STATUS);
    const priorities = ['HIGH', 'NORMAL', 'LOW'];

    for (let i = 0; i < count; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const coords = generateCoordinates();
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const assignedTech = status !== 'OPEN' ? technicians[Math.floor(Math.random() * technicians.length)] : null;

        orders.push({
            id: `ORD-${4400 + i}`,
            customer: customer.name,
            customerType: customer.type,
            phone: generatePhone(),
            address: `Jl. ${['Sudirman', 'Thamrin', 'Gatot Subroto', 'Kemang', 'Kuningan'][Math.floor(Math.random() * 5)]} No. ${Math.floor(1 + Math.random() * 100)}`,
            area: AREAS[Math.floor(Math.random() * AREAS.length)],
            coordinates: coords,
            product: PRODUCT_TYPES[Math.floor(Math.random() * PRODUCT_TYPES.length)],
            orderType: ['Pasang Baru', 'Upgrade', 'Perbaikan', 'Dismantle'][Math.floor(Math.random() * 4)],
            schedule: new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            scheduleTime: ['09:00', '10:00', '13:00', '14:00', '15:00'][Math.floor(Math.random() * 5)],
            status: status,
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            assignee: assignedTech ? { id: assignedTech.id, name: assignedTech.name } : null,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
            notes: ''
        });
    }

    return orders;
};

// Generate Claims
export const generateClaims = (count = 20) => {
    const claims = [];
    const statuses = ['INVESTIGATION', 'PENDING', 'RECTIFICATION', 'RESOLVED'];

    // Return empty claims if no technicians available
    if (technicians.length === 0) {
        return claims;
    }

    for (let i = 0; i < count; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const tech = technicians[Math.floor(Math.random() * technicians.length)];
        const originalDate = new Date(Date.now() - Math.floor(30 + Math.random() * 60) * 24 * 60 * 60 * 1000);
        const claimDate = new Date(originalDate.getTime() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);

        claims.push({
            id: `CLM-${1000 + i}`,
            orderId: `ORD-${8700 + i}`,
            customer: customer.name,
            technician: { id: tech.id, name: tech.name },
            product: PRODUCT_TYPES[Math.floor(Math.random() * 5)],
            originalPsDate: originalDate.toISOString().split('T')[0],
            claimDate: claimDate.toISOString().split('T')[0],
            remainingDays: Math.floor((Date.now() - claimDate.getTime()) / (24 * 60 * 60 * 1000)),
            status: statuses[Math.floor(Math.random() * statuses.length)],
            description: 'Connection issue reported by customer'
        });
    }

    return claims;
};

// Dashboard Stats
export const getDashboardStats = () => {
    const orders = generateOrders(100);
    const openOrders = orders.filter(o => o.status === 'OPEN').length;
    const inProgressOrders = orders.filter(o => ['SURVEY', 'IKR', 'ACTIVATION'].includes(o.status)).length;
    const completedOrders = orders.filter(o => o.status === 'PS_DONE').length;

    return {
        pendingActions: openOrders,
        onFieldFleet: technicians.filter(t => t.status === 'ACTIVE' || t.status === 'BUSY').length,
        avgResponse: 18,
        dailyCompletion: completedOrders,
        guaranteeClaims: 12,
        technicalIssues: orders.filter(o => o.status === 'TECHNICAL_ISSUE').length,
        systemIssues: 3,
        totalOrders: orders.length,
        activeTechnicians: technicians.filter(t => t.status !== 'OFFLINE').length,
        completionRate: ((completedOrders / orders.length) * 100).toFixed(1)
    };
};

// Users for authentication
export const users = [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
    { id: 2, username: 'supervisor', password: 'super123', role: 'supervisor', name: 'Supervisor' },
    { id: 3, username: 'helpdesk', password: 'help123', role: 'helpdesk', name: 'Helpdesk Operator' },
    { id: 4, username: 'guest', password: 'guest123', role: 'guest', name: 'Guest User' }
];

// Pending Technician Registrations (waiting for admin approval)
export const pendingTechnicians = [];

// Auto-increment counter for technician IDs
let techIdCounter = 9100;

// Generate new technician ID
export const generateTechId = () => {
    techIdCounter++;
    return `TX-${techIdCounter}`;
};

// Add pending registration
export const addPendingTechnician = (telegramChatId, telegramUsername, telegramName) => {
    const existingPending = pendingTechnicians.find(t => t.telegramChatId === telegramChatId);
    if (existingPending) {
        return { success: false, message: 'Already registered, waiting for approval', data: existingPending };
    }

    const existingApproved = technicians.find(t => t.telegramChatId === telegramChatId);
    if (existingApproved) {
        return { success: false, message: 'Already approved as technician', data: existingApproved };
    }

    const newId = generateTechId();
    const pending = {
        id: newId,
        telegramChatId,
        telegramUsername: telegramUsername || null,
        telegramName: telegramName || 'Unknown',
        registeredAt: new Date().toISOString(),
        status: 'PENDING'
    };

    pendingTechnicians.push(pending);
    return { success: true, message: 'Registration submitted', data: pending };
};

// Approve pending technician
export const approveTechnician = (pendingId, name, area, phone, nik, unit) => {
    const index = pendingTechnicians.findIndex(t => t.id === pendingId);
    if (index === -1) {
        return { success: false, message: 'Pending registration not found' };
    }

    const pending = pendingTechnicians[index];

    const newTechnician = {
        id: pending.id,
        nik: nik || '',
        name: name || pending.telegramName,
        photo: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 50)}.jpg`,
        area: area || 'Jakarta Selatan',
        unit: unit || '',
        phone: phone || '',
        status: 'AVAILABLE',
        telegramChatId: pending.telegramChatId,
        telegramUsername: pending.telegramUsername,
        workload: 0,
        maxWorkload: 3,
        stats: {
            revenuePoints: 0,
            avgHandlingTime: 0,
            completedOrders: 0,
            slaCompliance: 100,
            guaranteeClaims: 0
        },
        rank: 'AVERAGE',
        approvedAt: new Date().toISOString()
    };

    technicians.push(newTechnician);
    pendingTechnicians.splice(index, 1);

    return { success: true, message: 'Technician approved', data: newTechnician };
};

// Reject pending technician
export const rejectTechnician = (pendingId, reason) => {
    const index = pendingTechnicians.findIndex(t => t.id === pendingId);
    if (index === -1) {
        return { success: false, message: 'Pending registration not found' };
    }

    const pending = pendingTechnicians[index];
    pendingTechnicians.splice(index, 1);

    return { success: true, message: 'Registration rejected', data: { ...pending, rejectedReason: reason } };
};

export default {
    technicians,
    pendingTechnicians,
    generateOrders,
    generateClaims,
    getDashboardStats,
    users,
    PRODUCT_TYPES,
    ORDER_STATUS,
    generateTechId,
    addPendingTechnician,
    approveTechnician,
    rejectTechnician
};

