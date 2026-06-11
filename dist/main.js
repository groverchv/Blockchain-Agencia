"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Agencia Blockchain Node')
        .setDescription('Decentralized recruitment ledger API for candidate skill and contract verification.')
        .setVersion('1.0')
        .addTag('Blockchain Node')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 3000);
    await app.listen(port);
    console.log(`Blockchain Node is running on: http://localhost:${port}`);
    console.log(`Swagger OpenAPI docs available at: http://localhost:${port}/api-docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map