import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeactivateAccountDto {
  @ApiProperty({
    description: 'Motivo da desativação da conta',
    example: 'Não estou mais usando o aplicativo',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O motivo deve ser uma string' })
  @MaxLength(500, { message: 'O motivo não pode exceder 500 caracteres' })
  reason?: string;
}

