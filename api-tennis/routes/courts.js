
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all courts with activation status and maintenance info
router.get('/', async (req, res) => {
  try {
    const [courts] = await db.query('SELECT * FROM courts');
    // Fetch maintenance periods for each court
    const [maintenance] = await db.query('SELECT * FROM court_maintenance');
    // Map maintenance to courts
    const courtsWithMaintenance = courts.map(court => {
      const maintenancePeriods = maintenance.filter(m => m.court_id === court.id);
      return { ...court, maintenancePeriods };
    });
    res.json(courtsWithMaintenance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courts', error: error.message });
  }
});

// Get court by ID with maintenance info
router.get('/:id', async (req, res) => {
  try {
    const [courts] = await db.query('SELECT * FROM courts WHERE id = ?', [req.params.id]);
    if (courts.length === 0) {
      return res.status(404).json({ message: 'Court not found' });
    }
    const court = courts[0];
    const [maintenancePeriods] = await db.query('SELECT * FROM court_maintenance WHERE court_id = ?', [court.id]);
    court.maintenancePeriods = maintenancePeriods;
    res.json(court);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching court', error: error.message });
  }
});

// Get court availability excluding maintenance periods
router.get('/:id/availability', async (req, res) => {
  try {
    const { date } = req.query;
    // Check if date is in maintenance period
    const [maintenance] = await db.query(
      'SELECT * FROM court_maintenance WHERE court_id = ? AND ? BETWEEN start_date AND end_date',
      [req.params.id, date]
    );
    if (maintenance.length > 0) {
      return res.json([]); // No availability during maintenance
    }
    const [slots] = await db.query(
      `SELECT * FROM time_slots 
       WHERE court_id = ? 
       AND date = ? 
       AND NOT EXISTS (
         SELECT 1 FROM reservations 
         WHERE time_slot_id = time_slots.id
       )`,
      [req.params.id, date]
    );
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability', error: error.message });
  }
});

// Activate or deactivate a court
router.post('/:id/activation', async (req, res) => {
  try {
    const { active } = req.body;
    await db.query('UPDATE courts SET active = ? WHERE id = ?', [active, req.params.id]);

    // Notify users if court is deactivated
    if (!active) {
      const { notifyUsersOfDeactivatedCourt } = require('./reservations');
      notifyUsersOfDeactivatedCourt(req.params.id);
    }

    res.json({ message: `Court ${active ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Error updating court activation', error: error.message });
  }
});

// Schedule maintenance period
router.post('/:id/maintenance', async (req, res) => {
  try {
    const { start_date, end_date, comment } = req.body;
    await db.query(
      'INSERT INTO court_maintenance (court_id, start_date, end_date, comment) VALUES (?, ?, ?, ?)',
      [req.params.id, start_date, end_date, comment]
    );
    res.status(201).json({ message: 'Maintenance period scheduled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error scheduling maintenance', error: error.message });
  }
});

// Get maintenance history for a court
router.get('/:id/maintenance', async (req, res) => {
  try {
    const [maintenancePeriods] = await db.query('SELECT * FROM court_maintenance WHERE court_id = ?', [req.params.id]);
    res.json(maintenancePeriods);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching maintenance history', error: error.message });
  }
});

// Get usage statistics per court
router.get('/:id/statistics', async (req, res) => {
  try {
    const [stats] = await db.query(
      `SELECT COUNT(*) as reservation_count
       FROM reservations
       WHERE court_id = ?`,
      [req.params.id]
    );
    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching usage statistics', error: error.message });
  }
});

// Get comments for a court
router.get('/:id/comments', async (req, res) => {
  try {
    const [comments] = await db.query(
      'SELECT * FROM court_comments WHERE court_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});

// Add a comment for a court
router.post('/:id/comments', async (req, res) => {
  try {
    const { comment, admin_user } = req.body;
    await db.query(
      'INSERT INTO court_comments (court_id, comment, admin_user, created_at) VALUES (?, ?, ?, NOW())',
      [req.params.id, comment, admin_user]
    );
    res.status(201).json({ message: 'Comment added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
});

module.exports = router;
