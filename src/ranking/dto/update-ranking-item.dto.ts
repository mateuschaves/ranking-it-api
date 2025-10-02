import { IsArray, IsOptional, IsString, IsNumberString, IsLatitude, IsLongitude } from 'class-validator';

export default class UpdateRankingItemDto {
  @IsOptional()
  @IsString({
    message: 'Nome inválido 🙈',
  })
  readonly name?: string;

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
  @IsString({
    message: 'Latitude deve ser uma string 🙈',
  })
  @IsNumberString(
    {},
    {
      message: 'Latitude deve ser um número válido 🙈',
    },
  )
  @IsLatitude({
    message: 'Latitude deve estar entre -90 e 90 graus 🙈',
  })
  readonly latitude?: string;

  @IsOptional()
  @IsString({
    message: 'Longitude deve ser uma string 🙈',
  })
  @IsNumberString(
    {},
    {
      message: 'Longitude deve ser um número válido 🙈',
    },
  )
  @IsLongitude({
    message: 'Longitude deve estar entre -180 e 180 graus 🙈',
  })
  readonly longitude?: string;
}


