import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/user/models/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) {}

    public async generateJWT(user: UserEntity): Promise<string> {
        const token = await this.jwtService.signAsync({ user });
        return token;
    }

    public async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 12);
    }

    public async comparePasswords(newPassword: string, passwortHash: string): Promise<boolean> {
        return await bcrypt.compare(newPassword, passwortHash);
    }
}
