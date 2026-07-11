import { describe, it, expect } from "vitest";
import {
  TEMPLATES,
  needsQuotes,
  formatScalar,
  isNamedVolume,
  buildCompose,
  toYaml,
  defaultServiceFromTemplate,
  buildServiceDef
} from "../tools/dev/docker-compose-generator.js";

describe("docker-compose-generator: needsQuotes", () => {
  it("quotes empty string", () => {
    expect(needsQuotes("")).toBe(true);
  });

  it("does not quote simple alphanumeric", () => {
    expect(needsQuotes("nginx")).toBe(false);
    expect(needsQuotes("myapp_default")).toBe(false);
  });

  it("quotes strings containing a colon", () => {
    expect(needsQuotes("80:80")).toBe(true);
    expect(needsQuotes("nginx:alpine")).toBe(true);
  });

  it("quotes strings containing a space", () => {
    expect(needsQuotes("hello world")).toBe(true);
  });

  it("quotes strings containing a hash", () => {
    expect(needsQuotes("a#b")).toBe(true);
  });

  it("quotes strings that look like numbers", () => {
    expect(needsQuotes("8080")).toBe(true);
    expect(needsQuotes("-3.14")).toBe(true);
  });

  it("quotes reserved words that parse as booleans or null", () => {
    expect(needsQuotes("true")).toBe(true);
    expect(needsQuotes("false")).toBe(true);
    expect(needsQuotes("yes")).toBe(true);
    expect(needsQuotes("no")).toBe(true);
    expect(needsQuotes("null")).toBe(true);
    expect(needsQuotes("on")).toBe(true);
    expect(needsQuotes("off")).toBe(true);
    expect(needsQuotes("TRUE")).toBe(true);
  });

  it("quotes strings starting with a YAML special char", () => {
    expect(needsQuotes("-foo")).toBe(true);
    expect(needsQuotes("?key")).toBe(true);
    expect(needsQuotes(":val")).toBe(true);
    expect(needsQuotes("&anchor")).toBe(true);
    expect(needsQuotes("#comment")).toBe(true);
    expect(needsQuotes("*ref")).toBe(true);
  });

  it("does not quote simple key=value fragments", () => {
    expect(needsQuotes("NODE_ENV=production")).toBe(false);
  });
});

describe("docker-compose-generator: formatScalar", () => {
  it("returns null for null/undefined", () => {
    expect(formatScalar(null)).toBe("null");
    expect(formatScalar(undefined)).toBe("null");
  });

  it("emits numbers unquoted", () => {
    expect(formatScalar(42)).toBe("42");
    expect(formatScalar(3.14)).toBe("3.14");
    expect(formatScalar(0)).toBe("0");
  });

  it("emits booleans as true/false", () => {
    expect(formatScalar(true)).toBe("true");
    expect(formatScalar(false)).toBe("false");
  });

  it("emits simple strings unquoted", () => {
    expect(formatScalar("nginx")).toBe("nginx");
  });

  it("quotes strings that need it", () => {
    expect(formatScalar("80:80")).toBe('"80:80"');
    expect(formatScalar("hello world")).toBe('"hello world"');
    expect(formatScalar("true")).toBe('"true"');
  });
});

describe("docker-compose-generator: isNamedVolume", () => {
  it("treats relative paths as bind mounts", () => {
    expect(isNamedVolume("./data:/var/lib/data")).toBe(false);
    expect(isNamedVolume("../shared:/shared")).toBe(false);
  });

  it("treats absolute paths as bind mounts", () => {
    expect(isNamedVolume("/host/path:/container/path")).toBe(false);
  });

  it("treats tilde paths as bind mounts", () => {
    expect(isNamedVolume("~/data:/data")).toBe(false);
  });

  it("treats simple alphanumeric names as named volumes", () => {
    expect(isNamedVolume("pgdata:/var/lib/postgresql/data")).toBe(true);
    expect(isNamedVolume("mysqldata:/var/lib/mysql")).toBe(true);
  });

  it("returns false for empty head", () => {
    expect(isNamedVolume(":/data")).toBe(false);
  });

  it("returns false for invalid name characters", () => {
    expect(isNamedVolume("has space:/data")).toBe(false);
  });
});

