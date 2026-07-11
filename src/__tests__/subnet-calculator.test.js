import { describe, it, expect } from "vitest";
import { parseCIDR, calcSubnet } from "../tools/dev/subnet-calculator.js";

describe("subnet-calculator", () => {
  describe("parseCIDR", () => {
    it("parses valid CIDR", () => {
      const r = parseCIDR("192.168.1.0/24");
      expect(r).not.toBeNull();
      expect(r.ip).toEqual([192, 168, 1, 0]);
      expect(r.prefix).toBe(24);
    });

    it("returns null for invalid format", () => {
      expect(parseCIDR("invalid")).toBeNull();
      expect(parseCIDR("1.2.3.4")).toBeNull();
      expect(parseCIDR("1.2.3.4/33")).toBeNull();
      expect(parseCIDR("256.1.1.1/24")).toBeNull();
    });
  });

  describe("calcSubnet", () => {
    it("calculates /24 correctly", () => {
      const s = calcSubnet([192, 168, 1, 0], 24);
      expect(s.network).toBe("192.168.1.0");
      expect(s.broadcast).toBe("192.168.1.255");
      expect(s.mask).toBe("255.255.255.0");
      expect(s.firstHost).toBe("192.168.1.1");
      expect(s.lastHost).toBe("192.168.1.254");
      expect(s.totalHosts).toBe(254);
    });

    it("calculates /16 correctly", () => {
      const s = calcSubnet([10, 0, 0, 0], 16);
      expect(s.network).toBe("10.0.0.0");
      expect(s.mask).toBe("255.255.0.0");
      expect(s.totalHosts).toBe(65534);
    });

    it("calculates /32 correctly", () => {
      const s = calcSubnet([1, 2, 3, 4], 32);
      expect(s.network).toBe("1.2.3.4");
      expect(s.broadcast).toBe("1.2.3.4");
      expect(s.totalHosts).toBe(1);
    });

    it("calculates /31 (RFC 3021)", () => {
      const s = calcSubnet([10, 0, 0, 0], 31);
      expect(s.totalHosts).toBe(2);
      expect(s.firstHost).toBe("10.0.0.0");
      expect(s.lastHost).toBe("10.0.0.1");
    });

    it("generates binary representations", () => {
      const s = calcSubnet([192, 168, 1, 0], 24);
      expect(s.binaryIp).toContain("11000000");
      expect(s.binaryMask).toContain("11111111");
    });
  });
});
