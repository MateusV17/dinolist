import Database from '../database/database.js';

async function create(period) {
  const db = await Database.connect();

  const { id, name } = period;

  const sql = `
    INSERT INTO
      periods (id, name)
    VALUES
      (?, ?)
  `;

  const { lastID } = await db.run(sql, [id, name]);

  return read(lastID);
}

async function readAll() {
  const db = await Database.connect();

  const sql = `
    SELECT
      *
    FROM
      periods
  `;

  const periods = await db.all(sql);

  return periods;
}

async function read(id) {
  const db = await Database.connect();

  const sql = `
    SELECT
      *
    FROM
      periods
    WHERE
      id = ?
  `;

  const category = await db.get(sql, [id]);

  return category;
}

export default { create, readAll, read };
