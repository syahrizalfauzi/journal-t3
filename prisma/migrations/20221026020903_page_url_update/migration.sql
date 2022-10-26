/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `Page` will be added. If there are existing duplicate values, this will fail.
  - Made the column `url` on table `Page` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Page_name_key";

-- AlterTable
ALTER TABLE "Page" ALTER COLUMN "url" SET NOT NULL,
ALTER COLUMN "url" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Page_url_key" ON "Page"("url");
