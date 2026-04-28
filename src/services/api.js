const RAW_API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/$/, '')
export const isApiConfigured = Boolean(import.meta.env.VITE_API_URL)

const endpointGroups = {
  products: ['/api/productes', '/api/productos', '/api/products'],
  wines: ['/api/vins', '/api/vinos', '/api/wines'],
  beers: ['/api/cerveses', '/api/cervezas', '/api/beers'],
  login: ['/api/auth/login', '/api/login'],
  register: ['/api/auth/registro', '/api/auth/register', '/api/auth/registre'],
  profile: ['/api/auth/perfil', '/api/auth/profile'],
  orders: ['/api/comandes', '/api/pedidos', '/api/orders'],
  myOrders: ['/api/comandes/me', '/api/pedidos/me', '/api/orders/me'],
  users: ['/api/usuaris', '/api/usuarios', '/api/users'],
}

function createHttpError(message, status, body) {
  const error = new Error(message)
  error.status = status
  error.body = body
  return error
}

function isAbsoluteUrl(value = '') {
  return /^https?:\/\//i.test(value)
}

function pickFirst(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function normalizeRole(role = 'user') {
  const normalized = String(role).toLowerCase()

  if (normalized.includes('admin')) {
    return 'admin'
  }

  if (normalized.includes('edit')) {
    return 'editor'
  }

  return 'user'
}

function resolveArray(payload, keys = []) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  for (const key of [...keys, 'data', 'items', 'results']) {
    if (Array.isArray(payload[key])) {
      return payload[key]
    }
  }

  return []
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  let payload = null

  if (contentType.includes('application/json')) {
    payload = await response.json()
  } else {
    const text = await response.text()

    try {
      payload = text ? JSON.parse(text) : null
    } catch {
      payload = text
    }
  }

  if (!response.ok) {
    const message =
      payload?.message || payload?.msg || payload?.error || `Error HTTP ${response.status}`

    throw createHttpError(message, response.status, payload)
  }

  return payload
}

async function request(path, options = {}, token) {
  const headers = new Headers(options.headers || {})

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  return parseResponse(response)
}

async function requestWithFallback(paths, buildOptions, token) {
  let lastError = null

  for (const path of paths) {
    try {
      return await request(path, buildOptions(path), token)
    } catch (error) {
      lastError = error

      if (![404, 405].includes(error.status ?? 0)) {
        throw error
      }
    }
  }

  throw lastError || new Error('No se encontró un endpoint compatible.')
}

function resolveAssetUrl(value) {
  if (!value) {
    return ''
  }

  if (isAbsoluteUrl(value)) {
    return value
  }

  const normalizedPath = value.startsWith('/') ? value : `/${value}`
  return `${API_BASE_URL}${normalizedPath}`
}

export function normalizeProduct(raw = {}, forcedCategory = '') {
  const rawCategory = pickFirst(
    forcedCategory,
    raw.category,
    raw.categoria,
    raw.tipoProducto,
    raw.kind,
  )

  const normalizedCategory = String(rawCategory || 'vino').toLowerCase().includes('cer')
    ? 'cerveza'
    : 'vino'

  return {
    id: pickFirst(raw._id, raw.id, raw.slug, crypto.randomUUID()),
    name: pickFirst(raw.nombre, raw.name, raw.titulo, 'Producto sin nombre'),
    description: pickFirst(raw.descripcion, raw.description, raw.notas, 'Sin descripción.'),
    category: normalizedCategory,
    type: pickFirst(raw.tipo, raw.style, raw.variedad, 'general'),
    abv: String(pickFirst(raw.graduacion, raw.abv, raw.alcohol, '0')),
    price: Number(pickFirst(raw.precio, raw.price, raw.pvp, 0)),
    stock: Number(pickFirst(raw.stock, raw.cantidad, raw.units, 0)),
    image: resolveAssetUrl(pickFirst(raw.imagen, raw.image, raw.foto, raw.imageUrl, '')),
  }
}

export function normalizeUser(raw = {}) {
  return {
    id: pickFirst(raw._id, raw.id, raw.uid, crypto.randomUUID()),
    name: pickFirst(raw.nombre, raw.name, raw.username, 'Usuario'),
    email: pickFirst(raw.email, raw.correo, 'sin-correo@example.com'),
    role: normalizeRole(pickFirst(raw.rol, raw.role, 'user')),
    image: resolveAssetUrl(pickFirst(raw.foto, raw.image, raw.avatar, '')),
  }
}

function normalizeOrderItem(raw = {}) {
  return {
    id: pickFirst(raw._id, raw.id, crypto.randomUUID()),
    name: pickFirst(raw.nombre, raw.name, raw.productName, 'Producto'),
    quantity: Number(pickFirst(raw.cantidad, raw.quantity, 1)),
    price: Number(pickFirst(raw.precio, raw.price, 0)),
  }
}

export function normalizeOrder(raw = {}) {
  const items = resolveArray(raw.items || raw.productos || raw.lineas || raw.orderLines || [])

  return {
    id: pickFirst(raw._id, raw.id, raw.code, crypto.randomUUID()),
    createdAt: pickFirst(raw.createdAt, raw.fecha, new Date().toISOString()),
    status: pickFirst(raw.estado, raw.status, 'pendiente'),
    total: Number(pickFirst(raw.total, raw.importeTotal, 0)),
    items: items.map((item) => normalizeOrderItem(item)),
    notes: pickFirst(raw.notas, raw.notes, ''),
  }
}

function extractAuthPayload(payload = {}) {
  const user = normalizeUser(payload.user || payload.usuario || payload.profile || payload.data || {})
  const token = pickFirst(payload.token, payload.jwt, payload.accessToken, '')

  return { token, user }
}

