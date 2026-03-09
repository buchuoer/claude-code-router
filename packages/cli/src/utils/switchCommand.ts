import { ROUTE_GROUPS_DIR } from "@CCR/shared";
import { existsSync } from "fs";
import { join } from "path";
import { readConfigFile } from "./index";

/**
 * Execute the switch command
 * Outputs shell export commands for eval usage
 * Usage: eval "$(myccr switch <route-group-name>)"
 */
export const switchCommand = async (routeGroupName?: string) => {
  if (!routeGroupName) {
    console.error("Error: Route group name is required");
    console.error("Usage: myccr switch <route-group-name>");
    console.error("Example: myccr switch production");
    process.exit(1);
  }

  // Check if route group exists
  const routeGroupPath = join(ROUTE_GROUPS_DIR, `${routeGroupName}.json`);
  if (!existsSync(routeGroupPath)) {
    console.error(`Error: Route group "${routeGroupName}" not found`);
    console.error(`Available route groups can be found in ${ROUTE_GROUPS_DIR}`);
    process.exit(1);
  }

  // Read config to get server port
  const config = await readConfigFile();
  const port = config.PORT || 3456;

  // Output shell export commands
  console.log(`export CCR_ROUTE_GROUP="${routeGroupName}"`);
  console.log(`export ANTHROPIC_BASE_URL="http://127.0.0.1:${port}/rg/${routeGroupName}"`);
}
