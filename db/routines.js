const client = require("./client");
const { attachActivitiesToRoutines } = require("./activities");

async function createRoutine({
  creatorId,
  isPublic,
  name,
  goal
}) {
  const { rows: [ routine ] } = await client.query(`
    INSERT INTO routines("creatorId", "isPublic", name, goal)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `, [creatorId, isPublic, name, goal])

  return routine;
}

async function getRoutineById(id) {
  const { rows: [ routine ] } = await client.query(`
    SELECT *
    FROM routines
    WHERE id=$1;
  `, [id])

  return routine;
}

async function getRoutinesWithoutActivities() {
  const { rows } = await client.query(`
    SELECT *
    FROM routines;
  `)
  if (!rows) {
    return null;
  }

  return rows;
}

async function getAllRoutines() {
  const { rows } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId"=users.Id;
  `);

  return attachActivitiesToRoutines(rows);
}

async function getAllPublicRoutines() {
  const { rows } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId"=users.Id
    WHERE "isPublic"=true;
  `);

  return attachActivitiesToRoutines(rows);
}

async function getAllRoutinesByUser({ username }) {
  const { rows } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId"=users.Id
    WHERE username=$1;
  `, [username]);

  return attachActivitiesToRoutines(rows);
}

async function getPublicRoutinesByUser({ username }) {
  const { rows } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId"=users.Id
    WHERE username=$1 AND "isPublic"=true;
  `, [username]);

  return attachActivitiesToRoutines(rows);
}

async function getPublicRoutinesByActivity({ id }) {
  const { rows } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId"=users.Id
    JOIN routine_activities ON routine_activities."routineId"=routines.id
    WHERE routine_activities."activityId"=$1 AND "isPublic"=true;
  `, [id]);

  return attachActivitiesToRoutines(rows);
}

async function updateRoutine({ id, ...fields }) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  if (setString.length === 0) {
      return;
  }

  const { rows: [ routine ] } = await client.query(`
      UPDATE routines
      SET ${ setString }
      WHERE id=${ id }
      RETURNING *;
  `, Object.values(fields));

  return routine;
}

async function destroyRoutine(id) {
  await client.query(`
    DELETE FROM routine_activities
    WHERE "routineId"=$1;
  `, [id])

  await client.query(`
    DELETE FROM routines
    WHERE id=$1;
  `, [id])
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
