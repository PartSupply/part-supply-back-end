import { Controller, Post } from '@nestjs/common';
import { LoginService } from './login.service';

@Controller('login')
export class LoginController {
  constructor(private loginService: LoginService) {}

  @Post('')
  public async doLogin() {
    return this.loginService.save();
  }
}
