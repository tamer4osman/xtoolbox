import { describe, it, expect, beforeEach } from "vitest";
import {
  createDefaultBoard,
  loadState,
  saveState,
  findColumn,
  findCard,
  addColumn,
  renameColumn,
  setColumnColor,
  deleteColumn,
  addCard,
  updateCard,
  deleteCard,
  moveCard,
  adjustDropIndex
} from "../tools/productivity/kanban-board.js";

beforeEach(() => {
  localStorage.clear();
});

function makeBoard() {
  return {
    columns: [
      {
        id: "c1",
        title: "To Do",
        color: "#3B82F6",
        cards: [{ id: "card1", title: "Task A", description: "" }]
      },
      {
        id: "c2",
        title: "Done",
        color: "#10B981",
        cards: [{ id: "card2", title: "Task B", description: "note" }]
      }
    ]
  };
}

describe("kanban-board", () => {
  it("exports toolConfig and render", async () => {
    const mod = await import("../tools/productivity/kanban-board.js");
    expect(mod.toolConfig).toBeDefined();
    expect(mod.toolConfig.id).toBe("kanban-board");
    expect(mod.toolConfig.category).toBe("productivity");
    expect(typeof mod.render).toBe("function");
  });

  it("toolConfig has required fields", async () => {
    const mod = await import("../tools/productivity/kanban-board.js");
    expect(mod.toolConfig.name).toBeTruthy();
    expect(mod.toolConfig.description).toBeTruthy();
    expect(mod.toolConfig.icon).toBeTruthy();
    expect(Array.isArray(mod.toolConfig.keywords)).toBe(true);
    expect(Array.isArray(mod.toolConfig.steps)).toBe(true);
    expect(Array.isArray(mod.toolConfig.faqs)).toBe(true);
  });

  it("render creates board with toolbar and 3 default columns", async () => {
    const mod = await import("../tools/productivity/kanban-board.js");
    const container = document.createElement("div");
    mod.render(container);

    expect(container.querySelector("#kanban-board-add-column")).not.toBeNull();
    expect(container.querySelector("#kanban-board-reset")).not.toBeNull();
    const columns = container.querySelectorAll(".kanban-column");
    expect(columns.length).toBe(3);
    expect(columns[0].querySelector("[data-col-title]").value).toBe("To Do");
  });

  it("render restores saved columns from localStorage", async () => {
    const saved = {
      columns: [
        {
          id: "c1",
          title: "Backlog",
          color: "#EF4444",
          cards: [{ id: "k", title: "X", description: "" }]
        }
      ]
    };
    localStorage.setItem("kanban_v1", JSON.stringify(saved));
    const mod = await import("../tools/productivity/kanban-board.js");
    const container = document.createElement("div");
    mod.render(container);

    const columns = container.querySelectorAll(".kanban-column");
    expect(columns.length).toBe(1);
    expect(columns[0].querySelector("[data-col-title]").value).toBe("Backlog");
    expect(container.querySelectorAll(".kanban-card").length).toBe(1);
  });

  it("render move-select has neutral placeholder and omits current column", async () => {
    localStorage.setItem(
      "kanban_v1",
      JSON.stringify({
        columns: [{ id: "c1", title: "To Do", color: "#3B82F6", cards: [{ id: "k", title: "X" }] }]
      })
    );
    const mod = await import("../tools/productivity/kanban-board.js");
    const container = document.createElement("div");
    mod.render(container);

    const cardEl = container.querySelector(".kanban-card");
    const select = cardEl.querySelector(".kanban-move-select");
    const options = Array.from(select.options);
    expect(options[0].value).toBe("");
    expect(options[0].disabled).toBe(true);
    expect(select.value).toBe("");
    const columnId = cardEl.closest("[data-column-id]").dataset.columnId;
    expect(options.some(opt => opt.value === columnId)).toBe(false);
    expect(options.length).toBe(1);
  });

  it("toolConfig documents edit action and keyboard movement accurately", async () => {
    const mod = await import("../tools/productivity/kanban-board.js");
    expect(mod.toolConfig.steps.some(s => s.includes("Edit a column name"))).toBe(true);
    expect(mod.toolConfig.steps.some(s => s.includes("Double-click"))).toBe(false);
    const faq = mod.toolConfig.faqs.find(f => f.question.includes("keyboard"));
    expect(faq.question).toBe("Can I move cards with my keyboard?");
  });
});

