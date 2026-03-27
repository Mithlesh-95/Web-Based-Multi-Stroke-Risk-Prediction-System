import React from 'react';
import './Dashboard.css';

interface DashboardProps {
    username: string;
    onLogout: () => void;
    onNavigateToPrediction: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
    username,
    onLogout,
    onNavigateToPrediction
}) => {
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>Welcome, <span>{username}</span></h1>
                    <p className="dashboard-subtitle">NeuroCardia AI - Stroke Risk Prediction System</p>
                </div>
                <button className="logout-btn" onClick={onLogout}>Logout</button>
            </div>

            <div className="dashboard-content">
                <div className="dashboard-grid">
                    {/* Quick Stats */}
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <h3>Risk Assessment</h3>
                        <p>Get comprehensive stroke risk analysis based on clinical parameters</p>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🧠</div>
                        <h3>AI Powered</h3>
                        <p>Advanced deep neural network model for multi-dimensional prediction</p>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📄</div>
                        <h3>Report Generation</h3>
                        <p>Download detailed PDF reports of your assessment results</p>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🔒</div>
                        <h3>Secure & Private</h3>
                        <p>Your health data is processed with enterprise-grade security</p>
                    </div>
                </div>

                {/* Main CTA */}
                <div className="dashboard-cta">
                    <div className="cta-card">
                        <h2>Start Stroke Risk Assessment</h2>
                        <p>Answer clinical questions about your health to receive a personalized risk prediction</p>
                        <button className="primary-btn" onClick={onNavigateToPrediction}>
                            Begin Assessment →
                        </button>
                    </div>
                </div>

                {/* Information Section */}
                <div className="info-section">
                    <h3>How It Works</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <div className="number">1</div>
                            <h4>Provide Information</h4>
                            <p>Enter your clinical parameters and health information</p>
                        </div>
                        <div className="info-item">
                            <div className="number">2</div>
                            <h4>AI Analysis</h4>
                            <p>Our AI model analyzes the data with advanced algorithms</p>
                        </div>
                        <div className="info-item">
                            <div className="number">3</div>
                            <h4>Get Results</h4>
                            <p>Receive comprehensive risk assessment and recommendations</p>
                        </div>
                        <div className="info-item">
                            <div className="number">4</div>
                            <h4>Download Report</h4>
                            <p>Export your results as a detailed PDF report</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
