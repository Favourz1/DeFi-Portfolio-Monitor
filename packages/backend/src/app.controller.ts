import { Controller, Get } from "@nestjs/common";
import { AppService } from "@/app.service";
import { ApiResponse } from "@/common/interfaces/api-response.interface";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("about")
  getAbout() {
    return {
      message: "DeFi Portfolio Tracker API is running!",
      version: "1.0.0",
      description:
        "Fully developed backend API for DeFi portfolio tracking, aggregating and serving on-chain portfolio data.",
      timestamp: new Date().toISOString(),
    };
  }

  @Get("health")
  getHealth(): ApiResponse<{ status: string }> {
    return {
      error: false,
      message: "Service is healthy",
      statusCode: 200,
      data: {
        status: "ok",
      },
      timestamp: new Date().toISOString(),
    };
  }
}
