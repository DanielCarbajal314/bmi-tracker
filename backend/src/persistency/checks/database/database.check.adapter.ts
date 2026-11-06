import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DatabaseCheck } from './database.check';

@Injectable()
export class DatabaseCheckAdapter extends DatabaseCheck {
  constructor(@Inject(DataSource) private readonly dataSource: DataSource) {
    super();
  }

  async ping(): Promise<void> {
    await this.dataSource.query('SELECT 1');
  }
}
