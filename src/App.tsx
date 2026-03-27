import { useState, useEffect } from 'react'
import Spline from '@splinetool/react-spline'
import { ProblemStatement } from './components/ProblemStatement'
import { RiskAssessment } from './components/RiskAssessment'
import { Login } from './components/Login'
import { Register } from './components/Register'
import { Dashboard } from './components/Dashboard'
import { Prediction } from './components/Prediction'
import './App.css'

type AppView = 'landing' | 'login' | 'register' | 'dashboard' | 'prediction'

function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing')
  const [username, setUsername] = useState('')

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/dashboard', {
          credentials: 'include'
        })
        if (response.ok) {
          setCurrentView('dashboard')
        }
      } catch (err) {
        // User not logged in
      }
    }
    checkSession()
  }, [])

  const handleLoginSuccess = () => {
    setCurrentView('dashboard')
  }

  const handleRegisterSuccess = () => {
    setCurrentView('login')
  }

  const handleLogout = async () => {
    try {
      await fetch('http://127.0.0.1:5000/logout', {
        credentials: 'include'
      })
    } catch (err) {
      console.error('Logout error:', err)
    }
    setCurrentView('landing')
    setUsername('')
  }

  if (currentView === 'login') {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <button
            onClick={() => setCurrentView('landing')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8b5cf6',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Back to Home
          </button>
        </div>
      </>
    )
  }

  if (currentView === 'register') {
    return (
      <>
        <Register onRegisterSuccess={handleRegisterSuccess} />
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <button
            onClick={() => setCurrentView('login')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8b5cf6',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Back to Login
          </button>
        </div>
      </>
    )
  }

  if (currentView === 'dashboard') {
    return (
      <Dashboard
        username={username || 'User'}
        onLogout={handleLogout}
        onNavigateToPrediction={() => setCurrentView('prediction')}
      />
    )
  }

  if (currentView === 'prediction') {
    return (
      <Prediction
        onLogout={handleLogout}
        onBackToDashboard={() => setCurrentView('dashboard')}
      />
    )
  }

  // Landing page
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

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
              <button
                className="cta-button"
                onClick={() => setCurrentView('login')}
              >
                Sign In
              </button>
              <button
                className="cta-button"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                onClick={() => setCurrentView('register')}
              >
                Create Account
              </button>
            </div>

            <button
              className="cta-button"
              style={{
                marginTop: '1rem',
                background: 'transparent',
                border: 'none'
              }}
              onClick={() => document.getElementById('risk-assessment')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Demo
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
