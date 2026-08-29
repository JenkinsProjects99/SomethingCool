-- Additive public image plus timezone/address for the tourist feed.
ALTER TABLE "events" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'America/New_York';
ALTER TABLE "events" ADD COLUMN "address" TEXT NOT NULL DEFAULT 'Ashland, KY';
ALTER TABLE "events" ADD COLUMN "image" TEXT;
ALTER TABLE "events" ADD COLUMN "date_only" BOOLEAN NOT NULL DEFAULT false;
