
import React, { useState } from 'react';
import './RiskAssessment.css';

interface FormData {
    gender: string;
    age: number | '';
    hypertension: string;
    heart_disease: string;
    ever_married: string;
    work_type: string;
    Residence_type: string;
    avg_glucose_level: number | '';
    bmi: number | '';
    smoking_status: string;
}

interface PredictionResult {
    ischemic_stroke_risk: number;
    hemorrhagic_stroke_risk: number;
    recurrent_stroke_risk: number;
    ischemic_stroke_prob: number;
    hemorrhagic_stroke_prob: number;
    recurrent_stroke_prob: number;
}

export const RiskAssessment: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
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
            // Convert types as needed by API (API expects raw strings for cats, numbers for numeric)
            // But we need to ensure numbers are actually numbers

            // 1. Validate Numeric Ranges
            const age = Number(formData.age);
            const glucose = Number(formData.avg_glucose_level);
            const bmi = Number(formData.bmi);

            if (isNaN(age) || age < 0 || age > 120) {
                throw new Error("Age must be between 0 and 120.");
            }
            if (isNaN(glucose) || glucose < 20 || glucose > 600) {
                throw new Error("Avg Glucose Level must be between 20 and 600.");
            }
            if (isNaN(bmi) || bmi < 10 || bmi > 100) {
                throw new Error("BMI must be between 10 and 100.");
            }
            if (!formData.age || !formData.avg_glucose_level || !formData.bmi) {
                throw new Error("Please fill in all numeric fields.");
            }

            const payload = {
                ...formData,
                age: age,
                avg_glucose_level: glucose,
                bmi: bmi,

                // Convert '0'/'1' strings back to numbers if needed, strictly speaking API might handle it or we cast it
                // API code: df[col] = pd.to_numeric(df[col]), so strings '0'/'1' are fine for numeric columns
                // However, for categorical columns, we send the string label.
                // hypertension and heart_disease were trained as 0/1 integers.
                hypertension: Number(formData.hypertension),
                heart_disease: Number(formData.heart_disease)
            };

            const response = await fetch('http://127.0.0.1:5000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Prediction failed');
            }

            const data = await response.json();
            setResult(data);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="risk-assessment" className="risk-section">
            <div className="risk-container">
                <h2 className="risk-title">AI Risk Assessment</h2>
                <p className="risk-subtitle">Enter clinical parameters for multi-dimensional stroke analysis.</p>

                <div className="risk-layout">
                    {/* Form Column */}
                    <div className="risk-form-card">
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Age (0-120)</label>
                                    <input type="number" name="age" value={formData.age} onChange={handleChange} required min="0" max="120" placeholder="e.g. 55" />
                                </div>

                                <div className="form-group">
                                    <label>Hypertension</label>
                                    <select name="hypertension" value={formData.hypertension} onChange={handleChange}>
                                        <option value="0">No</option>
                                        <option value="1">Yes</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Heart Disease</label>
                                    <select name="heart_disease" value={formData.heart_disease} onChange={handleChange}>
                                        <option value="0">No</option>
                                        <option value="1">Yes</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Ever Married</label>
                                    <select name="ever_married" value={formData.ever_married} onChange={handleChange}>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Work Type</label>
                                    <select name="work_type" value={formData.work_type} onChange={handleChange}>
                                        <option value="Private">Private</option>
                                        <option value="Self-employed">Self-employed</option>
                                        <option value="Govt_job">Govt Job</option>
                                        <option value="children">Children</option>
                                        <option value="Never_worked">Never Worked</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Residence Type</label>
                                    <select name="Residence_type" value={formData.Residence_type} onChange={handleChange}>
                                        <option value="Urban">Urban</option>
                                        <option value="Rural">Rural</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Avg Glucose Level (20-600)</label>
                                    <input type="number" step="0.01" name="avg_glucose_level" value={formData.avg_glucose_level} onChange={handleChange} required min="20" max="600" placeholder="e.g. 105.5" />
                                </div>

                                <div className="form-group">
                                    <label>BMI (10-100)</label>
                                    <input type="number" step="0.1" name="bmi" value={formData.bmi} onChange={handleChange} required min="10" max="100" placeholder="e.g. 28.4" />
                                </div>

                                <div className="form-group">
                                    <label>Smoking Status</label>
                                    <select name="smoking_status" value={formData.smoking_status} onChange={handleChange}>
                                        <option value="never smoked">Never Smoked</option>
                                        <option value="formerly smoked">Formerly Smoked</option>
                                        <option value="smokes">Smokes</option>
                                        <option value="Unknown">Unknown</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? 'Analyzing...' : 'Run Analysis'}
                            </button>
                        </form>
                        {error && <div className="error-msg">{error}</div>}
                    </div>

                    {/* Result Column */}
                    <div className="risk-results-card">
                        {!result ? (
                            <div className="placeholder-result">
                                <div className="spinner-placeholder"></div>
                                <p>Awaiting Data Entry...</p>
                            </div>
                        ) : (
                            <div className="results-content animate-fade-in">
                                <h3>Assessment Report</h3>

                                <div className="result-item">
                                    <div className="result-header">
                                        <span>Ischemic Stroke Risk</span>
                                        <span className={result.ischemic_stroke_risk ? 'risk-high' : 'risk-low'}>
                                            {result.ischemic_stroke_risk ? 'DETECTED' : 'LOW'}
                                        </span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${result.ischemic_stroke_prob * 100}%`, background: result.ischemic_stroke_risk ? '#ef4444' : '#10b981' }}></div>
                                    </div>
                                    <span className="prob-label">{(result.ischemic_stroke_prob * 100).toFixed(1)}% Probability</span>
                                </div>

                                <div className="result-item">
                                    <div className="result-header">
                                        <span>Hemorrhagic Stroke Risk</span>
                                        <span className={result.hemorrhagic_stroke_risk ? 'risk-high' : 'risk-low'}>
                                            {result.hemorrhagic_stroke_risk ? 'DETECTED' : 'LOW'}
                                        </span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${result.hemorrhagic_stroke_prob * 100}%`, background: result.hemorrhagic_stroke_risk ? '#ef4444' : '#10b981' }}></div>
                                    </div>
                                    <span className="prob-label">{(result.hemorrhagic_stroke_prob * 100).toFixed(1)}% Probability</span>
                                </div>

                                <div className="result-item">
                                    <div className="result-header">
                                        <span>Recurrent Stroke Risk</span>
                                        <span className={result.recurrent_stroke_risk ? 'risk-high' : 'risk-low'}>
                                            {result.recurrent_stroke_risk ? 'DETECTED' : 'LOW'}
                                        </span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${result.recurrent_stroke_prob * 100}%`, background: result.recurrent_stroke_risk ? '#ef4444' : '#10b981' }}></div>
                                    </div>
                                    <span className="prob-label">{(result.recurrent_stroke_prob * 100).toFixed(1)}% Probability</span>
                                </div>

                                <div className="disclaimer">
                                    * This AI model is for educational purposes only and does not constitute a medical diagnosis. Consult a professional.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
