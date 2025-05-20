import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('achievements')
@Controller('achievements')
export class AchievementController {
    constructor(private readonly achievementService: AchievementService) {}

    @Post()
    create(@Body() createAchievementDto: CreateAchievementDto) {
        return this.achievementService.create(createAchievementDto);
    }

    @Get()
    findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
        return this.achievementService.findAll(page, limit);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.achievementService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateAchievementDto: UpdateAchievementDto) {
        return this.achievementService.update(+id, updateAchievementDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.achievementService.remove(+id);
    }
}
