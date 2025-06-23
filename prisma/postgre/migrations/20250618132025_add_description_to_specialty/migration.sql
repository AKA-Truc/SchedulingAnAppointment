/*
  Warnings:

  - You are about to drop the `AccessLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BusinessAssociateAgreement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ComplianceReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DataProcessingRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EncryptedMedicalData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MPCComputationSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MPCPartialResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PatientAlert` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PatientConsent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PatientTelemetry` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `Specialty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isActive` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "GenderEnum" ADD VALUE 'Other';

-- DropForeignKey
ALTER TABLE "AccessLog" DROP CONSTRAINT "AccessLog_accessedById_fkey";

-- DropForeignKey
ALTER TABLE "AccessLog" DROP CONSTRAINT "AccessLog_consentId_fkey";

-- DropForeignKey
ALTER TABLE "AccessLog" DROP CONSTRAINT "AccessLog_patientId_fkey";

-- DropForeignKey
ALTER TABLE "ComplianceReport" DROP CONSTRAINT "ComplianceReport_patientId_fkey";

-- DropForeignKey
ALTER TABLE "EncryptedMedicalData" DROP CONSTRAINT "EncryptedMedicalData_patientId_fkey";

-- DropForeignKey
ALTER TABLE "PatientAlert" DROP CONSTRAINT "PatientAlert_patientId_fkey";

-- DropForeignKey
ALTER TABLE "PatientConsent" DROP CONSTRAINT "PatientConsent_grantedToId_fkey";

-- DropForeignKey
ALTER TABLE "PatientConsent" DROP CONSTRAINT "PatientConsent_patientId_fkey";

-- DropForeignKey
ALTER TABLE "PatientTelemetry" DROP CONSTRAINT "PatientTelemetry_patientId_fkey";

-- AlterTable
ALTER TABLE "Specialty" ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL;

-- DropTable
DROP TABLE "AccessLog";

-- DropTable
DROP TABLE "BusinessAssociateAgreement";

-- DropTable
DROP TABLE "ComplianceReport";

-- DropTable
DROP TABLE "DataProcessingRecord";

-- DropTable
DROP TABLE "EncryptedMedicalData";

-- DropTable
DROP TABLE "MPCComputationSession";

-- DropTable
DROP TABLE "MPCPartialResult";

-- DropTable
DROP TABLE "PatientAlert";

-- DropTable
DROP TABLE "PatientConsent";

-- DropTable
DROP TABLE "PatientTelemetry";
