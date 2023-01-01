const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

const crypto = require('crypto')

function createHash(password) {
  // Create a hash of the password using the SHA-256 algorithm
  const hash = crypto.createHash('sha256')
  hash.update(password)
  return hash.digest('hex')
}


const login = async (req, res) => {
  let { username, password } = req.body
  console.log({ username, password })
  let existingUser
  try {
    existingUser = await prisma.user.findUnique({
      where: {
        username,
      },
    })
  } catch (e) {
    console.log('error :', e)
    return res.status(500).json({ err: "An error occured" })
  }

  const hashedPassword = createHash(password)

  if (!existingUser || existingUser.password != hashedPassword) {
    console.log('Username or password is incorrect')
    return res.status(401).json({ err: 'Username or password is incorrect' })
  }

  let token
  try {
    //Creating jwt token
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      "secretkeyappearshere",
      { expiresIn: "1h" }
    )
  } catch (err) {
    console.log(err)
    const error = new Error("Error! Something went wrong.")
    return next(error)
  }

  res
    .status(200)
    .json({
      success: true,
      data: {
        userId: existingUser.id,
        firstname: existingUser.firstname,
        lastname: existingUser.lastname,
        address: existingUser.address,
        email: existingUser.email,
        token: token,
      },
    })
}

const getUser = async (req, res) => {
  const { userId } = req.user
  console.log({ userId })

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        address: true,
        username: true,
        email: true
      },
    })
    console.log({ user })

    return res.json(user)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ err: "An error occured" })
  }
}

const getAccounts = async (req, res) => {
  const { userId } = req.user

  try {
    const accounts = await prisma.account.findMany({
      where: {
        userId
      }
    })
    console.log({ accounts })

    return res.json(accounts)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ err: "An error occured" })
  }
}

const getTransactions = async (req, res) => {
  const { accountId } = req.body

  console.log({ accountId })

  if (accountId === undefined) {
    return res.status(400).json({ err: "Bad request" })
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        accountId
      }
    })
    console.log({ transactions })

    return res.json(transactions)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ err: "An error occured" })
  }
}

const openAccount = async (req, res) => {
  let { balance, currency } = req.body

  try {
    const account = await prisma.account.create({
      data: {
        userId: req.user.userId,
        balance: parseFloat(balance),
        currency,
      }
    })
    return res.json(account)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ err: "An error occured" })
  }
}

const tranfer = async (req, res) => {
  let { accountId, transactionAmount, destinationAccount } = req.body

  console.log({ accountId, transactionAmount, destinationAccount })

  const _transactionAmount = parseFloat(transactionAmount)

  console.log({ _transactionAmount })

  if (_transactionAmount < 0 ) {
    return res.status(500).json({ err: "Transaction amount is less than zero" })
  }

  try {
    const account = await prisma.account.findUnique({
      where: {
        accountId
      }
    })
    console.log({ account })

    const totalBalance = account.balance - _transactionAmount
    if (totalBalance < 0) {
      return res.status(500).json({ err: "The amount in the account is less than the transaction amount." })
    }

    await prisma.account.update({
      where: {
        accountId
      },
      data: {
        balance: totalBalance,
      }
    })

    const destination = await prisma.account.findUnique({
      where: {
        accountId: destinationAccount
      }
    })

    await prisma.account.update({
      where: {
        accountId: destinationAccount
      },
      data: {
        balance: destination.balance + _transactionAmount,
      }
    })

    await prisma.transaction.create({
      data: {
        accountId,
        transacitonAmount: _transactionAmount,
        destinationAccount,
      }
    })

    return res.json({
      "success": true
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ err: "An error occured" })
  }
}

const register = async (req, res) => {
  let { firstname, lastname, username, password, address, email } = req.body

  const hashedPassword = createHash(password)

  try {
    const user = await prisma.user.create({
      data: {
        firstname,
        lastname,
        username,
        password: hashedPassword,
        address,
        email
      }
    })
    return res.json(user)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ err: "An error occured" })
  }
}

module.exports = {
  login,
  getUser,
  getAccounts,
  getTransactions,
  openAccount,
  tranfer,
  register
}