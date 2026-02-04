import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import './Login.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            const response = await authAPI.login(username, password);
            const { user, token } = response.data;

            login(user, token);
            toast.success(`Welcome, ${user.name}!`);
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    // Demo login
    const handleDemoLogin = (role) => {
        const credentials = {
            admin: { username: 'admin', password: 'admin123' },
            supervisor: { username: 'supervisor', password: 'super123' },
            helpdesk: { username: 'helpdesk', password: 'help123' },
            guest: { username: 'guest', password: 'guest123' }
        };

        setUsername(credentials[role].username);
        setPassword(credentials[role].password);
    };

    return (
        <div className="login-container">
            <div className="login-card animate-slide-up">
                <div className="login-header">
                    <div className="login-logo">
                        <Zap size={40} />
                    </div>
                    <h1>Smart Dispatcher</h1>
                    <p>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="password-input">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary login-btn"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="demo-accounts">
                    <p>Demo Accounts:</p>
                    <div className="demo-buttons">
                        <button onClick={() => handleDemoLogin('admin')} className="demo-btn">Admin</button>
                        <button onClick={() => handleDemoLogin('supervisor')} className="demo-btn">Supervisor</button>
                        <button onClick={() => handleDemoLogin('helpdesk')} className="demo-btn">Helpdesk</button>
                        <button onClick={() => handleDemoLogin('guest')} className="demo-btn">Guest</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
