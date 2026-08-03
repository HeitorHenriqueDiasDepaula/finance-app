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
  })
}

const server = http.createServer(async (request, response) => {
  response.setHeader('Content-Type', 'application/json')
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  const url = new URL(request.url ?? '/', `http://${request.headers.host}`)

  if (request.method === 'GET' && url.pathname === '/transactions') {
    const page = Number(url.searchParams.get('page') ?? '1')
    const limit = Number(url.searchParams.get('limit') ?? '5')
    const start = (page - 1) * limit
    const end = start + limit

    response.writeHead(200)
    response.end(JSON.stringify({
      data: transactions.slice(start, end),
      meta: {
        page,
        limit,
        totalItems: transactions.length,
        totalPages: Math.max(1, Math.ceil(transactions.length / limit)),
      },
    }))
    return
  }

  if (request.method === 'POST' && url.pathname === '/transactions') {
    const body = await parseBody(request)
    const transaction = {
      id: randomUUID(),
      ...body,
    }
    transactions.unshift(transaction)
    response.writeHead(201)
    response.end(JSON.stringify(transaction))
    return
  }

  const transactionId = url.pathname.split('/').filter(Boolean)[1]
  const transaction = transactions.find((item) => item.id === transactionId)

  if (!transaction && transactionId) {
    response.writeHead(404)
    response.end(JSON.stringify({ error: 'Transação não encontrada' }))
    return
  }

  if (request.method === 'PUT' && url.pathname.startsWith('/transactions/')) {
    const body = await parseBody(request)
    const index = transactions.findIndex((item) => item.id === transactionId)
    transactions[index] = { ...transactions[index], ...body }
    response.writeHead(200)
    response.end(JSON.stringify(transactions[index]))
    return
  }

  if (request.method === 'DELETE' && url.pathname.startsWith('/transactions/')) {
    const index = transactions.findIndex((item) => item.id === transactionId)
    transactions.splice(index, 1)
    response.writeHead(204)
    response.end()
    return
  }

  response.writeHead(404)
  response.end(JSON.stringify({ error: 'Rota não encontrada' }))
})

server.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`)
})
