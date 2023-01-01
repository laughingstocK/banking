const express = require('express')
const app = express()
const port = 3000
const auth = require("./middleware/auth")
const cors = require('cors')

const { PrismaClient } = require('@prisma/client')
const {
  login,
  getUser,
  getAccounts,
  getTransactions,
  openAccount,
  tranfer,
  register
} = require('./src/controller/index')

const prisma = new PrismaClient()

app.use(express.json())

app.use(cors({
  origin: '*'
}));

app.post('/tranfer', auth, tranfer)
app.post('/register', register)
app.post('/open_account', auth, openAccount)
app.post('/transactions', auth, getTransactions)
app.get('/accounts', auth, getAccounts)
app.get('/user', auth, getUser)
app.post('/login', login)

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`)
})