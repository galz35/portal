
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DbService } from './database/db.service';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db = app.get(DbService);
  
  let output = '';
  try {
    output += '--- COLUMNS FOR Usuarios ---\n';
    const columns = await db.query(`
      SELECT column_name as name, data_type as type
      FROM information_schema.columns 
      WHERE table_name = 'Usuarios'
    `);
    output += JSON.stringify(columns, null, 2) + '\n';

    output += '\n--- COLUMNS FOR Roles ---\n';
    const roles = await db.query(`
      SELECT column_name as name, data_type as type
      FROM information_schema.columns 
      WHERE table_name = 'Roles'
    `);
    output += JSON.stringify(roles, null, 2) + '\n';
    
  } catch (err) {
    output += 'Error querying schema: ' + err.message + '\n';
  } finally {
    fs.writeFileSync('db-inspect-result.txt', output);
    await app.close();
  }
}
bootstrap();
