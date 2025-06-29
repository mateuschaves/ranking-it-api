import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateRankingInviteDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  rankingId: string;
} 