function buildProductPayload(product) {
  const baseFields = {
    nombre: product.name,
    descripcion: product.description,
    tipo: product.type,
    graduacion: product.abv,
    precio: Number(product.price || 0),
    stock: Number(product.stock || 0),
    categoria: product.category,
    category: product.category,
    tipoProducto: product.category,
  }

  if (product.imageFile) {
    const formData = new FormData()

    Object.entries(baseFields).forEach(([key, value]) => {
      formData.append(key, String(value ?? ''))
    })

    formData.append('image', product.imageFile)
    formData.append('imagen', product.imageFile)
    formData.append('foto', product.imageFile)
    return formData
  }

  return JSON.stringify(baseFields)
}

export async function login(credentials) {
  const payload = await requestWithFallback(
    endpointGroups.login,
    () => ({ method: 'POST', body: JSON.stringify(credentials) }),
  )

  return extractAuthPayload(payload)
}

export async function register(data) {
  const formData = new FormData()

  formData.append('nombre', data.name)
  formData.append('name', data.name)
  formData.append('email', data.email)
  formData.append('password', data.password)

  if (data.photo) {
    formData.append('foto', data.photo)
    formData.append('image', data.photo)
  }

  const payload = await requestWithFallback(
    endpointGroups.register,
    () => ({ method: 'POST', body: formData }),
  )

  return payload
}

export async function getProfile(token) {
  const payload = await requestWithFallback(endpointGroups.profile, () => ({ method: 'GET' }), token)
  return normalizeUser(payload.user || payload.usuario || payload.profile || payload.data || payload)
}

export async function updateProfile(token, profile) {
  const payload = await requestWithFallback(
    endpointGroups.profile,
    () => ({ method: 'PUT', body: JSON.stringify(profile) }),
    token,
  )

  return normalizeUser(payload.user || payload.usuario || payload.profile || payload.data || payload)
}

export async function getProducts() {
  try {
    const payload = await requestWithFallback(endpointGroups.products, () => ({ method: 'GET' }))
    const products = resolveArray(payload, ['productes', 'productos', 'products'])
    return products.map((item) => normalizeProduct(item))
  } catch {
    const [winesResult, beersResult] = await Promise.allSettled([
      requestWithFallback(endpointGroups.wines, () => ({ method: 'GET' })),
      requestWithFallback(endpointGroups.beers, () => ({ method: 'GET' })),
    ])

    const wines = winesResult.status === 'fulfilled'
      ? resolveArray(winesResult.value, ['vins', 'vinos', 'wines']).map((item) => normalizeProduct(item, 'vino'))
      : []

    const beers = beersResult.status === 'fulfilled'
      ? resolveArray(beersResult.value, ['cerveses', 'cervezas', 'beers']).map((item) => normalizeProduct(item, 'cerveza'))
      : []

    if (!wines.length && !beers.length) {
      throw new Error('No se ha podido cargar el catálogo desde la API.')
    }

    return [...wines, ...beers]
  }
}

export async function getProductById(id) {
  const paths = [
    ...endpointGroups.products.map((path) => `${path}/${id}`),
    ...endpointGroups.wines.map((path) => `${path}/${id}`),
    ...endpointGroups.beers.map((path) => `${path}/${id}`),
  ]

  const payload = await requestWithFallback(paths, () => ({ method: 'GET' }))

  return normalizeProduct(
    payload.producte || payload.producto || payload.product || payload.data || payload,
  )
}

export async function createOrder(token, order) {
  const payload = await requestWithFallback(
    endpointGroups.orders,
    () => ({ method: 'POST', body: JSON.stringify(order) }),
    token,
  )

  return normalizeOrder(payload.comanda || payload.pedido || payload.order || payload.data || payload)
}

export async function getMyOrders(token) {
  const payload = await requestWithFallback(endpointGroups.myOrders, () => ({ method: 'GET' }), token)
  const orders = resolveArray(payload, ['comandes', 'pedidos', 'orders'])
  return orders.map((item) => normalizeOrder(item))
}

export async function saveProduct(token, product, productId = '') {
  const preferredPaths = product.category === 'cerveza' ? endpointGroups.beers : endpointGroups.wines
  const paths = [
    ...endpointGroups.products,
    ...preferredPaths,
  ].map((path) => (productId ? `${path}/${productId}` : path))

  const payload = await requestWithFallback(
    paths,
    () => ({ method: productId ? 'PUT' : 'POST', body: buildProductPayload(product) }),
    token,
  )

  return normalizeProduct(
    payload.producte || payload.producto || payload.product || payload.data || payload,
    product.category,
  )
}

export async function deleteProduct(token, product) {
  const preferredPaths = product.category === 'cerveza' ? endpointGroups.beers : endpointGroups.wines
  const productId = product.id || product._id
  const paths = [
    ...endpointGroups.products,
    ...preferredPaths,
  ].map((path) => `${path}/${productId}`)

  return requestWithFallback(paths, () => ({ method: 'DELETE' }), token)
}

export async function getUsers(token) {
  const payload = await requestWithFallback(endpointGroups.users, () => ({ method: 'GET' }), token)
  const users = resolveArray(payload, ['usuaris', 'usuarios', 'users'])
  return users.map((item) => normalizeUser(item))
}

export async function updateUserRole(token, userId, role) {
  const patchPaths = endpointGroups.users.map((path) => `${path}/${userId}/rol`)
  const alternativePaths = endpointGroups.users.map((path) => `/${path.split('/').filter(Boolean).join('/')}/${userId}/role`)
  const payload = await requestWithFallback(
    [...patchPaths, ...alternativePaths],
    () => ({ method: 'PATCH', body: JSON.stringify({ rol: role, role }) }),
    token,
  )

  return normalizeUser(payload.user || payload.usuario || payload.data || payload)
}
