import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService, private readonly usersService: UsersService) {}

  async signUp(email: string, password: string): Promise<any> {
    const { data, error } = await this.supabaseService.supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async signIn(email: string, password: string): Promise<any> {
    const { data, error } = await this.supabaseService.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async resetPassword(email: string): Promise<any> {
    const { data, error } = await this.supabaseService.supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async verifyToken(token: string, profile?: Record<string, unknown>): Promise<any> {
    const { data: supabaseUser, error } = await this.supabaseService.supabase.auth.getUser(token);

    if (error || !supabaseUser.user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Find or create user in our backend database
    const user = await this.usersService.findOrCreateUser(supabaseUser.user, profile);

    return user;
  }
}
