-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "repliedAt" TIMESTAMP(3),
ADD COLUMN     "replyLog" JSONB;
