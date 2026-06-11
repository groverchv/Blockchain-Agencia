import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Configure Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Agencia Blockchain Node')
    .setDescription('Decentralized recruitment ledger API for candidate skill and contract verification.')
    .setVersion('1.0')
    .addTag('Blockchain Node')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
  console.log(`Blockchain Node is running on: http://localhost:${port}`);
  console.log(`Swagger OpenAPI docs available at: http://localhost:${port}/api-docs`);
}
bootstrap();