describe("createDefaultBoard", () => {
  it("returns 3 columns with empty cards", () => {
    const board = createDefaultBoard();
    expect(board.columns.length).toBe(3);
    expect(board.columns.map(c => c.title)).toEqual(["To Do", "In Progress", "Done"]);
    expect(board.columns.every(c => Array.isArray(c.cards) && c.cards.length === 0)).toBe(true);
  });
});

describe("loadState / saveState", () => {
  it("returns default board when storage empty", () => {
    const board = loadState();
    expect(board.columns.length).toBe(3);
  });

  it("returns default board on corrupt JSON", () => {
    localStorage.setItem("kanban_v1", "{not json");
    const board = loadState();
    expect(board.columns.length).toBe(3);
  });

  it("returns default board on invalid shape", () => {
    localStorage.setItem("kanban_v1", JSON.stringify({ columns: "nope" }));
    const board = loadState();
    expect(board.columns.length).toBe(3);
  });

  it("round-trips through saveState", () => {
    const board = makeBoard();
    saveState(board);
    const loaded = loadState();
    expect(loaded.columns.length).toBe(2);
    expect(loaded.columns[0].cards[0].title).toBe("Task A");
  });

  it("sanitizes missing card fields on load", () => {
    localStorage.setItem(
      "kanban_v1",
      JSON.stringify({ columns: [{ id: "c1", title: "T", cards: [{ id: "x" }] }] })
    );
    const loaded = loadState();
    expect(loaded.columns[0].cards[0].title).toBe("Untitled");
    expect(loaded.columns[0].cards[0].description).toBe("");
  });

  it("preserves valid records when some columns or cards are null", () => {
    localStorage.setItem(
      "kanban_v1",
      JSON.stringify({
        columns: [
          null,
          { id: "c1", title: "Valid", cards: [null, { id: "k1", title: "Keep" }] },
          { id: "c2", title: "Empty", cards: null }
        ]
      })
    );
    const loaded = loadState();
    expect(loaded.columns.length).toBe(2);
    expect(loaded.columns[0].title).toBe("Valid");
    expect(loaded.columns[0].cards.length).toBe(1);
    expect(loaded.columns[0].cards[0].title).toBe("Keep");
    expect(loaded.columns[1].cards.length).toBe(0);
  });

  it("falls back to default board when all column records are invalid", () => {
    localStorage.setItem("kanban_v1", JSON.stringify({ columns: [null, "nope", 42] }));
    const loaded = loadState();
    expect(loaded.columns.length).toBe(3);
    expect(loaded.columns[0].title).toBe("To Do");
  });

  it("preserves a genuinely empty column list", () => {
    localStorage.setItem("kanban_v1", JSON.stringify({ columns: [] }));
    const loaded = loadState();
    expect(loaded.columns.length).toBe(0);
  });

  it("returns false from saveState when localStorage.setItem throws", () => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    try {
      const ok = saveState(makeBoard());
      expect(ok).toBe(false);
    } finally {
      Storage.prototype.setItem = original;
    }
  });

  it("returns true from saveState on success", () => {
    expect(saveState(makeBoard())).toBe(true);
  });
});

describe("findColumn / findCard", () => {
  const board = makeBoard();

  it("finds column by id", () => {
    expect(findColumn(board, "c1").title).toBe("To Do");
    expect(findColumn(board, "missing")).toBeUndefined();
  });

  it("finds card and its column", () => {
    const found = findCard(board, "card1");
    expect(found.card.title).toBe("Task A");
    expect(found.columnId).toBe("c1");
    expect(findCard(board, "missing")).toBeNull();
  });
});

describe("addColumn", () => {
  it("appends a new column", () => {
    const board = makeBoard();
    const col = addColumn(board, "Review");
    expect(board.columns.length).toBe(3);
    expect(col.title).toBe("Review");
    expect(Array.isArray(col.cards)).toBe(true);
    expect(col.color).toBeTruthy();
  });

  it("uses default title when omitted", () => {
    const board = makeBoard();
    addColumn(board);
    expect(board.columns[2].title).toBe("New Column");
  });
});

describe("renameColumn / setColumnColor", () => {
  it("renames a column", () => {
    const board = makeBoard();
    renameColumn(board, "c1", "  Backlog  ");
    expect(board.columns[0].title).toBe("Backlog");
  });

  it("ignores empty rename", () => {
    const board = makeBoard();
    renameColumn(board, "c1", "   ");
    expect(board.columns[0].title).toBe("To Do");
  });

  it("does nothing for missing column", () => {
    const board = makeBoard();
    renameColumn(board, "nope", "X");
    setColumnColor(board, "nope", "#000");
    expect(board.columns.length).toBe(2);
  });

  it("sets column color", () => {
    const board = makeBoard();
    setColumnColor(board, "c1", "#EF4444");
    expect(board.columns[0].color).toBe("#EF4444");
  });
});

