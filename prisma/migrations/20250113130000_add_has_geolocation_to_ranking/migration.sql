-- AddHasGeolocationToRanking
ALTER TABLE "Ranking" ADD COLUMN "hasGeolocation" BOOLEAN NOT NULL DEFAULT false;
