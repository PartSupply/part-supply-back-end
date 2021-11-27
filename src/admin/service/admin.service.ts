import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './../../user/models/user.entity';
import { Not, Repository } from 'typeorm';
import { RoleEntity } from './../../user/models/role.entity';
import { AddressEntity } from './../../user/models/address.entity';
import { UserSessionEntity } from './../../user/models/user-session.entity';
import { AuthService } from './../../auth/service/auth.service';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(RoleEntity) private readonly roleRepository: Repository<RoleEntity>,
        @InjectRepository(AddressEntity) private readonly addressRepository: Repository<AddressEntity>,
        @InjectRepository(UserSessionEntity) private readonly userSessionRepository: Repository<UserSessionEntity>,
        private authService: AuthService,
    ) {}

    public async getAllUsersAccountDetails() {
        const response = await this.userRepository.find({
            where: {
                role: { id: Not(1) },
            },
        });
        return response;
    }
}
