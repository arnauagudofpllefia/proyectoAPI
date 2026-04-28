const RAW_API_BASE_URL = import.meta.env.VITE_API_URL || ''

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
  users: ['/api/auth/usuaris', '/api/usuaris', '/api/usuarios', '/api/users'],
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

  if (normalized.includes('usuari') || normalized.includes('user')) {
    return 'user'
  }

  return 'user'
}

function mapRoleToApi(role = 'user') {
  return role === 'user' ? 'usuari' : role
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

async function parseResponse(response, path = '') {
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
    const rawMessage = payload?.message || payload?.msg || payload?.error || ''
    const notFoundHint =
      response.status === 404
        ? `Endpoint no encontrado (${path || 'ruta desconocida'}). Revisa que el frontend esté en Vite dev o que la API/proxy esté activa.`
        : ''
    const message = rawMessage || notFoundHint || `Error HTTP ${response.status}`

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

  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    })
  } catch (error) {
    throw createHttpError(
      'No se pudo conectar con la API. Si usas Render desde local, arranca Vite para usar el proxy o revisa CORS.',
      0,
      error,
    )
  }

  return parseResponse(response, path)
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
    image: resolveAssetUrl(pickFirst(raw.imatge, raw.imagen, raw.image, raw.foto, raw.imageUrl, '')),
  }
}

export function normalizeUser(raw = {}) {
  const email = pickFirst(raw.email, raw.correo, 'sin-correo@example.com')

  return {
    id: pickFirst(raw._id, raw.id, raw.uid, crypto.randomUUID()),
    name: pickFirst(raw.nombre, raw.name, raw.username, email.split('@')[0] || 'Usuario'),
    email,
    role: normalizeRole(pickFirst(raw.rol, raw.role, 'user')),
    image: resolveAssetUrl(pickFirst(raw.imatge, raw.foto, raw.image, raw.avatar, '')),
  }
}

