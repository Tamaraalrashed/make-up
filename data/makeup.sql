DROP TABLE IF EXISTS makeup;
CREATE TABLE makeup(
    id SERIAL PRIMARY KEY,
    image VARCHAR(500),
    name VARCHAR(255),
   price VARCHAR(255),
   description TEXT
);