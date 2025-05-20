/*
  Warnings:

  - The primary key for the `Appointment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `appointmentId` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `hospitalId` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledTime` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Appointment` table. All the data in the column will be lost.
  - The primary key for the `Doctor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `doctorId` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `hospitalId` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `specialtyId` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Doctor` table. All the data in the column will be lost.
  - The primary key for the `Hospital` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `address` on the `Hospital` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Hospital` table. All the data in the column will be lost.
  - You are about to drop the column `hospitalId` on the `Hospital` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Hospital` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Hospital` table. All the data in the column will be lost.
  - The primary key for the `MedicalRecord` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `appointmentId` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `diagnosis` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `doctorNotes` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `medicalRecordId` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `prescription` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `testResult` on the `MedicalRecord` table. All the data in the column will be lost.
  - The primary key for the `Payment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `appointmentId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Payment` table. All the data in the column will be lost.
  - The primary key for the `Specialty` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `description` on the `Specialty` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Specialty` table. All the data in the column will be lost.
  - You are about to drop the column `specialtyId` on the `Specialty` table. All the data in the column will be lost.
  - The primary key for the `Token` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accessExpiresAt` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `accessToken` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `refreshExpiresAt` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Token` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[User_ID]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Appointment_ID]` on the table `MedicalRecord` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Doctor_ID` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Hospital_ID` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Scheduled_time` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `User_ID` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Bio` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Hospital_ID` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Phone` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Rating` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Specialty_ID` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `User_ID` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `certifications` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearsOfExperience` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Address` to the `Hospital` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Description` to the `Hospital` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Email` to the `Hospital` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Name` to the `Hospital` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Phone` to the `Hospital` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Type` to the `Hospital` table without a default value. This is not possible if the table is not empty.
  - Added the required column `establishYear` to the `Hospital` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Appointment_ID` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ChiefComplaint` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Diagnosis` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Doctor_notes` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Prescription` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Test_Result` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assessment` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `education` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `historyPresentIllness` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nonDrugPlan` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `physicalExam` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `treatmentGoals` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `treatmentPlan` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Appointment_ID` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Payment_Method` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Payment_Status` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Price` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Description` to the `Specialty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Name` to the `Specialty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `AccessExpiresAt` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `AccessToken` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `RefreshExpiresAt` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `RefreshToken` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `User_ID` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Full_Name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Gender` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Phone` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoleEnum" AS ENUM ('ADMIN', 'DOCTOR', 'USER');

-- CreateEnum
CREATE TYPE "PaymentMethodEnum" AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'MOMO');

-- CreateEnum
CREATE TYPE "PaymentStatusEnum" AS ENUM ('PAID', 'UNPAID', 'PENDING');

-- CreateEnum
CREATE TYPE "GenderEmun" AS ENUM ('Male', 'FeMale');

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_hospitalId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_hospitalId_fkey";

-- DropForeignKey
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_specialtyId_fkey";

-- DropForeignKey
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_userId_fkey";

-- DropForeignKey
ALTER TABLE "MedicalRecord" DROP CONSTRAINT "MedicalRecord_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_userId_fkey";

-- DropIndex
DROP INDEX "Doctor_userId_key";

-- DropIndex
DROP INDEX "MedicalRecord_appointmentId_key";

-- DropIndex
DROP INDEX "Payment_appointmentId_key";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_pkey",
DROP COLUMN "appointmentId",
DROP COLUMN "doctorId",
DROP COLUMN "hospitalId",
DROP COLUMN "note",
DROP COLUMN "scheduledTime",
DROP COLUMN "userId",
ADD COLUMN     "Appointment_ID" SERIAL NOT NULL,
ADD COLUMN     "Doctor_ID" INTEGER NOT NULL,
ADD COLUMN     "Hospital_ID" INTEGER NOT NULL,
ADD COLUMN     "Note" TEXT,
ADD COLUMN     "Scheduled_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "User_ID" INTEGER NOT NULL,
ADD CONSTRAINT "Appointment_pkey" PRIMARY KEY ("Appointment_ID");

-- AlterTable
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_pkey",
DROP COLUMN "doctorId",
DROP COLUMN "hospitalId",
DROP COLUMN "phone",
DROP COLUMN "rating",
DROP COLUMN "specialtyId",
DROP COLUMN "userId",
ADD COLUMN     "Bio" TEXT NOT NULL,
ADD COLUMN     "Doctor_ID" SERIAL NOT NULL,
ADD COLUMN     "Hospital_ID" INTEGER NOT NULL,
ADD COLUMN     "Phone" INTEGER NOT NULL,
ADD COLUMN     "Rating" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "Specialty_ID" INTEGER NOT NULL,
ADD COLUMN     "User_ID" INTEGER NOT NULL,
ADD COLUMN     "certifications" TEXT NOT NULL,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "yearsOfExperience" TEXT NOT NULL,
ADD CONSTRAINT "Doctor_pkey" PRIMARY KEY ("Doctor_ID");

-- AlterTable
ALTER TABLE "Hospital" DROP CONSTRAINT "Hospital_pkey",
DROP COLUMN "address",
DROP COLUMN "description",
DROP COLUMN "hospitalId",
DROP COLUMN "name",
DROP COLUMN "phone",
ADD COLUMN     "Address" TEXT NOT NULL,
ADD COLUMN     "Description" TEXT NOT NULL,
ADD COLUMN     "Email" TEXT NOT NULL,
ADD COLUMN     "Hospital_ID" SERIAL NOT NULL,
ADD COLUMN     "Name" TEXT NOT NULL,
ADD COLUMN     "Phone" INTEGER NOT NULL,
ADD COLUMN     "Type" TEXT NOT NULL,
ADD COLUMN     "establishYear" INTEGER NOT NULL,
ADD CONSTRAINT "Hospital_pkey" PRIMARY KEY ("Hospital_ID");

-- AlterTable
ALTER TABLE "MedicalRecord" DROP CONSTRAINT "MedicalRecord_pkey",
DROP COLUMN "appointmentId",
DROP COLUMN "diagnosis",
DROP COLUMN "doctorNotes",
DROP COLUMN "medicalRecordId",
DROP COLUMN "prescription",
DROP COLUMN "testResult",
ADD COLUMN     "Appointment_ID" INTEGER NOT NULL,
ADD COLUMN     "ChiefComplaint" TEXT NOT NULL,
ADD COLUMN     "Diagnosis" TEXT NOT NULL,
ADD COLUMN     "Doctor_notes" TEXT NOT NULL,
ADD COLUMN     "MedicalRecord_ID" SERIAL NOT NULL,
ADD COLUMN     "Prescription" TEXT NOT NULL,
ADD COLUMN     "Test_Result" TEXT NOT NULL,
ADD COLUMN     "assessment" TEXT NOT NULL,
ADD COLUMN     "education" TEXT NOT NULL,
ADD COLUMN     "historyPresentIllness" TEXT NOT NULL,
ADD COLUMN     "nonDrugPlan" TEXT NOT NULL,
ADD COLUMN     "physicalExam" TEXT NOT NULL,
ADD COLUMN     "treatmentGoals" TEXT NOT NULL,
ADD COLUMN     "treatmentPlan" TEXT NOT NULL,
ADD CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("MedicalRecord_ID");

-- AlterTable
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_pkey",
DROP COLUMN "appointmentId",
DROP COLUMN "paymentId",
DROP COLUMN "paymentMethod",
DROP COLUMN "paymentStatus",
DROP COLUMN "price",
ADD COLUMN     "Appointment_ID" INTEGER NOT NULL,
ADD COLUMN     "Payment_ID" SERIAL NOT NULL,
ADD COLUMN     "Payment_Method" "PaymentMethodEnum" NOT NULL,
ADD COLUMN     "Payment_Status" "PaymentStatusEnum" NOT NULL,
ADD COLUMN     "Price" DOUBLE PRECISION NOT NULL,
ADD CONSTRAINT "Payment_pkey" PRIMARY KEY ("Payment_ID");

-- AlterTable
ALTER TABLE "Specialty" DROP CONSTRAINT "Specialty_pkey",
DROP COLUMN "description",
DROP COLUMN "name",
DROP COLUMN "specialtyId",
ADD COLUMN     "Description" TEXT NOT NULL,
ADD COLUMN     "Name" TEXT NOT NULL,
ADD COLUMN     "Specialty_ID" SERIAL NOT NULL,
ADD CONSTRAINT "Specialty_pkey" PRIMARY KEY ("Specialty_ID");

-- AlterTable
ALTER TABLE "Token" DROP CONSTRAINT "Token_pkey",
DROP COLUMN "accessExpiresAt",
DROP COLUMN "accessToken",
DROP COLUMN "createdAt",
DROP COLUMN "id",
DROP COLUMN "refreshExpiresAt",
DROP COLUMN "refreshToken",
DROP COLUMN "userId",
ADD COLUMN     "AccessExpiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "AccessToken" TEXT NOT NULL,
ADD COLUMN     "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "RefreshExpiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "RefreshToken" TEXT NOT NULL,
ADD COLUMN     "Token_ID" SERIAL NOT NULL,
ADD COLUMN     "User_ID" INTEGER NOT NULL,
ADD CONSTRAINT "Token_pkey" PRIMARY KEY ("Token_ID");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "email",
DROP COLUMN "fullName",
DROP COLUMN "gender",
DROP COLUMN "password",
DROP COLUMN "phone",
DROP COLUMN "role",
DROP COLUMN "userId",
ADD COLUMN     "Created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "Email" TEXT NOT NULL,
ADD COLUMN     "Full_Name" TEXT NOT NULL,
ADD COLUMN     "Gender" "GenderEmun" NOT NULL,
ADD COLUMN     "Password" TEXT NOT NULL,
ADD COLUMN     "Phone" INTEGER NOT NULL,
ADD COLUMN     "Role" "RoleEnum" NOT NULL,
ADD COLUMN     "User_ID" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("User_ID");

-- DropEnum
DROP TYPE "Gender";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "PatientProfile" (
    "Profile_ID" SERIAL NOT NULL,
    "User_ID" INTEGER NOT NULL,
    "Gender" TEXT NOT NULL,
    "DateOfBirth" TIMESTAMP(3) NOT NULL,
    "Address" TEXT NOT NULL,
    "Insurance" TEXT NOT NULL,
    "Allergies" TEXT NOT NULL,
    "ChronicDiseases" TEXT NOT NULL,
    "obstetricHistory" TEXT NOT NULL,
    "surgicalHistory" TEXT NOT NULL,
    "familyHistory" TEXT NOT NULL,
    "socialHistory" TEXT NOT NULL,
    "medicationHistory" TEXT NOT NULL,

    CONSTRAINT "PatientProfile_pkey" PRIMARY KEY ("Profile_ID")
);

-- CreateTable
CREATE TABLE "AppointmentReminder" (
    "reminder_ID" SERIAL NOT NULL,
    "appointment_ID" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "sent" BOOLEAN NOT NULL,

    CONSTRAINT "AppointmentReminder_pkey" PRIMARY KEY ("reminder_ID")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "feedback_ID" SERIAL NOT NULL,
    "appointment_ID" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("feedback_ID")
);

-- CreateTable
CREATE TABLE "PrescriptionItem" (
    "Item_ID" SERIAL NOT NULL,
    "MedicalRecord_ID" INTEGER NOT NULL,
    "medicineName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "notes" TEXT NOT NULL,

    CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY ("Item_ID")
);

-- CreateTable
CREATE TABLE "DoctorSchedule" (
    "schedule_ID" SERIAL NOT NULL,
    "doctor_ID" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "DoctorSchedule_pkey" PRIMARY KEY ("schedule_ID")
);

-- CreateTable
CREATE TABLE "DoctorLeave" (
    "leave_ID" SERIAL NOT NULL,
    "doctor_ID" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "DoctorLeave_pkey" PRIMARY KEY ("leave_ID")
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "followUp_ID" SERIAL NOT NULL,
    "appointment_ID" INTEGER NOT NULL,
    "nextDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("followUp_ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientProfile_User_ID_key" ON "PatientProfile"("User_ID");

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentReminder_appointment_ID_key" ON "AppointmentReminder"("appointment_ID");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_appointment_ID_key" ON "Feedback"("appointment_ID");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_User_ID_key" ON "Doctor"("User_ID");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalRecord_Appointment_ID_key" ON "MedicalRecord"("Appointment_ID");

-- CreateIndex
CREATE UNIQUE INDEX "User_Email_key" ON "User"("Email");

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_User_ID_fkey" FOREIGN KEY ("User_ID") REFERENCES "User"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_User_ID_fkey" FOREIGN KEY ("User_ID") REFERENCES "User"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_Specialty_ID_fkey" FOREIGN KEY ("Specialty_ID") REFERENCES "Specialty"("Specialty_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_Hospital_ID_fkey" FOREIGN KEY ("Hospital_ID") REFERENCES "Hospital"("Hospital_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProfile" ADD CONSTRAINT "PatientProfile_User_ID_fkey" FOREIGN KEY ("User_ID") REFERENCES "User"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_Doctor_ID_fkey" FOREIGN KEY ("Doctor_ID") REFERENCES "Doctor"("Doctor_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_User_ID_fkey" FOREIGN KEY ("User_ID") REFERENCES "User"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_Hospital_ID_fkey" FOREIGN KEY ("Hospital_ID") REFERENCES "Hospital"("Hospital_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentReminder" ADD CONSTRAINT "AppointmentReminder_appointment_ID_fkey" FOREIGN KEY ("appointment_ID") REFERENCES "Appointment"("Appointment_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_appointment_ID_fkey" FOREIGN KEY ("appointment_ID") REFERENCES "Appointment"("Appointment_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_Appointment_ID_fkey" FOREIGN KEY ("Appointment_ID") REFERENCES "Appointment"("Appointment_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_MedicalRecord_ID_fkey" FOREIGN KEY ("MedicalRecord_ID") REFERENCES "MedicalRecord"("MedicalRecord_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorSchedule" ADD CONSTRAINT "DoctorSchedule_doctor_ID_fkey" FOREIGN KEY ("doctor_ID") REFERENCES "Doctor"("Doctor_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorLeave" ADD CONSTRAINT "DoctorLeave_doctor_ID_fkey" FOREIGN KEY ("doctor_ID") REFERENCES "Doctor"("Doctor_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_Appointment_ID_fkey" FOREIGN KEY ("Appointment_ID") REFERENCES "Appointment"("Appointment_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_appointment_ID_fkey" FOREIGN KEY ("appointment_ID") REFERENCES "Appointment"("Appointment_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
