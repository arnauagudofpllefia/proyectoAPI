import { Link } from 'react-router-dom'

function ProductCard({ product, canOrder }) {
  const hasImage = Boolean(product.image)

  return (
    <article className="panel flex h-full flex-col gap-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(57,35,21,0.12)]">
      {hasImage ? (
        <div className="overflow-hidden rounded-xl border border-[rgba(107,74,49,0.1)] bg-[rgba(255,255,255,0.55)]">
          <img
            alt={product.name}
            className="h-44 w-full object-cover"
            loading="lazy"
            src={product.image}
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        </div>
      ) : (
        <div className="flex h-44 items-center justify-center rounded-xl border border-[rgba(107,74,49,0.1)] bg-[rgba(255,255,255,0.55)] text-sm text-[--muted]">
          Imagen no disponible
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[--accent]">
            {product.category}
          </p>
          <h3 className="mt-2 text-2xl leading-tight text-[--ink]">{product.name}</h3>
        </div>
        <span className="rounded-full border border-[rgba(157,106,52,0.2)] bg-[rgba(169,117,59,0.1)] px-3 py-1 text-xs font-semibold text-[--wood-dark]">
          {product.type}
        </span>
      </div>

      <p className="min-h-14 text-sm leading-6 text-[--muted]">{product.description}</p>

      <dl className="grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-xl border border-[rgba(107,74,49,0.1)] bg-[rgba(255,255,255,0.55)] p-3">
          <dt className="text-[11px] uppercase tracking-[0.22em] text-[--muted]">Graduación</dt>
          <dd className="mt-1 font-semibold text-[--ink]">{product.abv}%</dd>
        </div>
        <div className="rounded-xl border border-[rgba(107,74,49,0.1)] bg-[rgba(255,255,255,0.55)] p-3">
          <dt className="text-[11px] uppercase tracking-[0.22em] text-[--muted]">Precio</dt>
          <dd className="mt-1 font-semibold text-[--ink]">{product.price.toFixed(2)} €</dd>
        </div>
        <div className="rounded-xl border border-[rgba(107,74,49,0.1)] bg-[rgba(255,255,255,0.55)] p-3">
          <dt className="text-[11px] uppercase tracking-[0.22em] text-[--muted]">Stock</dt>
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
