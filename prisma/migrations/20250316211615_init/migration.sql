-- CreateTable
CREATE TABLE "media_files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL,
    "takenAt" DATETIME,
    "latitude" REAL,
    "longitude" REAL,
    "altitude" REAL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "googleUrl" TEXT,
    "deviceType" TEXT
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "tags_on_media_files" (
    "mediaFileId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("mediaFileId", "tagId"),
    CONSTRAINT "tags_on_media_files_mediaFileId_fkey" FOREIGN KEY ("mediaFileId") REFERENCES "media_files" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tags_on_media_files_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");
