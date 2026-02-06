import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import CreateUserModal from '../components/CreateUserModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import ResetPasswordModal from '../components/ResetPasswordModal';
import './Users.css';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const { user: currentUser } = useAuthStore();
    const isAdmin = currentUser?.role === 'admin';

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await usersAPI.getAll();
            setUsers(response.data.users);
        } catch (error) {
            toast.error('Failed to load users');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (userData) => {
        try {
            await usersAPI.create(userData);
            toast.success('User created successfully');
            loadUsers();
            setShowCreateModal(false);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create user');
        }
    };

    const handleChangePassword = async (userId, currentPassword, newPassword) => {
        try {
            await usersAPI.changePassword(userId, currentPassword, newPassword);
            toast.success('Password changed successfully');
            setShowPasswordModal(false);
            setSelectedUser(null);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to change password');
        }
    };

    const handleResetPassword = async (userId, newPassword) => {
        try {
            await usersAPI.resetPassword(userId, newPassword);
            toast.success('Password reset successfully');
            setShowResetModal(false);
            setSelectedUser(null);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to reset password');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await usersAPI.delete(userId);
                toast.success('User deleted successfully');
                loadUsers();
            } catch (error) {
                toast.error(error.response?.data?.error || 'Failed to delete user');
            }
        }
    };

    const getRoleColor = (role) => {
        const colors = {
            admin: '#22c55e',
            supervisor: '#3b82f6',
            helpdesk: '#f97316',
            guest: '#9ca3af'
        };
        return colors[role] || '#9ca3af';
    };

    return (
        <div className="users-container">
            <div className="users-header">
                <div>
                    <h1>User Management</h1>
                    <p>Manage system users, roles, and permissions</p>
                </div>
                {isAdmin && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <Plus size={18} /> Create User
                    </button>
                )}
            </div>

            {loading ? (
                <div className="loading">Loading users...</div>
            ) : users.length === 0 ? (
                <div className="empty-state">No users found</div>
            ) : (
                <div className="users-grid">
                    {users.map(user => (
                        <div key={user.id} className="user-card">
                            <div className="user-info">
                                <div className="user-header-row">
                                    <div className="user-name">{user.name}</div>
                                    <div 
                                        className="user-role"
                                        style={{ backgroundColor: getRoleColor(user.role) }}
                                    >
                                        {user.role}
                                    </div>
                                </div>
                                <div className="user-username">@{user.username}</div>
                                <div className="user-id">ID: {user.id}</div>
                            </div>

                            <div className="user-actions">
                                <button
                                    className="action-btn password-btn"
                                    title="Change Password"
                                    onClick={() => {
                                        setSelectedUser(user);
                                        if (user.id === currentUser?.id) {
                                            setShowPasswordModal(true);
                                        } else if (isAdmin) {
                                            setShowResetModal(true);
                                        } else {
                                            toast.error('Only admins can reset other users passwords');
                                        }
                                    }}
                                >
                                    <Lock size={18} />
                                </button>

                                {isAdmin && (
                                    <>
                                        <button
                                            className="action-btn edit-btn"
                                            title="Edit User"
                                            onClick={() => toast.info('Edit feature coming soon')}
                                        >
                                            <Edit size={18} />
                                        </button>

                                        {users.filter(u => u.role === 'admin').length > 1 || user.role !== 'admin' ? (
                                            <button
                                                className="action-btn delete-btn"
                                                title="Delete User"
                                                onClick={() => handleDeleteUser(user.id)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        ) : (
                                            <button
                                                className="action-btn delete-btn"
                                                disabled
                                                title="Cannot delete the last admin"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <CreateUserModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateUser}
                />
            )}

            {showPasswordModal && selectedUser && (
                <ChangePasswordModal
                    user={selectedUser}
                    onClose={() => {
                        setShowPasswordModal(false);
                        setSelectedUser(null);
                    }}
                    onSubmit={handleChangePassword}
                />
            )}

            {showResetModal && selectedUser && (
                <ResetPasswordModal
                    user={selectedUser}
                    onClose={() => {
                        setShowResetModal(false);
                        setSelectedUser(null);
                    }}
                    onSubmit={handleResetPassword}
                />
            )}
        </div>
    );
}
