-- CreateTable
CREATE TABLE "Upload" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimetype" TEXT,
    "size" INTEGER,
    "isLinked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Upload_publicId_key" ON "Upload"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Upload_url_key" ON "Upload"("url");

-- CreateIndex
CREATE INDEX "Upload_mimetype_idx" ON "Upload"("mimetype");

-- CreateIndex
CREATE INDEX "Upload_isLinked_createdAt_idx" ON "Upload"("isLinked", "createdAt");