function normalizeOrderItem(raw = {}) {
  return {
    id: pickFirst(raw._id, raw.id, raw.producteId, crypto.randomUUID()),
    name: pickFirst(raw.nom, raw.nombre, raw.name, raw.productName, 'Producto'),
    quantity: Number(pickFirst(raw.quantitat, raw.cantidad, raw.quantity, 1)),
    price: Number(pickFirst(raw.preuUnitari, raw.precio, raw.price, 0)),
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
  const user = normalizeUser(
    payload.user || payload.usuario || payload.usuari || payload.profile || payload.data || {},
  )
  const token = pickFirst(payload.token, payload.jwt, payload.accessToken, '')

  return { token, user }
}

function buildProductFields(product) {
  return {
    nombre: product.name,
    descripcion: product.description,
    tipo: product.type,
    graduacion: product.abv,
    precio: Number(product.price || 0),
  }
}

function buildProductCreatePayload(product) {
  const formData = new FormData()
  const baseFields = buildProductFields(product)

  Object.entries(baseFields).forEach(([key, value]) => {
    formData.append(key, String(value ?? ''))
  })

  if (product.imageFile) {
    formData.append('imatge', product.imageFile)
  }

  return formData
}

function buildProductUpdatePayload(product) {
  return JSON.stringify(buildProductFields(product))
}

function buildProductImagePayload(product) {
  const formData = new FormData()
  formData.append('imatge', product.imageFile)
  return formData
}

function extractProductEntity(payload = {}) {
  const entity =
    payload?.vino ??
    payload?.cerveza ??
    payload?.producte ??
    payload?.producto ??
    payload?.product ??
    payload?.data ??
    null

  if (entity && typeof entity === 'object') {
    return entity
  }

  if (payload && typeof payload === 'object' && (payload._id || payload.id || payload.nombre || payload.name)) {
    return payload
  }

  return null
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
    formData.append('imatge', data.photo)
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
  return normalizeUser(payload.user || payload.usuario || payload.usuari || payload.profile || payload.data || payload)
}

export async function updateProfile(token, profile) {
  const payload = await requestWithFallback(
    endpointGroups.profile,
    () => ({ method: 'PUT', body: JSON.stringify(profile) }),
    token,
  )

  return extractAuthPayload(payload)
}

export async function getProducts(token) {
  const [winesResult, beersResult] = await Promise.allSettled([
    requestWithFallback(endpointGroups.wines, () => ({ method: 'GET' }), token),
    requestWithFallback(endpointGroups.beers, () => ({ method: 'GET' }), token),
  ])

  const wines =
    winesResult.status === 'fulfilled'
      ? resolveArray(winesResult.value, ['vins', 'vinos', 'wines']).map((item) => normalizeProduct(item, 'vino'))
      : []

  const beers =
    beersResult.status === 'fulfilled'
      ? resolveArray(beersResult.value, ['cerveses', 'cervezas', 'beers']).map((item) => normalizeProduct(item, 'cerveza'))
      : []

  if (!wines.length && !beers.length) {
    const error = winesResult.status === 'rejected' ? winesResult.reason : beersResult.reason
    throw error || new Error('No se ha podido cargar el catálogo desde la API.')
  }

  return [...wines, ...beers]
}

export async function getProductById(id, token) {
  const paths = [...endpointGroups.wines, ...endpointGroups.beers].map((path) => `${path}/${id}`)

  const payload = await requestWithFallback(paths, () => ({ method: 'GET' }), token)

  return normalizeProduct(
    payload.vino || payload.cerveza || payload.producte || payload.producto || payload.product || payload.data || payload,
  )
}

export async function createOrder(token, order) {
  const items = (order.items || []).map((item) => ({
    tipus: item.tipus || item.category || item.tipo,
    producteId: item.producteId || item.productId,
    quantitat: Number(item.quantitat || item.cantidad || item.quantity || 1),
  }))

  const payload = await requestWithFallback(
    endpointGroups.orders,
    () => ({ method: 'POST', body: JSON.stringify({ items }) }),
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
  const primaryPaths = product.category === 'cerveza' ? endpointGroups.beers : endpointGroups.wines
  const secondaryPaths = product.category === 'cerveza' ? endpointGroups.wines : endpointGroups.beers

  if (!productId) {
    const payload = await requestWithFallback(
      primaryPaths,
      () => ({ method: 'POST', body: buildProductCreatePayload(product) }),
      token,
    )

    const createdEntity = extractProductEntity(payload)

    return normalizeProduct(createdEntity || payload, product.category)
  }

  const updatePaths = [...primaryPaths, ...secondaryPaths].map((path) => `${path}/${productId}`)
  let payload = null
  let normalizedProduct = null
  let resolvedPath = ''
  let lastError = null

  for (const path of updatePaths) {
    try {
      const responsePayload = await request(
        path,
        { method: 'PUT', body: buildProductUpdatePayload(product) },
        token,
      )

      const entity = extractProductEntity(responsePayload)

      if (!entity) {
        lastError = createHttpError('Producto no encontrado.', 404, responsePayload)
        continue
      }

      payload = responsePayload
      resolvedPath = path
      normalizedProduct = normalizeProduct(entity, product.category)
      break
    } catch (error) {
      lastError = error

      if (![404, 405].includes(error.status ?? 0)) {
        throw error
      }
    }
  }

  if (!normalizedProduct) {
    throw lastError || new Error('No se pudo actualizar el producto en la API.')
  }

  if (product.imageFile) {
    const imagePaths = [
      `${resolvedPath}/imatge`,
      ...updatePaths.map((path) => `${path}/imatge`),
    ]

    const uniqueImagePaths = [...new Set(imagePaths)]
    let imagePayload = null

    for (const path of uniqueImagePaths) {
      try {
        const responsePayload = await request(
          path,
          { method: 'PATCH', body: buildProductImagePayload(product) },
          token,
        )

        const entity = extractProductEntity(responsePayload)

        if (!entity) {
          continue
        }

        imagePayload = responsePayload
        break
      } catch (error) {
        if (![404, 405].includes(error.status ?? 0)) {
          throw error
        }
      }
    }

    if (imagePayload) {
      normalizedProduct = normalizeProduct(
        extractProductEntity(imagePayload) || imagePayload,
        product.category,
      )
    }
  }

  return normalizedProduct
}

export async function deleteProduct(token, product) {
  const productId = product.id || product._id
  const pathsByCategory = product.category === 'cerveza' ? endpointGroups.beers : endpointGroups.wines

  return requestWithFallback(
    pathsByCategory.map((path) => `${path}/${productId}`),
    () => ({ method: 'DELETE' }),
    token,
  )
}

export async function getUsers(token) {
  const payload = await requestWithFallback(endpointGroups.users, () => ({ method: 'GET' }), token)
  const users = resolveArray(payload, ['usuaris', 'usuarios', 'users'])
  return users.map((item) => normalizeUser(item))
}

export async function updateUserRole(token, userId, role) {
  const patchPaths = endpointGroups.users.map((path) => `${path}/${userId}/rol`)
  const payload = await requestWithFallback(
    patchPaths,
    () => ({ method: 'PATCH', body: JSON.stringify({ rol: mapRoleToApi(role) }) }),
    token,
  )

  return normalizeUser(payload.user || payload.usuario || payload.usuari || payload.data || payload)
}