describe("deleteColumn", () => {
  it("removes the column", () => {
    const board = makeBoard();
    deleteColumn(board, "c1");
    expect(board.columns.map(c => c.id)).toEqual(["c2"]);
  });
});

describe("addCard / updateCard / deleteCard", () => {
  it("adds a card to a column", () => {
    const board = makeBoard();
    const card = addCard(board, "c1", "New Task");
    expect(board.columns[0].cards.length).toBe(2);
    expect(card.title).toBe("New Task");
    expect(card.description).toBe("");
  });

  it("uses default title when omitted", () => {
    const board = makeBoard();
    const card = addCard(board, "c2");
    expect(card.title).toBe("New Task");
  });

  it("returns null for missing column", () => {
    const board = makeBoard();
    expect(addCard(board, "nope", "X")).toBeNull();
  });

  it("updates title and description", () => {
    const board = makeBoard();
    updateCard(board, "c1", "card1", { title: "Renamed", description: "desc" });
    expect(board.columns[0].cards[0].title).toBe("Renamed");
    expect(board.columns[0].cards[0].description).toBe("desc");
  });

  it("ignores undefined patch fields", () => {
    const board = makeBoard();
    updateCard(board, "c1", "card1", { description: "only" });
    expect(board.columns[0].cards[0].title).toBe("Task A");
    expect(board.columns[0].cards[0].description).toBe("only");
  });

  it("does nothing for missing card or column", () => {
    const board = makeBoard();
    updateCard(board, "nope", "card1", { title: "X" });
    updateCard(board, "c1", "nope", { title: "X" });
    expect(board.columns[0].cards[0].title).toBe("Task A");
  });

  it("deletes a card", () => {
    const board = makeBoard();
    deleteCard(board, "c1", "card1");
    expect(board.columns[0].cards.length).toBe(0);
    deleteCard(board, "nope", "card2");
    expect(board.columns[1].cards.length).toBe(1);
  });
});

describe("moveCard", () => {
  it("moves a card to another column", () => {
    const board = makeBoard();
    moveCard(board, "card1", "c2", 0);
    expect(board.columns[0].cards.length).toBe(0);
    expect(board.columns[1].cards.length).toBe(2);
    expect(board.columns[1].cards[0].id).toBe("card1");
  });

  it("reorders within the same column", () => {
    const board = makeBoard();
    addCard(board, "c1", "Second");
    moveCard(board, "card1", "c1", 1);
    expect(board.columns[0].cards.map(c => c.title)).toEqual(["Second", "Task A"]);
  });

  it("clamps index to valid range", () => {
    const board = makeBoard();
    moveCard(board, "card1", "c2", 99);
    expect(board.columns[1].cards[board.columns[1].cards.length - 1].id).toBe("card1");
    moveCard(board, "card2", "c1", -5);
    expect(board.columns[0].cards[0].id).toBe("card2");
  });

  it("does nothing when card or target is missing", () => {
    const board = makeBoard();
    moveCard(board, "nope", "c2", 0);
    moveCard(board, "card1", "nope", 0);
    expect(board.columns[0].cards.length).toBe(1);
    expect(board.columns[1].cards.length).toBe(1);
  });

  it("adjustDropIndex decrements when dropping within the same column below the source", () => {
    const board = makeBoard();
    addCard(board, "c1", "Second");
    addCard(board, "c1", "Third");
    // cards: [card1, Second, Third]; drag card1 below itself means placeholder lands at index 2
    expect(adjustDropIndex(board, "c1", "card1", 2)).toBe(1);
  });

  it("adjustDropIndex leaves index unchanged for downward-source same-column drops", () => {
    const board = makeBoard();
    addCard(board, "c1", "Second");
    // cards: [card1, Second]; drag Second before card1 → placeholder at index 0
    expect(adjustDropIndex(board, "c1", "card2", 0)).toBe(0);
  });

  it("adjustDropIndex ignores cross-column drops and unknown cards", () => {
    const board = makeBoard();
    expect(adjustDropIndex(board, "c2", "card1", 0)).toBe(0);
    expect(adjustDropIndex(board, "c1", "ghost", 2)).toBe(2);
  });
});
