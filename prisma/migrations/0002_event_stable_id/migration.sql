-- Replace cuid primary keys with stable seed ids (slug for existing rows).
ALTER TABLE "events" ADD COLUMN "new_id" TEXT;
UPDATE "events" SET "new_id" = "slug";
ALTER TABLE "events" DROP CONSTRAINT "events_pkey";
ALTER TABLE "events" DROP COLUMN "id";
ALTER TABLE "events" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "events" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "events" ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");
