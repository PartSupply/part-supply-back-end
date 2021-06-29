import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { UserEntiry } from './login.entity';

@EntityRepository(UserEntiry)
export class LoginRepostiry extends Repository<UserEntiry> {
  constructor() {
    super();
  }

  public async saveData(): Promise<boolean> {
    const user = new UserEntiry();
    user.userEmail = 'abc';
    user.userPassword = 'sf';
    user.userGuid = 'dsf';

    try {
      await user.save();
    } catch (error) {
      console.log(error);
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Username already exist');
      }
      throw new InternalServerErrorException(
        'Some error ocurred while trying to save user',
      );
    }
    return true;
  }
}
