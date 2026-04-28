import { useEffect, useMemo, useRef, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Login from './components/login'
import OrderPanel from './components/order-panel'
import ProductCard from './components/product-card'
import ProductForm from './components/product-form'
import ProtectedRoute from './components/protected-route'
import Register from './components/register'
import UserRolesPanel from './components/user-roles-panel'
import { AuthProvider, useAuth } from './context/AuthContext'
import { demoOrders, demoProducts, demoUsers } from './data/demoData'
import Layout from './layout/layout'
import {
  API_BASE_URL,
  deleteProduct,
  getMyOrders,
  getProductById,
  getProducts,
  getUsers,
  isApiConfigured,
  saveProduct,
  updateUserRole,
} from './services/api'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <AppRoutes />
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<HomePage />} path="/" />
      <Route element={<CatalogPage />} path="/catalogo" />
      <Route element={<Navigate to="/login" replace />} path="/auth" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<RegisterPage />} path="/registro" />
      <Route element={<ProductDetailPage />} path="/producto/:id" />
      <Route
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
        path="/pedidos"
      />
      <Route
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
        path="/perfil"
      />
      <Route
        element={
          <ProtectedRoute allowRoles={['editor', 'admin']}>
            <DashboardPage mode="editor" />
          </ProtectedRoute>
        }
        path="/dashboard/editor"
      />
      <Route
        element={
          <ProtectedRoute allowRoles={['admin']}>
            <DashboardPage mode="admin" />
          </ProtectedRoute>
        }
        path="/dashboard/admin"
      />
      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  )
}

function resolveLandingRoute(role = 'user') {
  if (role === 'admin') {
    return '/dashboard/admin'
  }

  if (role === 'editor') {
    return '/dashboard/editor'
  }

  return '/pedidos'
}

function PageHeader({ badge, title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[--accent]">{badge}</p>
        <h1 className="mt-2 text-3xl text-[--ink] md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[--muted]">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  )
}

function Notice({ tone = 'info', children }) {
  const className = {
    info: 'status-note',
    success: 'status-note status-note--success',
    error: 'status-note status-note--error',
  }[tone]

  return <p className={className}>{children}</p>
}

function HomePage() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="space-y-5">
      <PageHeader
        badge="Vinacoteca"
        title="Compra y gestiona tu catálogo"
        description="Interfaz simple para clientes, editores y administradores."
        actions={
          <>
            <Link className="btn-primary" to="/catalogo">
              Ver catálogo
            </Link>
            <Link className="btn-secondary" to={isAuthenticated ? resolveLandingRoute(user?.role) : '/login'}>
              {isAuthenticated ? 'Mi panel' : 'Iniciar sesión'}
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="panel">
          <h2 className="text-xl text-[--ink]">Catálogo</h2>
          <p className="mt-2 text-sm text-[--muted]">Consulta vinos y cervezas en una vista dedicada.</p>
        </article>
        <article className="panel">
          <h2 className="text-xl text-[--ink]">Pedidos</h2>
          <p className="mt-2 text-sm text-[--muted]">Crea pedidos y revisa historial con tu cuenta.</p>
        </article>
        <article className="panel">
          <h2 className="text-xl text-[--ink]">Gestión</h2>
          <p className="mt-2 text-sm text-[--muted]">Paneles separados para editor y admin.</p>
        </article>
      </section>
    </div>
  )
}

