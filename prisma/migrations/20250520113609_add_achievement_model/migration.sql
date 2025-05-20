/*
  Warnings:

  - Added the required column `education` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `Gender` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "GenderEnum" AS ENUM ('Male', 'Female');

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "education" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Hospital" ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "Gender",
ADD COLUMN     "Gender" "GenderEnum" NOT NULL;

-- DropEnum
DROP TYPE "GenderEmun";

-- CreateTable
CREATE TABLE "Achievement" (
    "Achievement_ID" SERIAL NOT NULL,
    "Title" TEXT NOT NULL,
    "Description" TEXT,
    "DateAchieved" TIMESTAMP(3),
    "Doctor_ID" INTEGER,
    "Hospital_ID" INTEGER,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("Achievement_ID")
);

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_Doctor_ID_fkey" FOREIGN KEY ("Doctor_ID") REFERENCES "Doctor"("Doctor_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_Hospital_ID_fkey" FOREIGN KEY ("Hospital_ID") REFERENCES "Hospital"("Hospital_ID") ON DELETE SET NULL ON UPDATE CASCADE;
