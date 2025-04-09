import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';
import { Readable } from 'stream';

class CreateFileDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsString()
  path: string;

  @IsNotEmpty()
  @IsString()
  mimetype: string;

  @IsNotEmpty()
  @IsNumberString()
  size: number;

  @IsNotEmpty()
  @IsString()
  buffer: Readable;
}

export default CreateFileDto;
