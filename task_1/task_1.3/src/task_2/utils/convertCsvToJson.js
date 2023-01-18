import csv from 'csvtojson'
import { existsSync, appendFileSync, unlinkSync } from 'fs'
import { jsonStringify } from './jsonStringify.js'

export function convertCsvToJson(csvFilePath, txtFilePath) {
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
