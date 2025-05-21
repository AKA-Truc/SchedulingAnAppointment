/*
  Warnings:

  - You are about to drop the column `certifications` on the `Doctor` table. All the data in the column will be lost.
  - Added the required column `WorkScheduling` to the `Hospital` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logo` to the `Hospital` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPOINTMENT', 'FOLLOW_UP', 'VACCINE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "NotificationMethod" AS ENUM ('EMAIL', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationTargetType" AS ENUM ('APPOINTMENT', 'FOLLOW_UP', 'CUSTOM');

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "certifications";

-- AlterTable
ALTER TABLE "Hospital" ADD COLUMN     "WorkScheduling" TEXT NOT NULL,
ADD COLUMN     "logo" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Certification" (
    "Certification_ID" SERIAL NOT NULL,
    "Title" TEXT NOT NULL,
    "Description" TEXT,
    "IssuedBy" TEXT NOT NULL,
    "DateIssued" TIMESTAMP(3) NOT NULL,
    "Doctor_ID" INTEGER NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("Certification_ID")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "type" "NotificationType" NOT NULL,
    "method" "NotificationMethod" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetType" "NotificationTargetType" NOT NULL,
    "targetId" INTEGER NOT NULL,
    "appointmentId" INTEGER,
    "followUpId" INTEGER,
    "medicalRecordId" INTEGER,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_Doctor_ID_fkey" FOREIGN KEY ("Doctor_ID") REFERENCES "Doctor"("Doctor_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("Appointment_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_followUpId_fkey" FOREIGN KEY ("followUpId") REFERENCES "FollowUp"("followUp_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "MedicalRecord"("MedicalRecord_ID") ON DELETE SET NULL ON UPDATE CASCADE;