describe("docker-compose-generator: TEMPLATES", () => {
  it("contains all 17 service templates", () => {
    expect(Object.keys(TEMPLATES)).toHaveLength(17);
  });

  it("every template has required fields", () => {
    for (const [key, t] of Object.entries(TEMPLATES)) {
      expect(t.name, `template ${key} name`).toBeTypeOf("string");
      expect(t.icon, `template ${key} icon`).toBeTypeOf("string");
      expect(t.image, `template ${key} image`).toBeTypeOf("string");
    }
  });

  it("database templates include a password env var", () => {
    const dbs = ["postgres", "mysql", "mariadb", "mongodb"];
    for (const k of dbs) {
      const env = TEMPLATES[k].environment || [];
      expect(
        env.some(v => /PASSWORD/i.test(v)),
        `${k} should include a password env var`
      ).toBe(true);
    }
  });
});

describe("docker-compose-generator: buildCompose", () => {
  it("returns a placeholder when no services exist", () => {
    const out = buildCompose({ projectName: "myapp", services: [] });
    expect(out).toContain("Add at least one service");
  });

  it("emits a single service", () => {
    const out = buildCompose({
      projectName: "myapp",
      services: [
        {
          name: "web",
          image: "nginx:alpine",
          command: "",
          ports: ["80:80"],
          volumes: [],
          environment: [],
          dependsOn: [],
          networks: [],
          restart: "unless-stopped"
        }
      ]
    });
    expect(out).toContain("services:");
    expect(out).toContain("web:");
    expect(out).toContain('image: "nginx:alpine"');
    expect(out).toContain("ports:");
    expect(out).toContain('- "80:80"');
    expect(out).toContain("restart: unless-stopped");
  });

  it("emits a top-level volumes block when a service uses a named volume", () => {
    const out = buildCompose({
      projectName: "myapp",
      services: [
        {
          name: "db",
          image: "postgres:16-alpine",
          command: "",
          ports: [],
          volumes: ["pgdata:/var/lib/postgresql/data"],
          environment: [],
          dependsOn: [],
          networks: [],
          restart: "unless-stopped"
        }
      ]
    });
    expect(out).toContain("volumes:");
    expect(out).toContain("pgdata:");
  });

  it("does not emit a top-level named-volumes block for bind mounts only", () => {
    const out = buildCompose({
      projectName: "",
      services: [
        {
          name: "web",
          image: "nginx:alpine",
          command: "",
          ports: ["80:80"],
          volumes: ["./html:/usr/share/nginx/html:ro"],
          environment: [],
          dependsOn: [],
          networks: [],
          restart: "unless-stopped"
        }
      ]
    });
    expect(out).not.toMatch(/^volumes:\s*$/m);
    expect(out).toContain('- "./html:/usr/share/nginx/html:ro"');
  });

  it("emits a top-level networks block with project name suffix", () => {
    const out = buildCompose({
      projectName: "myapp",
      services: [
        {
          name: "web",
          image: "nginx:alpine",
          command: "",
          ports: [],
          volumes: [],
          environment: [],
          dependsOn: [],
          networks: [],
          restart: "unless-stopped"
        }
      ]
    });
    expect(out).toContain("networks:");
    expect(out).toContain("default:");
    expect(out).toMatch(/name: "?myapp_default"?/);
  });

  it("omits restart when set to no", () => {
    const out = buildCompose({
      projectName: "myapp",
      services: [
        {
          name: "web",
          image: "nginx:alpine",
          command: "",
          ports: [],
          volumes: [],
          environment: [],
          dependsOn: [],
          networks: [],
          restart: "no"
        }
      ]
    });
    expect(out).not.toContain("restart:");
  });

  it("emits depends_on as a list of names", () => {
    const out = buildCompose({
      projectName: "myapp",
      services: [
        {
          name: "web",
          image: "nginx:alpine",
          command: "",
          ports: [],
          volumes: [],
          environment: [],
          dependsOn: ["api", "db"],
          networks: [],
          restart: "unless-stopped"
        },
        {
          name: "api",
          image: "node:20-alpine",
          command: "",
          ports: [],
          volumes: [],
          environment: [],
          dependsOn: [],
          networks: [],
          restart: "unless-stopped"
        },
        {
          name: "db",
          image: "postgres:16-alpine",
          command: "",
          ports: [],
          volumes: [],
          environment: [],
          dependsOn: [],
          networks: [],
          restart: "unless-stopped"
        }
      ]
    });
    expect(out).toContain("depends_on:");
    expect(out).toContain("- api");
    expect(out).toContain("- db");
  });

  it("emits environment as a list of KEY=VALUE strings", () => {
    const out = buildCompose({
      projectName: "myapp",
      services: [
        {
          name: "db",
          image: "postgres:16-alpine",
          command: "",
          ports: [],
          volumes: [],
          environment: ["POSTGRES_PASSWORD=changeme", "POSTGRES_DB=app"],
          dependsOn: [],
          networks: [],
          restart: "unless-stopped"
        }
      ]
    });
    expect(out).toContain("environment:");
    expect(out).toContain("- POSTGRES_PASSWORD=changeme");
    expect(out).toContain("- POSTGRES_DB=app");
  });

  it("skips services with empty names", () => {
    const out = buildCompose({
      projectName: "",
      services: [
        {
          name: "",
          image: "nginx:alpine",
          command: "",
          ports: [],
          volumes: [],
          environment: [],
          dependsOn: [],
          networks: [],
          restart: "unless-stopped"
        },
        {
          name: "web",
          image: "nginx:alpine",
          command: "",
          ports: [],
          volumes: [],
          environment: [],
          dependsOn: [],
          networks: [],
          restart: "unless-stopped"
        }
      ]
    });
    expect(out).toContain("web:");
    expect(out).not.toMatch(
      /^  [a-z_]+:\s*$\n[\s\S]*image: "nginx:alpine"\n[\s\S]*image: "nginx:alpine"/m
    );
  });

  it("skips empty list entries", () => {
    const out = buildCompose({
      projectName: "myapp",
      services: [
        {
          name: "web",
          image: "nginx:alpine",
          command: "",
          ports: ["80:80", "", "  "],
          volumes: ["./data:/data", ""],
          environment: ["A=1", ""],
          dependsOn: [],
          networks: [],
          restart: "unless-stopped"
        }
      ]
    });
    expect(out).toContain('- "80:80"');
    expect(out).not.toContain('- ""');
    expect(out).not.toContain('- " "');
  });
});

