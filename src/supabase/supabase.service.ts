import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  public supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    // Use service role key to bypass RLS policies - allows backend to fetch all data
    // Auth guards are enforced at the controller level for write operations
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not provided in environment variables. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
}

