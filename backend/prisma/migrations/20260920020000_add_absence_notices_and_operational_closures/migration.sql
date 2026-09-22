CREATE TABLE "absence_notices" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "service" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdById" TEXT NOT NULL,
    "reviewerId" TEXT,
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "absence_notices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "operational_closures" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "services" TEXT[] NOT NULL,
    "reason" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "operational_closures_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "absence_notices_subscriptionId_date_service_key" ON "absence_notices"("subscriptionId", "date", "service");
CREATE INDEX "absence_notices_studentId_status_idx" ON "absence_notices"("studentId", "status");
CREATE INDEX "absence_notices_subscriptionId_date_idx" ON "absence_notices"("subscriptionId", "date");
CREATE INDEX "operational_closures_restaurantId_startDate_endDate_idx" ON "operational_closures"("restaurantId", "startDate", "endDate");

ALTER TABLE "absence_notices" ADD CONSTRAINT "absence_notices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "absence_notices" ADD CONSTRAINT "absence_notices_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "absence_notices" ADD CONSTRAINT "absence_notices_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "absence_notices" ADD CONSTRAINT "absence_notices_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "operational_closures" ADD CONSTRAINT "operational_closures_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "operational_closures" ADD CONSTRAINT "operational_closures_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
