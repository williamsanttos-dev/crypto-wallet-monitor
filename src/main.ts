import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const prisma = new PrismaService();
  await prisma.onModuleInit();
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
