-- One unresolved alert per train and type.
-- A second open row is rejected so telemetry ticks cannot flood the table.

USE TrainOfTheFuture;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'ux_alerts_open_train_type'
      AND object_id = OBJECT_ID('alerts')
)
BEGIN
    CREATE UNIQUE INDEX ux_alerts_open_train_type
        ON alerts (train_id, type)
        WHERE is_resolved = 0;
END
GO
