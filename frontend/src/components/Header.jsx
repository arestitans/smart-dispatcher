import { Search, Bell, Settings, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Header() {
    const { user } = useAuthStore();

    return (
        <header className="header">
            <div className="header-left">
                <div className="header-status">
                    <span className="dot"></span>
                    AUTO-ALLOCATION ACTIVE
                </div>

                <div className="header-search">
                    <Search size={18} color="#9ca3af" />
                    <input type="text" placeholder="Search order ID or technician..." />
                </div>
            </div>

            <div className="header-right">
                <button className="btn btn-primary" style={{ gap: '8px' }}>
                    <RefreshCw size={16} />
                    Sync Sheets
                </button>

                <button className="header-btn notification">
                    <Bell size={20} />
                </button>

                <button className="header-btn">
                    <Settings size={20} />
                </button>

                <div className="user-menu">
                    <div className="user-avatar">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                </div>
            </div>
        </header>
    );
}
