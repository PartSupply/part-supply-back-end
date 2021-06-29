import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginRepostiry } from './login.repository';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(LoginRepostiry)
    private loginRepostiry: LoginRepostiry,
  ) {}

  public async save() {
    return await this.loginRepostiry.saveData();
  }
}
