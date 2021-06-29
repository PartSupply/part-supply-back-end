import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginController } from './login.controller';
import { LoginRepostiry } from './login.repository';
import { LoginService } from './login.service';

@Module({
  imports: [TypeOrmModule.forFeature([LoginRepostiry])],
  controllers: [LoginController],
  providers: [LoginService],
  exports: [],
})
export class LoginModule {}