describe("docker-compose-generator: buildServiceDef", () => {
  it("builds minimal service with image only", () => {
    const namedVolumes = new Set();
    const networks = new Set();
    const def = buildServiceDef({ name: "web", image: "nginx:alpine" }, namedVolumes, networks);
    expect(def.image).toBe("nginx:alpine");
    expect(Object.keys(def)).toHaveLength(1);
  });

  it("includes command when present", () => {
    const namedVolumes = new Set();
    const networks = new Set();
    const def = buildServiceDef(
      { image: "node:20", command: "node server.js" },
      namedVolumes,
      networks
    );
    expect(def.command).toBe("node server.js");
  });

  it("extracts named volume to collection", () => {
    const namedVolumes = new Set();
    const networks = new Set();
    buildServiceDef(
      { image: "postgres", volumes: ["pgdata:/var/lib/postgresql/data"] },
      namedVolumes,
      networks
    );
    expect(namedVolumes.has("pgdata")).toBe(true);
  });

  it("does not extract bind mount paths", () => {
    const namedVolumes = new Set();
    const networks = new Set();
    buildServiceDef({ image: "nginx", volumes: ["./data:/data"] }, namedVolumes, networks);
    expect(namedVolumes.size).toBe(0);
  });

  it("adds networks to collection", () => {
    const namedVolumes = new Set();
    const networks = new Set();
    buildServiceDef({ image: "nginx", networks: ["frontend", "backend"] }, namedVolumes, networks);
    expect(networks.has("frontend")).toBe(true);
    expect(networks.has("backend")).toBe(true);
  });

  it("omits restart when set to no", () => {
    const namedVolumes = new Set();
    const networks = new Set();
    const def = buildServiceDef({ image: "nginx", restart: "no" }, namedVolumes, networks);
    expect(def.restart).toBeUndefined();
  });
});

