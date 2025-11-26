import { IsEthereumAddress, IsOptional, IsIn } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * DTO for wallet demo endpoint request body
 */
export class WalletDemoDto {
  @ApiProperty({
    description: "Ethereum wallet address to demonstrate with",
    example: "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
  })
  @IsEthereumAddress({ message: "Invalid Ethereum address format" })
  address: string;

  @ApiPropertyOptional({
    description: "Network to use for demonstration",
    enum: ["mainnet", "sepolia"],
    default: "mainnet",
    example: "mainnet",
  })
  @IsOptional()
  @IsIn(["mainnet", "sepolia"], {
    message: "Network must be either mainnet or sepolia",
  })
  network?: "mainnet" | "sepolia" = "mainnet";
}

/**
 * Response data for wallet demo endpoint
 */
export class WalletDemoResponse {
  @ApiProperty({
    description: "Wallet address used in demonstration",
    example: "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
  })
  address: string;

  @ApiProperty({
    description: "Network used",
    enum: ["mainnet", "sepolia"],
    example: "mainnet",
  })
  network: "mainnet" | "sepolia";

  @ApiProperty({
    description: "Wagmi v2 compatible chain ID",
    example: 1,
  })
  chainId: number;

  @ApiProperty({
    description: "Example of how to use this address with Wagmi v2 hooks",
    example: {
      useAccount: "const { address, isConnected } = useAccount();",
      useChainId: "const chainId = useChainId();",
      useSwitchChain: "const { switchChain } = useSwitchChain();",
    },
  })
  wagmiUsage: {
    useAccount: string;
    useChainId: string;
    useSwitchChain: string;
    useDisconnect: string;
  };

  @ApiProperty({
    description: "Frontend API endpoint examples",
    example: {
      getTokenBalances:
        "/api/v1/wallet/0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503/tokens?network=mainnet",
      getTransactions:
        "/api/v1/wallet/0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503/transactions?network=mainnet",
      getPortfolio:
        "/api/v1/wallet/0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503/portfolio?network=mainnet",
    },
  })
  apiEndpoints: {
    getTokenBalances: string;
    getTransactions: string;
    getPortfolio: string;
  };

  @ApiProperty({
    description: "Documentation links",
    example: {
      wagmiDocs: "https://wagmi.sh/",
      rainbowKitDocs: "https://rainbowkit.com/docs",
      frontendHook: "See packages/frontend/src/hooks/useWallet.ts",
    },
  })
  documentation: {
    wagmiDocs: string;
    rainbowKitDocs: string;
    frontendHook: string;
  };
}
