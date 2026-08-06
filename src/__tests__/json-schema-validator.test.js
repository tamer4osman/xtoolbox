import { describe, it, expect } from "vitest";
import {
  parseJson,
  findKeyLine,
  formatAjvError,
  validateWithSchema
} from "../tools/dev/json-schema-validator.js";

const validSchema = `{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "integer", "minimum": 0 }
  },
  "required": ["name"],
  "additionalProperties": false
}`;

describe("parseJson", () => {
  it("parses valid JSON", () => {
    const res = parseJson('{"a": 1}', "Data");
    expect(res.ok).toBe(true);
    expect(res.value).toEqual({ a: 1 });
  });

  it("flags empty input", () => {
    const res = parseJson("", "Data");
    expect(res.ok).toBe(false);
    expect(res.error).toContain("empty");
  });

  it("flags invalid JSON", () => {
    const res = parseJson("{a: 1}", "Schema");
    expect(res.ok).toBe(false);
    expect(res.error).toContain("not valid JSON");
  });
});

describe("findKeyLine", () => {
  it("finds the line of a key", () => {
    const text = `{\n  "name": "x"\n}`;
    expect(findKeyLine(text, "name")).toBe(2);
  });

  it("returns -1 when key is absent", () => {
    expect(findKeyLine('{"a": 1}', "zzz")).toBe(-1);
  });
});

describe("formatAjvError", () => {
  it("formats a required error", () => {
    const err = {
      keyword: "required",
      instancePath: "",
      message: "must have required property 'name'",
      params: { missingProperty: "name" }
    };
    const out = formatAjvError(err);
    expect(out.location).toBe("root");
    expect(out.keyword).toBe("required");
  });

  it("formats an additionalProperty error", () => {
    const err = {
      keyword: "additionalProperties",
      instancePath: "",
      params: { additionalProperty: "foo" }
    };
    const out = formatAjvError(err);
    expect(out.message).toContain('"foo"');
  });

  it("formats a nested path", () => {
    const err = {
      keyword: "type",
      instancePath: "/user/age",
      message: "must be integer",
      params: {}
    };
    const out = formatAjvError(err);
    expect(out.location).toBe("/user/age");
  });
});

describe("validateWithSchema", () => {
  it("returns valid for conforming data", () => {
    const res = validateWithSchema(validSchema, '{"name": "Ada", "age": 36}', "07");
    expect(res.ok).toBe(true);
    expect(res.valid).toBe(true);
    expect(res.errors).toEqual([]);
  });

  it("returns errors for violating data", () => {
    const res = validateWithSchema(validSchema, '{"name": 123, "extra": true}', "07");
    expect(res.ok).toBe(true);
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
    expect(res.errors.map(e => e.keyword)).toEqual(
      expect.arrayContaining(["type", "additionalProperties"])
    );
  });

  it("reports schema parse failure", () => {
    const res = validateWithSchema("{bad", "{}", "07");
    expect(res.ok).toBe(false);
    expect(res.fatal).toBe(true);
  });

  it("supports draft 2020-12", () => {
    const schema = `{
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "type": "object",
      "properties": { "id": { "type": "string" } },
      "required": ["id"],
      "additionalProperties": false
    }`;
    const res = validateWithSchema(schema, '{"id": 5, "x": 1}', "2020-12");
    expect(res.ok).toBe(true);
    expect(res.valid).toBe(false);
  });

  it("rejects invalid schema with fatal error", () => {
    const res = validateWithSchema('{"type": 123}', "{}", "07");
    expect(res.ok).toBe(false);
    expect(res.fatal).toBe(true);
  });
});
