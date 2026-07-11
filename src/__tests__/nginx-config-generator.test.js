import { describe, it, expect } from "vitest";
import {
  toolConfig,
  PRESETS,
  DEFAULT_STATE,
  getPresetValues,
  parseBackends,
  buildUpstreamBlock,
  buildSecurityHeaders,
  buildGzipSection,
  buildLocationBlocks,
  buildServerBlock,
  buildNginxConfig,
  applyPreset,
  buildMainServerBlock,
  buildHttpsBlock,
  buildWwwRedirectBlock,
  buildHttpRedirectBlock
} from "../tools/dev/nginx-config-generator.js";

describe("nginx-config-generator", () => {
  describe("toolConfig", () => {
    it("has correct id, name, category", () => {
      expect(toolConfig.id).toBe("nginx-config-generator");
      expect(toolConfig.name).toBe("NGINX Config Generator");
      expect(toolConfig.category).toBe("dev");
    });

    it("has keywords, steps, and faqs", () => {
      expect(toolConfig.keywords.length).toBeGreaterThan(5);
      expect(toolConfig.steps.length).toBeGreaterThan(2);
      expect(toolConfig.faqs.length).toBeGreaterThan(1);
    });

    it("mentions nginx in description", () => {
      expect(toolConfig.description.toLowerCase()).toContain("nginx");
    });
  });

  describe("PRESETS", () => {
    it("defines at least 4 presets", () => {
      expect(Object.keys(PRESETS).length).toBeGreaterThanOrEqual(4);
    });

    it("each preset has label, description, values", () => {
      for (const [id, p] of Object.entries(PRESETS)) {
        expect(p.label, `preset ${id} label`).toBeTruthy();
        expect(p.description, `preset ${id} description`).toBeTruthy();
        expect(p.values, `preset ${id} values`).toBeDefined();
      }
    });

    it("wordpress preset enables PHP", () => {
      expect(PRESETS.wordpress.values.enablePhp).toBe(true);
    });

    it("node-proxy preset enables reverse proxy", () => {
      expect(PRESETS["node-proxy"].values.enableProxy).toBe(true);
    });

    it("load-balancer preset defines upstream backends", () => {
      expect(PRESETS["load-balancer"].values.enableUpstream).toBe(true);
      expect(PRESETS["load-balancer"].values.upstreamBackends).toContain("http://127.0.0.1:8080");
    });
  });

  describe("getPresetValues", () => {
    it("returns values for known preset", () => {
      expect(getPresetValues("static-site")).toEqual(PRESETS["static-site"].values);
    });

    it("returns null for unknown preset", () => {
      expect(getPresetValues("does-not-exist")).toBeNull();
    });
  });

  describe("parseBackends", () => {
    it("parses newline-separated backends", () => {
      expect(parseBackends("http://a:1\nhttp://b:2")).toEqual(["http://a:1", "http://b:2"]);
    });

    it("parses comma-separated backends", () => {
      expect(parseBackends("http://a:1, http://b:2")).toEqual(["http://a:1", "http://b:2"]);
    });

    it("drops empty entries", () => {
      expect(parseBackends("http://a:1\n\n  \nhttp://b:2")).toEqual(["http://a:1", "http://b:2"]);
    });

    it("returns [] for empty / non-string input", () => {
      expect(parseBackends("")).toEqual([]);
      expect(parseBackends(null)).toEqual([]);
      expect(parseBackends(undefined)).toEqual([]);
    });
  });

  describe("buildUpstreamBlock", () => {
    it("produces a valid upstream block", () => {
      const out = buildUpstreamBlock("backend", ["http://a:1", "http://b:2"]);
      expect(out).toContain("upstream backend {");
      expect(out).toContain("server http://a:1;");
      expect(out).toContain("server http://b:2;");
      expect(out).toContain("least_conn;");
    });

    it("returns empty string for no backends", () => {
      expect(buildUpstreamBlock("backend", [])).toBe("");
    });

    it("sanitizes invalid name characters", () => {
      const out = buildUpstreamBlock("back end-1!", ["http://a:1"]);
      expect(out).toContain("upstream back_end_1_ {");
    });
  });

  describe("buildSecurityHeaders", () => {
    it("contains X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy", () => {
      const out = buildSecurityHeaders();
      expect(out).toContain('X-Frame-Options "SAMEORIGIN"');
      expect(out).toContain('X-Content-Type-Options "nosniff"');
      expect(out).toContain('Referrer-Policy "strict-origin-when-cross-origin"');
      expect(out).toContain('Permissions-Policy "camera=(), microphone=(), geolocation=()"');
    });
  });

  describe("buildGzipSection", () => {
    it("contains common gzip directives", () => {
      const out = buildGzipSection();
      expect(out).toContain("gzip on;");
      expect(out).toContain("gzip_vary on;");
      expect(out).toContain("gzip_types");
      expect(out).toContain("application/javascript");
    });
  });

  describe("buildLocationBlocks", () => {
    it("returns [] when no features enabled", () => {
      expect(buildLocationBlocks({})).toEqual([]);
    });

    it("emits a fastcgi block when PHP enabled", () => {
      const blocks = buildLocationBlocks({
        enablePhp: true,
        phpSocket: "unix:/run/php/php8.2.sock"
      });
      expect(blocks.join("\n")).toContain("fastcgi_pass unix:/run/php/php8.2.sock;");
      expect(blocks.join("\n")).toContain("include snippets/fastcgi-php.conf;");
    });

    it("emits a static cache block when enabled", () => {
      const blocks = buildLocationBlocks({ enableStaticCache: true, cacheExpires: "7d" });
      expect(blocks.join("\n")).toContain("expires 7d;");
      expect(blocks.join("\n")).toContain("access_log off;");
    });

    it("emits a proxy_pass location with default headers when enabled", () => {
      const blocks = buildLocationBlocks({ enableProxy: true, proxyUrl: "http://127.0.0.1:3000" });
      const joined = blocks.join("\n");
      expect(joined).toContain("proxy_pass http://127.0.0.1:3000;");
      expect(joined).toContain("proxy_set_header Host $host;");
      expect(joined).toContain("X-Forwarded-For");
    });

    it("adds WebSocket upgrade headers when proxyWebsockets is true", () => {
      const blocks = buildLocationBlocks({
        enableProxy: true,
        proxyUrl: "http://x",
        proxyWebsockets: true
      });
      const joined = blocks.join("\n");
      expect(joined).toContain("proxy_set_header Upgrade $http_upgrade;");
      expect(joined).toContain('proxy_set_header Connection "upgrade";');
    });

    it("does not add WebSocket headers when proxyWebsockets is false", () => {
      const blocks = buildLocationBlocks({
        enableProxy: true,
        proxyUrl: "http://x",
        proxyWebsockets: false
      });
      expect(blocks.join("\n")).not.toContain("Upgrade $http_upgrade");
    });
  });

  describe("buildServerBlock", () => {
    it("emits server_name, root, index, listen directives", () => {
      const out = buildServerBlock({
        serverName: "example.com",
        root: "/var/www/html",
        index: "index.html",
        listen: 80
      });
      expect(out).toContain("listen 80;");
      expect(out).toContain("listen [::]:80;");
      expect(out).toContain("server_name example.com;");
      expect(out).toContain("root /var/www/html;");
      expect(out).toContain("index index.html;");
    });

    it("adds an HTTPS server block when enableHttps", () => {
      const out = buildServerBlock({
        serverName: "example.com",
        root: "/var/www/html",
        enableHttps: true,
        sslCertificate: "/c.pem",
        sslCertificateKey: "/k.pem",
        sslProtocols: "TLSv1.2 TLSv1.3"
      });
      expect(out).toContain("listen 443 ssl;");
      expect(out).toContain("ssl_certificate /c.pem;");
      expect(out).toContain("ssl_certificate_key /k.pem;");
      expect(out).toContain("ssl_protocols TLSv1.2 TLSv1.3;");
    });

    it("adds an HTTP->HTTPS redirect server when enabled", () => {
      const out = buildServerBlock({
        serverName: "example.com",
        enableHttps: true,
        enableHttpRedirect: true
      });
      expect(out).toContain("return 301 https://$host$request_uri;");
    });

    it("adds a to-www redirect server when enableWwwRedirect is to-www", () => {
      const out = buildServerBlock({ serverName: "example.com", enableWwwRedirect: "to-www" });
      expect(out).toContain("return 301 $scheme://www.example.com$request_uri;");
    });

    it("adds a from-www redirect server when enableWwwRedirect is from-www", () => {
      const out = buildServerBlock({ serverName: "example.com", enableWwwRedirect: "from-www" });
      expect(out).toContain("return 301 $scheme://example.com$request_uri;");
    });

    it("omits redirects when enableWwwRedirect is none", () => {
      const out = buildServerBlock({ serverName: "example.com", enableWwwRedirect: "none" });
      expect(out).not.toContain("$request_uri");
    });

    it("adds rate limiting when enabled", () => {
      const out = buildServerBlock({
        serverName: "x",
        enableRateLimit: true,
        rateLimitRate: "5r/s",
        rateLimitBurst: "10"
      });
      expect(out).toContain("limit_req zone=one burst=10 nodelay;");
    });

    it("adds security headers when enabled", () => {
      const out = buildServerBlock({ serverName: "x", enableSecurityHeaders: true });
      expect(out).toContain('X-Frame-Options "SAMEORIGIN"');
    });
  });

  describe("buildNginxConfig", () => {
    it("emits a header comment", () => {
      const out = buildNginxConfig({});
      expect(out).toContain("# nginx.conf — generated by ToolBox");
    });

    it("emits an upstream block when enableUpstream + backends", () => {
      const out = buildNginxConfig({
        enableUpstream: true,
        upstreamName: "app",
        upstreamBackends: "http://1:1\nhttp://2:2",
        serverName: "x"
      });
      expect(out).toContain("upstream app {");
      expect(out).toContain("server http://1:1;");
    });

    it("emits a limit_req_zone when rate limiting is enabled", () => {
      const out = buildNginxConfig({ enableRateLimit: true, rateLimitRate: "5r/m" });
      expect(out).toContain("limit_req_zone $binary_remote_addr zone=one:10m rate=5r/m;");
    });

    it("does NOT include rate-limit zone when feature is off", () => {
      const out = buildNginxConfig({});
      expect(out).not.toContain("limit_req_zone");
    });

    it("integrates server block", () => {
      const out = buildNginxConfig({ serverName: "example.com", root: "/var/www/html" });
      expect(out).toContain("server {");
      expect(out).toContain("server_name example.com;");
      expect(out).toContain("root /var/www/html;");
    });
  });

  describe("applyPreset", () => {
    it("returns the same object for unknown preset", () => {
      const state = { foo: 1 };
      expect(applyPreset("nope", state)).toBe(state);
    });

    it("preset overrides fields the preset defines, preserves fields it does not", () => {
      const result = applyPreset("wordpress", { listen: 8080, serverName: "old.com" });
      expect(result.listen).toBe(8080);
      expect(result.serverName).toBe("example.com");
      expect(result.enablePhp).toBe(true);
      expect(result.preset).toBe("wordpress");
    });

    it("preset values overwrite defaults for current = empty", () => {
      const result = applyPreset("static-site", {});
      expect(result.enableHttps).toBe(true);
      expect(result.serverName).toBe("example.com");
    });
  });

  describe("DEFAULT_STATE", () => {
    it("has sensible defaults", () => {
      expect(DEFAULT_STATE.listen).toBe(80);
      expect(DEFAULT_STATE.serverName).toBe("example.com");
      expect(DEFAULT_STATE.enableHttps).toBe(false);
    });

    it("does not enable extras by default", () => {
      expect(DEFAULT_STATE.enableGzip).toBe(false);
      expect(DEFAULT_STATE.enableProxy).toBe(false);
      expect(DEFAULT_STATE.enablePhp).toBe(false);
      expect(DEFAULT_STATE.enableUpstream).toBe(false);
    });
  });

  describe("buildMainServerBlock", () => {
    it("emits server block with listen, server_name, root, index", () => {
      const { lines } = buildMainServerBlock({
        serverName: "test.com",
        root: "/var/www",
        index: "index.html",
        listen: 443
      });
      expect(lines.join("\n")).toContain("listen 443;");
      expect(lines.join("\n")).toContain("server_name test.com;");
    });

    it("returns listenExtra for HTTPS block to reuse", () => {
      const { listenExtra } = buildMainServerBlock({ listenExtra: "ssl" });
      expect(listenExtra).toBe("ssl");
    });
  });

  describe("buildHttpsBlock", () => {
    it("emits HTTPS server block with ssl_certificate", () => {
      const out = buildHttpsBlock(
        {
          sslCertificate: "/cert.pem",
          sslCertificateKey: "/key.pem",
          sslProtocols: "TLSv1.2",
          serverName: "x"
        },
        ""
      );
      expect(out).toContain("listen 443 ssl;");
      expect(out).toContain("ssl_certificate /cert.pem;");
    });

    it("includes security headers when enabled", () => {
      const out = buildHttpsBlock({ enableSecurityHeaders: true }, "");
      expect(out).toContain("X-Frame-Options");
    });
  });

  describe("buildWwwRedirectBlock", () => {
    it("returns empty string for no redirect", () => {
      expect(buildWwwRedirectBlock({}, "")).toBe("");
      expect(buildWwwRedirectBlock({ enableWwwRedirect: "none" }, "")).toBe("");
    });

    it("emits to-www redirect", () => {
      const out = buildWwwRedirectBlock(
        { serverName: "example.com", enableWwwRedirect: "to-www" },
        ""
      );
      expect(out).toContain("return 301 $scheme://www.example.com$request_uri;");
    });

    it("emits from-www redirect", () => {
      const out = buildWwwRedirectBlock(
        { serverName: "example.com", enableWwwRedirect: "from-www" },
        ""
      );
      expect(out).toContain("server_name www.example.com;");
      expect(out).toContain("return 301 $scheme://example.com$request_uri;");
    });
  });

  describe("buildHttpRedirectBlock", () => {
    it("returns empty string when no HTTPS", () => {
      expect(buildHttpRedirectBlock({ enableHttpRedirect: true }, "")).toBe("");
    });

    it("returns empty string when no redirect enabled", () => {
      expect(buildHttpRedirectBlock({ enableHttps: true }, "")).toBe("");
    });

    it("emits HTTP to HTTPS redirect", () => {
      const out = buildHttpRedirectBlock(
        { serverName: "x", enableHttps: true, enableHttpRedirect: true },
        ""
      );
      expect(out).toContain("return 301 https://$host$request_uri;");
    });
  });
});
