const express = require('express');
const supabase = require('../config/supabase');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// GET /api/tasks
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', req.user.userId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ tasks: data });
});

// POST /api/tasks
router.post('/', async (req, res) => {
  const { title, description, status, due_date } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required' });

  const { data, error } = await supabase
    .from('tasks')
    .insert([{ title, description, status, due_date, user_id: req.user.userId }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ task: data });
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  const { title, description, status, due_date } = req.body;

  const { data, error } = await supabase
    .from('tasks')
    .update({ title, description, status, due_date })
    .eq('id', req.params.id)
    .eq('user_id', req.user.userId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Task not found' });
  res.json({ task: data });
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.userId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Task not found' });
  res.json({ message: 'Task deleted' });
});

module.exports = router;
