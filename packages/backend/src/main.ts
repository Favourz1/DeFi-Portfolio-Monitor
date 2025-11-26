import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AppModule } from "@/app.module";
import { HttpExceptionFilter } from "@/common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Redirect root path to /api/v1/about
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === "/") {
      return res.redirect(301, "/api/v1/about");
    }
    next();
  });

  // Global prefix for API versioning
  app.setGlobalPrefix("api/v1");

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
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

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Application running on: http://localhost:${port}/api/v1`);
}
bootstrap();
