-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "recurringExcludedDates" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[],
ADD COLUMN     "recurringUntil" TIMESTAMP(3);
