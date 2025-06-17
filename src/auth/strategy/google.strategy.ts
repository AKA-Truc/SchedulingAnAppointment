import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { VerifiedCallback } from 'passport-jwt';
import { Logger } from '@nestjs/common';
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {

    constructor(configService: ConfigService) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID') ?? '',
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') ?? '',
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
            scope: ['email', 'profile'],
            // passReqToCallback: true,
        });
    }

    //http://localhost:3000/auth/google/login
    async validate(
        // req: any,
        accessToken: string,
        refreshToken: string,
        profile: any,
        // done: (error: any, user?: any) => void,
        done: VerifiedCallback
    ) {
        const { name, emails, photos } = profile;
        const user = {
            email: emails[0].value,
            fullName: `${name.givenName} ${name.familyName}`,
            picture: photos[0].value,
            provider: 'google',
        };

        // done(null, user);
        return user;
    }

}
