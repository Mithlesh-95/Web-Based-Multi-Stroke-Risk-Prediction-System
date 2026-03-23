import Spline from '@splinetool/react-spline'
import { ProblemStatement } from './components/ProblemStatement'
import { RiskAssessment } from './components/RiskAssessment'
import './App.css'

function App() {
  return (
    <>
      <div className="hero-container">

        {/* Left Column: Heart Model */}
        <div className="col-side spline-wrapper heart-wrapper">
          <div className="ambient-glow" />
          <Spline scene="https://prod.spline.design/zzpvWAsdHgWYIkbc/scene.splinecode" />
        </div>

        {/* Center Column: Title and CTA */}
        <div className="col-center">
          <div className="hero-glass-card animate-fade-up">
            <h1 className="hero-title">
              NeuroCardia AI
            </h1>

            <h2 className="hero-headline">
              Predict.<br />
              <span className="text-gradient">The Unseen.</span>
            </h2>

            <p className="hero-subtitle">
              Multi-Stroke Risk Intelligence
            </p>

            <button
              className="cta-button"
              onClick={() => document.getElementById('risk-assessment')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Risk Assessment
            </button>
          </div>
        </div>

        {/* Right Column: Brain Model */}
        <div className="col-side spline-wrapper">
          <div className="ambient-glow" />
          <Spline scene="https://prod.spline.design/s1wTmEDvxbizPCr0/scene.splinecode" />
        </div>

      </div>
      <ProblemStatement />
      <RiskAssessment />
    </>
  )
}

export default App
