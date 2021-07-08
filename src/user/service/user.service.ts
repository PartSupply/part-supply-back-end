import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from 'src/auth/service/auth.service';
import { Repository } from 'typeorm';
import { RoleEntity } from '../models/role.entity';
import { UserDto, userRoleMapper } from '../models/user.dto';
import { UserEntity } from '../models/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { AddressEntity } from '../models/address.entity';
import { use } from 'passport';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(RoleEntity) private readonly roleRepository: Repository<RoleEntity>,
        @InjectRepository(AddressEntity) private readonly addressRepository: Repository<AddressEntity>,
        private authService: AuthService,
    ) {}

    public async createUser(user: UserDto): Promise<any> {
        const userRoleId = userRoleMapper.get(user.role.roleName);
        const userRole: RoleEntity = await this.roleRepository.findOne({ id: userRoleId });

        // Save the Address
        let addressEntity: AddressEntity = new AddressEntity();
        addressEntity.addressLineOne = user.address.addressLineOne;
        addressEntity.city = user.address.city;
        addressEntity.state = user.address.state;
        addressEntity.zipCode = user.address.zipCode;
        addressEntity.country = user.address.country;
        addressEntity = await this.addressRepository.save(addressEntity);
        // Build the user entity object
        const userEntity = new UserEntity();
        userEntity.userGuid = uuidv4();
        userEntity.firstName = user.firstName;
        userEntity.lastName = user.lastName;
        userEntity.email = user.email;
        userEntity.password = await this.authService.hashPassword(user.password);
        userEntity.companyName = user.companyName;
        userEntity.address = addressEntity;
        userEntity.isMailDeliveryAcceptable = user.isMailDeliveryAcceptable;
        userEntity.phoneNumber = user.phoneNumber;
        userEntity.faxNumber = user.faxNumber;
        userEntity.role = userRole;

        return from(this.userRepository.save(userEntity)).pipe(
            map((user: UserEntity) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                delete user.password;
                return user;
            }),
            catchError((err) => throwError(err)),
        );
    }

    public async login(user: UserDto): Promise<string> {
        const userObj: UserEntity = await this.validateUser(user.email, user.password);
        if (user) {
            return await this.authService.generateJWT(userObj);
        }
        return 'Wrong Credentials';
    }

    public async validateUser(email: string, password: string): Promise<UserEntity> {
        const user: UserEntity = await this.findUserByEmail(email);
        const isValidUser = this.authService.comparePasswords(password, user.password);
        if (isValidUser) {
            delete user.password;
            return user;
        }
        throw Error;
    }

    public async findUserByEmail(email: string): Promise<UserEntity> {
        return await this.userRepository.findOne({ email });
    }

    public async findOne(id: number): Promise<UserEntity> {
        const user: UserEntity = await this.userRepository.findOne({ id });
        delete user.password;
        return user;
    }
}
