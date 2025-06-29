import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export default class CreateRankingCriteriaDto {
  @ApiProperty({
    description: 'Criteria name for the ranking',
    example: 'Taste',
  })
  @IsNotEmpty({
    message: 'Critério não pode ser vazio 💁',
  })
  criteria: string;
}
