import express from 'express'
import chalk from 'chalk'
import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt, { Secret } from 'jsonwebtoken'
require('dotenv').config()

const prisma = new PrismaClient()
const app = express()

app.use(express.json())
app.use(cors())

const getUser = (token: string) => {
  if (token) {
    try {
      return jwt.verify(token, process.env['JWT_SECRET'] as Secret)
    } catch (err) {
      throw new Error('Session invalid')
    }
  }
}

app.get('/todos', async (req, res) => {
  let page = req.query['page'] as any as number
  let pageSize = req.query['size'] as any as number
  const skip = pageSize * page - pageSize
  const take = Number(pageSize)
  if (page == 0) {
    return res.status(400).send('page should be greater than or equal to 1')
  }
  const allTodos = await prisma.todo.findMany({})
  const totalPages = Math.ceil(allTodos.length / pageSize)

  const paginationTodos = await prisma.todo.findMany({
    skip: skip,
    take: take,
  })
  return res.status(200).send({ paginationTodos, totalPages })
})

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany()
  return res.status(200).send(users)
})

app.post('/todos', async (req, res) => {
  const token = req.headers.authorization as string
  const user = getUser(token)

  if (user) {
    const { title, done } = req.body
    const newTodo = await prisma.todo.create({
      data: {
        title: title,
        done: done,
      },
    })
    return res.status(200).send(newTodo)
  } else {
    return res.send('This operation is not authorized')
  }
})
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQzYThlY2U4LWNmNmYtNGRlOC1iNTlkLTI3ZWU5MmYwMmM4MSIsImlhdCI6MTY1NTk4NTQwM30.eccqxg_F-HJB-wtrwkeifw43r2iHAI-HOVt-8vhm7Sk

app.post('/signup', async (req, res) => {
  let { username, email, password } = req.body

  email = email.trim().toLowerCase()
  const hashed = await bcrypt.hash(password, 10)
  try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashed,
      },
    })
    const token = jwt.sign({ id: user.id }, process.env['JWT_SECRET'] as Secret)
    res.status(200).send(token)
  } catch (err) {
    console.log(err)
  }
})

app.post('/signin', async (req, res) => {
  let { email, password } = req.body
  if (email) {
    email = email.trim().toLowerCase() as string
  }
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })
  if (!user) {
    throw new Error('Error signining in')
  }
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    throw new Error('Error signing in')
  }
  const token = jwt.sign({ id: user.id }, process.env['JWT_SECRET'] as Secret)
  res.status(200).send(token)
})
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhjZTJkODFkLTQ2MjctNGJlOS04ZTdiLWZmMGQwM2UyNDM5YSIsImlhdCI6MTY1NTk3Njg0OH0.K_9kdBCI9HosrZXO2KE2LsxEt5HokVcHDNsQfz6x9hA

app.put('/todos/:id', async (req, res) => {
  const id = req.params.id
  console.log(id)
  const { title, done } = req.body
  const editTodo = await prisma.todo.update({
    where: {
      id: id,
    },
    data: {
      title: title,
      done: done,
    },
  })
  return res.status(200).send(editTodo)
})

app.delete('/todos/:id', async (req, res) => {
  const id = req.params.id

  const todo = await prisma.todo.delete({
    where: {
      id: id,
    },
  })
  console.log(id, todo)
  return res.status(200).send(todo)
})

const port = process.env['port'] || 4000
app.listen(port, () => {
  console.log(chalk.green(`Server running at ${port}!`))
})
