import { describe, it, expect } from "vitest";

function buf2hex(buf) {
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function buf2b64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

async function hmacSign(message, secret, algo = "SHA-256") {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: algo },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return sig;
}

describe("hmac-generator pure logic", () => {
  it("produces consistent hex output", async () => {
    const sig = await hmacSign("hello", "secret");
    const hex = buf2hex(sig);
    expect(hex).toMatch(/^[0-9a-f]{64}$/);
    const sig2 = await hmacSign("hello", "secret");
    expect(buf2hex(sig2)).toBe(hex);
  });

  it("produces consistent base64 output", async () => {
    const sig = await hmacSign("hello", "secret");
    const b64 = buf2b64(sig);
    expect(typeof b64).toBe("string");
    expect(b64.length).toBeGreaterThan(0);
  });

  it("different messages produce different signatures", async () => {
    const sig1 = await hmacSign("hello", "secret");
    const sig2 = await hmacSign("world", "secret");
    expect(buf2hex(sig1)).not.toBe(buf2hex(sig2));
  });

  it("different keys produce different signatures", async () => {
    const sig1 = await hmacSign("hello", "key1");
    const sig2 = await hmacSign("hello", "key2");
    expect(buf2hex(sig1)).not.toBe(buf2hex(sig2));
  });

  it("supports SHA-512", async () => {
    const sig = await hmacSign("test", "key", "SHA-512");
    const hex = buf2hex(sig);
    expect(hex).toMatch(/^[0-9a-f]{128}$/);
  });
});
