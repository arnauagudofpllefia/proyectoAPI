import { useState } from 'react'

function buildInitialValue(editingProduct) {
  if (!editingProduct) {
    return {
      category: 'vino',
      name: '',
      description: '',
      type: '',
      abv: '',
      price: '',
      stock: '',
      imageFile: null,
    }
  }

  return {
    category: editingProduct.category || 'vino',
    name: editingProduct.name || '',
    description: editingProduct.description || '',
    type: editingProduct.type || '',
    abv: editingProduct.abv || '',
    price: String(editingProduct.price || ''),
    stock: String(editingProduct.stock || ''),
    imageFile: null,
  }
}

function ProductForm({ editingProduct, onCancel, onSubmit, saving }) {
  const [formData, setFormData] = useState(() => buildInitialValue(editingProduct))
  const [error, setError] = useState('')

  const handleChange = ({ target }) => {
    const { name, value, files } = target

    setFormData((current) => ({
      ...current,
      [name]: files ? files[0] || null : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Completa al menos nombre y descripción.')
      return
    }

    if (!editingProduct && !formData.imageFile) {
      setError('La API exige una imagen al crear el producto.')
      return
    }

    await onSubmit({
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
      type: formData.type.trim(),
    }).catch((submitError) => {
      setError(submitError.message)
    })
  }

  return (
    <form className="panel space-y-4" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[--accent]">
            Dashboard de catálogo
          </p>
          <h3 className="mt-2 text-2xl text-[--ink]">
            {editingProduct ? 'Editar producto' : 'Nuevo producto'}
          </h3>
        </div>
        {editingProduct ? (
          <button className="btn-secondary" type="button" onClick={onCancel}>
            Cancelar edición
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="label" htmlFor="category">
          Categoría
          <select
            className="input"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="vino">Vino</option>
            <option value="cerveza">Cerveza</option>
          </select>
        </label>

        <label className="label" htmlFor="type">
          Tipo
          <input
            className="input"
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            placeholder="Reserva, IPA, stout..."
          />
        </label>

        <label className="label md:col-span-2" htmlFor="name">
          Nombre
          <input
            className="input"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nombre comercial"
          />
        </label>

        <label className="label md:col-span-2" htmlFor="description">
          Descripción
          <textarea
            className="input min-h-28"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Notas de cata, origen, maridaje..."
          />
        </label>

        <label className="label" htmlFor="abv">
          Graduación (%)
          <input
            className="input"
            id="abv"
            name="abv"
            type="number"
            min="0"
            step="0.1"
            value={formData.abv}
            onChange={handleChange}
          />
        </label>

        <label className="label" htmlFor="price">
          Precio (€)
          <input
            className="input"
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
          />
        </label>

        <label className="label" htmlFor="stock">
          Stock
          <input
            className="input"
            id="stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            value={formData.stock}
            onChange={handleChange}
          />
        </label>

        <label className="label" htmlFor="imageFile">
          Imagen del producto {editingProduct ? '(opcional)' : '(obligatoria)'}
          <input
            className="input"
            id="imageFile"
            name="imageFile"
            type="file"
            accept="image/*"
            onChange={handleChange}
          />
        </label>
      </div>

      {error ? <p className="status-note status-note--error">{error}</p> : null}

      <button className="btn-primary" type="submit" disabled={saving}>
        {saving ? 'Guardando...' : editingProduct ? 'Actualizar producto' : 'Crear producto'}
      </button>
    </form>
  )
}

export default ProductForm
