import { numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const transactions = pgTable('transactions', {
  id: uuid().primaryKey().defaultRandom(),
  description: text().notNull(),
  amount: numeric({ precision: 14, scale: 2, mode: 'number' }).notNull(),
  type: text().notNull(),
  category: text().notNull(),
  date: text().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
