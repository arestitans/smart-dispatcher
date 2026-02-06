import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    FileWarning,
    BarChart3,
    LogOut,
    Zap,
    Upload,
    Settings
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Sidebar() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'supervisor', 'helpdesk', 'guest'] },
        { to: '/orders', icon: ClipboardList, label: 'Orders', roles: ['admin', 'supervisor', 'helpdesk'] },
        { to: '/technicians', icon: Users, label: 'Technicians', roles: ['admin', 'supervisor', 'helpdesk', 'guest'] },
        { to: '/claims', icon: FileWarning, label: 'Claims', roles: ['admin', 'supervisor'] },
        { to: '/reports', icon: BarChart3, label: 'Reports', roles: ['admin', 'supervisor'] },
        { to: '/import', icon: Upload, label: 'Import Data', roles: ['admin', 'supervisor', 'helpdesk'] },
        { to: '/users', icon: Settings, label: 'User Management', roles: ['admin'] },
    ];

    const filteredNavItems = navItems.filter(item =>
        item.roles.includes(user?.role)
    );

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <Zap />
                    <h1>Smart Dispatcher</h1>
                </div>
            </div>

            <nav className="sidebar-nav">
                {filteredNavItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <item.icon />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="nav-item" onClick={handleLogout} style={{ width: '100%' }}>
                    <LogOut />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
