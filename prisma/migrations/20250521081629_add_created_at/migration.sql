/*
  Warnings:

  - You are about to drop the column `DateIssued` on the `Certification` table. All the data in the column will be lost.
  - You are about to drop the column `Description` on the `Certification` table. All the data in the column will be lost.
  - You are about to drop the column `IssuedBy` on the `Certification` table. All the data in the column will be lost.
  - You are about to drop the column `Title` on the `Certification` table. All the data in the column will be lost.
  - Added the required column `fileUrl` to the `Certification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UpdatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Certification" DROP COLUMN "DateIssued",
DROP COLUMN "Description",
DROP COLUMN "IssuedBy",
DROP COLUMN "Title",
ADD COLUMN     "fileUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "PaymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "UpdatedAt" TIMESTAMP(3) NOT NULL;
