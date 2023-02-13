-- script for creating the group table --

CREATE TABLE Groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  permissions text[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- dummy data --

INSERT INTO Groups (name, permissions)
VALUES ('read_group', '{"READ"}');

INSERT INTO Groups (name, permissions)
VALUES ('write_group', '{"WRITE"}');

INSERT INTO Groups (name, permissions)
VALUES ('delete_group', '{"DELETE"}');

INSERT INTO Groups (name, permissions)
VALUES ('share_group', '{"SHARE"}');

INSERT INTO Groups (name, permissions)
VALUES ('upload_group', '{"UPLOAD_FILES"}');

INSERT INTO Groups (name, permissions)
VALUES ('admin_group', '{"READ", "WRITE", "DELETE", "SHARE", "UPLOAD_FILES"}');
