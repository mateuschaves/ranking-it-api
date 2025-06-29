import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptRankingInviteDto {
  @IsString()
  @IsNotEmpty()
  inviteId: string;
} 