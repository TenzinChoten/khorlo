-- [Reason] Free subscriptions have no renewal or end date
ALTER TABLE "Subscription" ALTER COLUMN "expiresAt" DROP NOT NULL;

UPDATE "Subscription" AS s
SET "expiresAt" = NULL
FROM "Plan" AS p
WHERE s."planId" = p.id
  AND p.price <= 0;
