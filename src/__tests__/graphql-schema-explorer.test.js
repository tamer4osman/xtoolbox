import { describe, it, expect } from 'vitest';
import { parseSDL, buildTypeMap, getTypeKind } from '../tools/dev/graphql-schema-explorer.js';

describe('graphql-schema-explorer', () => {
  describe('parseSDL', () => {
    it('parses a simple type', () => {
      const sdl = `type User {
  id: ID!
  name: String!
}`;
      const types = parseSDL(sdl);
      expect(types).toHaveLength(1);
      expect(types[0].name).toBe('User');
      expect(types[0].kind).toBe('type');
      expect(types[0].fields).toHaveLength(2);
      expect(types[0].fields[0].name).toBe('id');
      expect(types[0].fields[0].type).toBe('ID');
    });

    it('parses fields with arguments', () => {
      const sdl = `type Query {
  user(id: ID!): User
}`;
      const types = parseSDL(sdl);
      expect(types[0].fields[0].args).toEqual([{ name: 'id', type: 'ID!' }]);
    });

    it('parses enum types', () => {
      const sdl = `enum Status {
  ACTIVE
  INACTIVE
}`;
      const types = parseSDL(sdl);
      expect(types[0].kind).toBe('enum');
      expect(types[0].name).toBe('Status');
    });

    it('skips comments and blank lines', () => {
      const sdl = `
# This is a comment
type Foo {
  bar: String
}
`;
      const types = parseSDL(sdl);
      expect(types).toHaveLength(1);
      expect(types[0].name).toBe('Foo');
    });

    it('parses multiple types', () => {
      const sdl = `type Query {
  users: [User]
}
type User {
  id: ID!
  name: String
}`;
      const types = parseSDL(sdl);
      expect(types).toHaveLength(2);
    });

    it('detects deprecated fields', () => {
      const sdl = `type User {
  oldName: String @deprecated
}`;
      const types = parseSDL(sdl);
      expect(types[0].fields[0].deprecated).toBe(true);
    });
  });

  describe('buildTypeMap', () => {
    it('builds a map from types array', () => {
      const types = [
        { name: 'User', kind: 'type', fields: [] },
        { name: 'Query', kind: 'type', fields: [] },
      ];
      const map = buildTypeMap(types);
      expect(map['User']).toBe(types[0]);
      expect(map['Query']).toBe(types[1]);
    });

    it('returns empty object for empty input', () => {
      expect(buildTypeMap([])).toEqual({});
    });
  });

  describe('getTypeKind', () => {
    it('returns required for non-null types', () => {
      expect(getTypeKind('String!')).toBe('required');
    });

    it('returns list for array types', () => {
      expect(getTypeKind('[User]')).toBe('list');
    });

    it('returns nullable for optional types', () => {
      expect(getTypeKind('String')).toBe('nullable');
    });

    it('returns list for required list types', () => {
      expect(getTypeKind('[User]!')).toBe('required');
    });
  });
});
