import type { Config } from '@netlify/functions'
import { count, desc, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { transactions } from '../../db/schema.js'

type Payload = {
  description?: unknown
  amount?: unknown
  type?: unknown
  category?: unknown
  date?: unknown
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function error(status: number, message: string) {
  return Response.json({ error: message }, { status })
}

function positiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function validate(body: Payload | null, partial = false): string | null {
  if (!body || typeof body !== 'object') return 'Corpo da requisição inválido'
  const { description, amount, type, category, date } = body
  const has = (v: unknown) => v !== undefined

  if ((!partial || has(description)) && (typeof description !== 'string' || !description.trim()))
    return 'Descrição é obrigatória'
  if ((!partial || has(amount)) && (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0))
    return 'Valor deve ser um número maior que zero'
  if ((!partial || has(type)) && type !== 'income' && type !== 'expense')
    return "Tipo deve ser 'income' ou 'expense'"
  if ((!partial || has(category)) && (typeof category !== 'string' || !category.trim()))
    return 'Categoria é obrigatória'
  if ((!partial || has(date)) && (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)))
    return 'Data deve estar no formato AAAA-MM-DD'
  return null
}

function pick(body: Payload) {
  const fields = {
    description: typeof body.description === 'string' ? body.description.trim() : undefined,
    amount: body.amount as number | undefined,
    type: body.type as 'income' | 'expense' | undefined,
    category: typeof body.category === 'string' ? body.category.trim() : undefined,
    date: body.date as string | undefined,
  }
  return Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined)) as Partial<
    typeof transactions.$inferInsert
  >
}

function toJson(row: typeof transactions.$inferSelect) {
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    type: row.type,
    category: row.category,
    date: row.date,
  }
}

async function readBody(req: Request): Promise<Payload | null | 'invalid'> {
  try {
    const text = await req.text()
    return text ? (JSON.parse(text) as Payload) : null
  } catch {
    return 'invalid'
  }
}

export default async (req: Request, context: { params: Record<string, string | undefined> }) => {
  const id = context.params?.id

  try {
    if (!id) {
      if (req.method === 'GET') {
        const url = new URL(req.url)
        const page = positiveInt(url.searchParams.get('page'), 1)
        const limit = Math.min(positiveInt(url.searchParams.get('limit'), 50), 500)
        const [rows, [{ total }]] = await Promise.all([
          db
            .select()
            .from(transactions)
            .orderBy(desc(transactions.date), desc(transactions.createdAt))
            .limit(limit)
            .offset((page - 1) * limit),
          db.select({ total: count() }).from(transactions),
        ])
        return Response.json({
          data: rows.map(toJson),
          meta: { page, limit, totalItems: total, totalPages: Math.max(1, Math.ceil(total / limit)) },
        })
      }

      if (req.method === 'POST') {
        const body = await readBody(req)
        if (body === 'invalid') return error(400, 'JSON inválido')
        const validationError = validate(body)
        if (validationError) return error(400, validationError)
        const [created] = await db
          .insert(transactions)
          .values(pick(body!) as typeof transactions.$inferInsert)
          .returning()
        return Response.json(toJson(created), { status: 201 })
      }

      return error(405, 'Método não permitido')
    }

    if (!UUID_RE.test(id)) return error(404, 'Transação não encontrada')

    if (req.method === 'GET') {
      const [row] = await db.select().from(transactions).where(eq(transactions.id, id))
      return row ? Response.json(toJson(row)) : error(404, 'Transação não encontrada')
    }

    if (req.method === 'PUT') {
      const body = await readBody(req)
      if (body === 'invalid') return error(400, 'JSON inválido')
      const validationError = validate(body, true)
      if (validationError) return error(400, validationError)
      const fields = pick(body!)
      if (Object.keys(fields).length === 0) {
        const [row] = await db.select().from(transactions).where(eq(transactions.id, id))
        return row ? Response.json(toJson(row)) : error(404, 'Transação não encontrada')
      }
      const [updated] = await db.update(transactions).set(fields).where(eq(transactions.id, id)).returning()
      return updated ? Response.json(toJson(updated)) : error(404, 'Transação não encontrada')
    }

    if (req.method === 'DELETE') {
      const [deleted] = await db.delete(transactions).where(eq(transactions.id, id)).returning()
      return deleted ? new Response(null, { status: 204 }) : error(404, 'Transação não encontrada')
    }

    return error(405, 'Método não permitido')
  } catch (err) {
    console.error(err)
    return error(500, 'Erro interno do servidor')
  }
}

export const config: Config = {
  path: ['/api/transactions', '/api/transactions/:id'],
}
