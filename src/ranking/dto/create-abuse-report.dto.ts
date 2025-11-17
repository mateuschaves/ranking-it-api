import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAbuseReportDto {
  @IsString()
  @IsNotEmpty({
    message: 'Descrição da denúncia é obrigatória 📝',
  })
  description: string;
}

