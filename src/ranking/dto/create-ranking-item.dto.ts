import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export default class CreateRankingItemDto {
  rankingId: string;

  @IsString({
    message: 'Nome inválido 🙈',
  })
  @IsNotEmpty({
    message: 'Nome não pode ser vazio 💁',
  })
  readonly name: string;

  createdById: string;

  @IsOptional()
  readonly description?: string;

  @IsOptional()
  @IsArray({
    message: 'As fotos devem ser uma lista de strings',
  })
  readonly photos?: string[];

  @IsOptional()
  readonly link?: string;

  @IsOptional()
  readonly latitude?: string;

  @IsOptional()
  readonly longitude?: string;
}
