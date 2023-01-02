const { createInterface } = require('readline')
const { stdin, stdout } = require('process')

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
