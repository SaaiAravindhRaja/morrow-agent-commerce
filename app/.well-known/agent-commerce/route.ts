import { GET as getCapabilities } from "@/app/api/capabilities/route";

export const dynamic = "force-static";

export function GET() {
  return getCapabilities();
}
