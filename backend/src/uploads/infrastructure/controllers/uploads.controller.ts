import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import type { RequestUser } from '../../../auth/domain/services/auth-token.service.interface';
import { DeleteUploadBodyDto } from '../../application/dto/delete-upload.dto';
import { PresignUploadBodyDto } from '../../application/dto/presign-upload.dto';
import { S3UploadService } from '../storage/s3-upload.service';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly s3: S3UploadService) {}

  @Post('presign')
  async presign(
    @CurrentUser() user: RequestUser,
    @Body() body: PresignUploadBodyDto,
  ) {
    const key = this.s3.buildKey(user.userId, body.type, body.filename);
    const uploadUrl = await this.s3.generatePresignedUploadUrl(
      key,
      body.contentType,
      300,
    );
    const readUrl = await this.s3.generatePresignedReadUrl(key, 3600);
    return { uploadUrl, key, readUrl };
  }

  @Delete()
  async remove(
    @CurrentUser() user: RequestUser,
    @Body() body: DeleteUploadBodyDto,
  ) {
    this.assertKeyOwnedByUser(user.userId, body.key);
    await this.s3.deleteFile(body.key);
    return { deleted: true };
  }

  private assertKeyOwnedByUser(userId: string, key: string): void {
    const prefixA = `uploads/avatar/${userId}/`;
    const prefixP = `uploads/portfolio/${userId}/`;
    if (!key.startsWith(prefixA) && !key.startsWith(prefixP)) {
      throw new ForbiddenException('Clave no autorizada');
    }
  }
}
