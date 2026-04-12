import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import type { RequestUser } from '../../../auth/domain/services/auth-token.service.interface';
import { CreateProfileBodyDto } from '../../application/dto/create-profile.dto';
import { SearchProfilesQueryDto } from '../../application/dto/search-profiles.query.dto';
import { UpdateProfileBodyDto } from '../../application/dto/update-profile.dto';
import { CreateProfileUseCase } from '../../application/use-cases/create-profile.use-case';
import { GetProfileByUserIdUseCase } from '../../application/use-cases/get-profile-by-user-id.use-case';
import { SearchProfilesUseCase } from '../../application/use-cases/search-profiles.use-case';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.use-case';

@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly createProfile: CreateProfileUseCase,
    private readonly updateProfile: UpdateProfileUseCase,
    private readonly getProfileByUserId: GetProfileByUserIdUseCase,
    private readonly searchProfiles: SearchProfilesUseCase,
  ) {}

  @Get('search')
  search(@Query() query: SearchProfilesQueryDto) {
    const skillIds = new Set<string>(query.skill ?? []);
    if (query.skillId) {
      skillIds.add(query.skillId);
    }
    return this.searchProfiles.execute({
      skillIds: skillIds.size ? [...skillIds] : undefined,
      skillName: query.skillName,
      district: query.district,
      isAvailable: query.isAvailable,
      maxHourlyRate: query.maxHourlyRate,
      search: query.search,
      category: query.category,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('by-user/:userId')
  getByUser(
    @Param('userId', new ParseUUIDPipe({ version: '4' })) userId: string,
  ) {
    return this.getProfileByUserId.execute(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: RequestUser, @Body() body: CreateProfileBodyDto) {
    return this.createProfile.execute(user.userId, body);
  }

  @Patch('by-user/:userId')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('userId', new ParseUUIDPipe({ version: '4' })) userId: string,
    @Body() body: UpdateProfileBodyDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.updateProfile.execute({
      targetUserId: userId,
      actorUserId: user.userId,
      patch: body,
    });
  }
}