describe("docker-compose-generator: toYaml", () => {
  it("emits empty array as []", () => {
    expect(toYaml([])).toBe("[]");
  });

  it("emits empty object as {}", () => {
    expect(toYaml({})).toBe("{}");
  });

  it("emits nested map with indentation", () => {
    const out = toYaml({ a: { b: "c" } });
    expect(out).toBe("a:\n  b: c");
  });

  it("emits list of maps with first-key-on-dash form", () => {
    const out = toYaml([{ a: 1, b: 2 }, { a: 3 }]);
    expect(out).toContain("- a: 1");
    expect(out).toContain("  b: 2");
    expect(out).toContain("- a: 3");
  });

  it("emits list of primitives with dash form", () => {
    const out = toYaml(["one", "two"], 0);
    expect(out).toBe("- one\n- two");
  });

  it("emits null for null value", () => {
    expect(toYaml(null)).toBe("null");
  });
});

describe("docker-compose-generator: defaultServiceFromTemplate", () => {
  it("produces a service with sensible defaults for postgres", () => {
    const svc = defaultServiceFromTemplate("postgres");
    expect(svc.name).toBe("db");
    expect(svc.image).toBe("postgres:16-alpine");
    expect(svc.ports).toContain("5432:5432");
    expect(svc.environment.some(e => /PASSWORD/.test(e))).toBe(true);
    expect(svc.volumes.some(v => v.startsWith("pgdata"))).toBe(true);
    expect(svc.restart).toBe("unless-stopped");
  });

  it('produces a service for redis with a "cache" name', () => {
    const svc = defaultServiceFromTemplate("redis");
    expect(svc.name).toBe("cache");
    expect(svc.image).toBe("redis:7-alpine");
  });

  it("produces a service for nginx with port 80:80", () => {
    const svc = defaultServiceFromTemplate("nginx");
    expect(svc.name).toBe("nginx");
    expect(svc.ports).toContain("80:80");
  });

  it("returns null for unknown template key", () => {
    expect(defaultServiceFromTemplate("nope")).toBe(null);
  });
});

describe("docker-compose-generator: realistic 3-service stack", () => {
  it("produces well-formed YAML for web + api + postgres", () => {
    const out = buildCompose({
      projectName: "shop",
      services: [
        {
          name: "web",
          image: "nginx:alpine",
          command: "",
          ports: ["80:80"],
          volumes: ["./public:/usr/share/nginx/html:ro"],
          environment: [],
          dependsOn: ["api"],
          networks: [],
          restart: "unless-stopped"
        },
        {
          name: "api",
          image: "node:20-alpine",
          command: "node server.js",
          ports: ["3000:3000"],
          volumes: [],
          environment: [
            "NODE_ENV=production",
            "DATABASE_URL=postgres://postgres:changeme@db:5432/app"
          ],
          dependsOn: ["db"],
          networks: [],
          restart: "unless-stopped"
        },
        {
          name: "db",
          image: "postgres:16-alpine",
          command: "",
          ports: [],
          volumes: ["pgdata:/var/lib/postgresql/data"],
          environment: ["POSTGRES_PASSWORD=changeme", "POSTGRES_DB=app"],
          dependsOn: [],
          networks: [],
          restart: "unless-stopped"
        }
      ]
    });

    expect(out).toContain("services:");
    expect(out).toContain("web:");
    expect(out).toContain("api:");
    expect(out).toContain("db:");
    expect(out).toContain("depends_on:");
    expect(out).toContain("- api");
    expect(out).toContain("- db");
    expect(out).toContain("volumes:");
    expect(out).toContain("pgdata:");
    expect(out).toContain("networks:");
    expect(out).toMatch(/name: "?shop_default"?/);

    const allLines = out.split("\n");
    for (const line of allLines) {
      if (line.trim() === "") continue;
      expect(line.length - line.replace(/^ /, "").length).toBeGreaterThanOrEqual(0);
    }
    expect(out.endsWith("\n")).toBe(true);
  });
});
