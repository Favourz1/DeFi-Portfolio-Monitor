# DeFi Portfolio Tracker

A full-stack application for tracking DeFi portfolios with multi-wallet support, real-time token balances, transaction history, and portfolio analytics. Built with NestJS backend and React frontend, featuring modern web3 integration via RainbowKit and Wagmi.

![DeFi Portfolio Tracker](https://img.shields.io/badge/DeFi-Portfolio%20Tracker-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![React](https://img.shields.io/badge/React-18-blue)
![NestJS](https://img.shields.io/badge/NestJS-10-red)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [RainbowKit Integration](#rainbowkit-integration)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 Overview

The DeFi Portfolio Tracker is a production-ready full-stack application that allows users to:

- **Connect Multiple Wallets**: MetaMask, WalletConnect, Coinbase Wallet, Rainbow Wallet, and 50+ more via RainbowKit
- **View Token Balances**: Real-time ERC-20 token balances with USD values
- **Browse Transactions**: Complete transaction history with search and filtering
- **Analyze Portfolio**: Total portfolio value and token distribution charts
- **Switch Networks**: Seamlessly switch between Ethereum Mainnet and Sepolia Testnet
- **Manual Address Mode**: View any wallet's portfolio without connecting

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │  RainbowKit + Wagmi v2 (Multi-Wallet Support)   │   │
│  │  React Query (Data Fetching & Caching)          │   │
│  │  Zustand (State Management)                      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                        │
                        │ HTTP/REST
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend (NestJS)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Alchemy API (Token Balances & Metadata)        │   │
│  │  Etherscan API (Transaction History)             │   │
│  │  CoinGecko API (Token Prices)                    │   │
│  │  Caching Layer (Performance Optimization)        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## ✨ Features

### Core Features

- ✅ **Multi-Wallet Support**: Connect with 50+ wallets via RainbowKit
- ✅ **Token Balances**: ERC-20 token balances with real-time USD values
- ✅ **Transaction History**: ETH and ERC-20 transfers with advanced filtering
- ✅ **Portfolio Analytics**: Total value calculation and distribution charts
- ✅ **Network Switching**: Mainnet and Sepolia support
- ✅ **Manual Address Mode**: View any wallet without connecting

### UI/UX Features

- ✅ **Dark Mode**: Full dark/light theme with system preference detection
- ✅ **Responsive Design**: Mobile-first design for all screen sizes
- ✅ **Loading States**: Skeleton loaders and spinners throughout
- ✅ **Error Handling**: User-friendly error messages with retry options
- ✅ **Toast Notifications**: Real-time feedback for user actions
- ✅ **Accessibility**: WCAG AA compliant with keyboard navigation

### Technical Features

- ✅ **TypeScript**: Full type safety across frontend and backend
- ✅ **Caching**: Intelligent caching to reduce API calls
- ✅ **Rate Limiting**: Protection against API abuse
- ✅ **Error Boundaries**: Graceful error handling
- ✅ **API Documentation**: Swagger/OpenAPI for backend endpoints

## 🛠️ Tech Stack

### Frontend

| Technology   | Purpose              | Version |
| ------------ | -------------------- | ------- |
| React        | UI Framework         | 18.2    |
| TypeScript   | Type Safety          | 5.2     |
| Vite         | Build Tool           | 5.0     |
| Tailwind CSS | Styling              | 4.1     |
| shadcn/ui    | Component Library    | Latest  |
| RainbowKit   | Wallet Connection UI | 2.2     |
| Wagmi        | Ethereum Hooks       | 2.19    |
| Viem         | Ethereum Library     | 2.0     |
| React Query  | Data Fetching        | 5.90    |
| Zustand      | State Management     | 5.0     |

### Backend

| Technology      | Purpose            | Version |
| --------------- | ------------------ | ------- |
| NestJS          | Framework          | 10.0    |
| TypeScript      | Type Safety        | 5.1     |
| Express         | HTTP Server        | Latest  |
| ethers.js       | Ethereum Utilities | 5.7     |
| Axios           | HTTP Client        | 1.13    |
| cache-manager   | Caching            | 7.2     |
| class-validator | Validation         | 0.14    |

### External APIs

- **Alchemy**: Token balances and metadata
- **Etherscan**: Transaction history
- **CoinGecko**: Token and ETH prices

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **API Keys**: Alchemy, Etherscan, CoinGecko (see [Environment Setup](#environment-setup))

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd code-challenge-fullstack
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   **Backend** (`packages/backend/.env`):

   ```env
   ALCHEMY_API_KEY_MAINNET=your_key_here
   ALCHEMY_API_KEY_SEPOLIA=your_key_here
   ETHERSCAN_API_KEY=your_key_here
   COINGECKO_API_KEY=your_key_here  # Optional
   ```

   **Frontend** (`packages/frontend/.env.local`):

   ```env
   VITE_API_BASE_URL=http://localhost:3001/api/v1
   VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here  # Optional
   ```

4. **Start development servers**:

   ```bash
   npm run dev
   ```

5. **Open in browser**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api/v1
   - API Docs: http://localhost:3001/api/v1/docs (Swagger)

## 📁 Project Structure

```
code-challenge-fullstack/
├── packages/
│   ├── backend/              # NestJS API server
│   │   ├── src/
│   │   │   ├── wallet/      # Wallet endpoints
│   │   │   ├── blockchain/  # External API providers
│   │   │   ├── common/      # Shared code
│   │   │   └── config/      # Configuration
│   │   ├── .env.example
│   │   └── README.md        # Backend documentation
│   │
│   └── frontend/            # React application
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── hooks/       # Custom hooks
│       │   ├── services/    # API clients
│       │   ├── store/       # Zustand stores
│       │   ├── types/       # TypeScript types
│       │   ├── config/      # Configuration
│       │   └── pages/       # Page components
│       ├── .env.example
│       └── README.md        # Frontend documentation
│
├── AI-context/              # Implementation documentation
│   ├── IMPLEMENTATION_PLAN.md
│   ├── TASKS.md
│   └── RAINBOWKIT_IMPLEMENTATION_PLAN.md
│
└── README.md                # This file
```

### Key Directories

- **`packages/backend/src/wallet/`**: Wallet-related API endpoints
- **`packages/backend/src/blockchain/`**: External API integrations
- **`packages/frontend/src/components/Wallet/`**: Wallet connection components
- **`packages/frontend/src/hooks/useWallet.ts`**: Wallet state management hook
- **`packages/frontend/src/config/wagmi.config.ts`**: Wagmi configuration

## 🔐 Environment Setup

### Backend Environment Variables

Create `packages/backend/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Alchemy API Keys (Required)
ALCHEMY_API_KEY_MAINNET=your_mainnet_alchemy_key_here
ALCHEMY_API_KEY_SEPOLIA=your_sepolia_alchemy_key_here

# Etherscan API Key (Required)
ETHERSCAN_API_KEY=your_etherscan_key_here

# CoinGecko API Key (Optional)
COINGECKO_API_KEY=

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=10

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend Environment Variables

Create `packages/frontend/.env.local`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api/v1

# App Configuration
VITE_APP_NAME=DeFi Portfolio Tracker
VITE_SUPPORTED_CHAINS=1,11155111

# WalletConnect Configuration (Optional)
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

### Getting API Keys

#### Alchemy API Keys

1. Go to [Alchemy](https://www.alchemy.com/)
2. Create a free account
3. Create apps for Mainnet and Sepolia
4. Copy API keys from dashboard

#### Etherscan API Key

1. Go to [Etherscan](https://etherscan.io/apis)
2. Create a free account
3. Generate API key
4. Copy API key

#### CoinGecko API Key (Optional)

1. Go to [CoinGecko](https://www.coingecko.com/en/api)
2. Create a free account
3. Generate API key (optional - free tier works without key)

#### WalletConnect Project ID (Optional)

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a free account
3. Create a new project
4. Copy Project ID

**Note**: WalletConnect Project ID is only required for WalletConnect support. MetaMask and other injected wallets work without it.

## 🌈 RainbowKit Integration

### Overview

This project uses **RainbowKit v2** + **Wagmi v2** for wallet connections, providing:

- **Multi-Wallet Support**: 50+ wallet options
- **Professional UX**: Built-in loading states and error handling
- **Theme Integration**: Matches app's dark/light theme
- **Future-Proof**: Actively maintained and follows best practices

### Setup Instructions

See [Frontend README - Wallet Connection Setup](packages/frontend/README.md#wallet-connection-setup) for detailed instructions.

### Key Files

- **`packages/frontend/src/config/wagmi.config.ts`**: Wagmi configuration
- **`packages/frontend/src/hooks/useWallet.ts`**: Wallet hook (uses Wagmi)
- **`packages/frontend/src/components/Wallet/WalletConnection.tsx`**: RainbowKit ConnectButton
- **`packages/frontend/src/App.tsx`**: Provider setup

## 📡 API Documentation

### Swagger/OpenAPI

The backend API is fully documented with Swagger/OpenAPI:

**Access**: http://localhost:3001/api/v1/docs

### API Endpoints

#### Get Token Balances

```http
GET /api/v1/wallet/:address/tokens?network=mainnet
```

**Response**:

```json
{
  "error": false,
  "message": "Token balances retrieved successfully",
  "statusCode": 200,
  "data": {
    "address": "0x...",
    "network": "mainnet",
    "tokens": [...],
    "ethBalance": { "balance": "1.5", "usdValue": "3000.00" },
    "totalValue": "4000.00"
  }
}
```

#### Get Transaction History

```http
GET /api/v1/wallet/:address/transactions?network=mainnet&limit=20&offset=0&type=all&search=
```

#### Get Portfolio

```http
GET /api/v1/wallet/:address/portfolio?network=mainnet
```

### API Response Format

All endpoints return standardized format:

```typescript
{
  error: boolean;        // true for errors, false for success
  message: string;       // Human-readable message
  statusCode: number;   // HTTP status code
  data: T | null;       // Response data or null on error
  timestamp?: string;   // ISO 8601 timestamp
}
```

### Full API Documentation

See [Backend README - API Endpoints](packages/backend/README.md#api-endpoints) for complete documentation.

## 💻 Development

### Available Commands

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only

# Building
npm run build           # Build both projects
npm run build:frontend  # Frontend only
npm run build:backend   # Backend only

# Testing
npm run test            # Run all tests
npm run test:frontend   # Frontend tests only
npm run test:backend    # Backend tests only

# Linting
npm run lint            # Lint both projects
```

### Development Workflow

1. **Start backend**:

   ```bash
   npm run dev:backend
   ```

   Backend runs on http://localhost:3001

2. **Start frontend**:

   ```bash
   npm run dev:frontend
   ```

   Frontend runs on http://localhost:5173

3. **Or start both**:
   ```bash
   npm run dev
   ```

### Code Style

- **TypeScript**: Strict mode enabled
- **Absolute Imports**: Use `@/` prefix
- **Error Handling**: Comprehensive try-catch with user-friendly messages
- **Loading States**: Always show loading indicators
- **Documentation**: JSDoc comments for complex functions

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run frontend tests
npm run test:frontend

# Run backend tests
npm run test:backend
```

### Test Coverage

- **Frontend**: Component and hook tests with Vitest
- **Backend**: Unit and integration tests with Jest
- **E2E**: End-to-end tests (optional)

### Writing Tests

See individual READMEs for test writing guidelines:

- [Frontend Testing](packages/frontend/README.md#testing)
- [Backend Testing](packages/backend/README.md#testing)

## 🚀 Deployment

### Production Build

```bash
# Build both projects
npm run build

# Start production servers
npm run start
```

### Environment Variables

Ensure all environment variables are set in production:

- **Backend**: All API keys must be set
- **Frontend**: `VITE_API_BASE_URL` must point to production backend
- **Frontend**: `VITE_WALLETCONNECT_PROJECT_ID` for WalletConnect support

### Deployment Checklist

- [ ] All environment variables set
- [ ] API keys valid and have required permissions
- [ ] CORS configured for production frontend URL
- [ ] Rate limiting configured appropriately
- [ ] Error logging configured
- [ ] Health check endpoint working
- [ ] API documentation accessible

## 🐛 Troubleshooting

### Common Issues

#### Wallet Connection Issues

**Problem**: Wallet doesn't connect

**Solutions**:

- Check WalletConnect Project ID is set (if using WalletConnect)
- Ensure wallet extension is installed and unlocked
- Check browser console for errors
- Try refreshing the page

#### API Connection Issues

**Problem**: Frontend can't connect to backend

**Solutions**:

- Verify backend is running on correct port
- Check `VITE_API_BASE_URL` in frontend `.env.local`
- Verify CORS is configured correctly
- Check backend logs for errors

#### Build Errors

**Problem**: Production build fails

**Solutions**:

- Check TypeScript compilation errors
- Verify all environment variables are set
- Check for circular dependencies
- Ensure all imports are correct

### Getting Help

1. **Check Logs**: Both frontend and backend logs show errors
2. **Check Documentation**: Review README files
3. **Check API Docs**: Swagger UI at `/api/v1/docs`
4. **Check Console**: Browser console for frontend errors

## 🤝 Contributing

### Code Contribution Guidelines

1. **Follow TypeScript Best Practices**: Use strict types, avoid `any`
2. **Use Absolute Imports**: Always use `@/` prefix
3. **Add Loading States**: All async operations need loading indicators
4. **Handle Errors**: Always include error handling
5. **Write Tests**: Add tests for new features
6. **Document Code**: Add JSDoc comments for complex functions
7. **Update Documentation**: Update README files when needed

### Pull Request Process

1. Create a feature branch
2. Make your changes
3. Add/update tests
4. Update documentation
5. Ensure all tests pass
6. Submit pull request with description

## 📚 Additional Resources

### Documentation

- [Frontend README](packages/frontend/README.md) - Complete frontend documentation
- [Backend README](packages/backend/README.md) - Complete backend documentation
- [Implementation Plan](AI-context/IMPLEMENTATION_PLAN.md) - Detailed implementation guide
- [RainbowKit Implementation Plan](AI-context/RAINBOWKIT_IMPLEMENTATION_PLAN.md) - Wallet integration guide

### External Resources

- **RainbowKit**: https://rainbowkit.com/docs
- **Wagmi**: https://wagmi.sh/
- **NestJS**: https://docs.nestjs.com/
- **React Query**: https://tanstack.com/query/latest
- **shadcn/ui**: https://ui.shadcn.com/

## 📝 License

This project is part of a coding challenge. See repository for license information.

---

**Built with ❤️ by [Favour Okoh](https://www.linkedin.com/in/favour-okoh/) using React, NestJS, TypeScript, and modern web3 libraries**

**Questions?** Check the individual README files or open an issue.
