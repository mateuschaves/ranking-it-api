import {IsEmail, IsNotEmpty, IsString, MinLength} from 'class-validator';

export default class SignInDto {
    @IsEmail({}, {message: 'Email inválido 👀'})
    @IsNotEmpty({
        message: 'Email não pode ser vazio'
    })
    readonly email: string;

    @IsString({
        message: 'Senha inválida 🙈'
    })
    @IsNotEmpty({
        message: 'Senha não pode ser vazia 🔒'
    })
    @MinLength(6, {
        message: 'Senha deve ter no mínimo 6 caracteres 🔐'
    })
    readonly password: string;
}