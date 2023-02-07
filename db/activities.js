const client = require('./client');

async function createActivity({ 
  name,
  description
}) {
  const{ rows: [ activity ] } = await client.query(`
    INSERT INTO activities(name, description)
    VALUES ($1, $2)
    RETURNING *;
  `, [name, description]);

  return activity;
}

async function getAllActivities() {
  const { rows } = await client.query(`
    SELECT *
    FROM activities;
  `);

  return rows;
}

async function getActivityById(id) {
  const { rows: [activity] } = await client.query(`
    SELECT *
    FROM activities
    WHERE id=$1;
  `, [id]);

  return activity;
}

async function getActivityByName(name) {
  const { rows: [activity] } = await client.query(`
    SELECT *
    FROM activities
    WHERE name=$1;
  `, [name]);

  return activity;
}

async function updateActivity({ id, ...fields }) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  if (setString.length === 0) {
      return;
  }

  const { rows: [ activity ] } = await client.query(`
      UPDATE activities
      SET ${ setString }
      WHERE id=${ id }
      RETURNING *;
  `, Object.values(fields));

  return activity;
}

async function attachActivitiesToRoutines(routines) {

  const routinesToReturn = [...routines];
  const binds = routines.map((_, index) => `$${index + 1}`).join(", ");
  const routineIds = routines.map((routine) => routine.id);

  if (!routineIds?.length) return [];

  const { rows: activities } = await client.query(`
    SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities.id AS "routineActivityId", routine_activities."routineId"
    FROM activities 
    JOIN routine_activities ON routine_activities."activityId" = activities.id
    WHERE routine_activities."routineId" IN (${binds});
  `, routineIds);

  for (const routine of routinesToReturn) {
    const activitiesToAdd = activities.filter(
      (activity) => activity.routineId === routine.id
    );
    routine.activities = activitiesToAdd;
  }
  return routinesToReturn;
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  createActivity,
  updateActivity,
  attachActivitiesToRoutines
};
