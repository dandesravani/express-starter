import { PrismaClient } from '@prisma/client'
import { range } from 'lodash'
import {faker} from '@faker-js/faker'

const prisma = new PrismaClient()

export const randomTodos = (n: number) => range(1, n+1).map(_ => ({
  title: faker.lorem.sentence(),
  done:faker.datatype.boolean()
}))

async function main() {
  for (const todo of randomTodos(20)) {
    await prisma.todo.create({
      data: todo
    })
  }
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
