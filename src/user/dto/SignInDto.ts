import {IsEmail, IsNotEmpty, IsString, MinLength} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export default class SignInDto {
    @ApiProperty({
        description: 'User email address',
        example: 'john.doe@example.com',
    })
    @IsEmail({}, {message: 'Email inválido 👀'})
    @IsNotEmpty({
        message: 'Email não pode ser vazio'
    })
    readonly email: string;

    @ApiProperty({
        description: 'User password',
        example: 'password123',
    })
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