import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
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
import { CreateServiceBodyDto } from '../../application/dto/create-service.dto';
import { FeedQueryDto } from '../../application/dto/feed-query.dto';
import { AddFavoriteBodyDto } from '../../application/dto/add-favorite.dto';
import { UpdateServiceBodyDto } from '../../application/dto/update-service.dto';
import { AddServiceFavoriteUseCase } from '../../application/use-cases/add-service-favorite.use-case';
import { CreateServiceUseCase } from '../../application/use-cases/create-service.use-case';
import { DeleteServiceUseCase } from '../../application/use-cases/delete-service.use-case';
import { GetFeedServicesUseCase } from '../../application/use-cases/get-feed-services.use-case';
import { GetServiceByIdUseCase } from '../../application/use-cases/get-service-by-id.use-case';
import { GetServicesByProfileUseCase } from '../../application/use-cases/get-services-by-profile.use-case';
import { GetMyServiceByIdUseCase } from '../../application/use-cases/get-my-service-by-id.use-case';
import { ListUserFavoriteIdsUseCase } from '../../application/use-cases/list-user-favorite-ids.use-case';
import { ListUserFavoritesUseCase } from '../../application/use-cases/list-user-favorites.use-case';
import { ListMyServicesUseCase } from '../../application/use-cases/list-my-services.use-case';
import { RemoveServiceFavoriteUseCase } from '../../application/use-cases/remove-service-favorite.use-case';
import { ToggleServiceActiveUseCase } from '../../application/use-cases/toggle-service-active.use-case';
import { UpdateServiceUseCase } from '../../application/use-cases/update-service.use-case';
import { SetServiceStatusUseCase } from '../../application/use-cases/set-service-status.use-case';
import { RecordServiceViewUseCase } from '../../application/use-cases/record-service-view.use-case';

@Controller('services')
export class ServicesController {
  constructor(
    private readonly getFeed: GetFeedServicesUseCase,
    private readonly getByProfile: GetServicesByProfileUseCase,
    private readonly getById: GetServiceByIdUseCase,
    private readonly recordServiceView: RecordServiceViewUseCase,
    private readonly createService: CreateServiceUseCase,
    private readonly updateService: UpdateServiceUseCase,
    private readonly toggleActive: ToggleServiceActiveUseCase,
    private readonly deleteService: DeleteServiceUseCase,
    private readonly listFavoriteIds: ListUserFavoriteIdsUseCase,
    private readonly listFavorites: ListUserFavoritesUseCase,
    private readonly listMyServices: ListMyServicesUseCase,
    private readonly getMyServiceById: GetMyServiceByIdUseCase,
    private readonly addFavorite: AddServiceFavoriteUseCase,
    private readonly removeFavorite: RemoveServiceFavoriteUseCase,
    private readonly setStatus: SetServiceStatusUseCase,
  ) {}

  @Get('feed')
  feed(@Query() query: FeedQueryDto) {
    return this.getFeed.execute({
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
      orderBy: query.orderBy ?? 'random',
      search: query.search,
      tags: query.tags,
      country: query.country,
      featuredOnly: query.featuredOnly,
    });
  }

  @Get('profile/:profileId')
  byProfile(@Param('profileId', new ParseUUIDPipe()) profileId: string) {
    return this.getByProfile.execute(profileId);
  }

  @Get('favorites/ids')
  @UseGuards(JwtAuthGuard)
  favoriteIds(@CurrentUser() user: RequestUser) {
    return this.listFavoriteIds.execute(user.userId);
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  favorites(@CurrentUser() user: RequestUser) {
    return this.listFavorites.execute(user.userId);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  myServices(@CurrentUser() user: RequestUser) {
    return this.listMyServices.execute(user.userId);
  }

  @Get('mine/:id')
  @UseGuards(JwtAuthGuard)
  myServiceById(
    @CurrentUser() user: RequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.getMyServiceById.execute(id, user.userId);
  }

  @Post('favorites')
  @UseGuards(JwtAuthGuard)
  addToFavorites(
    @CurrentUser() user: RequestUser,
    @Body() body: AddFavoriteBodyDto,
  ) {
    return this.addFavorite.execute(user.userId, body.serviceId);
  }

  @Delete('favorites/:serviceId')
  @UseGuards(JwtAuthGuard)
  removeFromFavorites(
    @CurrentUser() user: RequestUser,
    @Param('serviceId', new ParseUUIDPipe()) serviceId: string,
  ) {
    return this.removeFavorite.execute(user.userId, serviceId);
  }

  /** Registra una vista real (navegación al detalle); no se dispara con prefetch de enlaces. */
  @Post(':id/view')
  async recordView(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ ok: true }> {
    const ok = await this.recordServiceView.execute(id);
    if (!ok) {
      throw new NotFoundException();
    }
    return { ok: true };
  }

  @Get(':id')
  one(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.getById.execute(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: RequestUser, @Body() body: CreateServiceBodyDto) {
    return this.createService.execute(user.userId, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: RequestUser,
    @Body() body: UpdateServiceBodyDto,
  ) {
    return this.updateService.execute(id, user.userId, body);
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard)
  toggle(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.toggleActive.execute(id, user.userId);
  }

  @Patch(':id/pause')
  @UseGuards(JwtAuthGuard)
  pause(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.setStatus.execute(id, user.userId, 'PAUSADA');
  }

  @Patch(':id/reactivate')
  @UseGuards(JwtAuthGuard)
  reactivate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.setStatus.execute(id, user.userId, 'ACTIVA');
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  publish(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.setStatus.execute(id, user.userId, 'EN_REVISION');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.deleteService.execute(id, user.userId);
  }
}
