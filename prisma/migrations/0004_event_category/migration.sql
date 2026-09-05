-- Additive public category. Stored on the row; do not infer from source.
ALTER TABLE "events" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'community';
