-- Add anonymization tracking to users
ALTER TABLE "users"
ADD COLUMN "is_anonymized" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "anonymized_at" TIMESTAMP(6);

CREATE INDEX "users_is_anonymized_idx" ON "users"("is_anonymized");
