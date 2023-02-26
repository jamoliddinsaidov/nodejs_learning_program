import { SOMETHING_WENT_WRONG } from './constants.js'

export const getGenericErrorMessage = (error: Error) => ({
  success: false,
  message: SOMETHING_WENT_WRONG,
  error: error.message,
})
