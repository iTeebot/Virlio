import { syncOfficialBadgesAndPurgeLegacy } from "../src/server/repositories/badge.repository";

async function main() {
  console.log("Syncing official 13 system badges and purging non-system legacy rows...");
  await syncOfficialBadgesAndPurgeLegacy();
  console.log("Badge sync and auto-healing completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error running badge sync:", err);
  process.exit(1);
});
