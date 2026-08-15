import { describe, expect, it } from "vitest";

import {
  ARCHITECTURE_AWS,
  ARCHITECTURE_NODES,
  ARCHITECTURE_RESEARCH,
  bakeSvgColors,
  findArchitectureNode,
  svgHasExternalNetwork,
  wrapStandaloneSvg,
} from "@/lib/architecture";

describe("architecture catalog", () => {
  it("separates current evidence from optional production mapping", () => {
    const evidence = new Set(ARCHITECTURE_NODES.flatMap((node) => node.evidence));
    expect(evidence).toEqual(
      new Set(["DEPLOYED", "FORK_PROVEN", "SIMULATED", "NOT_USED"]),
    );
    expect(ARCHITECTURE_NODES.every((node) => node.evidence.length > 0)).toBe(true);
    expect(findArchitectureNode("inventory")?.productionMapping).toMatch(/DynamoDB/);
    expect(findArchitectureNode("inventory")?.evidence).not.toContain("DEPLOYED");
  });

  it("keeps the loser-never-charged claim on the settle split", () => {
    const loser = findArchitectureNode("loser");
    expect(loser?.protocol.toLowerCase()).toContain("settle is not called");
    expect(loser?.does.toLowerCase()).toMatch(/discard|expire/);
  });

  it("says AWS is a mapping and the fork is what runs today", () => {
    const inventory = findArchitectureNode("inventory");
    expect(inventory?.today).toMatch(/in-process lock/i);
    expect(inventory?.today).toMatch(/DynamoDB is not running/);
    expect(ARCHITECTURE_AWS.some((item) => /production mapping/i.test(item.body))).toBe(true);
  });

  it("does not claim public /api/commit returns 402 while production is 503", () => {
    const merchant = findArchitectureNode("merchant");
    expect(merchant?.today).toMatch(/503/);
    expect(merchant?.protocol).not.toMatch(/returns HTTP 402\.$/);
  });

  it("surfaces the three protocol findings a judge should see", () => {
    const titles = ARCHITECTURE_RESEARCH.map((item) => item.title).join(" ");
    expect(titles).toMatch(/Correction 7/);
    expect(titles).toMatch(/Correction 12/);
    expect(titles).toMatch(/Correction 14/);
  });

  it("does not put network URLs in node copy", () => {
    const blob = ARCHITECTURE_NODES.map((node) => `${node.does} ${node.protocol} ${node.today}`).join(" ");
    expect(svgHasExternalNetwork(blob)).toBe(false);
  });
});

describe("SVG export", () => {
  it("bakes CSS variables so the file can render offline", () => {
    const baked = bakeSvgColors(
      '<rect fill="var(--arch-panel)" stroke="var(--arch-acid)"/>',
      { "--arch-panel": "#151a16", "--arch-acid": "#c9ff47" },
    );
    expect(baked).toBe('<rect fill="#151a16" stroke="#c9ff47"/>');
    expect(svgHasExternalNetwork(baked)).toBe(false);
  });

  it("wraps a standalone SVG document without remote resources", () => {
    const doc = wrapStandaloneSvg('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    expect(doc.startsWith("<?xml")).toBe(true);
    expect(svgHasExternalNetwork(doc.replace("http://www.w3.org/2000/svg", ""))).toBe(false);
  });
});
