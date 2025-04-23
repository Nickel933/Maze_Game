-- Create a new database called maze_game
CREATE DATABASE maze_game;

-- Select the maze_game database for use
USE maze_game;

-- Create a table for storing quiz questions
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- Unique ID for each question
    question TEXT NOT NULL,  -- The question text
    option_a VARCHAR(255),  -- Option A
    option_b VARCHAR(255),  -- Option B
    option_c VARCHAR(255),  -- Option C
    option_d VARCHAR(255),  -- Option D
    correct_option CHAR(1) NOT NULL  -- The correct option (A, B, C, or D)
);

-- Insert some example questions into the questions table
INSERT INTO questions (question, option_a, option_b, option_c, option_d, correct_option) VALUES
('What is the capital of France?', 'London', 'Berlin', 'Paris', 'Rome', 'C'),
('What is 12 * 12?', '144', '121', '132', '124', 'A'),
('Which planet is known as the Red Planet?', 'Earth', 'Venus', 'Mars', 'Jupiter', 'C'),
('Who wrote Hamlet?', 'Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Leo Tolstoy', 'B');

-- Create a table for storing user information (username and password)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- Unique ID for each user
    username VARCHAR(255) UNIQUE NOT NULL,  -- Username (unique constraint)
    password VARCHAR(255) NOT NULL  -- Password for the user
);
