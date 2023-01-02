import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { convertCsvToJson } from './utils/convertCsvToJson.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const csvFilePath = join(__dirname, 'csv/data.csv')
const txtFilePath = join(__dirname, 'csv/data.txt')

convertCsvToJson(csvFilePath, txtFilePath)