function CatalogPage() {
  const { isAuthenticated, token, user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [previewMode, setPreviewMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [filters, setFilters] = useState({ search: '', category: 'all' })

  useEffect(() => {
    let ignore = false

    getProducts(token)
      .then((catalog) => {
        if (!ignore) {
          setProducts(catalog)
          setPreviewMode(false)
          setErrorMessage('')
        }
      })
      .catch((error) => {
        if (!ignore) {
          setProducts(demoProducts)
          setPreviewMode(true)
          setErrorMessage(
            error.status === 401
              ? 'Tu API requiere login para listar vinos y cervezas.'
              : error.message,
          )
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [token])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = filters.category === 'all' || product.category === filters.category
      const matchesSearch = `${product.name} ${product.description} ${product.type}`
        .toLowerCase()
        .includes(filters.search.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [filters.category, filters.search, products])

  return (
    <div className="space-y-5">
      <PageHeader
        badge="Catálogo"
        title="Vinos y cervezas"
        description="Busca y filtra productos disponibles."
        actions={
          <>
            <Link className="btn-primary" to={isAuthenticated ? resolveLandingRoute(user?.role) : '/login'}>
              {isAuthenticated ? 'Mi zona' : 'Entrar'}
            </Link>
            <Link className="btn-secondary" to="/pedidos">
              Ir a pedidos
            </Link>
          </>
        }
      />

      {previewMode ? (
        <Notice tone="info">
          {isAuthenticated
            ? `No se pudo cargar el catálogo real desde ${API_BASE_URL} y se muestran productos de vista previa.`
            : 'Sin sesión no se puede cargar el catálogo real porque tu API protege esos endpoints con JWT.'}
          {errorMessage ? ` Motivo: ${errorMessage}` : ''}
        </Notice>
      ) : null}

      <section className="panel space-y-4">
        <div className="grid gap-4 md:grid-cols-[1fr_180px] lg:grid-cols-[1fr_180px_180px]">
          <label className="label" htmlFor="search">
            Buscar producto
            <input
              className="input"
              id="search"
              placeholder="Rioja, IPA, stout..."
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            />
          </label>

          <label className="label" htmlFor="category-filter">
            Categoría
            <select
              className="input"
              id="category-filter"
              value={filters.category}
              onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
            >
              <option value="all">Todas</option>
              <option value="vino">Vinos</option>
              <option value="cerveza">Cervezas</option>
            </select>
          </label>

          <div className="rounded-[1.2rem] bg-[rgba(255,255,255,0.42)] px-4 py-3 text-sm text-[--wood-dark]">
            <p className="text-xs uppercase tracking-[0.22em] text-[--muted]">Resultados</p>
            <p className="mt-1 text-2xl font-semibold text-[--ink]">{filteredProducts.length}</p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-[--muted]">Cargando catálogo...</p>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} canOrder={isAuthenticated} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function AuthPage({ mode = 'login' }) {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  if (isAuthenticated) {
    return (
      <div className="space-y-5">
        <PageHeader
          badge="Sesión activa"
          title={`Ya has iniciado sesión como ${user?.name || user?.email}`}
          description=""
          actions={<Link className="btn-primary" to={resolveLandingRoute(user?.role)}>Ir a mi panel</Link>}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        badge="Acceso"
        title={mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión'}
        description=""
      />

      <div className="grid gap-5 xl:grid-cols-[220px_1fr]">
        <aside className="panel flex flex-col gap-3">
          <button className={mode === 'login' ? 'btn-primary' : 'btn-secondary'} onClick={() => navigate('/login')} type="button">
            Login
          </button>
          <button className={mode === 'register' ? 'btn-primary' : 'btn-secondary'} onClick={() => navigate('/registro')} type="button">
            Registro
          </button>
        </aside>

        {mode === 'register' ? (
          <Register onSwitchToLogin={() => navigate('/login')} />
        ) : (
          <Login onSwitchToRegister={() => navigate('/registro')} />
        )}
      </div>
    </div>
  )
}

function LoginPage() {
  return <AuthPage mode="login" />
}

function RegisterPage() {
  return <AuthPage mode="register" />
}

function ProductDetailPage() {
  const { token } = useAuth()
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    let ignore = false

    getProductById(id, token)
      .then((item) => {
        if (!ignore) {
          setProduct(item)
          setPreviewMode(false)
          setErrorMessage('')
        }
      })
      .catch((error) => {
        const fallback = demoProducts.find((item) => item.id === id)

        if (!ignore) {
          if (fallback) {
            setProduct(fallback)
            setPreviewMode(true)
            setErrorMessage(error.message)
          } else {
            setProduct(null)
            setErrorMessage(error.message)
          }
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [id, token])

  if (loading) {
    return <div className="panel text-sm text-[--muted]">Cargando detalle del producto...</div>
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <PageHeader
          badge="404 controlado"
          title="Producto no encontrado"
          description=""
          actions={<Link className="btn-secondary" to="/catalogo">Volver al catálogo</Link>}
        />
        <Notice tone="error">{errorMessage || 'No existe un producto con ese identificador.'}</Notice>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        badge="Detalle público"
        title={product.name}
        description={product.description}
        actions={
          <>
            <Link className="btn-primary" to={`/pedidos?productId=${product.id}`}>
              Pedir este producto
            </Link>
            <Link className="btn-secondary" to="/catalogo">
              Volver al catálogo
            </Link>
          </>
        }
      />

      {previewMode ? (
        <Notice>
          Este detalle se está mostrando en modo vista previa porque la API aún no ha respondido.
          {errorMessage ? ` ${errorMessage}` : ''}
        </Notice>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="panel min-h-64 overflow-hidden p-0">
          {product.image ? (
            <img
              alt={product.name}
              className="h-full min-h-64 w-full object-cover"
              src={product.image}
              onError={(event) => {
                event.currentTarget.style.display = 'none'
                const fallback = event.currentTarget.nextElementSibling

                if (fallback) {
                  fallback.classList.remove('hidden')
                }
              }}
            />
          ) : null}

          <div
            className={`flex min-h-64 items-center justify-center bg-[linear-gradient(135deg,rgba(109,78,52,0.14),rgba(79,102,74,0.12))] text-center ${product.image ? 'hidden' : ''}`}
          >
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[--accent]">{product.category}</p>
              <h2 className="mt-3 text-4xl text-[--ink]">{product.type}</h2>
              <p className="mt-3 text-sm text-[--muted]">Imagen no disponible</p>
            </div>
          </div>
        </div>

        <div className="panel space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.15rem] bg-[rgba(255,255,255,0.42)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[--muted]">Graduación</p>
              <p className="mt-2 text-xl font-semibold text-[--ink]">{product.abv}%</p>
            </div>
            <div className="rounded-[1.15rem] bg-[rgba(255,255,255,0.42)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[--muted]">Precio</p>
              <p className="mt-2 text-xl font-semibold text-[--ink]">{product.price.toFixed(2)} €</p>
            </div>
            <div className="rounded-[1.15rem] bg-[rgba(255,255,255,0.42)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[--muted]">Stock</p>
              <p className="mt-2 text-xl font-semibold text-[--ink]">{product.stock}</p>
            </div>
          </div>

          <div className="rounded-[1.15rem] bg-[rgba(255,255,255,0.42)] p-4 text-sm leading-6 text-[--wood-dark]">
            <p className="font-semibold">Integración esperada</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Ruta pública para detalle del producto.</li>
              <li>Respuesta 404 controlada si el id no existe.</li>
              <li>Imagen servida por el backend o URL remota.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

function OrdersPage() {
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    let ignore = false

    Promise.allSettled([getProducts(token), getMyOrders(token)])
      .then(([productsResult, ordersResult]) => {
        if (ignore) {
          return
        }

        setProducts(productsResult.status === 'fulfilled' ? productsResult.value : demoProducts)
        setOrders(ordersResult.status === 'fulfilled' ? ordersResult.value : demoOrders)
        setPreviewMode(productsResult.status === 'rejected' || ordersResult.status === 'rejected')
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [token])

  return (
    <div className="space-y-5">
      <PageHeader
        badge="Comandas"
        title="Pedidos"
        description="Crea pedidos y revisa tu historial."
      />

      {previewMode ? (
        <Notice>
          Estás viendo datos de muestra porque la API aún no está accesible. Aun así, el flujo de la UI ya está montado y listo para conectarse.
        </Notice>
      ) : null}

      {loading ? (
        <div className="panel text-sm text-[--muted]">Cargando tus pedidos...</div>
      ) : (
        <OrderPanel
          initialProductId={searchParams.get('productId') || ''}
          orders={orders}
          previewMode={previewMode}
          products={products}
          onOrderCreated={(order) => setOrders((current) => [order, ...current])}
        />
      )}
    </div>
  )
}

function ProfilePage() {
  const { loading, saveProfile, user } = useAuth()
  const userLabel = user?.name || user?.email || 'Usuario'
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
  })
  const [status, setStatus] = useState({ tone: 'info', message: '' })

  useEffect(() => {
    setFormData({
      email: user?.email || '',
      password: '',
    })
  }, [user?.email])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ tone: 'info', message: '' })

    try {
      await saveProfile({
        email: formData.email.trim(),
        ...(formData.password.trim() ? { password: formData.password } : {}),
      })
      setFormData((current) => ({ ...current, password: '' }))
      setStatus({ tone: 'success', message: 'Perfil actualizado correctamente.' })
    } catch (error) {
      setStatus({ tone: 'error', message: error.message })
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        badge="Perfil"
        title="Mi perfil"
        description="Actualiza correo y contraseña."
      />

      <form className="panel space-y-4" onSubmit={handleSubmit}>
        <div className="flex items-center gap-4 rounded-[1.15rem] bg-[rgba(255,255,255,0.42)] p-4">
          {user?.image ? (
            <img
              alt={userLabel}
              className="h-16 w-16 rounded-full border border-[rgba(109,78,52,0.2)] object-cover"
              src={user.image}
              onError={(event) => {
                event.currentTarget.style.display = 'none'
                const fallback = event.currentTarget.nextElementSibling

                if (fallback) {
                  fallback.classList.remove('hidden')
                }
              }}
            />
          ) : null}

          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(109,78,52,0.16)] text-xl font-semibold text-[--wood-dark] ${user?.image ? 'hidden' : ''}`}
          >
            {userLabel.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[--muted]">Tu perfil</p>
            <p className="mt-1 text-lg font-semibold text-[--ink]">{userLabel}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="label" htmlFor="profile-email">
            Correo
            <input
              className="input"
              id="profile-email"
              type="email"
              value={formData.email}
              onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
            />
          </label>

          <label className="label" htmlFor="profile-password">
            Nueva contraseña
            <input
              className="input"
              id="profile-password"
              type="password"
              value={formData.password}
              onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
              placeholder="Déjala vacía para no cambiarla"
            />
          </label>
        </div>

        <div className="rounded-[1.15rem] bg-[rgba(255,255,255,0.42)] p-4 text-sm text-[--wood-dark]">
          <p>
            <strong>Rol actual:</strong> {user?.role || 'user'}
          </p>
          <p className="mt-1 text-[--muted]">La UI bloqueará o permitirá dashboards según este valor.</p>
        </div>

        {status.message ? <Notice tone={status.tone}>{status.message}</Notice> : null}

        <button className="btn-primary" disabled={loading} type="submit">
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}

function DashboardPage({ mode }) {
  const { token } = useAuth()
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [previewMode, setPreviewMode] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const productFormRef = useRef(null)
  const [savingProduct, setSavingProduct] = useState(false)
  const [savingUserId, setSavingUserId] = useState('')
  const [status, setStatus] = useState({ tone: 'info', message: '' })

  useEffect(() => {
    let ignore = false

    Promise.allSettled([getProducts(token), mode === 'admin' ? getUsers(token) : Promise.resolve([])])
      .then(([productsResult, usersResult]) => {
        if (ignore) {
          return
        }

        setProducts(productsResult.status === 'fulfilled' ? productsResult.value : demoProducts)
        setUsers(usersResult.status === 'fulfilled' ? usersResult.value : demoUsers)
        setPreviewMode(productsResult.status === 'rejected' || usersResult.status === 'rejected')
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [mode, token])

  const resolveProductApiErrorMessage = (error, actionLabel = 'guardar') => {
    if (error?.status === 403) {
      return 'No tienes permisos para gestionar productos. Esta acción requiere rol admin.'
    }

    if (error?.status === 404) {
      return `La ruta de API para ${actionLabel} productos no existe o no está publicada.`
    }

    if (error?.status === 401) {
      return 'Tu sesión no es válida o ha caducado. Inicia sesión de nuevo.'
    }

    return error?.message || 'No se pudo completar la operación con la API.'
  }

  const handleProductSubmit = async (formValues) => {
    setSavingProduct(true)

    try {
      const savedProduct = await saveProduct(token, formValues, editingProduct?.id)

      setProducts((current) => {
        const next = editingProduct
          ? current.map((item) => (item.id === editingProduct.id ? savedProduct : item))
          : [savedProduct, ...current]

        return next
      })

      setEditingProduct(null)
      setStatus({ tone: 'success', message: 'Producto guardado en la API.' })
    } catch (error) {
      if (previewMode || !error.status) {
        const localProduct = {
          id: editingProduct?.id || `LOCAL-${Date.now()}`,
          ...formValues,
          price: Number(formValues.price || 0),
          stock: Number(formValues.stock || 0),
        }

        setProducts((current) => {
          const next = editingProduct
            ? current.map((item) => (item.id === editingProduct.id ? localProduct : item))
            : [localProduct, ...current]

          return next
        })

        setEditingProduct(null)
        setStatus({
          tone: 'success',
          message: 'La API aún no responde; se ha actualizado la vista previa local.',
        })
        return
      }

      throw new Error(
        resolveProductApiErrorMessage(error, editingProduct ? 'actualizar' : 'crear'),
      )
    } finally {
      setSavingProduct(false)
    }
  }

  const handleDeleteProduct = async (product) => {
    const shouldDelete = window.confirm(`¿Quieres eliminar "${product.name}"?`)

    if (!shouldDelete) {
      return
    }

    try {
      await deleteProduct(token, product)
      setProducts((current) => current.filter((item) => item.id !== product.id))
      setStatus({ tone: 'success', message: 'Producto eliminado correctamente.' })
    } catch (error) {
      if (previewMode || !error.status) {
        setProducts((current) => current.filter((item) => item.id !== product.id))
        setStatus({ tone: 'success', message: 'Producto eliminado en modo local de vista previa.' })
        return
      }

      setStatus({ tone: 'error', message: resolveProductApiErrorMessage(error, 'eliminar') })
    }
  }

  const handleStartEditingProduct = (product) => {
    setEditingProduct(product)
    setStatus({ tone: 'info', message: `Editando: ${product.name}` })

    requestAnimationFrame(() => {
      productFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const handleRoleChange = async (userId, role) => {
    setSavingUserId(userId)

    try {
      const updatedUser = await updateUserRole(token, userId, role)
      setUsers((current) => current.map((item) => (item.id === userId ? updatedUser : item)))
      setStatus({ tone: 'success', message: 'Rol actualizado correctamente.' })
    } catch (error) {
      if (previewMode || !error.status) {
        setUsers((current) => current.map((item) => (item.id === userId ? { ...item, role } : item)))
        setStatus({ tone: 'success', message: 'Rol cambiado solo en vista previa local.' })
      } else {
        setStatus({ tone: 'error', message: error.message })
      }
    } finally {
      setSavingUserId('')
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        badge={mode === 'admin' ? 'Panel admin' : 'Panel editor'}
        title={mode === 'admin' ? 'Administración completa de la vinacoteca' : 'Gestión del catálogo'}
        description={mode === 'admin' ? 'Gestiona productos y roles.' : 'Gestiona productos.'}
      />

      {previewMode ? (
        <Notice>
          El panel sigue siendo usable en modo vista previa mientras terminas la API. Cuando el backend responda, las operaciones pasarán a ser reales automáticamente.
        </Notice>
      ) : null}

      {status.message ? <Notice tone={status.tone}>{status.message}</Notice> : null}

      {loading ? (
        <div className="panel text-sm text-[--muted]">Cargando dashboard...</div>
      ) : (
        <>
          <div ref={productFormRef}>
            <ProductForm
              key={editingProduct?.id || 'new-product'}
              editingProduct={editingProduct}
              onCancel={() => setEditingProduct(null)}
              onSubmit={handleProductSubmit}
              saving={savingProduct}
            />
          </div>

          <section className="panel space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[--accent]">
                Productos del catálogo
              </p>
              <h2 className="mt-2 text-2xl text-[--ink]">Listado gestionable</h2>
            </div>

            <div className="space-y-3">
              {products.map((product) => (
                <article
                  className="flex flex-col gap-3 rounded-[1.15rem] border border-[rgba(109,78,52,0.12)] bg-[rgba(255,255,255,0.4)] p-4 lg:flex-row lg:items-center lg:justify-between"
                  key={product.id}
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[--accent]">
                      {product.category} · {product.type}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-[--ink]">{product.name}</h3>
                    <p className="mt-1 max-w-2xl text-sm text-[--muted]">{product.description}</p>
                    <p className="mt-2 text-sm font-medium text-[--wood-dark]">
                      {product.price.toFixed(2)} € · stock {product.stock}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button className="btn-secondary" onClick={() => handleStartEditingProduct(product)} type="button">
                      Editar
                    </button>
                    <button className="btn-danger" onClick={() => handleDeleteProduct(product)} type="button">
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {mode === 'admin' ? (
            <UserRolesPanel users={users} onRoleChange={handleRoleChange} savingUserId={savingUserId} />
          ) : null}
        </>
      )}
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        badge="Ruta no encontrada"
        title="Esta página no existe"
        description=""
        actions={<Link className="btn-secondary" to="/">Volver al inicio</Link>}
      />
    </div>
  )
}

export default App
