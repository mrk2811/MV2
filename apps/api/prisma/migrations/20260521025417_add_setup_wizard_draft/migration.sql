-- CreateTable
CREATE TABLE "SetupWizardDraft" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT,
    "data" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SetupWizardDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SetupWizardDraft_tenantId_key" ON "SetupWizardDraft"("tenantId");

-- CreateIndex
CREATE INDEX "SetupWizardDraft_adminUserId_idx" ON "SetupWizardDraft"("adminUserId");

-- AddForeignKey
ALTER TABLE "SetupWizardDraft" ADD CONSTRAINT "SetupWizardDraft_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetupWizardDraft" ADD CONSTRAINT "SetupWizardDraft_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
