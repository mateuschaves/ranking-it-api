import { IsNotEmpty } from 'class-validator';

export default class CreateRankingCriteriaDto {
  @IsNotEmpty({
    message: 'Critério não pode ser vazio 💁',
  })
  criteria: string;
}
