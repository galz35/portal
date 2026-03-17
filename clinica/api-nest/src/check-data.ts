
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DbService } from './database/db.service';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db = app.get(DbService);
  
  let output = '';
  try {
    output += '--- ROLES ---\n';
    const roles = await db.query('SELECT * FROM Roles');
    output += JSON.stringify(roles, null, 2) + '\n';

    output += '\n--- USER GUSTAVO? ---\n';
    const users = await db.query("SELECT * FROM Usuarios WHERE carnet = '500708' OR carnet = 'GUSTAVO.LIRA@CLARO.COM.NI'");
    output += JSON.stringify(users, null, 2) + '\n';
    
  } catch (err) {
    output += 'Error: ' + err.message + '\n';
  } finally {
    fs.writeFileSync('db-data-check.txt', output);
    await app.close();
  }
}
bootstrap();
