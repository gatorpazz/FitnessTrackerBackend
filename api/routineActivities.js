const express = require('express');
const router = express.Router();
const { requireUser } = require("./utils");
const { 
    getRoutineActivityById,
    getRoutineById,
    destroyRoutineActivity,
    updateRoutineActivity
} = require("../db")

// PATCH /api/routine_activities/:routineActivityId
router.patch('/:routineActivityId', requireUser, async (req, res, next) => {
    const { 
        count,
        duration
    } = req.body;
    const id = req.params.routineActivityId;
  
    try {
        const routineActivityById = await getRoutineActivityById(id);
        const routineById = await getRoutineById(routineActivityById.routineId);
        if (routineById.creatorId !== req.user.id) {
            res.status(403);
            next({
                name: "UnauthorizedUpdateError",
                message: `User ${req.user.username} is not allowed to update ${routineById.name}`,
            });
        } 
        const updatedRoutineActivity = await updateRoutineActivity({ 
            id,
            count,
            duration
        });

        res.send(updatedRoutineActivity);
    } catch ({ name, message }) {
      next({ name, message });
    }
})

// DELETE /api/routine_activities/:routineActivityId
router.delete('/:routineActivityId', requireUser, async (req, res, next) => {
    const id = req.params.routineActivityId;

    try {
        const routineActivityById = await getRoutineActivityById(id);
        const routineById = await getRoutineById(routineActivityById.id);

        if (routineById.creatorId !== req.user.id) {
            res.status(403);
            next({
                name: "UnauthorizedDeleteError",
                message: `User ${req.user.username} is not allowed to delete ${routineById.name}`,
            });
        }
        await destroyRoutineActivity(id);
        res.send(routineActivityById); 
    } catch ({ name, message }) {
        next({ name, message })
    }
});

module.exports = router;
