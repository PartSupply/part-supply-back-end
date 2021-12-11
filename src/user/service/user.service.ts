import { Injectable, NotFoundException, HttpService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from './../../auth/service/auth.service';
import { Repository, UpdateResult } from 'typeorm';
import { RoleEntity } from '../models/role.entity';
import { ResetUserPasswordDto, UserDto, userRoleMapper, UserSessionDto } from '../models/user.dto';
import { UserEntity } from '../models/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { AddressEntity } from '../models/address.entity';
import { UserSessionEntity } from '../models/user-session.entity';
import * as https from 'https';
import { OtpEntity } from '../models/otp.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(RoleEntity) private readonly roleRepository: Repository<RoleEntity>,
        @InjectRepository(AddressEntity) private readonly addressRepository: Repository<AddressEntity>,
        @InjectRepository(UserSessionEntity) private readonly userSessionRepository: Repository<UserSessionEntity>,
        @InjectRepository(OtpEntity) private readonly otpRepository: Repository<OtpEntity>,
        private authService: AuthService,
        private httpService: HttpService,
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
        const createAccountTemplate = this.createAccountTemplate(userEntity);
        this.sendEmail(userEntity, createAccountTemplate);
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

        const addressEntity: AddressEntity = new AddressEntity();
        addressEntity.id = savedUser.address.id;
        addressEntity.addressLineOne = user.address.addressLineOne;
        addressEntity.city = user.address.city;
        addressEntity.state = user.address.state;
        addressEntity.zipCode = user.address.zipCode;
        addressEntity.country = user.address.country;
        await this.addressRepository.save({
            ...addressEntity,
        });
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

    public generatePasscode(): number {
        const min = 100000;
        const max = 900000;
        const num = Math.floor(Math.random() * min) + max;
        return num;
    }

    public sendPassCodeTemplate(otpEntity: OtpEntity) {
        return {
            subject: 'PartSupply: One time PassCode for changing password of your account',
            body: `Your One Time PassCode for Resetting Password for PartSupply is : ${otpEntity.oneTimeCode}`,
        };
    }

    public passwordChangeTemplate(user: UserEntity) {
        return {
            subject: 'PartSupply: User Account Password Changed',
            body: 'Your PartSupply account password has been changed successfully',
        };
    }

    public createAccountTemplate(user: UserEntity) {
        return {
            subject: 'PartSupply: User Account Created',
            body: `Your account with PartSupply has been created successfully. Your account email is ${user.email} please login with this user email address.`,
        };
    }

    public async generateOneTimeCodeForPasswordReset(user: UserEntity) {
        let otpEntity = await this.otpRepository.findOne({ userId: user.id });
        if (!otpEntity) {
            otpEntity = new OtpEntity();
            otpEntity.userId = user.id;
        }
        otpEntity.oneTimeCode = this.generatePasscode();
        await this.otpRepository.save(otpEntity);
        const template = this.sendPassCodeTemplate(otpEntity);
        this.sendEmail(user, template);
        return;
    }

    public async sendEmail(user: UserEntity, template: any) {
        const config = {
            headers: {
                Authorization: `Bearer ${process.env.EMAIL_API_KEY}`,
                Host: 'api.sendgrid.com',
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        };

        const body = {
            from: {
                email: 'partsupplytaylor@gmail.com',
            },
            subject: template.subject,
            personalizations: [
                {
                    to: [
                        {
                            email: user.email,
                        },
                    ],
                },
            ],
            content: [
                {
                    value: `${template.body}`,
                    type: 'text/plain',
                },
                {
                    value: `${template.body}`,
                    type: 'text/html',
                },
            ],
        };

        await this.httpService.post('https://api.sendgrid.com/v3/mail/send', body, config).toPromise();
    }

    public async resetPassword(user: UserEntity, resetPasswordDto: ResetUserPasswordDto) {
        const savedOtpEntity = await this.otpRepository.findOne({ userId: user.id });
        if (!savedOtpEntity || savedOtpEntity.oneTimeCode !== resetPasswordDto.oneTimeCode) {
            throw new NotFoundException('One time passcode is not match');
        }

        user.password = await this.authService.hashPassword(resetPasswordDto.password);
        await this.userRepository.save({
            ...user,
        });
        const template = this.passwordChangeTemplate(user);
        this.sendEmail(user, template);
    }
}
