# DeFi Portfolio Tracker - Backend

A NestJS API server that aggregates blockchain data from multiple sources (Alchemy, Etherscan, CoinGecko) to provide wallet portfolio information, token balances, and transaction history.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [API Response Format](#api-response-format)
- [Development](#development)
- [Testing](#testing)
- [Security](#security)
- [Error Handling](#error-handling)
- [Logging](#logging)
- [Caching](#caching)
- [Rate Limiting](#rate-limiting)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 Overview

The backend is a NestJS REST API that serves as a proxy layer between the frontend and various blockchain data providers. It:

- Aggregates data from Alchemy, Etherscan, and CoinGecko APIs
- Caches responses to reduce API calls and improve performance
- Provides standardized API responses with consistent error handling
- Implements rate limiting to protect external APIs
- Validates all inputs using class-validator DTOs

## ✨ Features

### Core Features

- **Token Balances**: Fetch ERC-20 token balances with USD values
- **Transaction History**: Retrieve ETH and ERC-20 transfer history
- **Portfolio Data**: Aggregate complete portfolio information
- **Multi-Network Support**: Ethereum Mainnet and Sepolia Testnet
- **Real-time Prices**: USD values for tokens and ETH via CoinGecko

### Technical Features

- **Caching**: In-memory caching with configurable TTLs
- **Rate Limiting**: Protect external APIs with request throttling
- **Error Handling**: Standardized error responses
- **Input Validation**: DTO-based validation with class-validator
- **Logging**: Comprehensive logging for debugging and monitoring
- **CORS**: Configurable CORS for frontend integration

## 🛠️ Tech Stack

### Core Framework

- **NestJS**: Progressive Node.js framework
- **TypeScript**: Type-safe development
- **Express**: HTTP server (via NestJS)

### External API Integrations

- **Alchemy API**: Token balances and metadata
- **Etherscan API**: Transaction history
- **CoinGecko API**: Token and ETH prices

### Libraries

- **ethers.js v5**: Ethereum utilities and BigNumber handling
- **axios**: HTTP client for external API calls
- **cache-manager**: In-memory caching
- **class-validator**: Input validation
- **class-transformer**: DTO transformation
- **joi**: Environment variable validation

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher (or yarn/pnpm)
- **API Keys**: Alchemy, Etherscan, and CoinGecko (see [Environment Variables](#environment-variables))

### Installation

1. **Navigate to backend directory**:

   ```bash
   cd packages/backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys (see [Environment Variables](#environment-variables))

4. **Start development server**:

   ```bash
   npm run dev
   ```

5. **Verify server is running**:
   ```
   http://localhost:3001/api/v1
   ```

### Quick Test

Test the health endpoint:

```bash
curl http://localhost:3001/api/v1/health
```

## 📁 Project Structure

```
packages/backend/
├── src/
│   ├── wallet/                # Wallet module
│   │   ├── wallet.controller.ts    # REST endpoints
│   │   ├── wallet.service.ts       # Business logic
│   │   ├── wallet.module.ts        # Module definition
│   │   └── dto/                    # Data Transfer Objects
│   │       └── transactions-query.dto.ts
│   ├── blockchain/             # Blockchain providers module
│   │   ├── blockchain.module.ts
│   │   ├── blockchain.service.ts
│   │   └── providers/              # External API providers
│   │       ├── alchemy.provider.ts
│   │       ├── etherscan.provider.ts
│   │       └── coingecko.provider.ts
│   ├── common/                 # Shared code
│   │   ├── dto/                # Common DTOs
│   │   │   ├── wallet-address.param.ts
│   │   │   └── pagination.dto.ts
│   │   ├── filters/            # Exception filters
│   │   │   └── http-exception.filter.ts
│   │   └── interfaces/         # TypeScript interfaces
│   │       ├── api-response.interface.ts
│   │       ├── token.interface.ts
│   │       └── transaction.interface.ts
│   ├── config/                 # Configuration
│   │   ├── configuration.ts    # Config service
│   │   └── validation.schema.ts  # Environment validation
│   ├── app.module.ts           # Root module
│   ├── app.controller.ts       # Root controller
│   ├── app.service.ts          # Root service
│   └── main.ts                 # Application entry point
├── test/                       # E2E tests
├── dist/                       # Compiled output
├── .env.example                # Environment variables template
├── tsconfig.json               # TypeScript configuration
├── nest-cli.json               # NestJS CLI configuration
└── package.json                # Dependencies and scripts
```

### Key Modules

#### Wallet Module

Handles all wallet-related endpoints:

- `GET /wallet/:address/tokens` - Token balances
- `GET /wallet/:address/transactions` - Transaction history
- `GET /wallet/:address/portfolio` - Complete portfolio

#### Blockchain Module

Provides access to external blockchain APIs:

- **AlchemyProvider**: Token balances, metadata, ETH balance
- **EtherscanProvider**: Transaction history (ETH and ERC-20)
- **CoingeckoProvider**: Token and ETH prices

## 🔐 Environment Variables

Create a `.env` file in the `packages/backend` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
BASE_URL=http://localhost:3001

# Alchemy API Keys (Required)
ALCHEMY_API_KEY_MAINNET=your_mainnet_alchemy_key_here
ALCHEMY_API_KEY_SEPOLIA=your_sepolia_alchemy_key_here

# Etherscan API Key (Required)
ETHERSCAN_API_KEY=your_etherscan_key_here

# CoinGecko API Key (Optional - free tier works without key)
COINGECKO_API_KEY=

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=10

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Variable Descriptions

| Variable                  | Required | Description                          | Default                 |
| ------------------------- | -------- | ------------------------------------ | ----------------------- |
| `NODE_ENV`                | No       | Environment (development/production) | `development`           |
| `PORT`                    | No       | Server port                          | `3001`                  |
| `BASE_URL`                | No       | Base URL for Swagger documentation   | `http://localhost:3001` |
| `ALCHEMY_API_KEY_MAINNET` | Yes      | Alchemy API key for Mainnet          | -                       |
| `ALCHEMY_API_KEY_SEPOLIA` | Yes      | Alchemy API key for Sepolia          | -                       |
| `ETHERSCAN_API_KEY`       | Yes      | Etherscan API key                    | -                       |
| `COINGECKO_API_KEY`       | No       | CoinGecko API key (optional)         | -                       |
| `RATE_LIMIT_TTL`          | No       | Rate limit window (seconds)          | `60`                    |
| `RATE_LIMIT_MAX`          | No       | Max requests per window              | `10`                    |
| `CORS_ORIGIN`             | No       | Allowed CORS origin                  | `http://localhost:5173` |

### Getting API Keys

#### Alchemy API Keys

1. Go to [Alchemy](https://www.alchemy.com/)
2. Create a free account
3. Create a new app for Mainnet
4. Create a new app for Sepolia
5. Copy API keys from dashboard

#### Etherscan API Key

1. Go to [Etherscan](https://etherscan.io/apis)
2. Create a free account
3. Generate API key
4. Copy API key

#### CoinGecko API Key (Optional)

1. Go to [CoinGecko](https://www.coingecko.com/en/api)
2. Create a free account
3. Generate API key (optional - free tier works without key)
4. Copy API key

## 📚 API Documentation (Swagger)

The backend API is fully documented with Swagger/OpenAPI. After starting the server, access the interactive API documentation at:

**Swagger UI**: http://localhost:3001/api/v1/docs

### Features

- **Interactive API Explorer**: Test endpoints directly from the browser
- **Request/Response Examples**: See example requests and responses
- **Schema Documentation**: View all data models and DTOs
- **Error Responses**: Documented error responses for each endpoint

### Viewing API Documentation

1. Start the backend server:

   ```bash
   npm run dev
   ```

2. Open Swagger UI in your browser:

   ```
   http://localhost:3001/api/v1/docs
   ```

3. Explore endpoints, test requests, and view schemas

### Extending API Documentation

To add Swagger documentation to new endpoints:

1. Import Swagger decorators:

   ```typescript
   import { ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
   ```

2. Add decorators to controller methods:

   ```typescript
   @ApiOperation({ summary: 'Endpoint description' })
   @ApiResponse({ status: 200, description: 'Success response' })
   ```

3. Document DTOs with `@ApiProperty()` decorators

See existing endpoints in `wallet.controller.ts` for examples.

## 📡 API Endpoints

All endpoints are prefixed with `/api/v1`.

### Health Check

```http
GET /api/v1/health
```

**Response**:

```json
{
  "error": false,
  "message": "Server is healthy",
  "statusCode": 200,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Token Balances

```http
GET /api/v1/wallet/:address/tokens?network=mainnet
```

**Parameters**:

- `address` (path): Ethereum wallet address (0x...)
- `network` (query): `mainnet` or `sepolia` (default: `mainnet`)

**Response**:

```json
{
  "error": false,
  "message": "Token balances retrieved successfully",
  "statusCode": 200,
  "data": {
    "address": "0x...",
    "network": "mainnet",
    "tokens": [
      {
        "contractAddress": "0x...",
        "symbol": "USDC",
        "name": "USD Coin",
        "balance": "1000.00",
        "decimals": 6,
        "usdValue": "1000.00",
        "logo": "https://..."
      }
    ],
    "ethBalance": {
      "balance": "1.5",
      "usdValue": "3000.00"
    },
    "totalValue": "4000.00",
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Get Transaction History

```http
GET /api/v1/wallet/:address/transactions?network=mainnet&limit=20&offset=0&type=all&search=
```

**Parameters**:

- `address` (path): Ethereum wallet address
- `network` (query): `mainnet` or `sepolia` (default: `mainnet`)
- `limit` (query): Number of transactions per page (1-100, default: 20)
- `offset` (query): Pagination offset (default: 0)
- `type` (query): `all`, `sent`, or `received` (default: `all`)
- `search` (query): Search term for transaction hash, addresses, or token symbols (optional)

**Response**:

```json
{
  "error": false,
  "message": "Transactions retrieved successfully",
  "statusCode": 200,
  "data": {
    "address": "0x...",
    "network": "mainnet",
    "transactions": [
      {
        "hash": "0x...",
        "type": "eth_transfer",
        "from": "0x...",
        "to": "0x...",
        "value": "0.5",
        "timestamp": 1704067200,
        "usdValue": "1000.00",
        "status": "success",
        "blockNumber": 18000000,
        "gasUsed": "21000",
        "gasPrice": "20000000000"
      }
    ],
    "pagination": {
      "total": 100,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Get Portfolio

```http
GET /api/v1/wallet/:address/portfolio?network=mainnet
```

**Parameters**:

- `address` (path): Ethereum wallet address
- `network` (query): `mainnet` or `sepolia` (default: `mainnet`)

**Response**: Same as token balances endpoint (portfolio is currently the same as token balances)

## 📦 API Response Format

All endpoints return a standardized response format:

```typescript
{
  error: boolean;        // true for errors, false for success
  message: string;       // Human-readable message
  statusCode: number;    // HTTP status code
  data: T | null;        // Response data or null on error
  timestamp?: string;     // ISO 8601 timestamp
}
```

### Success Response Example

```json
{
  "error": false,
  "message": "Token balances retrieved successfully",
  "statusCode": 200,
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response Example

```json
{
  "error": true,
  "message": "Invalid Ethereum address format",
  "statusCode": 400,
  "data": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 💻 Development

### Available Scripts

```bash
# Start development server (watch mode)
npm run dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Lint code
npm run lint

# Format code
npm run format
```

### Development Workflow

1. **Start development server**:

   ```bash
   npm run dev
   ```

2. **Server runs on**: http://localhost:3001

3. **API base URL**: http://localhost:3001/api/v1

4. **Hot reload**: Changes automatically restart the server

### Code Style

- **TypeScript**: Strict mode enabled
- **Absolute Imports**: Use `@/` prefix (e.g., `@/wallet/wallet.service`)
- **NestJS Patterns**: Follow NestJS module/controller/service structure
- **Error Handling**: Use NestJS HttpException for errors
- **Validation**: Use DTOs with class-validator decorators

### Adding New Endpoints

1. **Create DTO** (if needed) in `src/[module]/dto/`
2. **Add method to service** in `src/[module]/[module].service.ts`
3. **Add endpoint to controller** in `src/[module]/[module].controller.ts`
4. **Add Swagger decorators** for API documentation
5. **Add tests** in `src/[module]/[module].controller.spec.ts`

### Adding New Providers

1. **Create provider** in `src/blockchain/providers/`
2. **Add to BlockchainModule** providers array
3. **Inject in WalletService** constructor
4. **Add error handling** and logging
5. **Add tests** in `src/blockchain/providers/[provider].spec.ts`

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
```

### Test Structure

- **Unit Tests**: Service and provider tests (`.spec.ts` files)
- **Integration Tests**: Controller tests with mocked providers
- **E2E Tests**: Full API endpoint tests (in `test/` directory)

### Writing Tests

Tests use Jest and NestJS testing utilities:

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { WalletService } from "./wallet.service";

describe("WalletService", () => {
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletService /* mocked providers */],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
```

### Mocking External APIs

External API calls should be mocked in tests:

```typescript
const mockAlchemyProvider = {
  getTokenBalances: jest.fn().mockResolvedValue([...]),
  getEthBalance: jest.fn().mockResolvedValue('1000000000000000000'),
};
```

## 🔒 Security

### Input Validation

All inputs are validated using DTOs with class-validator:

```typescript
export class WalletAddressParam {
  @IsEthereumAddress({ message: "Invalid Ethereum address format" })
  address: string;
}
```

### Rate Limiting

Rate limiting is implemented using `@nestjs/throttler`:

- **Default**: 10 requests per 60 seconds per IP
- **Configurable**: Via `RATE_LIMIT_TTL` and `RATE_LIMIT_MAX` environment variables
- **Applied**: To all wallet endpoints via `@UseGuards(ThrottlerGuard)`

### CORS

CORS is configured to allow requests from the frontend:

- **Configurable**: Via `CORS_ORIGIN` environment variable
- **Default**: `http://localhost:5173` (frontend dev server)

### Error Handling

Errors are handled consistently:

- **Validation Errors**: 400 Bad Request with validation messages
- **Not Found**: 404 Not Found
- **External API Errors**: 503 Service Unavailable
- **Server Errors**: 500 Internal Server Error

All errors return standardized format (see [API Response Format](#api-response-format)).

## 📝 Error Handling

### Global Exception Filter

All exceptions are caught by `HttpExceptionFilter` and transformed into standardized responses:

```typescript
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Transform to standardized format
  }
}
```

### Error Types

- **HttpException**: Standard NestJS exceptions (400, 404, etc.)
- **Validation Errors**: From class-validator (400)
- **External API Errors**: From providers (503)
- **Unexpected Errors**: Logged and returned as 500

### Logging

All errors are logged with context:

- Error message
- Stack trace (for unexpected errors)
- Request details (URL, method, params)

## 📊 Logging

Logging uses NestJS's built-in Logger:

```typescript
private readonly logger = new Logger(ServiceName.name);

this.logger.log('Info message');
this.logger.warn('Warning message');
this.logger.error('Error message', error.stack);
```

### Log Levels

- **Log**: General information
- **Warn**: Warnings (e.g., API rate limits, missing data)
- **Error**: Errors (e.g., API failures, unexpected exceptions)

## 💾 Caching

Caching is implemented using `@nestjs/cache-manager`:

### Cache Strategy

- **Token Balances**: 30 seconds TTL
- **Transactions**: 60 seconds TTL
- **Prices**: 60 seconds TTL (CoinGecko)

### Cache Keys

Cache keys include all relevant parameters:

```typescript
const cacheKey = `token_balances_${address}_${network}`;
```

### Cache Behavior

- **Cache Hit**: Return cached data immediately
- **Cache Miss**: Fetch from API, cache result, return data
- **API Failure**: Return cached data if available (stale data)

## ⚡ Rate Limiting

Rate limiting protects external APIs from abuse:

### Configuration

- **Window**: 60 seconds (configurable via `RATE_LIMIT_TTL`)
- **Max Requests**: 10 per window (configurable via `RATE_LIMIT_MAX`)
- **Scope**: Per IP address

### Rate Limit Headers

Responses include rate limit headers:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1704067260
```

### Rate Limit Exceeded

When rate limit is exceeded:

- **Status**: 429 Too Many Requests
- **Message**: "Too many requests, please try again later"
- **Retry-After**: Seconds until limit resets

## 🐛 Troubleshooting

### Common Issues

#### API Key Errors

**Problem**: External API returns 401/403 errors

**Solutions**:

- Verify API keys are set correctly in `.env`
- Check API key has required permissions
- Verify API key is not expired
- Check API key is for correct network (Mainnet vs Sepolia)

#### Rate Limit Errors

**Problem**: External API returns 429 errors

**Solutions**:

- Reduce request frequency
- Increase cache TTLs
- Check API tier limits
- Implement exponential backoff

#### CORS Errors

**Problem**: Frontend can't make requests

**Solutions**:

- Verify `CORS_ORIGIN` matches frontend URL
- Check backend is running
- Verify CORS is enabled in `main.ts`

#### Cache Issues

**Problem**: Stale data returned

**Solutions**:

- Clear cache (restart server)
- Reduce cache TTLs
- Check cache keys are unique

#### Port Already in Use

**Problem**: Port 3001 is already in use

**Solutions**:

- Change `PORT` in `.env`
- Kill process using port 3001
- Use different port for development

### Debugging

1. **Check Logs**: Server logs show errors and warnings
2. **Check Network**: Use Postman/Thunder Client to test endpoints
3. **Check Cache**: Verify cache is working correctly
4. **Check API Keys**: Ensure all API keys are valid

## 🤝 Contributing

### Code Contribution Guidelines

1. **Follow NestJS Patterns**: Use modules, controllers, services
2. **Use TypeScript**: Strict types, avoid `any`
3. **Add Validation**: Use DTOs with class-validator
4. **Handle Errors**: Always include error handling
5. **Write Tests**: Add tests for new endpoints
6. **Document Code**: Add JSDoc comments for complex functions
7. **Update Swagger**: Add Swagger decorators for new endpoints

### Pull Request Process

1. Create a feature branch
2. Make your changes
3. Add/update tests
4. Update Swagger documentation
5. Ensure all tests pass
6. Submit pull request with description

### Code Review Checklist

- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] Input validation implemented
- [ ] Error handling included
- [ ] Swagger documentation updated
- [ ] Logging added for important operations
- [ ] Cache strategy considered

## 📚 Additional Resources

- **NestJS Docs**: https://docs.nestjs.com/
- **Alchemy Docs**: https://docs.alchemy.com/
- **Etherscan API Docs**: https://docs.etherscan.io/
- **CoinGecko API Docs**: https://www.coingecko.com/en/api/documentation

## 📝 License

This project is part of a coding challenge. See root README for license information.

---

**Built with ❤️ [Favour Okoh](https://www.linkedin.com/in/favour-okoh/) using NestJS, TypeScript, and blockchain APIs**
