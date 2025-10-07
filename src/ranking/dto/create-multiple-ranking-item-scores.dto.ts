import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ScoreDto {
  @IsNotEmpty({
    message: 'ID do critério não pode ser vazio 💁',
  })
  rankingCriteriaId: string;

  @IsNotEmpty({
    message: 'Pontuação não pode ser vazia 💁',
  })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    {
      message: 'Pontuação precisa ser um número 🤷',
    },
  )
  score: number;
}

export default class CreateMultipleRankingItemScoresDto {
  rankingItemId: string;
  userId: string;

  @IsArray({
    message: 'Scores deve ser um array 📝',
  })
  @ValidateNested({ each: true })
  @Type(() => ScoreDto)
  scores: ScoreDto[];
}
