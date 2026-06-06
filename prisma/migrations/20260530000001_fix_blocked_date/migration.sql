-- Restaura coluna reason (removida por engano na migration anterior)
ALTER TABLE "BlockedDate" ADD COLUMN IF NOT EXISTS "reason" TEXT;

-- Adiciona createdAt
ALTER TABLE "BlockedDate" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Garante FK com cascade
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'BlockedDate_userId_fkey'
  ) THEN
    ALTER TABLE "BlockedDate"
      ADD CONSTRAINT "BlockedDate_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS "BlockedDate_userId_idx" ON "BlockedDate"("userId");
