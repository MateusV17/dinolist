import Database from './database.js';

async function up() {
  const db = await Database.connect();

  const periodSql = `
    CREATE TABLE periods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(20) NOT NULL
    )
  `;

  await db.run(periodSql);
  
  const dinosSql = `
    CREATE TABLE dinos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(20) NOT NULL,
      height VARCHAR(20) NOT NULL,
      weight VARCHAR(20) NOT NULL,
      description TEXT NOT NULL,
      image VARCHAR(50) NOT NULL,
      period_id INTEGER NOT NULL,
      FOREIGN KEY (period_id) REFERENCES periods (id)
    )
  `;
  
  await db.run(dinosSql);

  const foodsSql = `
  CREATE TABLE foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(20) NOT NULL,
    image VARCHAR(50) NOT NULL,
    price DOUBLE NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories (id)
  )
`;

  await db.run(foodsSql);

const usersSql = `
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(20) NOT NULL CHECK(LENGTH(password) >= 8)
  )
`;

  await db.run(usersSql);

}

export default { up };
