import { describe, it, expect } from "vitest";
import { createElement } from "../utils/dom-create.js";
import { $ } from "../utils/dom-query.js";

describe("dom", () => {
  describe("createElement", () => {
    it("creates element with tag", () => {
      const el = createElement("div");
      expect(el.tagName.toLowerCase()).toBe("div");
    });

    it("sets className", () => {
      const el = createElement("div", { className: "test-class" });
      expect(el.className).toBe("test-class");
    });

    it("sets id attribute", () => {
      const el = createElement("div", { id: "my-id" });
      expect(el.id).toBe("my-id");
    });

    it("sets textContent", () => {
      const el = createElement("div", { textContent: "hello" });
      expect(el.textContent).toBe("hello");
    });

    it("sets innerHTML", () => {
      const el = createElement("div", { innerHTML: "<span>hi</span>" });
      expect(el.innerHTML).toBe("<span>hi</span>");
    });

    it("sets style object", () => {
      const el = createElement("div", { style: { color: "red", fontSize: "12px" } });
      expect(el.style.color).toBe("red");
      expect(el.style.fontSize).toBe("12px");
    });

    it("sets dataset", () => {
      const el = createElement("div", { dataset: { foo: "bar" } });
      expect(el.dataset.foo).toBe("bar");
    });

    it("adds string children", () => {
      const el = createElement("div", {}, ["hello", " ", "world"]);
      expect(el.textContent).toBe("hello world");
    });

    it("adds node children", () => {
      const child = document.createElement("span");
      child.textContent = "hi";
      const el = createElement("div", {}, [child]);
      expect(el.children.length).toBe(1);
      expect(el.children[0].tagName.toLowerCase()).toBe("span");
    });
  });

  describe("$", () => {
    it("queries element by selector", () => {
      document.body.innerHTML = '<div id="test">hi</div>';
      expect($("#test").textContent).toBe("hi");
    });

    it("queries within parent", () => {
      document.body.innerHTML = '<section><p class="para">text</p></section>';
      const section = document.querySelector("section");
      expect($(".para", section).textContent).toBe("text");
    });

    it("returns null for missing element", () => {
      expect($("#missing")).toBeNull();
    });
  });
});
