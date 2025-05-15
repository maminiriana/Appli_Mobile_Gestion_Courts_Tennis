-- Création de la base de données
CREATE DATABASE IF NOT EXISTS tennis_courts;
USE tennis_courts;

-- Table des utilisateurs
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  subscription_status BOOLEAN DEFAULT FALSE,
  last_subscription_date DATE,
  role ENUM('joueur', 'administrateur') DEFAULT 'joueur',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des courts de tennis
CREATE TABLE courts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  surface VARCHAR(50) NOT NULL,
  indoor BOOLEAN DEFAULT false,
  price_per_hour DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des créneaux horaires
CREATE TABLE time_slots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  court_id INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE
);

-- Table des réservations
CREATE TABLE reservations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  court_id INT NOT NULL,
  time_slot_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
  FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE CASCADE,
  UNIQUE KEY unique_reservation (court_id, time_slot_id, date)
);

-- Données de test pour les courts
INSERT INTO courts (name, description, surface, indoor, price_per_hour, image_url) VALUES
('Court Central', 'Notre court principal avec surface en terre battue', 'Terre battue', false, 25.00, 'https://images.pexels.com/photos/1432039/pexels-photo-1432039.jpeg'),
('Court Couvert', 'Court intérieur avec une surface synthétique', 'Synthétique', true, 30.00, 'https://images.pexels.com/photos/2352270/pexels-photo-2352270.jpeg'),
('Court Gazon', 'Expérience Wimbledon avec notre court en gazon naturel', 'Gazon', false, 35.00, 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg');

-- Données de test pour les créneaux horaires
INSERT INTO time_slots (court_id, start_time, end_time) VALUES
(1, '08:00', '09:00'),
(1, '09:00', '10:00'),
(1, '10:00', '11:00'),
(1, '11:00', '12:00'),
(1, '14:00', '15:00'),
(1, '15:00', '16:00'),
(1, '16:00', '17:00'),
(1, '17:00', '18:00'),
(2, '08:00', '09:00'),
(2, '09:00', '10:00'),
(2, '10:00', '11:00'),
(2, '11:00', '12:00'),
(2, '14:00', '15:00'),
(2, '15:00', '16:00'),
(2, '16:00', '17:00'),
(2, '17:00', '18:00'),
(3, '08:00', '09:00'),
(3, '09:00', '10:00'),
(3, '10:00', '11:00'),
(3, '11:00', '12:00'),
(3, '14:00', '15:00'),
(3, '15:00', '16:00'),
(3, '16:00', '17:00'),
(3, '17:00', '18:00');
