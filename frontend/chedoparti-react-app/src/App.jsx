import { useState, useEffect } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8989'

function App() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loginData, setLoginData] = useState({ email: 'demo@chedoparti.com', password: 'demo123' })
  const [authResponse, setAuthResponse] = useState(null)

  useEffect(() => {
    checkServices()
  }, [])

  const checkServices = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/health`)
      const data = await response.json()
      setHealth(data)
    } catch (error) {
      console.error('Health check failed:', error)
      setHealth({ status: 'DOWN', error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })
      if (response.ok) {
        const data = await response.json()
        setAuthResponse({ success: true, data })
      } else {
        setAuthResponse({ success: false, error: 'Login failed' })
      }
    } catch (error) {
      setAuthResponse({ success: false, error: error.message })
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎾 Chedoparti</h1>
        <p>Reserve tu cancha favorita</p>
      </header>

      <main className="App-main">
        <section className="status-section">
          <h2>System Status</h2>
          {loading ? (
            <p>Checking services...</p>
          ) : (
            <div className="status-box">
              <p><strong>API Gateway:</strong> {API_BASE}</p>
              <p><strong>Status:</strong> <span className={health?.status === 'UP' ? 'status-up' : 'status-down'}>
                {health?.status || 'UNKNOWN'}
              </span></p>
            </div>
          )}
        </section>

        <section className="login-section">
          <h2>Login Demo</h2>
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              required
            />
            <button type="submit">Login</button>
          </form>

          {authResponse && (
            <div className={`auth-response ${authResponse.success ? 'success' : 'error'}`}>
              {authResponse.success ? (
                <>
                  <p>✅ Login successful!</p>
                  <p><strong>User:</strong> {authResponse.data.name}</p>
                  <p><strong>Email:</strong> {authResponse.data.email}</p>
                  <p><strong>Token:</strong> {authResponse.data.token.substring(0, 20)}...</p>
                </>
              ) : (
                <p>❌ {authResponse.error}</p>
              )}
            </div>
          )}
        </section>

        <section className="info-section">
          <h2>Quick Start</h2>
          <ul>
            <li>API Gateway running on port 8989</li>
            <li>React Dev Server on port 5173</li>
            <li>Demo credentials: demo@chedoparti.com / demo123</li>
            <li>All microservices accessible via /api/* routes</li>
          </ul>
        </section>
      </main>

      <footer className="App-footer">
        <p>Chedoparti - Production-Grade Docker Setup</p>
      </footer>
    </div>
  )
}

export default App
