import { useState } from 'react'
import Login from './components/login'
import Register from './components/register'
import Layout from './layout/layout'

function App() {
  const [authView, setAuthView] = useState('login')

  return (
    <Layout>
        {authView === 'login' ? (
          <Login onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <Register onSwitchToLogin={() => setAuthView('login')} />
        )}
    </Layout>
  )
}

export default App
