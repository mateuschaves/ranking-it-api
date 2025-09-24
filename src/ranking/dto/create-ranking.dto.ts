import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export default class CreateRankingDto {
  @ApiProperty({
    description: 'Ranking name',
    example: 'Best Restaurants in NYC',
  })
  @IsString({
    message: 'Nome inválido 🙈',
  })
  @IsNotEmpty({
    message: 'Nome não pode ser vazio 💁',
  })
  readonly name: string;

  @ApiProperty({
    description: 'Ranking description',
    example: 'Top restaurants in New York City',
    required: false,
  })
  @IsOptional()
  readonly description: string;

  @ApiProperty({
    description: 'Ranking banner photo',
    example: 'banner-photo-url',
    required: false,
  })
  @IsOptional()
  readonly photo?: string;

  @ApiProperty({
    description: 'Whether ranking items can have geolocation (latitude/longitude)',
    example: true,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({
    message: 'hasGeolocation deve ser um valor booleano',
  })
  readonly hasGeolocation?: boolean;

  @ApiProperty({
    description: 'Owner ID (automatically set from JWT token)',
    example: 'user-123',
  })
  ownerId: string;
}
