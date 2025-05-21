import {
    Controller, Get, Post, Body, Param,Delete,Patch,Query,ParseIntPipe,
} from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { CreateHospital, UpdateHospital } from './DTO';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Hospital')
@Controller('hospital')
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Post()
  async create(@Body() dto: CreateHospital) {
    const result = await this.hospitalService.createHospital(dto);
    return {
      message: 'Hospital created successfully',
      data: result,
    };
  }

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const parsedPage = Math.max(Number(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

    const { data, meta } = await this.hospitalService.getAllHospitals(parsedPage, parsedLimit);

    return {
      message: 'Hospitals fetched successfully',
      data,
      meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.hospitalService.getHospitalById(id);
    return {
      message: `Hospital with ID ${id} fetched successfully`,
      data: result,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHospital,
  ) {
    const updated = await this.hospitalService.updateHospital(id, dto);
    return {
      message: `Hospital with ID ${id} updated successfully`,
      data: updated,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.hospitalService.deleteHospital(id);
    return {
      message: `Hospital with ID ${id} deleted successfully`,
      data: deleted,
    };
  }
}
