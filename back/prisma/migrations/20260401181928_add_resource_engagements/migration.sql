-- CreateTable
CREATE TABLE "user_resource_like" (
    "user_id" INTEGER NOT NULL,
    "resource_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_resource_like_pkey" PRIMARY KEY ("user_id","resource_id")
);

-- CreateTable
CREATE TABLE "user_saved_resource" (
    "user_id" INTEGER NOT NULL,
    "resource_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_saved_resource_pkey" PRIMARY KEY ("user_id","resource_id")
);

-- CreateIndex
CREATE INDEX "user_resource_like_resource_id_idx" ON "user_resource_like"("resource_id");

-- CreateIndex
CREATE INDEX "user_saved_resource_resource_id_idx" ON "user_saved_resource"("resource_id");

-- AddForeignKey
ALTER TABLE "user_resource_like" ADD CONSTRAINT "user_resource_like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_resource_like" ADD CONSTRAINT "user_resource_like_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("resource_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_saved_resource" ADD CONSTRAINT "user_saved_resource_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_saved_resource" ADD CONSTRAINT "user_saved_resource_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("resource_id") ON DELETE CASCADE ON UPDATE CASCADE;
