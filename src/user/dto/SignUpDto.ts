import {IsEmail, IsNotEmpty, IsOptional, IsString, MinLength} from 'class-validator';

export default class SignUpDto {
    @IsString()
    @IsOptional()
    readonly name: string;

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

    @IsString()
    @IsOptional()
    readonly avatar: string;
}