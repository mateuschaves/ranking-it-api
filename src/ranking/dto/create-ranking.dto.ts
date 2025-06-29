import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
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
  readonly photo: string;

  @ApiProperty({
    description: 'Owner ID (automatically set from JWT token)',
    example: 'user-123',
  })
  ownerId: string;
}
