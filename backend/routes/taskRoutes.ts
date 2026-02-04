import { Router } from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController';

const router = Router();

// GET /api/tasks - Get all tasks
router.get('/', getTasks);

// POST /api/tasks - Create new task
router.post('/', createTask);

// PUT /api/tasks/:id - Update task
router.put('/:id', updateTask);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', deleteTask);

export default router;
