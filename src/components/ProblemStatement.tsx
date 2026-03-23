import React from 'react';
import './ProblemStatement.css';

export const ProblemStatement: React.FC = () => {
    return (
        <section className="problem-statement-section">
            <div className="problem-content">
                <h2 className="problem-title">Problem Statement</h2>

                <p className="problem-intro">
                    Stroke remains a leading cause of disability worldwide, yet traditional risk assessment models often identify patients only after critical warning signs appear.
                </p>

                <span className="problem-label">CURRENT LIMITATIONS</span>

                <ul className="problem-list">
                    <li>Existing models focus primarily on population-level research rather than individual patient prediction.</li>
                    <li>Current algorithms lack accessible, real-time web-based implementation for clinical use.</li>
                    <li>Most systems predict single-event risks, failing to account for multi-stroke recurrence patterns.</li>
                    <li>Complex medical data is rarely presented in a format accessible to patients and non-specialists.</li>
                </ul>

                <p className="problem-conclusion">
                    There is an urgent need for a precise, machine-learning-driven system capable of analyzing multi-dimensional risk factors to predict cumulative stroke probability before an event occurs.
                </p>
            </div>
        </section>
    );
};
