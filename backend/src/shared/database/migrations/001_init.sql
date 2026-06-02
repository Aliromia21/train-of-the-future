-- Initial Schema

USE TrainOfTheFuture;
GO

-- ── trains 
CREATE TABLE trains (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    train_number NVARCHAR(20)  UNIQUE NOT NULL,
    name         NVARCHAR(100) NOT NULL,
    line         NVARCHAR(50)  NOT NULL,
    max_speed    INT           DEFAULT 250,
    status       NVARCHAR(20)  DEFAULT 'INACTIVE',
    created_at   DATETIME2     DEFAULT GETDATE()
);

-- ── train_telemetry (current state) 
CREATE TABLE train_telemetry (
    train_id              INT PRIMARY KEY REFERENCES trains(id),
    speed                 INT           DEFAULT 0,
    latitude              DECIMAL(9,6),
    longitude             DECIMAL(9,6),
    wifi_status           NVARCHAR(20)  DEFAULT 'UNKNOWN',
    connected_passengers  INT           DEFAULT 0,
    signal_strength       INT           DEFAULT 0,
    heading               DECIMAL(5,2)  DEFAULT 0,
    updated_at            DATETIME2     DEFAULT GETDATE()
);

-- ── telemetry_log (historical — append only) 
CREATE TABLE telemetry_log (
    id                    BIGINT IDENTITY(1,1) PRIMARY KEY,
    train_id              INT REFERENCES trains(id),
    speed                 INT,
    latitude              DECIMAL(9,6),
    longitude             DECIMAL(9,6),
    wifi_status           NVARCHAR(20),
    connected_passengers  INT,
    signal_strength       INT,
    recorded_at           DATETIME2     DEFAULT GETDATE()
);
CREATE INDEX idx_log_train_time ON telemetry_log (train_id, recorded_at);

-- ── alerts 
CREATE TABLE alerts (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    train_id    INT REFERENCES trains(id),
    type        NVARCHAR(30)  NOT NULL,
    severity    NVARCHAR(10)  NOT NULL,
    message     NVARCHAR(500),
    is_resolved BIT           DEFAULT 0,
    created_at  DATETIME2     DEFAULT GETDATE(),
    resolved_at DATETIME2     NULL
);
CREATE INDEX idx_alerts_unresolved ON alerts (severity) WHERE is_resolved = 0;

-- ── stations 
CREATE TABLE stations (
    id        INT IDENTITY(1,1) PRIMARY KEY,
    name      NVARCHAR(100) NOT NULL,
    city      NVARCHAR(100),
    latitude  DECIMAL(9,6),
    longitude DECIMAL(9,6)
);

-- ── daily_stats 
CREATE TABLE daily_stats (
    date                  DATE PRIMARY KEY,
    total_active_trains   INT           DEFAULT 0,
    avg_uptime_percent    DECIMAL(5,2)  DEFAULT 0,
    avg_speed             DECIMAL(6,2)  DEFAULT 0,
    total_alerts          INT           DEFAULT 0,
    wifi_disconnections   INT           DEFAULT 0,
    passengers_served     INT           DEFAULT 0,
    updated_at            DATETIME2     DEFAULT GETDATE()
);
GO

-- ── Seed: 10 trains 
INSERT INTO trains (train_number, name, line, max_speed) VALUES
('ICE-101', 'Hannover Express',    'Hannover–Berlin',      300),
('ICE-102', 'Hildesheim Flyer',    'Hannover–Berlin',      300),
('ICE-103', 'Braunschweig Arrow',  'Hannover–Berlin',      300),
('IC-201',  'Niedersachsen Link',  'Hannover–Braunschweig', 200),
('IC-202',  'Wolfsburg Shuttle',   'Hannover–Wolfsburg',    200),
('IC-203',  'Magdeburg Express',   'Berlin–Magdeburg',      200),
('RE-301',  'Leine Valley',        'Hannover–Hildesheim',   160),
('RE-302',  'Harz Connect',        'Hildesheim–Magdeburg',  160),
('RE-303',  'Capital Link',        'Magdeburg–Berlin',      160),
('S1',      'Hannover S-Bahn S1',  'Hannover S-Bahn',       120);

-- ── Seed: 8 stations 
INSERT INTO stations (name, city, latitude, longitude) VALUES
('Hannover Hbf',      'Hannover',     52.3764,  9.7415),
('Hildesheim Hbf',    'Hildesheim',   52.1530,  9.9509),
('Braunschweig Hbf',  'Braunschweig', 52.2524, 10.5354),
('Wolfsburg Hbf',     'Wolfsburg',    52.4279, 10.7873),
('Magdeburg Hbf',     'Magdeburg',    52.1308, 11.6265),
('Berlin Hbf',        'Berlin',       52.5251, 13.3694),
('Berlin Ostbahnhof', 'Berlin',       52.5103, 13.4341),
('Stendal',           'Stendal',      52.5999, 11.8577);
GO
