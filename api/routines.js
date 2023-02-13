const express = require('express');
const router = express.Router();
const { requireUser } = require("./utils");
const { getAllRoutines,
    createRoutine,
    getRoutineById,
    updateRoutine,
    destroyRoutine,
    addActivityToRoutine,
    getRoutineActivitiesByRoutine
} = require("../db")


// GET /api/routines
router.get('/', async (req, res, next) => {
    try {
        const allRoutines = await getAllRoutines();
        res.send(allRoutines);
    } catch(error) {
        next(error)
    }
})

// POST /api/routines
router.post('/', requireUser, async (req, res, next) => {
    const {
        isPublic,   
        name,
        goal
    } = req.body;

    try {
        const routine = await createRoutine({
            creatorId: req.user.id,
            isPublic,
            name,
            goal
        });
        if (routine) {
            res.send(routine)
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
})

// PATCH /api/routines/:routineId
router.patch('/:routineId', requireUser, async (req, res, next) => {
    const { 
        isPublic,
        name,
        goal
    } = req.body;
    const id = parseInt(req.params.routineId);

    try {
        const routineById = await getRoutineById(id);
        if (routineById.creatorId !== req.user.id) {
            res.status(403);
            next({
                name: "UnauthorizedUpdateError",
                message: `User ${req.user.username} is not allowed to update ${routineById.name}`,
            });
        } 
        const updatedRoutine = await updateRoutine({ 
            id,
            isPublic,
            name,
            goal
        });

        res.send(updatedRoutine);
    } catch ({ name, message }) {
      next({ name, message });
    }
})

// DELETE /api/routines/:routineId
router.delete('/:routineId', requireUser, async (req, res, next) => {
    const id = req.params.routineId;
    
    try {
        const routineById = await getRoutineById(id);
        if (routineById.creatorId !== req.user.id) {
            res.status(403);
            next({
                name: "UnauthorizedDeleteError",
                message: `User ${req.user.username} is not allowed to delete ${routineById.name}`,
            });
        }
        await destroyRoutine(id);
        res.send(routineById); 
    } catch ({ name, message }) {
        next({ name, message })
    }
})


// POST /api/routines/:routineId/activities
router.post('/:routineId/activities', requireUser, async (req, res, next) => {
    const { routineId } = req.params;
    const { 
        activityId,
        count,
        duration
    } = req.body;

    try {
        const routineActivities = await getRoutineActivitiesByRoutine({ id: routineId })
        let activityFound = false;
        routineActivities.forEach(routineActivity => {
            if (routineActivity.activityId === activityId) {
                activityFound = true;
            }
        });


        if (activityFound) {
            next({
                name: "DuplicateRoutineActivityError",
                message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`
            })
        } else {
            const updatedRoutine = await addActivityToRoutine({
                routineId,
                activityId,
                duration,
                count
            });
            res.send(updatedRoutine);
        }
        
    } catch ({ name, message }) {
        next({ name, message })
    }
})

module.exports = router;
