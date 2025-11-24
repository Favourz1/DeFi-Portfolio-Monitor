export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  alchemy: {
    mainnet: process.env.ALCHEMY_API_KEY_MAINNET,
    sepolia: process.env.ALCHEMY_API_KEY_SEPOLIA,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  coingecko: {
    apiKey: process.env.COINGECKO_API_KEY || "",
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    limit: parseInt(process.env.RATE_LIMIT_MAX, 10) || 10,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
});
