-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "recurringDaysOfWeek" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
