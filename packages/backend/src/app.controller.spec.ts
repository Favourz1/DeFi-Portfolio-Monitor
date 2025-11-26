import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it("should return hello message", () => {
      expect(appController.getHello()).toBe(
        "Hello from DeFi Portfolio Tracker API!"
      );
    });
  });

  describe("about", () => {
    it("should return about information", () => {
      const result = appController.getAbout();
      expect(result).toHaveProperty(
        "message",
        "DeFi Portfolio Tracker API is running!"
      );
      expect(result).toHaveProperty("version", "1.0.0");
      expect(result).toHaveProperty("description");
      expect(result).toHaveProperty("timestamp");
    });
  });

  describe("health", () => {
    it("should return health check object", () => {
      const result = appController.getHealth();
      expect(result).toHaveProperty("data");
      expect(result.data).toHaveProperty("status", "ok");
      expect(result).toHaveProperty("timestamp");
    });
  });
});
