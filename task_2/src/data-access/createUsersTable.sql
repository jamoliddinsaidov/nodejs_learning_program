-- script for creating the users db and table --

CREATE DATABASE Users;

CREATE TABLE Users (
  id SERIAL PRIMARY KEY,
  login VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  age INT NOT NULL CHECK(age BETWEEN 4 AND 130),
  is_deleted BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- dummy data --

INSERT INTO Users (login, password, age, is_deleted)
VALUES ('john', 'paSw0rd', 18, FALSE);

INSERT INTO Users (login, password, age, is_deleted)
VALUES ('sherlock', '03Pss', 35, FALSE);

INSERT INTO Users (login, password, age, is_deleted)
VALUES ('doe', 'S0mePs', 24, FALSE);

INSERT INTO Users (login, password, age, is_deleted)
VALUES ('ann', '2wsPs', 45, FALSE);

INSERT INTO Users (login, password, age, is_deleted)
VALUES ('jimmy', '0sPsa', 56, TRUE);