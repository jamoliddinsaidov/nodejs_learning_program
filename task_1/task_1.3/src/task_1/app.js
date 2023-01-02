import { createInterface } from 'readline'
import { stdin, stdout } from 'process'

const readline = createInterface({
  input: stdin,
  output: stdout,
  terminal: false,
})

readline.on('line', (line) => {
  const lineArray = line.trim().split('')
  const reversedLine = lineArray.reverse().join('')
  console.log(reversedLine)
})

readline.once('close', () => {
  console.log('Closing the application...')
})
