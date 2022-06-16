import tap from 'tap'
import add from './add'

tap.pass('this test is always passing')

tap.test('add', t => {
  t.equal(add(1, 2), 3)
  t.end()
})
