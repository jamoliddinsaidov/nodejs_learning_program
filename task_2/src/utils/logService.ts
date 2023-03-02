import { logger } from "../middlewares/index.js"

export const logService = (service: string,method: string, args: Object) => {
  logger.info(`${service}: ${method} with arguments - ${JSON.stringify(args)}`)
}