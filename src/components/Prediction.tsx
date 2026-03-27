import React, { useState } from 'react';
import './Prediction.css';

interface PredictionProps {
    onLogout: () => void;
    onBackToDashboard: () => void;
}

interface PredictionResult {
    prob: number;
    brain: number;
    heart: number;
    class: string;
    alert: string;
}

export const Prediction: React.FC<PredictionProps> = ({
    onLogout,
    onBackToDashboard
}) => {
    const [formData, setFormData] = useState({
        gender: 'Male',
        age: '',
        hypertension: '0',
        heart_disease: '0',
        ever_married: 'Yes',
        work_type: 'Private',
        Residence_type: 'Urban',
        avg_glucose_level: '',
        bmi: '',
        smoking_status: 'never smoked'
    });

    const [result, setResult] = useState<PredictionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                formDataToSend.append(key, String(value));
            });

            const response = await fetch('http://127.0.0.1:5000/predict', {
                method: 'POST',
                body: formDataToSend,
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Prediction failed');
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                setResult(data);
            } else {
                // Parse HTML response to extract result data
                const html = await response.text();
                // This is a simple extraction - you might need to adjust based on actual HTML structure
                const match = html.match(/prob["\']?\s*[:=]\s*([0-9.]+)/);
                if (match) {
                    setResult({
                        prob: parseFloat(match[1]),
                        brain: 0,
                        heart: 0,
                        class: 'Pending',
                        alert: 'Processing...'
                    });
                }
            }
        } catch (err: any) {
            setError(err.message || 'Error making prediction. Ensure Flask server is running.');
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/download_pdf', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to download report');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'stroke_report.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError('Failed to download report');
        }
    };

    const getRiskLevel = (prob: number) => {
        if (prob > 0.75) return 'critical';
        if (prob > 0.5) return 'high';
        if (prob > 0.3) return 'moderate';
        return 'low';
    };

    return (
        <div className="prediction-container">
            <div className="prediction-header">
                <h1>🧠 Stroke Risk Assessment</h1>
                <div className="header-controls">
                    <button className="secondary-btn" onClick={onBackToDashboard}>← Back to Dashboard</button>
                    <button className="logout-btn" onClick={onLogout}>Logout</button>
                </div>
            </div>

            <div className="prediction-content">
                <div className="form-section">
                    <h2>Clinical Information</h2>
                    <p className="section-subtitle">Enter your health parameters for accurate prediction</p>

                    <form onSubmit={handleSubmit} className="prediction-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Age (0-120)</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    placeholder="e.g., 55"
                                    required
                                    disabled={loading}
                                    min="0"
                                    max="120"
                                />
                            </div>

                            <div className="form-group">
                                <label>Hypertension</label>
                                <select
                                    name="hypertension"
                                    value={formData.hypertension}
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    <option value="0">No</option>
                                    <option value="1">Yes</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Heart Disease</label>
                                <select
                                    name="heart_disease"
                                    value={formData.heart_disease}
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    <option value="0">No</option>
                                    <option value="1">Yes</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Ever Married</label>
                                <select
                                    name="ever_married"
                                    value={formData.ever_married}
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Work Type</label>
                                <select
                                    name="work_type"
                                    value={formData.work_type}
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    <option value="Private">Private</option>
                                    <option value="Self-employed">Self-employed</option>
                                    <option value="Govt_job">Govt Job</option>
                                    <option value="children">Children</option>
                                    <option value="Never_worked">Never Worked</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Residence Type</label>
                                <select
                                    name="Residence_type"
                                    value={formData.Residence_type}
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    <option value="Urban">Urban</option>
                                    <option value="Rural">Rural</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Avg Glucose Level (20-5000)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="avg_glucose_level"
                                    value={formData.avg_glucose_level}
                                    onChange={handleChange}
                                    placeholder="e.g., 105.5"
                                    required
                                    disabled={loading}
                                    min="20"
                                    max="5000"
                                />
                            </div>

                            <div className="form-group">
                                <label>BMI (10-200)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="bmi"
                                    value={formData.bmi}
                                    onChange={handleChange}
                                    placeholder="e.g., 28.4"
                                    required
                                    disabled={loading}
                                    min="10"
                                    max="200"
                                />
                            </div>

                            <div className="form-group">
                                <label>Smoking Status</label>
                                <select
                                    name="smoking_status"
                                    value={formData.smoking_status}
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    <option value="never smoked">Never Smoked</option>
                                    <option value="formerly smoked">Formerly Smoked</option>
                                    <option value="smokes">Smokes</option>
                                </select>
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button
                            type="submit"
                            className="predict-btn"
                            disabled={loading}
                        >
                            {loading ? 'Analyzing...' : 'Get Risk Assessment'}
                        </button>
                    </form>
                </div>

                {result && (
                    <div className={`result-section result-${getRiskLevel(result.prob)}`}>
                        <h2>Assessment Result</h2>

                        <div className="result-card">
                            <div className="result-header">
                                <div className="result-class">
                                    <h3>Prediction</h3>
                                    <p className="class-label">{result.class}</p>
                                </div>
                                <div className="result-probability">
                                    <h3>Risk Probability</h3>
                                    <p className="probability-value">{(result.prob * 100).toFixed(1)}%</p>
                                </div>
                            </div>

                            <div className="alert-box">
                                <span className="alert-icon">⚠️</span>
                                <span className="alert-text">{result.alert}</span>
                            </div>

                            <div className="score-grid">
                                <div className="score-item">
                                    <label>Brain Stroke Score</label>
                                    <div className="score-bar">
                                        <div
                                            className="score-fill brain"
                                            style={{ width: `${Math.min(result.brain * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="score-value">{result.brain.toFixed(3)}</p>
                                </div>

                                <div className="score-item">
                                    <label>Heart Stroke Score</label>
                                    <div className="score-bar">
                                        <div
                                            className="score-fill heart"
                                            style={{ width: `${Math.min(result.heart * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="score-value">{result.heart.toFixed(3)}</p>
                                </div>
                            </div>

                            <button className="download-btn" onClick={downloadReport}>
                                📥 Download PDF Report
                            </button>
                        </div>

                        <button className="new-assessment-btn" onClick={() => setResult(null)}>
                            ↻ New Assessment
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
