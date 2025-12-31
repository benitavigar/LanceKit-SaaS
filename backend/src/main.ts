import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // CORS
    app.enableCors();

    // Swagger Configuration
    const config = new DocumentBuilder()
        .setTitle('Freelance CRM API')
        .setDescription('Production-ready API for managing freelance clients and invoices')
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
            },
            'JWT-auth',
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // Export Swagger JSON to project root
    const swaggerPath = path.join(process.cwd(), 'swagger.json');
    fs.writeFileSync(swaggerPath, JSON.stringify(document, null, 2));
    console.log(`📄 Swagger JSON exported to: ${swaggerPath}`);

    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
