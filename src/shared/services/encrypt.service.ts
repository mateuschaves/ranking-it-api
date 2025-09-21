import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcryptjs';

@Injectable()
export class EncryptService {
    async hash(value: string): Promise<string> {
        return await hash(value, 8);
    }

    async compare(raw: string, hashed: string): Promise<boolean> {
        return await compare(raw, hashed);
    }
}