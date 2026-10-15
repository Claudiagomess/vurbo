CREATE TABLE user_accounts (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(120) NOT NULL,
    name VARCHAR(160) NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE repairs (
    id VARCHAR(36) PRIMARY KEY,
    brand VARCHAR(120) NOT NULL,
    appliance_type VARCHAR(120) NOT NULL,
    model VARCHAR(120),
    locality VARCHAR(120) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    created_by VARCHAR(36) NOT NULL,
    CONSTRAINT fk_repairs_created_by FOREIGN KEY (created_by) REFERENCES user_accounts (id)
);

CREATE INDEX idx_repairs_status_created ON repairs (status, created_at);

CREATE TABLE applications (
    id VARCHAR(36) PRIMARY KEY,
    repair_id VARCHAR(36) NOT NULL,
    technician_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_applications_repair FOREIGN KEY (repair_id) REFERENCES repairs (id),
    CONSTRAINT fk_applications_technician FOREIGN KEY (technician_id) REFERENCES user_accounts (id),
    CONSTRAINT uq_applications_repair_technician UNIQUE (repair_id, technician_id)
);

CREATE INDEX idx_applications_repair_created ON applications (repair_id, created_at);
