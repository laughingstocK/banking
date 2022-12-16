const express = require('express')
const app = express()
const port = 3030
const jwt = require('jsonwebtoken')
const auth = require("./middleware/auth")
const cors = require('cors')

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

app.use(express.json())

app.use(cors({
  origin: '*'
}));

app.post('/tranfer', auth, async (req, res) => {
  let { accountId, transactionAmount, destinationAccount } = req.body;

  console.log({ accountId, transactionAmount, destinationAccount })

  const _transactionAmount = parseFloat(transactionAmount)

  console.log({ _transactionAmount })

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
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "An error occured" })
  }
})

app.post('/register', async (req, res) => {
  let { firstname, lastname, username, password, address, email } = req.body;
  try {
    const user = await prisma.user.create({
      data: {
        firstname,
        lastname,
        username,
        password,
        address,
        email
      }
    })
    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "An error occured" })
  }
})

app.post('/open_account', auth, async (req, res) => {
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
    console.log(err);
    return res.status(500).json({ err: "An error occured" });
  }
})

app.get('/transactions', auth, async (req, res) => {
  const { accountId } = req.body

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        accountId
      }
    })
    console.log({ transactions })

    return res.json(transactions)
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "An error occured" })
  }
})

app.get('/accounts', auth, async (req, res) => {
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
    console.log(err);
    return res.status(500).json({ err: "An error occured" })
  }
})

app.get('/user', auth, async (req, res) => {
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
    console.log(err);
    return res.status(500).json({ err: "An error occured" })
  }
})

// Handling post request
app.post('/login', async (req, res, next) => {
  let { username, password } = req.body;
  console.log({ username, password })
  let existingUser;
  try {
    existingUser = await prisma.user.findUnique({
      where: {
        username,
      },
    })
  } catch (e) {
    console.log('<<<<<', e)
    const error = new Error("Error! Something went wrong.");
    return next(error);
  }

  console.log(existingUser)

  if (!existingUser || existingUser.password != password) {
    const error = Error("Wrong details please check at once");
    return next(error);
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
    console.log(err);
    const error = new Error("Error! Something went wrong.");
    return next(error);
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
})

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`)
})