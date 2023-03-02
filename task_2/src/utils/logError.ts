import { logger } from '../middlewares/index.js'

export const logError = (controllerName: string, method: string, args: Object, errorMessage: string) => {
  logger.error(`Error at ${controllerName}: ${method} with arguments ${JSON.stringify(args)}
  Error message: ${errorMessage}`)
}
