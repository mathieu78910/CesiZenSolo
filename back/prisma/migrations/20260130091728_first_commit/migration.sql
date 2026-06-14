-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "signup_date" DATE NOT NULL,
    "role" "UserRole" NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "exercise_id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "exercise_type" VARCHAR(50) NOT NULL,
    "duration" INTEGER NOT NULL,
    "benefit" TEXT NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("exercise_id")
);

-- CreateTable
CREATE TABLE "resources" (
    "resource_id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "content" TEXT NOT NULL,
    "resource_type" VARCHAR(50) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("resource_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" SERIAL NOT NULL,
    "label" VARCHAR(50) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "user_exercise" (
    "practice_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "exercise_id" INTEGER NOT NULL,
    "completed_at" TIMESTAMP(6) NOT NULL,
    "duration_completed" INTEGER NOT NULL,

    CONSTRAINT "user_exercise_pkey" PRIMARY KEY ("practice_id")
);

-- CreateTable
CREATE TABLE "user_resource_view" (
    "view_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "resource_id" INTEGER NOT NULL,
    "viewed_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "user_resource_view_pkey" PRIMARY KEY ("view_id")
);

-- CreateTable
CREATE TABLE "resource_category" (
    "resource_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "resource_category_pkey" PRIMARY KEY ("resource_id","category_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_label_key" ON "categories"("label");

-- CreateIndex
CREATE INDEX "user_exercise_user_id_idx" ON "user_exercise"("user_id");

-- CreateIndex
CREATE INDEX "user_exercise_exercise_id_idx" ON "user_exercise"("exercise_id");

-- CreateIndex
CREATE INDEX "user_resource_view_user_id_idx" ON "user_resource_view"("user_id");

-- CreateIndex
CREATE INDEX "user_resource_view_resource_id_idx" ON "user_resource_view"("resource_id");

-- CreateIndex
CREATE INDEX "resource_category_category_id_idx" ON "resource_category"("category_id");

-- AddForeignKey
ALTER TABLE "user_exercise" ADD CONSTRAINT "user_exercise_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_exercise" ADD CONSTRAINT "user_exercise_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("exercise_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_resource_view" ADD CONSTRAINT "user_resource_view_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_resource_view" ADD CONSTRAINT "user_resource_view_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("resource_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_category" ADD CONSTRAINT "resource_category_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("resource_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_category" ADD CONSTRAINT "resource_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;
