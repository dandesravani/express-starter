import express from 'express'
import chalk from 'chalk';
import { PrismaClient } from '@prisma/client'
import cors from 'cors'

const prisma = new PrismaClient()
const app = express()

app.use(express.json())
app.use(cors())



app.get('/todos', async (req, res) => {
    let page = req.query['page'] as any as number
    let pageSize = req.query['size'] as any as number
    const skip = (pageSize * page) - pageSize
    const take = Number(pageSize)
    if (page == 0) {
        return res.status(400).send("page should be greater than or equal to 1")
    }
    const allTodos = await prisma.todo.findMany({})
    const totalPages = Math.ceil(allTodos.length / pageSize)

    const paginationTodos = await prisma.todo.findMany({
            skip: skip,
            take: take,
        })
    return res.status(200).send({ paginationTodos, totalPages })
    }
)

app.post('/todos', async (req, res) => {
    const { title ,done} = req.body
    const newTodo = await prisma.todo.create({
        data: {
            title: title,
            done:done
        }
    })
    return res.status(200).send(newTodo)
})

app.put('/todos/:id', async (req, res) => {
    const id = req.params.id
    console.log(id)
    const { title, done } = req.body
    const editTodo = await prisma.todo.update({
        where: {
            id:id
        },
        data: {
            title: title,
            done:done
        }
    })
     return res.status(200).send(editTodo)
})

app.delete('/todos/:id', async (req, res) => {
    const id = req.params.id

    const todo = await prisma.todo.delete({
        where: {
            id:id
        }
    })
    console.log(id,todo)
    return res.status(200).send(todo)
})

const port = process.env['port'] || 4000
app.listen(port, () => {
    console.log(chalk.green(`Server running at ${port}!`))
})
