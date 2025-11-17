import { IsNotEmpty, IsString } from 'class-validator';

export class BlockUserDto {
  @IsString({
    message: 'ID do usuário precisa ser uma string 😅',
  })
  @IsNotEmpty({
    message: 'ID do usuário é obrigatório 😬',
  })
  blockedUserId: string;
}

