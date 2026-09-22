ALTER TABLE "daily_meals" ADD COLUMN "idempotencyKey" TEXT;

CREATE UNIQUE INDEX "daily_meals_idempotencyKey_key" ON "daily_meals"("idempotencyKey");
