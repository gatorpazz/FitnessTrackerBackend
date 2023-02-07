const client = require("./client");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  const { rows: [routine] } = await client.query(`
    INSERT INTO routine_activities("routineId", "activityId", count, duration)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT ("routineId", "activityId") DO NOTHING
    RETURNING *;
  `, [routineId, activityId, count, duration])

  return routine;
}

async function getRoutineActivityById(id) {
  const { rows: [ routine ] } = await client.query(`
    SELECT *
    FROM routine_activities
    WHERE id=$1;
  `, [id])

  return routine;
}

async function getRoutineActivitiesByRoutine({ id }) {
  const { rows } = await client.query(`
    SELECT *
    FROM routine_activities
    WHERE "routineId"=$1;
  `, [id])

  return rows;
}

async function updateRoutineActivity({ id, ...fields }) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  if (setString.length === 0) {
      return;
  }

  const { rows: [ routine_activity ] } = await client.query(`
      UPDATE routine_activities
      SET ${ setString }
      WHERE id=${id}
      RETURNING *;
  `, Object.values(fields));

  return routine_activity;
}

async function destroyRoutineActivity(id) {
  const { rows: [ routine_activity ] } =   await client.query(`
  DELETE FROM routine_activities
  WHERE id=$1
  RETURNING *;
`, [id])

  return routine_activity;
}

async function canEditRoutineActivity(routineActivityId, userId) {
  const { rows: [ routine_activity ] } = await client.query(`
    SELECT *
    FROM routine_activities
    JOIN routines ON routine_activities."routineId" = routines.id AND routine_activities.id=$1;
  `, [routineActivityId])

  return routine_activity.creatorId === userId;
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
