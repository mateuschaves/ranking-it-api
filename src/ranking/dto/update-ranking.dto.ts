import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export default class UpdateRankingDto {
  @IsString({
    message: 'Nome inválido 🙈',
  })
  @IsNotEmpty({
    message: 'Nome não pode ser vazio 💁',
  })
  @IsOptional()
  readonly name: string;

  @IsOptional()
  readonly description: string;

  @IsOptional()
  readonly photo: string;
}
