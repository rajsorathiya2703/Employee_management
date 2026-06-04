-- CreateTable
CREATE TABLE "circulars" (
    "id" TEXT NOT NULL,
    "circularTitle" TEXT NOT NULL,
    "circularDescription" TEXT NOT NULL,
    "circularPostDate" TIMESTAMP(3) NOT NULL,
    "circularPostTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "circulars_pkey" PRIMARY KEY ("id")
);
