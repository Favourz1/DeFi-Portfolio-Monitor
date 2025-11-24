import * as Joi from "joi";

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(3001),
  ALCHEMY_API_KEY_MAINNET: Joi.string().required(),
  ALCHEMY_API_KEY_SEPOLIA: Joi.string().required(),
  ETHERSCAN_API_KEY: Joi.string().required(),
  COINGECKO_API_KEY: Joi.string().allow("").optional(),
  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_MAX: Joi.number().default(10),
  CORS_ORIGIN: Joi.string(),
});
