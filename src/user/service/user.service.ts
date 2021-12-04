import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from './../../auth/service/auth.service';
import { Repository, UpdateResult } from 'typeorm';
import { RoleEntity } from '../models/role.entity';
import { UserDto, userRoleMapper, UserSessionDto } from '../models/user.dto';
import { UserEntity } from '../models/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { AddressEntity } from '../models/address.entity';
import { UserSessionEntity } from '../models/user-session.entity';
import { threadId } from 'worker_threads';
import { use } from 'passport';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(RoleEntity) private readonly roleRepository: Repository<RoleEntity>,
        @InjectRepository(AddressEntity) private readonly addressRepository: Repository<AddressEntity>,
        @InjectRepository(UserSessionEntity) private readonly userSessionRepository: Repository<UserSessionEntity>,
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
        userEntity.deliveryRadius = user.deliveryRadius;
        // By default make this as false and this needs to be approved by admin
        userEntity.isAccountApproved = false;
        userEntity.isAccountActive = false;
        userEntity.accountCreationDate = new Date().toISOString();
        userEntity.accountUpdatedDate = new Date().toISOString();
        userEntity.role = userRole;

        return await this.userRepository.save(userEntity);
    }

    public async updateUserProfile(user: UserDto) {
        const savedUser: UserEntity = await this.userRepository.findOne({ email: user.email });
        savedUser.firstName = user.firstName;
        savedUser.lastName = user.lastName;
        savedUser.password = await this.authService.hashPassword(user.password);
        savedUser.companyName = user.companyName;
        savedUser.address.addressLineOne = user.address.addressLineOne;
        savedUser.address.city = user.address.city;
        savedUser.address.state = user.address.state;
        savedUser.address.zipCode = user.address.zipCode;
        savedUser.address.country = user.address.country;
        savedUser.isMailDeliveryAcceptable = user.isMailDeliveryAcceptable;
        savedUser.phoneNumber = user.phoneNumber;
        savedUser.deliveryRadius = user.deliveryRadius;
        savedUser.faxNumber = user.faxNumber;

        await this.userRepository.save({
            ...savedUser,
        });
        return;
    }

    public async login(user: UserDto): Promise<string> {
        const userObj: UserEntity = await this.validateUser(user.email, user.password);
        if (user) {
            // First need to make sure user account is approved by admin and second is not blocked
            if (!userObj.isAccountActive || !userObj.isAccountApproved) {
                // If any one of this set as false that mean admin has blocked this account
                throw new NotFoundException('Account is not activate by Admin. please reach out to admin');
            }
            const jwtString = await this.authService.generateJWT(userObj);
            // Need to store this issued token in to user session table
            // this stored token will be validated upon all authenticated request
            let savedUserSession = await this.findSavedUserSessionByUserGuid(userObj.userGuid);
            if (!savedUserSession) {
                savedUserSession = new UserSessionEntity();
                savedUserSession.userGuid = userObj.userGuid;
                savedUserSession.token = jwtString;
                savedUserSession.dateTime = new Date() + '';
            } else {
                savedUserSession.token = jwtString;
                savedUserSession.dateTime = new Date() + '';
            }
            await this.saveUserSession(savedUserSession);
            return jwtString;
        }
        return 'Wrong Credentials';
    }

    public async validateUser(email: string, password: string): Promise<UserEntity> {
        const user: UserEntity = await this.findUserByEmail(email);
        const isValidUser = await this.authService.comparePasswords(password, user.password);
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

    public async saveUserSession(userSession: UserSessionDto): Promise<UserSessionEntity> {
        const userSessionEntity = new UserSessionEntity();
        userSessionEntity.userGuid = userSession.userGuid;
        userSessionEntity.token = userSession.token;
        userSessionEntity.dateTime = userSession.dateTime;
        return await this.userSessionRepository.save(userSession);
    }

    public async findSavedUserSessionByUserGuid(userGuid: string): Promise<UserSessionEntity> {
        return await this.userSessionRepository.findOne({ userGuid });
    }

    public async updateSavedUserSession(userSession: UserSessionEntity): Promise<UpdateResult> {
        return await this.userSessionRepository.update(userSession.id, userSession);
    }
}
