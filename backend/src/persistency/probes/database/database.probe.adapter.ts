import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DatabaseProbe } from './database.probe';

@Injectable()
export class DatabaseProbeAdapter extends DatabaseProbe {
  constructor(@Inject(DataSource) private readonly dataSource: DataSource) {
    super();
  }

  async ping(): Promise<void> {
    await this.dataSource.query('SELECT 1');
  }
}
