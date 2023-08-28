import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// eslint-disable-next-line import/no-unresolved
import { AppController } from './app.controller';
// eslint-disable-next-line import/no-unresolved
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
