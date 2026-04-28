import { Link } from 'react-router-dom'

function ProductCard({ product, canOrder }) {
  return (
    <article className="panel flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[--accent]">
            {product.category}
          </p>
          <h3 className="mt-2 text-xl text-[--ink]">{product.name}</h3>
        </div>
        <span className="rounded-full bg-[rgba(169,117,59,0.12)] px-3 py-1 text-xs font-semibold text-[--wood-dark]">
          {product.type}
        </span>
      </div>

      <p className="text-sm leading-6 text-[--muted]">{product.description}</p>

      <dl className="grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-2xl bg-[rgba(255,255,255,0.45)] p-3">
          <dt className="text-xs uppercase tracking-[0.24em] text-[--muted]">Graduación</dt>
          <dd className="mt-1 font-semibold text-[--ink]">{product.abv}%</dd>
        </div>
        <div className="rounded-2xl bg-[rgba(255,255,255,0.45)] p-3">
          <dt className="text-xs uppercase tracking-[0.24em] text-[--muted]">Precio</dt>
          <dd className="mt-1 font-semibold text-[--ink]">{product.price.toFixed(2)} €</dd>
        </div>
        <div className="rounded-2xl bg-[rgba(255,255,255,0.45)] p-3">
          <dt className="text-xs uppercase tracking-[0.24em] text-[--muted]">Stock</dt>
          <dd className="mt-1 font-semibold text-[--ink]">{product.stock}</dd>
        </div>
      </dl>

      <div className="mt-auto flex flex-wrap gap-3">
        <Link className="btn-secondary" to={`/producto/${product.id}`}>
          Ver detalle
        </Link>
        {canOrder ? (
          <Link className="btn-primary" to={`/pedidos?productId=${product.id}`}>
            Pedir desde la web
          </Link>
        ) : null}
      </div>
    </article>
  )
}

export default ProductCard
