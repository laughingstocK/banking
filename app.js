const express = require('express')
const app = express()
const port = 3000
const jwt = require('jsonwebtoken')
const auth = require("./middleware/auth")
const cors = require('cors')

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

app.use(express.json())

app.use(cors())

app.post('/tranfer', auth, async (req, res) => {
  let { accountId, transactionAmount, destinationAccount } = req.body;

  const _transactionAmount = parseFloat(transactionAmount)
  try {
    const account = await prisma.account.findUnique({
      where: {
        accountId
      }
    })
    console.log({ account })

    const totalBalance = account.balance - _transactionAmount

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

app.get('/history', auth, async (req, res) => {
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

// Handling post request
app.post('/login', async (req, res, next) => {
  let { username, password } = req.body;

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

  console.log('>>>', existingUser)

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
        email: existingUser.email,
        token: token,
      },
    })
})

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`)
})