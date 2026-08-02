import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Req } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createPropertyDto: CreatePropertyDto, @Req() req) {
    const property = await this.propertiesService.create(createPropertyDto, req.user.id);
    return { property };
  }

  @Get()
  async findAll() {
    return this.propertiesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const property = await this.propertiesService.findOne(id);
    if (!property) {
      // Consider throwing NotFoundException
      return null;
    }
    return property;
  }

  @Post(':id/views')
  async incrementViews(@Param('id') id: string) {
    const property = await this.propertiesService.incrementViews(id);
    return { property };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto) {
    const property = await this.propertiesService.update(id, updatePropertyDto);
    return { property };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.propertiesService.remove(id);
  }
}
