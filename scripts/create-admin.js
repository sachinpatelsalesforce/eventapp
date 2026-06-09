#!/usr/bin/env node
const bcrypt = require('bcryptjs')
const { Pool } = require('pg')

async function main() {
  const password = process.env.ADMIN_PASSWORD
  if (!password) {
    console.error('ADMIN_PASSWORD environment variable is required')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })

  try {
    const hash = await bcrypt.hash(password, 10)
    await pool.query(
      `INSERT INTO admin_users (username, password_hash)
       VALUES ('admin', $1)
       ON CONFLICT (username) DO UPDATE SET password_hash = $1`,
      [hash]
    )
    console.log('Admin user created/updated successfully.')
    console.log('Username: admin')
    console.log('Password: (as set in ADMIN_PASSWORD)')
  } finally {
    await pool.end()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
