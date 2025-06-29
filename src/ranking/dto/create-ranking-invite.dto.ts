import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRankingInviteDto {
  @ApiProperty({
    description: 'Email address of the user to invite',
    example: 'friend@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'ID of the ranking to invite the user to',
    example: 'ranking-123',
  })
  @IsString()
  @IsNotEmpty()
  rankingId: string;
} 