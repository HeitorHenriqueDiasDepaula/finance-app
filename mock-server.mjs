import http from 'node:http'
import { randomUUID } from 'node:crypto'

const port = Number(process.env.PORT ?? 3000)

const transactions = [
  {
    id: randomUUID(),
    description: 'Salário',
    amount: 5000,
    type: 'income',
    category: 'Trabalho',
    date: '2026-08-01',
  },
  {
    id: randomUUID(),
    description: 'Aluguel',
    amount: 1800,
    type: 'expense',
    category: 'Moradia',
    date: '2026-08-02',
  },
  {
    id: randomUUID(),
    description: 'Mercado',
    amount: 320,
    type: 'expense',
    category: 'Alimentação',
    date: '2026-08-03',
  },
  {
    id: randomUUID(),
    description: 'Consultoria',
    amount: 1200,
    type: 'income',
    category: 'Freelance',
    date: '2026-08-04',
  },
  {
    id: randomUUID(),
    description: 'Internet',
    amount: 120,
    type: 'expense',
    category: 'Contas',
    date: '2026-08-05',
  },
  {
    id: randomUUID(),
    description: 'Transporte',
    amount: 90,
    type: 'expense',
    category: 'Transporte',
    date: '2026-08-06',
  },
]

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''
    request.on('data', (chunk) => {
      body += chunk
    })
    request.on('end', () => {
      if (!body) {
        resolve(null)
        return
      }
      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })
    request.on('error', reject)
  })
}

function validatePayload(body, { partial = false } = {}) {
  if (!body || typeof body !== 'object') {
    return 'Corpo da requisição inválido'
  }

  const { description, amount, type, category, date } = body
  const has = (value) => value !== undefined

  if ((!partial || has(description)) && (typeof description !== 'string' || !description.trim())) {
    return 'Descrição é obrigatória'
  }
  if ((!partial || has(amount)) && (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0)) {
    return 'Valor deve ser um número maior que zero'
  }
  if ((!partial || has(type)) && type !== 'income' && type !== 'expense') {
    return "Tipo deve ser 'income' ou 'expense'"
  }
  if ((!partial || has(category)) && (typeof category !== 'string' || !category.trim())) {
    return 'Categoria é obrigatória'
  }
  if ((!partial || has(date)) && (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date))) {
    return 'Data deve estar no formato AAAA-MM-DD'
  }

  return null
}

function pickFields({ description, amount, type, category, date }) {
  const fields = { description, amount, type, category, date }
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined))
}

function positiveInt(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function send(response, status, payload) {
  response.writeHead(status)
  response.end(payload === undefined ? undefined : JSON.stringify(payload))
}

const server = http.createServer(async (request, response) => {
  response.setHeader('Content-Type', 'application/json')
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (request.method === 'OPTIONS') {
    send(response, 204)
    return
  }

  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host}`)
    const [resource, transactionId] = url.pathname.split('/').filter(Boolean)

    if (resource !== 'transactions') {
      send(response, 404, { error: 'Rota não encontrada' })
      return
    }

    if (request.method === 'GET' && !transactionId) {
      const page = positiveInt(url.searchParams.get('page'), 1)
      const limit = positiveInt(url.searchParams.get('limit'), 5)
      const start = (page - 1) * limit

      send(response, 200, {
        data: transactions.slice(start, start + limit),
        meta: {
          page,
          limit,
          totalItems: transactions.length,
          totalPages: Math.max(1, Math.ceil(transactions.length / limit)),
        },
      })
      return
    }

    if (request.method === 'POST' && !transactionId) {
      const body = await parseBody(request)
      const validationError = validatePayload(body)
      if (validationError) {
        send(response, 400, { error: validationError })
        return
      }

      const transaction = { id: randomUUID(), ...pickFields(body) }
      transactions.unshift(transaction)
      send(response, 201, transaction)
      return
    }

    if (transactionId) {
      const index = transactions.findIndex((item) => item.id === transactionId)
      if (index === -1) {
        send(response, 404, { error: 'Transação não encontrada' })
        return
      }

      if (request.method === 'GET') {
        send(response, 200, transactions[index])
        return
      }

      if (request.method === 'PUT') {
        const body = await parseBody(request)
        const validationError = validatePayload(body, { partial: true })
        if (validationError) {
          send(response, 400, { error: validationError })
          return
        }

        transactions[index] = { ...transactions[index], ...pickFields(body) }
        send(response, 200, transactions[index])
        return
      }

      if (request.method === 'DELETE') {
        transactions.splice(index, 1)
        send(response, 204)
        return
      }
    }

    send(response, 405, { error: 'Método não permitido' })
  } catch (error) {
    if (error instanceof SyntaxError) {
      send(response, 400, { error: 'JSON inválido' })
      return
    }
    console.error(error)
    send(response, 500, { error: 'Erro interno do servidor' })
  }
})

server.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`)
})
