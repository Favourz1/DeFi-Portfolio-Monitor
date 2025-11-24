import { IsOptional, IsIn, IsString, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { NetworkQueryDto } from "@/common/dto/wallet-address.param";

/**
 * Query parameters for transactions endpoint
 */
export class TransactionsQueryDto extends NetworkQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;

  @IsOptional()
  @IsIn(["all", "sent", "received"])
  type: "all" | "sent" | "received" = "all";

  @IsOptional()
  @IsString()
  search?: string;
}
