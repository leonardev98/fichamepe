import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UploadsController } from './infrastructure/controllers/uploads.controller';
import { S3UploadService } from './infrastructure/storage/s3-upload.service';

@Module({
  imports: [AuthModule],
  controllers: [UploadsController],
  providers: [S3UploadService],
  exports: [S3UploadService],
})
export class UploadsModule {}
