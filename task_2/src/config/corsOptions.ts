import { CorsOptions } from "cors";
import { allowedOrigins } from "./allowedOrigins.js";
import { NOT_ALLOWED_BY_CORS } from "../utils/constants.js";

export const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
            callback(null, true)
        } else {
            callback(new Error(NOT_ALLOWED_BY_CORS));
        }
    },
    optionsSuccessStatus: 200
}