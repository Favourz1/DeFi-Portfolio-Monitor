import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "@/app.module";
import { HttpExceptionFilter } from "@/common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Redirect root path to /api/v1/docs
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === "/") {
      return res.redirect(301, "/api/v1/docs");
    }
    next();
  });

  // Global prefix for API versioning
  app.setGlobalPrefix("api/v1");

  // Swagger/OpenAPI configuration
  const port = process.env.PORT || 3001;
  const baseUrl =
    process.env.BASE_URL && process.env.BASE_URL.trim() !== ""
      ? process.env.BASE_URL.trim()
      : `http://localhost:${port}`;

  const config = new DocumentBuilder()
    .setTitle("DeFi Portfolio Tracker API")
    .setDescription(
      "REST API for tracking DeFi portfolios. Provides endpoints for token balances, transaction history, and portfolio analytics. Integrates with Alchemy, Etherscan, and CoinGecko APIs."
    )
    .setVersion("1.0")
    .addTag("wallet", "Wallet-related endpoints")
    .addServer(baseUrl, "Development server")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/v1/docs", app, document, {
    customSiteTitle: "DeFi Portfolio Tracker API Docs",
    customCss: ".swagger-ui .topbar { display: none }",
    customfavIcon: "/favicon.ico",
  });

  // CORS configuration
  app.enableCors({
    origin:
      (process.env.CORS_ORIGIN || "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean).length > 1
        ? (process.env.CORS_ORIGIN || "")
            .split(",")
            .map((origin) => origin.trim())
            .filter(Boolean)
        : process.env.CORS_ORIGIN,
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip non-whitelisted properties
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  await app.listen(port);

  console.log(`🚀 Application running on: http://localhost:${port}/api/v1`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/v1/docs`);
}
bootstrap();
