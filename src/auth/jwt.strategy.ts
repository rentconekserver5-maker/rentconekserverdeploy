import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'), // Use your NestJS JWT secret
    });
  }

  async validate(payload: any) {
    const { sub: userId } = payload; // Supabase JWT 'sub' field contains the user ID

    // Verify the JWT with Supabase (optional, but good for active session check)
    const { data: supabaseUser, error: supabaseError } = await this.supabaseService.supabase.auth.getUser(userId);
    if (supabaseError || !supabaseUser) {
      throw new UnauthorizedException('Supabase authentication failed.');
    }

    // Fetch the user profile from our public.users table
    const userProfile = await this.usersService.findOne(userId);
    if (!userProfile) {
      throw new UnauthorizedException('User profile not found.');
    }

    return userProfile; // This object will be attached to req.user
  }
}
