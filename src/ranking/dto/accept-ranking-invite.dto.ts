import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptRankingInviteDto {
  @ApiProperty({
    description: 'ID of the invite to accept',
    example: 'invite-123',
  })
  @IsString()
  @IsNotEmpty()
  inviteId: string;
} 