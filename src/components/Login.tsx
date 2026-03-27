import React, { useState } from 'react';
import './Auth.css';

interface LoginProps {
    onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await fetch('http://127.0.0.1:5000/', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (response.ok) {
                // Check if response is HTML (successful redirect) or JSON (error)
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('text/html')) {
                    onLoginSuccess();
                } else {
                    setError('Invalid login credentials');
                }
            } else {
                setError('Invalid login credentials');
            }
        } catch (err) {
            setError('Connection error. Make sure Flask is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>NeuroCardia AI</h1>
                    <p>Stroke Risk Prediction</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        className="auth-btn"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>New user? <a href="#register" onClick={(e) => {
                        e.preventDefault();
                        // Component can handle register navigation
                    }}>Create account</a></p>
                </div>
            </div>
        </div>
    );
};
