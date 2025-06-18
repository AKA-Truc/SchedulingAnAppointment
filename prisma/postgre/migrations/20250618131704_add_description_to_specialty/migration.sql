/*
  Warnings:

  - You are about to drop the column `description` on the `Specialty` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Specialty" DROP COLUMN "description";

-- CreateTable
CREATE TABLE "PatientConsent" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "grantedToId" INTEGER NOT NULL,
    "dataType" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessLog" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "accessedById" INTEGER NOT NULL,
    "dataType" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consentId" INTEGER,

    CONSTRAINT "AccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientTelemetry" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "deviceId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientTelemetry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientAlert" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "alertType" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncryptedMedicalData" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "dataType" TEXT NOT NULL,
    "encryptedData" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "cipherContext" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EncryptedMedicalData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceReport" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "reportData" JSONB NOT NULL,
    "gdprCompliant" BOOLEAN NOT NULL,
    "hipaaCompliant" BOOLEAN NOT NULL,
    "issues" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessAssociateAgreement" (
    "id" SERIAL NOT NULL,
    "entityId" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "documents" JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessAssociateAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataProcessingRecord" (
    "id" SERIAL NOT NULL,
    "processCategory" TEXT NOT NULL,
    "dataCategories" TEXT[],
    "recipients" TEXT[],
    "retention" TEXT NOT NULL,
    "securityMeasures" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataProcessingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MPCComputationSession" (
    "id" SERIAL NOT NULL,
    "sessionType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "participants" INTEGER[],
    "threshold" INTEGER NOT NULL,
    "result" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "MPCComputationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MPCPartialResult" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "partyId" INTEGER NOT NULL,
    "partialData" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MPCPartialResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EncryptedMedicalData_patientId_dataType_idx" ON "EncryptedMedicalData"("patientId", "dataType");

-- CreateIndex
CREATE INDEX "ComplianceReport_patientId_reportDate_idx" ON "ComplianceReport"("patientId", "reportDate");

-- CreateIndex
CREATE INDEX "BusinessAssociateAgreement_entityType_status_idx" ON "BusinessAssociateAgreement"("entityType", "status");

-- CreateIndex
CREATE INDEX "DataProcessingRecord_processCategory_idx" ON "DataProcessingRecord"("processCategory");

-- CreateIndex
CREATE INDEX "MPCComputationSession_status_idx" ON "MPCComputationSession"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MPCPartialResult_sessionId_partyId_key" ON "MPCPartialResult"("sessionId", "partyId");

-- AddForeignKey
ALTER TABLE "PatientConsent" ADD CONSTRAINT "PatientConsent_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("profileId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientConsent" ADD CONSTRAINT "PatientConsent_grantedToId_fkey" FOREIGN KEY ("grantedToId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("profileId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_accessedById_fkey" FOREIGN KEY ("accessedById") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_consentId_fkey" FOREIGN KEY ("consentId") REFERENCES "PatientConsent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientTelemetry" ADD CONSTRAINT "PatientTelemetry_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("profileId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientAlert" ADD CONSTRAINT "PatientAlert_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("profileId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncryptedMedicalData" ADD CONSTRAINT "EncryptedMedicalData_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("profileId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceReport" ADD CONSTRAINT "ComplianceReport_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("profileId") ON DELETE RESTRICT ON UPDATE CASCADE;
