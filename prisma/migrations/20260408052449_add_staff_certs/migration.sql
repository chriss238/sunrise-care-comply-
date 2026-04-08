-- CreateTable
CREATE TABLE "Nurse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "facilityId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "employeeId" TEXT,
    "whatsappNumber" TEXT,
    "whatsappOptIn" BOOLEAN NOT NULL DEFAULT false,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "alternativePhone" TEXT,
    "dateJoined" DATETIME,
    "internalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Nurse_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NurseCert" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nurseId" INTEGER NOT NULL,
    "certType" TEXT NOT NULL,
    "certNumber" TEXT NOT NULL,
    "holderName" TEXT NOT NULL,
    "issuingBody" TEXT NOT NULL,
    "issueDate" DATETIME,
    "expiryDate" DATETIME NOT NULL,
    "renewalDate" DATETIME,
    "attachmentUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NurseCert_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "Nurse" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotificationRule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "certType" TEXT NOT NULL DEFAULT 'All Certifications',
    "daysBeforeExpiry" INTEGER NOT NULL,
    "templateEn" TEXT NOT NULL,
    "templateFil" TEXT,
    "templateId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "escalateToAdmin" BOOLEAN NOT NULL DEFAULT false,
    "escalateDays" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nurseCertId" INTEGER,
    "recipientId" INTEGER NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "messageText" TEXT NOT NULL,
    "sentAt" DATETIME,
    "deliveredAt" DATETIME,
    "readAt" DATETIME,
    "repliedAt" DATETIME,
    "replyText" TEXT,
    "status" TEXT NOT NULL,
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NotificationLog_nurseCertId_fkey" FOREIGN KEY ("nurseCertId") REFERENCES "NurseCert" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "NotificationLog_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Nurse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CertUpload" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nurseCertId" INTEGER,
    "nurseId" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadMethod" TEXT NOT NULL DEFAULT 'whatsapp',
    "ocrStatus" TEXT NOT NULL DEFAULT 'pending',
    "extractedData" TEXT,
    "confidenceScore" REAL,
    "reviewedById" INTEGER,
    "approvedAt" DATETIME,
    "reviewStatus" TEXT NOT NULL DEFAULT 'pending',
    "reviewNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CertUpload_nurseCertId_fkey" FOREIGN KEY ("nurseCertId") REFERENCES "NurseCert" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CertUpload_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "Nurse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CertUpload_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "Nurse" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nurseId" INTEGER NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "messageText" TEXT NOT NULL,
    "language" TEXT,
    "intent" TEXT,
    "botResponse" TEXT,
    "handledByBot" BOOLEAN NOT NULL DEFAULT false,
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "Nurse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Nurse_email_key" ON "Nurse"("email");
