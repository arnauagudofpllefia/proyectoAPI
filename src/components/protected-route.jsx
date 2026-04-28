import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ allowRoles = [], children }) {
  const { bootstrapping, isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (bootstrapping) {
    return (
      <div className="panel flex min-h-[240px] items-center justify-center text-sm text-[--muted]">
        Comprobando tu sesión...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  if (allowRoles.length > 0 && !allowRoles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
