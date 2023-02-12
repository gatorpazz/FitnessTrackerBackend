const express = require('express');
const router = express.Router();
const { requireUser } = require("./utils");
const {
    getAllActivities,
    getActivityByName,
    createActivity,
    getActivityById,
    updateActivity,
    getPublicRoutinesByActivity
} = require('../db');

// GET /api/activities
router.get('/', async (req, res, next) => {
    try {
      const allActivities = await getAllActivities();
  
      res.send(allActivities);
    } catch ({ name, message }) {
      next({ name, message });
    }
})

// POST /api/activities
router.post('/', requireUser, async (req, res, next) => {
    const { name, description = "" } = req.body;

    try {
        const _activity = await getActivityByName(name);

        if (_activity) {
            next({
                name: "ActivityExistsError",
                message: `An activity with name ${_activity.name} already exists`,
            });
        }

        const activity = await createActivity({
            name,
            description
        });

        res.send(activity)
    } catch ({ name, message }) {
        next({ name, message });
    }
})

// PATCH /api/activities/:activityId
router.patch('/:activityId', requireUser, async (req, res, next) => {
    const { name, description } = req.body;
    const id = req.params.activityId;

    try {
        const activityById = await getActivityById(id);
        const activityByName = await getActivityByName(name);
        if (!activityById) {
            next({
                name: "ActivityNotFoundError",
                message: `Activity ${id} not found`
            });
        } else if (activityByName) {
            next({
                name: "ActivityExistsError",
                message: `An activity with name ${name} already exists`,
            });
        } else {
            const updatedActivity = await updateActivity({ 
                id,
                name,
                description
            });
    
            res.send(updatedActivity);
        }
    } catch ({ name, message }) {
      next({ name, message });
    }
})

// GET /api/activities/:activityId/routines
router.get('/:activityId/routines', async (req, res, next) => {
    const id = req.params.activityId;

    try {
        const activityById = await getActivityById(id);
        const publicRoutines = await getPublicRoutinesByActivity({ id });
        if (!activityById) {
            next({
                name: "ActivityNotFoundError",
                message: `Activity ${id} not found`
            }); 
        } else {
            res.send(publicRoutines);
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
})

module.exports = router;
