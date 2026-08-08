-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('ACTIVITY', 'COMMITMENT');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "type" "TaskType" NOT NULL DEFAULT 'ACTIVITY';
