-- CreateTable
CREATE TABLE "PvEssai" (
    "id" SERIAL NOT NULL,
    "marque" TEXT,
    "power" DOUBLE PRECISION,
    "frequency" INTEGER,
    "numero" TEXT,
    "phases" INTEGER,
    "type" TEXT,
    "client" TEXT,
    "mtu1" DOUBLE PRECISION,
    "mtu2" DOUBLE PRECISION,
    "btu2" DOUBLE PRECISION,
    "prises" TEXT,
    "norme" TEXT,
    "couplage" TEXT,
    "bti2" DOUBLE PRECISION,
    "date" TIMESTAMP(3),
    "voltage_ratio" JSONB,
    "no_load_test" JSONB,
    "short_circuit_test" JSONB,
 
    "dielectric_test" JSONB,
    "resistance_test" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PvEssai_pkey" PRIMARY KEY ("id")
);
