import {IsNotEmpty, IsOptional, IsString} from 'class-validator';

export default class CreateRankingDto {
    @IsString({
        message: 'Nome inválido 🙈'
    })
    @IsNotEmpty({
        message: 'Nome não pode ser vazio 💁'
    })
     readonly name: string;

    @IsOptional()
     readonly description: string;

    @IsOptional()
     readonly photo: string;

     ownerId: string;
}