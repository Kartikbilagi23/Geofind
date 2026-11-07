-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Category" ADD VALUE 'CONTRACTOR_HANDYMAN';
ALTER TYPE "Category" ADD VALUE 'PLUMBER';
ALTER TYPE "Category" ADD VALUE 'ELECTRICIAN';
ALTER TYPE "Category" ADD VALUE 'HVAC';
ALTER TYPE "Category" ADD VALUE 'APPLIANCE_REPAIR';
ALTER TYPE "Category" ADD VALUE 'ROOFING';
ALTER TYPE "Category" ADD VALUE 'LOCKSMITH';
ALTER TYPE "Category" ADD VALUE 'PAINTER';
ALTER TYPE "Category" ADD VALUE 'LANDSCAPING';
ALTER TYPE "Category" ADD VALUE 'NURSERY_GARDENING';
ALTER TYPE "Category" ADD VALUE 'FLORIST';
ALTER TYPE "Category" ADD VALUE 'TREE_SERVICE';
ALTER TYPE "Category" ADD VALUE 'HOME_CLEANING';
ALTER TYPE "Category" ADD VALUE 'FURNITURE_STORE';
ALTER TYPE "Category" ADD VALUE 'MOVER';
