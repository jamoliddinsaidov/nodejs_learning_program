const csv = require('csvtojson')
const { join } = require('path')
const { existsSync, appendFileSync, unlinkSync } = require('fs')
const { jsonStringify } = require('./utils')

function convert(csvFilePath, txtFilePath) {
  csv()
    .fromFile(csvFilePath)
    .then((csvFileObjects) => {
      if (existsSync(txtFilePath)) {
        unlinkSync(txtFilePath)
        console.log('Deleting the existing destination file to start conversion from scratch...')
      }

      csvFileObjects.forEach((csvFileObject, index) => {
        appendFileSync(txtFilePath, jsonStringify(csvFileObject))
        console.log(`Converted line ${index + 1} from CSV to JSON`)
      })
    })
    .catch((error) => console.error(error))
}

const csvFilePath = join(__dirname, 'data/data.csv')
const txtFilePath = join(__dirname, 'data/data.txt')

convert(csvFilePath, txtFilePath)
