import {IsNotEmpty, IsNumber} from "class-validator";

export default class CreateRankingItemScoreDto {
    rankingItemId: string
    userId: string

    @IsNotEmpty({
        message: 'Pontuação não pode ser vazia 💁'
    })
    @IsNumber({

    }, {
        message: 'Pontuação precisa ser um número 🤷'
    })
    score: number
}