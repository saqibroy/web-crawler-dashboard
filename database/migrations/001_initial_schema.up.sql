CREATE TABLE analyses (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  url VARCHAR(2048) NOT NULL,
  status ENUM('queued', 'processing', 'completed', 'failed') DEFAULT 'queued',
  html_version VARCHAR(10),
  title VARCHAR(255),
  headings JSON,
  internal_links INT DEFAULT 0,
  external_links INT DEFAULT 0,
  has_login_form BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
