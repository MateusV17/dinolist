import { resolve } from 'path';
import { readFileSync } from 'fs';
import Note from '../models/Note.js';
import Category from '../models/Category.js';

async function up() {
  const file = resolve(process.cwd(), 'src', 'database', 'seeders.json');

  const content = JSON.parse(readFileSync(file));

  for (const period of content.periods) {
    await Category.create(period);
  }

  // for (const food of content.foods) {
  //   await Note.create(food);
  // }
}

export default { up };
