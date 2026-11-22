import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { CatalogModule } from "./catalog.module";
import { applyMicroserviceLayer } from "../../../libs/rpc/src";


async function bootstrap() {
  process.title = 'catalog';
  const logger = new Logger('CatalogBootstrap')
  const rmqUrl = process.env.RABBITMQ_URL ?? "amqp://localhost:5672"
  const queue = process.env.CATALOG_QUEUE ?? "catalog_queue"
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CatalogModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        queue,
        queueOptions: {
          durable: true
        }
      }
    }
  );
  applyMicroserviceLayer(app)
  app.enableShutdownHooks()
  await app.listen()
  logger.log(`Catalog RMQ listening on queue ${queue} via ${rmqUrl}`)
}

bootstrap();