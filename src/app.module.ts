import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { VindecoderModule } from './vindecoder/vindecoder.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                type: 'mysql',
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT) || 3306,
                username: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                entities: [__dirname + '/**/**/*.entity{.ts,.js}'],
                synchronize: true,
            }),
        }),
        UserModule,
        AuthModule,
        VindecoderModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
