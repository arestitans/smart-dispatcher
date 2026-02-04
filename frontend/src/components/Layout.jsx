import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import './Layout.css';

export default function Layout() {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="layout-main">
                <Header />
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
