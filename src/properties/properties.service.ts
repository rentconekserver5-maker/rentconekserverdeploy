import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

function mapPropertyToFrontend(dbProperty: any, owner?: any): any {
  if (!dbProperty) return null;
  return {
    id: dbProperty.id,
    title: dbProperty.title,
    description: dbProperty.description || '',
    price: Number(dbProperty.price) || 0,
    priceType: dbProperty.price_type || 'month',
    currency: dbProperty.currency || 'USD',
    address: dbProperty.address || '',
    latitude: Number(dbProperty.latitude) || 0,
    longitude: Number(dbProperty.longitude) || 0,
    bedrooms: Number(dbProperty.bedrooms) || 0,
    bathrooms: Number(dbProperty.bathrooms) || 0,
    area: Number(dbProperty.area) || 0,
    images: dbProperty.images || [],
    ownerId: dbProperty.owner_id,
    ownerName: owner?.name || '',
    ownerPhone: owner?.phone || '',
    ownerEmail: owner?.email || '',
    amenities: dbProperty.amenities || [],
    availableFrom: dbProperty.available_from || new Date().toISOString(),
    propertyType: dbProperty.property_type || 'apartment',
    createdAt: dbProperty.created_at,
    isAvailable: dbProperty.status === 'published',
    views: Number(dbProperty.views) || 0,
  };
}

@Injectable()
export class PropertiesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createPropertyDto: CreatePropertyDto, ownerId: string) {
    const { data, error } = await this.supabaseService.supabase
      .from('properties')
      .insert({
        title: createPropertyDto.title,
        description: createPropertyDto.description,
        price: createPropertyDto.price,
        price_type: createPropertyDto.priceType,
        currency: createPropertyDto.currency,
        address: createPropertyDto.address,
        latitude: createPropertyDto.latitude,
        longitude: createPropertyDto.longitude,
        bedrooms: createPropertyDto.bedrooms,
        bathrooms: createPropertyDto.bathrooms,
        area: createPropertyDto.area,
        images: createPropertyDto.images,
        amenities: createPropertyDto.amenities,
        available_from: createPropertyDto.availableFrom,
        property_type: createPropertyDto.propertyType,
        owner_id: ownerId,
      })
      .select();
    if (error) {
      throw new Error(error.message);
    }
    const property = data ? data[0] : null;

    // Fetch owner to include in response
    const { data: ownerData } = await this.supabaseService.supabase
      .from('users')
      .select('*')
      .eq('id', ownerId)
      .single();

    return property ? mapPropertyToFrontend(property, ownerData) : null;
  }

  async findAll() {
    const { data, error } = await this.supabaseService.supabase
      .from('properties')
      .select('*, users!properties_owner_id_fkey(*)');
    if (error) {
      throw new Error(error.message);
    }
    const results = data ? data.map((item: any) => mapPropertyToFrontend(item, item.users)) : [];
    return { results };
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService.supabase
      .from('properties')
      .select('*, users!properties_owner_id_fkey(*)')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data ? mapPropertyToFrontend(data, data.users) : null;
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto) {
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };
    if (updatePropertyDto.title !== undefined) updatePayload.title = updatePropertyDto.title;
    if (updatePropertyDto.description !== undefined) updatePayload.description = updatePropertyDto.description;
    if (updatePropertyDto.price !== undefined) updatePayload.price = updatePropertyDto.price;
    if (updatePropertyDto.priceType !== undefined) updatePayload.price_type = updatePropertyDto.priceType;
    if (updatePropertyDto.currency !== undefined) updatePayload.currency = updatePropertyDto.currency;
    if (updatePropertyDto.address !== undefined) updatePayload.address = updatePropertyDto.address;
    if (updatePropertyDto.latitude !== undefined) updatePayload.latitude = updatePropertyDto.latitude;
    if (updatePropertyDto.longitude !== undefined) updatePayload.longitude = updatePropertyDto.longitude;
    if (updatePropertyDto.bedrooms !== undefined) updatePayload.bedrooms = updatePropertyDto.bedrooms;
    if (updatePropertyDto.bathrooms !== undefined) updatePayload.bathrooms = updatePropertyDto.bathrooms;
    if (updatePropertyDto.area !== undefined) updatePayload.area = updatePropertyDto.area;
    if (updatePropertyDto.images !== undefined) updatePayload.images = updatePropertyDto.images;
    if (updatePropertyDto.amenities !== undefined) updatePayload.amenities = updatePropertyDto.amenities;
    if (updatePropertyDto.availableFrom !== undefined) updatePayload.available_from = updatePropertyDto.availableFrom;
    if (updatePropertyDto.propertyType !== undefined) updatePayload.property_type = updatePropertyDto.propertyType;
    if (updatePropertyDto.status !== undefined) updatePayload.status = updatePropertyDto.status;

    const { data, error } = await this.supabaseService.supabase
      .from('properties')
      .update(updatePayload)
      .eq('id', id)
      .select('*, users!properties_owner_id_fkey(*)');
    if (error) {
      throw new Error(error.message);
    }
    const property = data ? data[0] : null;
    return property ? mapPropertyToFrontend(property, property.users) : null;
  }

  async incrementViews(id: string) {
    // First, get current property
    const { data: dbProperty, error: findError } = await this.supabaseService.supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
    if (findError) {
      if (findError.code === 'PGRST116') throw new Error('Property not found');
      throw new Error(findError.message);
    }

    const { data, error } = await this.supabaseService.supabase
      .from('properties')
      .update({
        views: (dbProperty.views || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, users!properties_owner_id_fkey(*)');
    if (error) {
      throw new Error(error.message);
    }
    const property = data ? data[0] : null;
    return property ? mapPropertyToFrontend(property, property.users) : null;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService.supabase
      .from('properties')
      .delete()
      .eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
    return { success: true };
  }
}
