import { IsArray, IsNotEmpty, IsOptional, IsString, IsNumberString, IsLatitude, IsLongitude } from 'class-validator';

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
  @IsString({
    message: 'Descrição inválida 🙈',
  })
  readonly description?: string;

  @IsOptional()
  @IsArray({
    message: 'As fotos devem ser uma lista de strings',
  })
  readonly photos?: string[];

  @IsOptional()
  @IsString({
    message: 'Link inválido 🙈',
  })
  readonly link?: string;

  @IsOptional()
  @IsLatitude({
    message: 'Latitude deve estar entre -90 e 90 graus 🙈',
  })
  readonly latitude?: string;

  @IsOptional()
  @IsString({
    message: 'Longitude deve ser uma string 🙈',
  })
  @IsLongitude({
    message: 'Longitude deve estar entre -180 e 180 graus 🙈',
  })
  readonly longitude?: string;
}
