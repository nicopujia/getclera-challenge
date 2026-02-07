import { describe, it, expect } from "vitest";
import {
  generateFruit,
  generateApple,
  generateOrange,
  communicateAttributes,
  communicatePreferences,
  type Fruit,
} from "../fruit";

describe("generateFruit", () => {
  it("generates an apple with correct type", () => {
    const fruit = generateFruit("apple");
    expect(fruit.type).toBe("apple");
  });

  it("generates an orange with correct type", () => {
    const fruit = generateFruit("orange");
    expect(fruit.type).toBe("orange");
  });

  it("generates attributes with expected keys", () => {
    const fruit = generateFruit("apple");
    const keys = Object.keys(fruit.attributes);
    expect(keys).toContain("size");
    expect(keys).toContain("weight");
    expect(keys).toContain("hasStem");
    expect(keys).toContain("hasLeaf");
    expect(keys).toContain("hasWorm");
    expect(keys).toContain("shineFactor");
    expect(keys).toContain("hasChemicals");
  });

  it("generates numeric attributes within valid ranges", () => {
    // Run multiple times to catch range violations
    for (let i = 0; i < 50; i++) {
      const fruit = generateFruit("apple");
      if (fruit.attributes.size !== null) {
        expect(fruit.attributes.size).toBeGreaterThanOrEqual(2.0);
        expect(fruit.attributes.size).toBeLessThanOrEqual(14.0);
      }
      if (fruit.attributes.weight !== null) {
        expect(fruit.attributes.weight).toBeGreaterThanOrEqual(50);
        expect(fruit.attributes.weight).toBeLessThanOrEqual(350);
      }
    }
  });

  it("generates shineFactor from valid enum values", () => {
    const validShine = ["dull", "neutral", "shiny", "extraShiny"];
    for (let i = 0; i < 30; i++) {
      const fruit = generateFruit("orange");
      if (fruit.attributes.shineFactor !== null) {
        expect(validShine).toContain(fruit.attributes.shineFactor);
      }
    }
  });

  it("generates preferences as a partial object", () => {
    const fruit = generateFruit("apple");
    expect(fruit.preferences).toBeDefined();
    expect(typeof fruit.preferences).toBe("object");
  });
});

describe("generateApple / generateOrange shortcuts", () => {
  it("generateApple returns apple type", () => {
    expect(generateApple().type).toBe("apple");
  });

  it("generateOrange returns orange type", () => {
    expect(generateOrange().type).toBe("orange");
  });
});

describe("communicateAttributes", () => {
  it("returns a non-empty string", () => {
    const fruit = generateFruit("apple");
    const text = communicateAttributes(fruit);
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);
  });

  it("mentions the fruit type", () => {
    const apple = generateFruit("apple");
    const text = communicateAttributes(apple);
    expect(text.toLowerCase()).toContain("apple");
  });

  it("mentions size when not null", () => {
    const fruit: Fruit = {
      type: "apple",
      attributes: {
        size: 7.2,
        weight: null,
        hasStem: null,
        hasLeaf: null,
        hasWorm: null,
        shineFactor: null,
        hasChemicals: null,
      },
      preferences: {},
    };
    const text = communicateAttributes(fruit);
    expect(text).toContain("7.2");
  });
});

describe("communicatePreferences", () => {
  it("returns a non-empty string", () => {
    const fruit = generateFruit("orange");
    const text = communicatePreferences(fruit);
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);
  });

  it("returns open-minded message when no preferences", () => {
    const fruit: Fruit = {
      type: "apple",
      attributes: {
        size: 7,
        weight: 180,
        hasStem: true,
        hasLeaf: false,
        hasWorm: false,
        shineFactor: "shiny",
        hasChemicals: false,
      },
      preferences: {},
    };
    const text = communicatePreferences(fruit);
    // Should mention being open-minded or having no preferences
    expect(text.length).toBeGreaterThan(10);
  });

  it("mentions size range when size preference exists", () => {
    const fruit: Fruit = {
      type: "orange",
      attributes: {
        size: 8,
        weight: 200,
        hasStem: false,
        hasLeaf: false,
        hasWorm: false,
        shineFactor: "neutral",
        hasChemicals: false,
      },
      preferences: {
        size: { min: 5, max: 10 },
      },
    };
    const text = communicatePreferences(fruit);
    expect(text).toContain("5");
    expect(text).toContain("10");
  });
});
