import { GET as getCapabilities } from "@/app/api/capabilities/route";

export const dynamic = "force-dynamic";

export function GET() {
  return getCapabilities();
}
