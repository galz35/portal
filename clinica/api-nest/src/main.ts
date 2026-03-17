import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';
import { existsSync } from 'fs';
import { AppModule } from './app.module';
import { GlobalErrorFilter } from './common/filters/global-error.filter';

async function bootstrap() {
  // 1. Backend REST veloz usando Fastify
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  // Registrar cookies
  await app.register(require('@fastify/cookie'), {
    secret: process.env.COOKIE_SECRET || 'secret-ultra-seguro-portal',
  });

  // 2. Conexión de entorno gRPC
  const microserviceOptions: MicroserviceOptions = {
    transport: Transport.GRPC,
    options: {
      package: 'medico',
      protoPath: join(__dirname, '..', 'proto', 'medico.proto'), // Root fallback
      url: '127.0.0.1:50051',
    },
  };

  // Ajuste de ruta para producción (si está en dist/)
  const distProto = join(__dirname, 'medico.proto');
  if (existsSync(distProto)) {
    (microserviceOptions.options as any).protoPath = distProto;
  }

  app.connectMicroservice(microserviceOptions);

  // 3. Documentación Swagger
  const config = new DocumentBuilder()
    .setTitle('Medico API')
    .setDescription('The Medico API using Fastify and gRPC')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new GlobalErrorFilter());
  app.setGlobalPrefix('api');
  
  // 4. Levantar microservicios e interfaces REST
  await app.startAllMicroservices();
  const port = process.env.PORT ?? process.env.API_PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 API REST corriendo en puerto ${port}`);
  console.log(`🔌 gRPC corriendo en 127.0.0.1:50051`);
}
bootstrap();
