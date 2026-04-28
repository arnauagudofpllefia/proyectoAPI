export const demoProducts = [
  {
    id: 'vino-rioja-reserva',
    name: 'Rioja Reserva',
    description:
      'Vino tinto con crianza en barrica, notas de fruta madura y final especiado.',
    category: 'vino',
    type: 'reserva',
    abv: '13.5',
    price: 24.9,
    stock: 18,
    image: '',
  },
  {
    id: 'vino-verdejo-joven',
    name: 'Verdejo Joven',
    description: 'Blanco fresco y aromático, ideal para aperitivos y cocina mediterránea.',
    category: 'vino',
    type: 'blanco',
    abv: '12.0',
    price: 14.5,
    stock: 27,
    image: '',
  },
  {
    id: 'cerveza-ipa-artesana',
    name: 'IPA Artesana',
    description: 'Cerveza lupulada con amargor equilibrado y aroma cítrico.',
    category: 'cerveza',
    type: 'ipa',
    abv: '6.4',
    price: 5.8,
    stock: 40,
    image: '',
  },
  {
    id: 'cerveza-stout-roble',
    name: 'Stout de Roble',
    description: 'Negra cremosa con recuerdos de cacao y café tostado.',
    category: 'cerveza',
    type: 'stout',
    abv: '7.1',
    price: 6.3,
    stock: 22,
    image: '',
  },
]

export const demoOrders = [
  {
    id: 'PED-1001',
    createdAt: '2026-04-03T10:20:00.000Z',
    status: 'confirmada',
    total: 49.8,
    items: [
      { name: 'Rioja Reserva', quantity: 2, price: 24.9 },
    ],
  },
  {
    id: 'PED-1002',
    createdAt: '2026-04-05T18:10:00.000Z',
    status: 'pendiente',
    total: 17.4,
    items: [
      { name: 'IPA Artesana', quantity: 3, price: 5.8 },
    ],
  },
]

export const demoUsers = [
  {
    id: 'USR-1',
    name: 'Admin Demo',
    email: 'admin@vinacoteca.local',
    role: 'admin',
  },
  {
    id: 'USR-2',
    name: 'Editor Demo',
    email: 'editor@vinacoteca.local',
    role: 'editor',
  },
  {
    id: 'USR-3',
    name: 'Cliente Demo',
    email: 'cliente@vinacoteca.local',
    role: 'user',
  },
]
