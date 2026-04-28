import { useEffect, useMemo, useState } from 'react'
import { createOrder } from '../services/api'
import { useAuth } from '../context/AuthContext'

function OrderPanel({ products, orders, initialProductId = '', previewMode, onOrderCreated }) {
  const { token } = useAuth()
  const [formData, setFormData] = useState({
    productId: initialProductId,
    quantity: 1,
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState({ type: 'idle', message: '' })

  useEffect(() => {
    if (!formData.productId && products.length > 0) {
      setFormData((current) => ({ ...current, productId: products[0].id }))
    }
  }, [formData.productId, products])

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === formData.productId) || null,
    [formData.productId, products],
  )

  const handleChange = ({ target }) => {
    const { name, value } = target

    setFormData((current) => ({
      ...current,
      [name]: name === 'quantity' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ type: 'idle', message: '' })

    if (!selectedProduct) {
      setStatus({ type: 'error', message: 'Selecciona un producto válido.' })
      return
    }

    if (formData.quantity < 1) {
      setStatus({ type: 'error', message: 'La cantidad mínima es 1.' })
      return
    }

    const payload = {
      productId: selectedProduct.id,
      producteId: selectedProduct.id,
      category: selectedProduct.category,
      quantity: formData.quantity,
      quantitat: formData.quantity,
      notes: formData.notes.trim(),
      total: selectedProduct.price * formData.quantity,
      items: [
        {
          tipus: selectedProduct.category,
          producteId: selectedProduct.id,
          productId: selectedProduct.id,
          name: selectedProduct.name,
          quantitat: formData.quantity,
          quantity: formData.quantity,
          price: selectedProduct.price,
        },
      ],
    }

    setSubmitting(true)

    try {
      const order = await createOrder(token, payload)
      onOrderCreated(order)
      setStatus({ type: 'success', message: 'Pedido creado y enviado al backend.' })
      setFormData((current) => ({ ...current, quantity: 1, notes: '' }))
    } catch (error) {
      if (previewMode) {
        onOrderCreated({
          id: `LOCAL-${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: 'pendiente',
          total: payload.total,
          items: [
            {
              id: selectedProduct.id,
              name: selectedProduct.name,
              quantity: formData.quantity,
              price: selectedProduct.price,
            },
          ],
          notes: payload.notes,
        })

        setStatus({
          type: 'success',
          message:
            'La API todavía no responde; el pedido queda guardado en modo local de vista previa.',
        })
        setFormData((current) => ({ ...current, quantity: 1, notes: '' }))
      } else {
        setStatus({ type: 'error', message: error.message })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
      <form className="panel space-y-4" onSubmit={handleSubmit}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[--accent]">
            Zona privada
          </p>
          <h3 className="mt-2 text-2xl text-[--ink]">Crear pedido</h3>
          <p className="mt-2 text-sm leading-6 text-[--muted]">
            Al enviar la comanda, el backend podrá registrar el pedido y disparar el correo al
            propietario.
          </p>
        </div>

        <label className="label" htmlFor="productId">
          Producto
          <select
            className="input"
            id="productId"
            name="productId"
            value={formData.productId}
            onChange={handleChange}
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} · {product.price.toFixed(2)} €
              </option>
            ))}
          </select>
        </label>

        <label className="label" htmlFor="quantity">
          Cantidad
          <input
            className="input"
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={handleChange}
          />
        </label>

        <label className="label" htmlFor="notes">
          Notas para la bodega
          <textarea
            className="input min-h-28"
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Ej.: recoger el viernes o incluir factura."
          />
        </label>

        {selectedProduct ? (
          <div className="rounded-2xl bg-[rgba(255,255,255,0.45)] p-4 text-sm text-[--wood-dark]">
            <p className="font-semibold">Resumen</p>
            <p className="mt-2">{selectedProduct.name}</p>
            <p>
              Total estimado: <strong>{(selectedProduct.price * formData.quantity).toFixed(2)} €</strong>
            </p>
          </div>
        ) : null}

        {status.message ? (
          <p className={`status-note ${status.type === 'error' ? 'status-note--error' : 'status-note--success'}`}>
            {status.message}
          </p>
        ) : null}

        <button className="btn-primary" type="submit" disabled={submitting || products.length === 0}>
          {submitting ? 'Enviando...' : 'Confirmar pedido'}
        </button>
      </form>

      <section className="panel space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[--accent]">
            Historial
          </p>
          <h3 className="mt-2 text-2xl text-[--ink]">Mis pedidos</h3>
        </div>

        {orders.length === 0 ? (
          <p className="text-sm text-[--muted]">Todavía no hay pedidos registrados.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <article
                className="rounded-[1.15rem] border border-[rgba(109,78,52,0.12)] bg-[rgba(255,255,255,0.4)] p-4"
                key={order.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-semibold text-[--ink]">{order.id}</h4>
                  <span className="rounded-full bg-[rgba(79,102,74,0.12)] px-3 py-1 text-xs font-semibold text-emerald-900">
                    {order.status}
                  </span>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-[--muted]">
                  {new Date(order.createdAt).toLocaleString('es-ES')}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-[--wood-dark]">
                  {order.items.map((item) => (
                    <li key={item.id || `${order.id}-${item.name}`}>
                      {item.quantity} × {item.name} · {item.price.toFixed(2)} €
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm font-semibold text-[--ink]">
                  Total: {order.total.toFixed(2)} €
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default OrderPanel
