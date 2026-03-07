import bcrypt from 'bcrypt';

import { IHashProvider } from './hash.provider.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BcryptHashProvider implements IHashProvider {
  async hash(payload: string): Promise<string> {
    return bcrypt.hash(payload, 10);
  }
  async compare(payload: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(payload, hashed);
  }
}
