import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import './Modals.css';

export default function ChangePasswordModal({ user, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.currentPassword || !formData.newPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (formData.currentPassword === formData.newPassword) {
            toast.error('New password must be different from current password');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(user.id, formData.currentPassword, formData.newPassword);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Change Password</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="user-info-display">
                        <p><strong>User:</strong> {user.name}</p>
                        <p><strong>Username:</strong> @{user.username}</p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            className="form-input"
                            placeholder="Enter your current password"
                            value={formData.currentPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            className="form-input"
                            placeholder="Enter new password (min 6 characters)"
                            value={formData.newPassword}
                            onChange={handleChange}
                            minLength="6"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-input"
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            minLength="6"
                        />
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
