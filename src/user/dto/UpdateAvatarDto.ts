import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAvatarDto {
  @ApiProperty({
    description: 'ID do novo avatar (fileId)',
    example: 'file-123',
  })
  @IsString()
  @IsNotEmpty()
  avatarId: string;
} 