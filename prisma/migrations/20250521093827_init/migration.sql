-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPOINTMENT', 'FOLLOW_UP', 'VACCINE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "NotificationMethod" AS ENUM ('email', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationTargetType" AS ENUM ('APPOINTMENT', 'FOLLOW_UP', 'CUSTOM');

-- CreateEnum
CREATE TYPE "RoleEnum" AS ENUM ('ADMIN', 'DOCTOR', 'USER');

-- CreateEnum
CREATE TYPE "PaymentMethodEnum" AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'MOMO');

-- CreateEnum
CREATE TYPE "PaymentStatusEnum" AS ENUM ('PAID', 'UNPAID', 'PENDING');

-- CreateEnum
CREATE TYPE "GenderEnum" AS ENUM ('Male', 'Female');

-- CreateTable
CREATE TABLE "User" (
    "userId" SERIAL NOT NULL,
    "Full_Name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "Role" "RoleEnum" NOT NULL,
    "Gender" "GenderEnum" NOT NULL,
    "Created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Avatar" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Token" (
    "Token_ID" SERIAL NOT NULL,
    "AccessToken" TEXT NOT NULL,
    "RefreshToken" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "AccessExpiresAt" TIMESTAMP(3) NOT NULL,
    "RefreshExpiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("Token_ID")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "doctorId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "Specialty_ID" INTEGER NOT NULL,
    "hospitalId" INTEGER NOT NULL,
    "Rating" DOUBLE PRECISION NOT NULL,
    "Bio" TEXT NOT NULL,
    "yearsOfExperience" TEXT NOT NULL,
    "education" TEXT NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("doctorId")
);

-- CreateTable
CREATE TABLE "PatientProfile" (
    "Profile_ID" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "Gender" TEXT NOT NULL,
    "DateOfBirth" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
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
CREATE TABLE "Specialty" (
    "Specialty_ID" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Specialty_pkey" PRIMARY KEY ("Specialty_ID")
);

-- CreateTable
CREATE TABLE "Hospital" (
    "hospitalId" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "establishYear" INTEGER NOT NULL,
    "logo" TEXT NOT NULL,
    "WorkScheduling" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "website" TEXT,

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("hospitalId")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "Appointment_ID" SERIAL NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "hospitalId" INTEGER NOT NULL,
    "Scheduled_time" TIMESTAMP(3) NOT NULL,
    "Note" TEXT,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("Appointment_ID")
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
    "feedbackId" SERIAL NOT NULL,
    "appointment_ID" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("feedbackId")
);

-- CreateTable
CREATE TABLE "MedicalRecord" (
    "MedicalRecord_ID" SERIAL NOT NULL,
    "Appointment_ID" INTEGER NOT NULL,
    "Diagnosis" TEXT NOT NULL,
    "Prescription" TEXT NOT NULL,
    "Test_Result" TEXT NOT NULL,
    "Doctor_notes" TEXT NOT NULL,
    "ChiefComplaint" TEXT NOT NULL,
    "historyPresentIllness" TEXT NOT NULL,
    "physicalExam" TEXT NOT NULL,
    "treatmentGoals" TEXT NOT NULL,
    "assessment" TEXT NOT NULL,
    "treatmentPlan" TEXT NOT NULL,
    "nonDrugPlan" TEXT NOT NULL,
    "education" TEXT NOT NULL,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("MedicalRecord_ID")
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
    "scheduleId" SERIAL NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "DoctorSchedule_pkey" PRIMARY KEY ("scheduleId")
);

-- CreateTable
CREATE TABLE "DoctorLeave" (
    "leave_ID" SERIAL NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "DoctorLeave_pkey" PRIMARY KEY ("leave_ID")
);

-- CreateTable
CREATE TABLE "Payment" (
    "Payment_ID" SERIAL NOT NULL,
    "Appointment_ID" INTEGER NOT NULL,
    "Price" DOUBLE PRECISION NOT NULL,
    "Payment_Method" "PaymentMethodEnum" NOT NULL,
    "Payment_Status" "PaymentStatusEnum" NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("Payment_ID")
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "followUpId" SERIAL NOT NULL,
    "appointment_ID" INTEGER NOT NULL,
    "nextDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("followUpId")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "Achievement_ID" SERIAL NOT NULL,
    "Title" TEXT NOT NULL,
    "description" TEXT,
    "DateAchieved" TIMESTAMP(3),
    "doctorId" INTEGER,
    "hospitalId" INTEGER,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("Achievement_ID")
);

-- CreateTable
CREATE TABLE "Certification" (
    "Certification_ID" SERIAL NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "doctorId" INTEGER NOT NULL,

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

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_userId_key" ON "Doctor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientProfile_userId_key" ON "PatientProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentReminder_appointment_ID_key" ON "AppointmentReminder"("appointment_ID");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_appointment_ID_key" ON "Feedback"("appointment_ID");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalRecord_Appointment_ID_key" ON "MedicalRecord"("Appointment_ID");

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_Specialty_ID_fkey" FOREIGN KEY ("Specialty_ID") REFERENCES "Specialty"("Specialty_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("hospitalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProfile" ADD CONSTRAINT "PatientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("doctorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("hospitalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentReminder" ADD CONSTRAINT "AppointmentReminder_appointment_ID_fkey" FOREIGN KEY ("appointment_ID") REFERENCES "Appointment"("Appointment_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_appointment_ID_fkey" FOREIGN KEY ("appointment_ID") REFERENCES "Appointment"("Appointment_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_Appointment_ID_fkey" FOREIGN KEY ("Appointment_ID") REFERENCES "Appointment"("Appointment_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_MedicalRecord_ID_fkey" FOREIGN KEY ("MedicalRecord_ID") REFERENCES "MedicalRecord"("MedicalRecord_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorSchedule" ADD CONSTRAINT "DoctorSchedule_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("doctorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorLeave" ADD CONSTRAINT "DoctorLeave_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("doctorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_Appointment_ID_fkey" FOREIGN KEY ("Appointment_ID") REFERENCES "Appointment"("Appointment_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_appointment_ID_fkey" FOREIGN KEY ("appointment_ID") REFERENCES "Appointment"("Appointment_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("doctorId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("hospitalId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("doctorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("Appointment_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_followUpId_fkey" FOREIGN KEY ("followUpId") REFERENCES "FollowUp"("followUpId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "MedicalRecord"("MedicalRecord_ID") ON DELETE SET NULL ON UPDATE CASCADE;
