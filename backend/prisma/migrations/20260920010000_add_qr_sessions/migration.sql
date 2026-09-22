-- CreateTable
CREATE TABLE "qr_sessions" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "issuedById" TEXT NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "qr_sessions_tokenHash_key" ON "qr_sessions"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "qr_sessions_codeHash_key" ON "qr_sessions"("codeHash");

-- CreateIndex
CREATE INDEX "qr_sessions_restaurantId_service_expiresAt_idx" ON "qr_sessions"("restaurantId", "service", "expiresAt");

-- AddForeignKey
ALTER TABLE "qr_sessions" ADD CONSTRAINT "qr_sessions_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_sessions" ADD CONSTRAINT "qr_sessions_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
