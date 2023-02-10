import { SOMETHING_WENT_WRONG_MESSAGE } from './constants.js'

export const getGenericErrorMessage = (error: Error) => ({
  success: false,
  message: SOMETHING_WENT_WRONG_MESSAGE,
  error: error.message,
})
