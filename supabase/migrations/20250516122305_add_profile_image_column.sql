-- Create profile_images table
CREATE TABLE IF NOT EXISTS profile_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    image_path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Add trigger to update profile_image in users table
DELIMITER //
CREATE TRIGGER update_user_profile_image
AFTER INSERT ON profile_images
FOR EACH ROW
BEGIN
    UPDATE users
    SET profile_image = NEW.image_path
    WHERE id = NEW.user_id;
END//
DELIMITER ;
