-- Additive public category on every event row.
ALTER TABLE "events" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'community';
