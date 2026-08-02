import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

function mapUserToFrontend(dbUser: any): any {
  if (!dbUser) return null;
  return {
    id: dbUser.id,
    name: dbUser.name || '',
    surname: dbUser.surname || '',
    username: dbUser.username || dbUser.display_name || '',
    email: dbUser.email,
    phone: dbUser.phone || '',
    role: dbUser.role || 'tenant',
    isVerified: dbUser.is_verified || false,
    verificationDate: dbUser.verification_date || null,
    subscriptionType: dbUser.subscription_type || null,
    subscriptionExpiry: dbUser.subscription_expiry || null,
    favoriteProperties: dbUser.favorites || [],
    profileImage: dbUser.photo_url || null,
  };
}

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createProfile(id: string, email: string, displayName?: string) {
    const { data, error } = await this.supabaseService.supabase
      .from('users')
      .insert({ id, email, display_name: displayName })
      .select();
    if (error) {
      throw new Error(error.message);
    }
    return data ? mapUserToFrontend(data[0]) : null;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      // If no user found, Supabase returns error.code == 'PGRST116'
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return mapUserToFrontend(data);
  }

  async updateProfile(id: string, updateData: { displayName?: string; phone?: string; photoUrl?: string }) {
    const { data, error } = await this.supabaseService.supabase
      .from('users')
      .update({ 
        display_name: updateData.displayName,
        phone: updateData.phone,
        photo_url: updateData.photoUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    if (error) {
      throw new Error(error.message);
    }
    return data ? mapUserToFrontend(data[0]) : null;
  }

  async updateFavorites(userId: string, propertyId: string, action: 'add' | 'remove') {
    // First, get current user
    const { data: dbUser, error: findError } = await this.supabaseService.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (findError) {
      if (findError.code === 'PGRST116') throw new Error('User not found');
      throw new Error(findError.message);
    }

    let newFavorites = dbUser.favorites || [];
    if (action === 'add') {
      // Add only if not already present
      if (!newFavorites.includes(propertyId)) {
        newFavorites = [...newFavorites, propertyId];
      }
    } else if (action === 'remove') {
      // Remove if present
      newFavorites = newFavorites.filter((id: string) => id !== propertyId);
    }

    const { data, error } = await this.supabaseService.supabase
      .from('users')
      .update({ 
        favorites: newFavorites,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();
    if (error) {
      throw new Error(error.message);
    }
    return data ? mapUserToFrontend(data[0]) : null;
  }

  async findOrCreateUser(supabaseUser: any, profile?: Record<string, unknown>): Promise<any> {
    let { data: dbUser, error: findError } = await this.supabaseService.supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (dbUser) {
      // User exists, update profile if data is provided
      const updatePayload: any = { updated_at: new Date().toISOString() };
      if (profile?.name) updatePayload.name = profile.name;
      if (profile?.surname) updatePayload.surname = profile.surname;
      if (profile?.username) updatePayload.username = profile.username;
      if (profile?.phone) updatePayload.phone = profile.phone;
      if (profile?.role) updatePayload.role = profile.role;
      if (profile?.isVerified) updatePayload.is_verified = profile.isVerified;


      const { data, error } = await this.supabaseService.supabase
        .from('users')
        .update(updatePayload)
        .eq('id', supabaseUser.id)
        .select();

      if (error) {
        throw new Error(error.message);
      }
      return mapUserToFrontend(data[0]);
    } else {
      // User does not exist, create new user
      const createPayload: any = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        display_name: profile?.username || supabaseUser.email, // Use username if available, else email
        name: profile?.name,
        surname: profile?.surname,
        username: profile?.username,
        phone: profile?.phone,
        role: profile?.role || 'tenant', // Default role
        is_verified: profile?.isVerified || false,
      };

      const { data, error } = await this.supabaseService.supabase
        .from('users')
        .insert(createPayload)
        .select();

      if (error) {
        throw new Error(error.message);
      }
      return mapUserToFrontend(data[0]);
    }
  }
}
