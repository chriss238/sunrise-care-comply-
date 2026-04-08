-- CreateTable
CREATE TABLE "Facility" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "mohLicense" TEXT NOT NULL,
    "lastAuditDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ComplianceItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "facilityId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "notes" TEXT,
    "completedAt" DATETIME,
    "completedBy" TEXT,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ComplianceItem_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompletionLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemId" INTEGER NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedBy" TEXT NOT NULL DEFAULT 'Staff',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompletionLog_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ComplianceItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Facility_mohLicense_key" ON "Facility"("mohLicense");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceItem_facilityId_itemName_key" ON "ComplianceItem"("facilityId", "itemName");
