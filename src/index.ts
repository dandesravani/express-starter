import express from 'express'
import chalk from 'chalk';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client'
import { range } from 'lodash';
import cors from 'cors'

const prisma = new PrismaClient()
const app = express()

app.use(express.json())
app.use(cors())


const randomSentences = (n: number) => {
    return range(0, n).map(_ => ({ sentence: faker.lorem.sentence() }))
}

export let sentences = randomSentences(40)


app.get('/sentences', (req, res) => {
    let page = req.query['page'] as any as number
    let pageSize = req.query['size'] as any as number
    if (page == undefined && pageSize == undefined) {
        res.json({ sentences })
    } else if (pageSize == undefined) {
        pageSize = 6
    } else if (page == undefined) {
        page = 1
    }
    const start = (page - 1) * pageSize
    const end = page * pageSize
    const sentencesPerPage = sentences.slice(start, end)
    const totalPages = Math.ceil((sentences.length / pageSize))
    res.json({ sentences, sentencesPerPage, totalPages })
})


app.post('/sentences', (req, res) => {
    const sentence = req.body
    sentences = [...sentences, sentence]
    res.json(sentences)
})

const port = process.env['port'] || 4000
app.listen(port, () => {
    console.log(chalk.green(`Server running at ${port}!`))
})
