import { IsArray, IsOptional, IsString } from 'class-validator';

export default class UpdateRankingItemDto {
  @IsOptional()
  @IsString({
    message: 'Nome inválido 🙈',
  })
  readonly name?: string;

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


