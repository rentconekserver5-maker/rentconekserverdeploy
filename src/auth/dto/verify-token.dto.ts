import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export enum UserRole {
  LANDLORD = 'landlord',
  TENANT = 'tenant',
  AGENT = 'agent',
}

export class VerifyTokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsOptional()
  @IsObject()
  profile?: {
    name?: string;
    surname?: string;
    username?: string;
    email?: string;
    phone?: string;
    role?: UserRole;
    isVerified?: boolean;
  };
}