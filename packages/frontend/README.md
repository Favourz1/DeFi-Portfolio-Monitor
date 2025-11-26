# DeFi Portfolio Tracker - Frontend

A modern React application for tracking DeFi portfolios with multi-wallet support, real-time token balances, transaction history, and portfolio analytics.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Wallet Connection Setup](#wallet-connection-setup)
- [API Integration](#api-integration)
- [Development](#development)
- [Testing](#testing)
- [Building](#building)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 Overview

The frontend is a React 18 application built with TypeScript, Vite, and modern web3 libraries. It provides a comprehensive interface for users to:

- Connect multiple wallet types (MetaMask, WalletConnect, Coinbase Wallet, etc.)
- View token balances with real-time USD values
- Browse transaction history with advanced filtering
- Analyze portfolio distribution with interactive charts
- Switch between Ethereum Mainnet and Sepolia Testnet
- View any wallet address without connecting (manual mode)

## ✨ Features

### Core Features

- **Multi-Wallet Support**: Connect with MetaMask, WalletConnect, Coinbase Wallet, Rainbow Wallet, and more via RainbowKit
- **Token Balances**: Display ERC-20 token balances with USD values, logos, and metadata
- **Transaction History**: Browse ETH and ERC-20 transfers with search and filtering
- **Portfolio Analytics**: View total portfolio value and token distribution charts
- **Network Switching**: Seamlessly switch between Mainnet and Sepolia
- **Manual Address Mode**: View any wallet's portfolio without connecting

### UI/UX Features

- **Dark Mode**: Full dark/light theme support with system preference detection
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **Loading States**: Skeleton loaders and spinners for all async operations
- **Error Handling**: User-friendly error messages with retry options
- **Toast Notifications**: Real-time feedback for user actions
- **Accessibility**: WCAG AA compliant with keyboard navigation support

## 🛠️ Tech Stack

### Core Libraries

- **React 18**: UI framework with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Accessible component library

### State Management & Data Fetching

- **Zustand**: Lightweight state management for wallet state
- **React Query (TanStack Query)**: Server state management with caching
- **Axios**: HTTP client for API requests

### Web3 Integration

- **RainbowKit v2**: Multi-wallet connection UI
- **Wagmi v2**: React hooks for Ethereum
- **Viem**: TypeScript Ethereum library
- **ethers.js v5**: Ethereum utilities

### UI Libraries

- **Recharts**: Chart library for portfolio visualization
- **Sonner**: Toast notification system
- **next-themes**: Theme management
- **react-loading-skeleton**: Loading state components
- **lucide-react**: Icon library
- **date-fns**: Date formatting utilities

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher (or yarn/pnpm)
- **Wallet Extension**: MetaMask or any supported wallet (optional for manual mode)

### Installation

1. **Navigate to frontend directory**:

   ```bash
   cd packages/frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your configuration (see [Environment Variables](#environment-variables))

4. **Start development server**:

   ```bash
   npm run dev
   ```

5. **Open in browser**:
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
packages/frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Layout/          # Layout components (ErrorBoundary, ThemeProvider)
│   │   ├── Wallet/           # Wallet connection components
│   │   ├── Portfolio/       # Portfolio overview and charts
│   │   ├── Tokens/           # Token balance components
│   │   ├── Transactions/     # Transaction history components
│   │   ├── Loading/          # Loading skeleton components
│   │   └── ui/               # shadcn/ui components
│   ├── hooks/                # Custom React hooks
│   │   ├── useWallet.ts     # Wallet management hook (Wagmi)
│   │   ├── useTokenBalances.ts
│   │   ├── useTransactions.ts
│   │   └── usePortfolio.ts
│   ├── services/             # API and service layers
│   │   ├── api/              # API client and endpoints
│   │   └── web3/             # Web3 utilities (if needed)
│   ├── store/                # Zustand stores
│   │   └── wallet.store.ts  # Wallet state (manual mode)
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   ├── config/               # Configuration files
│   │   ├── constants.ts     # App constants
│   │   └── wagmi.config.ts  # Wagmi configuration
│   ├── pages/                # Page components
│   │   └── Home.tsx         # Main page
│   ├── lib/                  # Library utilities
│   │   └── utils.ts         # cn() helper for Tailwind
│   ├── App.tsx               # Root component with providers
│   └── main.tsx              # Entry point
├── public/                   # Static assets
├── .env.example              # Environment variables template
├── tailwind.config.js        # Tailwind configuration
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

### Key Files

- **`src/App.tsx`**: Root component with all providers (Wagmi, RainbowKit, React Query, Theme)
- **`src/pages/Home.tsx`**: Main application page
- **`src/hooks/useWallet.ts`**: Custom hook wrapping Wagmi hooks for wallet state
- **`src/config/wagmi.config.ts`**: Wagmi configuration with chains and connectors
- **`src/services/api/wallet.api.ts`**: API client methods for backend endpoints

## 🔐 Environment Variables

Create a `.env.local` file in the `packages/frontend` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api/v1

# App Configuration
VITE_APP_NAME=DeFi Portfolio Tracker
VITE_SUPPORTED_CHAINS=1,11155111

# WalletConnect Configuration (Required for WalletConnect support)
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

### Variable Descriptions

| Variable                        | Required | Description               | Default                        |
| ------------------------------- | -------- | ------------------------- | ------------------------------ |
| `VITE_API_BASE_URL`             | Yes      | Backend API base URL      | `http://localhost:3001/api/v1` |
| `VITE_APP_NAME`                 | No       | Application name          | `DeFi Portfolio Tracker`       |
| `VITE_SUPPORTED_CHAINS`         | No       | Comma-separated chain IDs | `1,11155111`                   |
| `VITE_WALLETCONNECT_PROJECT_ID` | No\*     | WalletConnect Project ID  | -                              |

\* Required only if you want WalletConnect support. MetaMask will work without it.

## 🔌 Wallet Connection Setup

This application uses [RainbowKit](https://rainbowkit.com/) for wallet connections, which provides support for multiple wallet types and a professional connection experience.

### Supported Wallets

- **MetaMask**: Browser extension wallet
- **WalletConnect**: Mobile wallet connections via QR code
- **Coinbase Wallet**: Coinbase's browser extension and mobile app
- **Rainbow Wallet**: Mobile wallet
- **And more**: RainbowKit supports 50+ wallets

### Getting a WalletConnect Project ID

WalletConnect is required for mobile wallet connections (scanning QR codes). To enable it:

1. **Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)**
2. **Create a free account** (if you don't have one)
3. **Create a new project**
4. **Copy the Project ID** from your project dashboard
5. **Add to `.env.local`**:
   ```env
   VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```

### Development without WalletConnect

If you only need MetaMask for development, you can skip the WalletConnect Project ID. The app will work with MetaMask and other injected wallets, but WalletConnect features will be disabled.

**Note**: You can use a placeholder Project ID for development, but it won't work for actual WalletConnect connections.

### How Wallet Connection Works

1. **User clicks "Connect Wallet"** → RainbowKit modal opens
2. **User selects wallet** → RainbowKit handles connection flow
3. **Wallet connects** → Wagmi hooks update automatically
4. **App receives address** → Components fetch portfolio data

### Manual Address Mode

Users can also view portfolios without connecting a wallet:

1. Click **"View Any Wallet Address"** button
2. Enter a valid Ethereum address
3. Select network (Mainnet or Sepolia)
4. View portfolio data

This is useful for:

- Viewing other wallets' portfolios
- Testing without connecting a wallet
- Demonstrating the app to others

### Network Support

- **Ethereum Mainnet** (Chain ID: 1)
- **Sepolia Testnet** (Chain ID: 11155111)

Users can switch networks using the network selector in the header.

## 🔗 API Integration

The frontend communicates with the backend API for all blockchain data. All API calls are handled through React Query for caching, error handling, and automatic refetching.

### API Endpoints Used

| Endpoint                        | Method | Description                             |
| ------------------------------- | ------ | --------------------------------------- |
| `/wallet/:address/tokens`       | GET    | Get token balances with USD values      |
| `/wallet/:address/transactions` | GET    | Get transaction history with pagination |
| `/wallet/:address/portfolio`    | GET    | Get complete portfolio data             |

### API Client

The API client is located at `src/services/api/client.ts` and uses Axios with interceptors for:

- Request/response transformation
- Error handling
- Standardized error format

### React Query Configuration

- **Stale Time**: 30 seconds (data considered fresh)
- **Cache Time**: 5 minutes (data kept in cache)
- **Refetch Interval**: 30 seconds for token balances
- **Retry**: 2 attempts on failure

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Lint code
npm run lint
```

### Development Workflow

1. **Start backend** (from root or `packages/backend`):

   ```bash
   npm run dev:backend
   ```

2. **Start frontend** (from `packages/frontend`):

   ```bash
   npm run dev
   ```

3. **Open browser**: http://localhost:5173

### Code Style

- **TypeScript**: Strict mode enabled
- **Absolute Imports**: Use `@/` prefix (e.g., `@/components/Wallet/WalletConnection`)
- **Component Structure**: Functional components with hooks
- **Error Handling**: Try-catch with user-friendly error messages
- **Loading States**: Always show loading indicators for async operations

### Adding New Components

1. Create component in appropriate directory (`src/components/[Category]/`)
2. Export from `src/components/index.ts`
3. Use shadcn/ui components when possible
4. Add TypeScript types for props
5. Include loading/error/empty states
6. Add JSDoc comments for complex logic

### Adding New Hooks

1. Create hook in `src/hooks/`
2. Use React Query for API calls
3. Export from `src/hooks/index.ts`
4. Add TypeScript return types
5. Document with JSDoc

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

- **Unit Tests**: Component and hook tests
- **Integration Tests**: API integration tests
- **Test Setup**: `src/test/setup.ts` with Wagmi mocks

### Writing Tests

Tests use Vitest and React Testing Library:

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Mocking Wagmi Hooks

Wagmi hooks are mocked in `src/test/setup.ts`. To mock in individual tests:

```typescript
import { vi } from "vitest";
import * as wagmi from "wagmi";

vi.spyOn(wagmi, "useAccount").mockReturnValue({
  address: "0x123...",
  isConnected: true,
});
```

## 🏗️ Building

### Production Build

```bash
npm run build
```

This will:

1. Type-check TypeScript
2. Build optimized bundle with Vite
3. Output to `dist/` directory

### Build Output

- **HTML**: `dist/index.html`
- **JavaScript**: `dist/assets/*.js` (code-split chunks)
- **CSS**: `dist/assets/*.css`
- **Static Assets**: `dist/assets/*` (images, fonts, etc.)

### Bundle Optimization

The build is optimized with:

- **Code Splitting**: Separate chunks for RainbowKit, Wagmi, and app code
- **Tree Shaking**: Unused code removed
- **Minification**: JavaScript and CSS minified
- **Asset Optimization**: Images optimized

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

## 🐛 Troubleshooting

### Common Issues

#### Wallet Connection Issues

**Problem**: Wallet doesn't connect or modal doesn't open

**Solutions**:

- Check that WalletConnect Project ID is set (if using WalletConnect)
- Ensure wallet extension is installed and unlocked
- Check browser console for errors
- Try refreshing the page
- Clear browser cache and localStorage

#### Network Errors

**Problem**: API calls fail with network errors

**Solutions**:

- Verify backend is running on `http://localhost:3001`
- Check `VITE_API_BASE_URL` in `.env.local`
- Verify CORS is configured correctly in backend
- Check browser network tab for detailed error

#### TypeScript Errors

**Problem**: TypeScript compilation fails

**Solutions**:

- Run `npm install` to ensure all dependencies are installed
- Check `tsconfig.json` for correct paths configuration
- Verify absolute imports use `@/` prefix
- Clear TypeScript cache: `rm -rf node_modules/.cache`

#### Build Errors

**Problem**: Production build fails

**Solutions**:

- Check for TypeScript errors: `npm run build` shows errors
- Verify all environment variables are set
- Check for circular dependencies
- Ensure all imports are correct

#### Theme Issues

**Problem**: Dark mode doesn't work or theme doesn't apply

**Solutions**:

- Check that `ThemeProvider` wraps the app in `App.tsx`
- Verify `next-themes` is installed
- Check browser localStorage for theme preference
- Clear browser cache

### Getting Help

1. **Check Console**: Browser console often has helpful error messages
2. **Check Network Tab**: Verify API calls are being made correctly
3. **Check Documentation**: Review this README and implementation plans
4. **Check Issues**: Look for similar issues in the repository

## 🤝 Contributing

### Code Contribution Guidelines

1. **Follow TypeScript Best Practices**: Use strict types, avoid `any`
2. **Use Absolute Imports**: Always use `@/` prefix
3. **Add Loading States**: All async operations need loading indicators
4. **Handle Errors**: Always include error handling with user-friendly messages
5. **Write Tests**: Add tests for new components and hooks
6. **Document Code**: Add JSDoc comments for complex functions
7. **Follow Component Structure**: Use functional components with hooks

### Pull Request Process

1. Create a feature branch
2. Make your changes
3. Add/update tests
4. Update documentation if needed
5. Ensure all tests pass
6. Submit pull request with description

### Code Review Checklist

- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] Loading states implemented
- [ ] Error handling included
- [ ] Responsive design tested
- [ ] Dark mode tested
- [ ] Documentation updated

## 📚 Additional Resources

- **RainbowKit Docs**: https://rainbowkit.com/docs
- **Wagmi Docs**: https://wagmi.sh/
- **React Query Docs**: https://tanstack.com/query/latest
- **shadcn/ui Docs**: https://ui.shadcn.com/
- **Tailwind CSS Docs**: https://tailwindcss.com/docs

## 📝 License

This project is part of a coding challenge. See root README for license information.

---

**Built with ❤️ by [Favour Okoh](https://www.linkedin.com/in/favour-okoh/) using React, TypeScript, and modern web3 libraries**
