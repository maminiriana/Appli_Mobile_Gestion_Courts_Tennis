
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const nodemailer = require('nodemailer');

// Create reservation
router.post('/', async (req, res) => {
  try {
    const { userId, courtId, timeSlotId, date } = req.body;

    // Check if slot is available
    const [existingReservations] = await db.query(
      'SELECT * FROM reservations WHERE time_slot_id = ? AND date = ?',
      [timeSlotId, date]
    );

    if (existingReservations.length > 0) {
      return res.status(400).json({ message: 'Time slot already booked' });
    }

    // Check if court is active
    const [courts] = await db.query('SELECT active FROM courts WHERE id = ?', [courtId]);
    if (courts.length === 0 || !courts[0].active) {
      return res.status(400).json({ message: 'Court is currently deactivated and cannot be booked' });
    }

    // Create reservation
    const [result] = await db.query(
      'INSERT INTO reservations (user_id, court_id, time_slot_id, date) VALUES (?, ?, ?, ?)',
      [userId, courtId, timeSlotId, date]
    );

    res.status(201).json({ message: 'Reservation created successfully', reservationId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating reservation', error: error.message });
  }
});

// Get user reservations
router.get('/user/:userId', async (req, res) => {
  try {
    const [reservations] = await db.query(
      `SELECT r.*, c.name as court_name, ts.start_time, ts.end_time 
       FROM reservations r 
       JOIN courts c ON r.court_id = c.id 
       JOIN time_slots ts ON r.time_slot_id = ts.id 
       WHERE r.user_id = ?`,
      [req.params.userId]
    );
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservations', error: error.message });
  }
});

// Cancel reservation
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM reservations WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling reservation', error: error.message });
  }
});

// Notify users with reservations on deactivated courts
async function notifyUsersOfDeactivatedCourt(courtId) {
  try {
    // Get reservations for the court in the future
    const [reservations] = await db.query(
      `SELECT r.id, r.user_id, u.email, c.name as court_name, ts.start_time, ts.end_time, r.date
       FROM reservations r
       JOIN users u ON r.user_id = u.id
       JOIN courts c ON r.court_id = c.id
       JOIN time_slots ts ON r.time_slot_id = ts.id
       WHERE r.court_id = ? AND r.date >= CURDATE()`,
      [courtId]
    );

    if (reservations.length === 0) {
      return;
    }

    // Setup email transporter (configure with your SMTP settings)
    const transporter = nodemailer.createTransport({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'your_email@example.com',
        pass: 'your_email_password',
      },
    });

    for (const reservation of reservations) {
      const mailOptions = {
        from: '"Tennis Court Management" <no-reply@tenniscourts.com>',
        to: reservation.email,
        subject: `Notification: Court ${reservation.court_name} Deactivation`,
        text: `Dear user,\n\nThe court ${reservation.court_name} you have reserved for ${reservation.date} from ${reservation.start_time} to ${reservation.end_time} has been deactivated. Please contact support for more information or to reschedule your reservation.\n\nBest regards,\nTennis Court Management Team`,
      };

      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.error('Error sending deactivation notifications:', error);
  }
}

module.exports = router;
