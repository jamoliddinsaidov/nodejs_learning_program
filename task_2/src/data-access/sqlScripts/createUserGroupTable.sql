-- script for creating the users db and table --

CREATE TABLE UserGroups (
  user_group_id SERIAL PRIMARY KEY,
  fk_user_ids INT[],
  fk_group_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_group FOREIGN KEY(fk_group_id) REFERENCES Groups(id)
);

-- dummy data --

INSERT INTO UserGroups (fk_user_ids, fk_group_id) VALUES ('{1, 2}', 6);
INSERT INTO UserGroups (fk_user_ids, fk_group_id) VALUES ('{3, 4}', 2);
INSERT INTO UserGroups (fk_user_ids, fk_group_id) VALUES ('{5}', 4);