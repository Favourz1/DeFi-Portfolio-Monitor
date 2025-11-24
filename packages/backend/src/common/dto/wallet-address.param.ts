import { IsEthereumAddress, IsIn } from "class-validator";

/**
 * DTO for validating Ethereum wallet address in URL params
 */
export class WalletAddressParam {
  @IsEthereumAddress({ message: "Invalid Ethereum address format" })
  address: string;
}

/**
 * Query parameters for network selection
 */
export class NetworkQueryDto {
  @IsIn(["mainnet", "sepolia"], {
    message: "Network must be either mainnet or sepolia",
  })
  network: "mainnet" | "sepolia" = "mainnet";
}
