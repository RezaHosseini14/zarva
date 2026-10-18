-- CreateTable
CREATE TABLE "SidebarNavItem" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "parentId" TEXT,
    "href" TEXT NOT NULL,
    "labelKey" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "iconActive" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "moduleKey" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SidebarNavItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SidebarNavItem_key_key" ON "SidebarNavItem"("key");

-- CreateIndex
CREATE INDEX "SidebarNavItem_parentId_sortOrder_idx" ON "SidebarNavItem"("parentId", "sortOrder");

-- CreateIndex
CREATE INDEX "SidebarNavItem_group_sortOrder_idx" ON "SidebarNavItem"("group", "sortOrder");

-- AddForeignKey
ALTER TABLE "SidebarNavItem" ADD CONSTRAINT "SidebarNavItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "SidebarNavItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
