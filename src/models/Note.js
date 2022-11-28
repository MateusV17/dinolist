import Database from '../database/database.js';
const c = console;


async function readAll() {
  const db = await Database.connect();

  const sql = `
    SELECT 
      *
    FROM 
      dinos
  `;

  const dinos = await db.all(sql);

  c.log(dinos);
  return dinos;
}

async function readDino(id) {
  const db = await Database.connect();

  const sql = `
    SELECT 
      *
    FROM 
      dinos
    WHERE
      id = ?
  `;

  const dino = await db.get(sql, [id]);

  return dino;
}

async function read(id) {
  const db = await Database.connect();

  const sql = `
  SELECT 
    *
  FROM 
    dinos
  WHERE
    id = ?
  `;

  

  const dino = await db.get(sql, [id]);

  return dino;
}

async function create(dino) {
  const db = await Database.connect();

  const { name, height, weight, description, image, period_id } = dino;
  c.log(name, height, weight, description, image, period_id);
  const sql = `
    INSERT INTO
      dinos (name, height, weight, description, image, period_id)
    VALUES
      (?, ?, ?, ?, ?, ?)
  `;

  const { lastID } = await db.run(sql, [name, height, weight, description, image, period_id]);
  c.log('ate aqui ta dboa');

  return lastID;
}

async function update(dino, id) {
  const db = await Database.connect();
  const { name, height, weight, description, image, period_id  } = dino;

  const sql = `
    UPDATE 
      dinos
    SET
      name = ?, height = ?, weight = ?, description = ?, image = ?, period_id = ?
    WHERE
      id = ?
  `;

  const { changes } = await db.run(sql, [name, height, weight, description, image, period_id, id]);


  if (changes === 1) {

    return read(id);
  } else {
    return false;
  }
}

async function destroy(id) {
  const db = await Database.connect();

  const sql = `
    DELETE FROM
      dinos
    WHERE
      id = ?
  `;

  const { changes } = await db.run(sql, [id]);

  return changes === 1;
}

export default { readAll, read, readDino, create, update, destroy };
