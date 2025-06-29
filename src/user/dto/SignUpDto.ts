import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export default class SignUpDto {
  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Email inválido 👀' })
  @IsNotEmpty({
    message: 'Email não pode ser vazio',
  })
  readonly email: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'password123',
    minLength: 6,
  })
  @IsString({
    message: 'Senha inválida 🙈',
  })
  @IsNotEmpty({
    message: 'Senha não pode ser vazia 🔒',
  })
  @MinLength(6, {
    message: 'Senha deve ter no mínimo 6 caracteres 🔐',
  })
  readonly password: string;

  @ApiProperty({
    description: 'Avatar file ID',
    example: 'file-123',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly avatarId: string;
}
