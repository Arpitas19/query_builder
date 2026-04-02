import { type DataSet, type EventRow, type OrderRow, type ProductRow, type UserRow } from '../domain/dataset'
import { createSeededRandom } from './seededRandom'

const firstNames = ['Liam', 'Noah', 'Olivia', 'Emma', 'Mia', 'Sophia', 'Ava', 'Lucas', 'Aria', 'Ethan']
const lastNames = ['Smith', 'Brown', 'Taylor', 'Wilson', 'Lee', 'Martin', 'Clark', 'Allen', 'Hill', 'Scott']
const countries = ['US', 'UK', 'IN', 'DE', 'FR', 'CA', 'AU', 'JP', 'BR', 'SG']
const productAdjectives = ['Smart', 'Eco', 'Pro', 'Flex', 'Ultra', 'Mini', 'Prime']
const productNouns = ['Bottle', 'Keyboard', 'Headset', 'Chair', 'Camera', 'Lamp', 'Bag']
const categories = ['Electronics', 'Home', 'Fashion', 'Fitness', 'Office']
const orderStatuses = ['pending', 'paid', 'shipped', 'cancelled']
const eventTypes = ['page_view', 'add_to_cart', 'checkout', 'login', 'logout']
const pages = ['/home', '/catalog', '/product', '/cart', '/checkout', '/account']

function pick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]
}

function randomInt(min: number, max: number, random: () => number): number {
  return Math.floor(random() * (max - min + 1)) + min
}

function randomDate(start: Date, end: Date, random: () => number): string {
  const ts = start.getTime() + random() * (end.getTime() - start.getTime())
  return new Date(ts).toISOString()
}

function two(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function randomSessionId(random: () => number): string {
  const a = randomInt(1000, 9999, random)
  const b = randomInt(1000, 9999, random)
  return `sess_${a}${b}`
}

export function generateMockData(seed = 20260401): DataSet {
  const random = createSeededRandom(seed)

  const users: UserRow[] = []
  for (let id = 1; id <= 650; id += 1) {
    const first = pick(firstNames, random)
    const last = pick(lastNames, random)
    const name = `${first} ${last}`
    const country = pick(countries, random)
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${two(id % 100)}@example.com`

    users.push({
      id,
      name,
      email,
      country,
      created_at: randomDate(new Date('2022-01-01'), new Date('2025-01-01'), random),
      is_active: random() > 0.2,
    })
  }

  const products: ProductRow[] = []
  for (let id = 1; id <= 550; id += 1) {
    const name = `${pick(productAdjectives, random)} ${pick(productNouns, random)} ${id}`
    const price = Number((randomInt(10, 500, random) + random()).toFixed(2))

    products.push({
      id,
      name,
      category: pick(categories, random),
      price,
      stock: randomInt(0, 250, random),
      rating: Number((Math.round((2 + random() * 3) * 10) / 10).toFixed(1)),
    })
  }

  const orders: OrderRow[] = []
  for (let id = 1; id <= 1400; id += 1) {
    const user = users[randomInt(0, users.length - 1, random)]
    const product = products[randomInt(0, products.length - 1, random)]
    const quantity = randomInt(1, 5, random)

    orders.push({
      id,
      user_id: user.id,
      product_id: product.id,
      quantity,
      total_price: Number((product.price * quantity).toFixed(2)),
      status: pick(orderStatuses, random),
      ordered_at: randomDate(new Date('2023-01-01'), new Date('2025-03-31'), random),
    })
  }

  const events: EventRow[] = []
  for (let id = 1; id <= 1800; id += 1) {
    const user = users[randomInt(0, users.length - 1, random)]
    events.push({
      id,
      user_id: user.id,
      event_type: pick(eventTypes, random),
      page: pick(pages, random),
      occurred_at: randomDate(new Date('2024-01-01'), new Date('2025-03-31'), random),
      session_id: randomSessionId(random),
    })
  }

  return {
    users,
    orders,
    products,
    events,
  }
}
