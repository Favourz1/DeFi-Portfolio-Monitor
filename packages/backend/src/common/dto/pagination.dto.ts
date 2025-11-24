import { IsOptional, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";

/**
 * DTO for pagination query parameters
 */
export class PaginationDto {
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
}
