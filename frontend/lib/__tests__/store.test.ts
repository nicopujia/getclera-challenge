import { describe, it, expect, beforeEach } from "vitest";
import { useMatchmakingStore, selectActiveConversation } from "../store";
import type { Conversation, ConversationMessage } from "../store";

describe("MatchmakingStore", () => {
  beforeEach(() => {
    // Reset the store before each test
    useMatchmakingStore.getState().reset();
  });

  describe("addConversation", () => {
    it("adds a conversation to the store", () => {
      const conversation: Conversation = {
        id: "conv-1",
        type: "apple",
        fruitId: "fruit-1",
        fruit: {
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
        },
        messages: [],
        status: "active",
        createdAt: new Date(),
      };

      useMatchmakingStore.getState().addConversation(conversation);
      expect(useMatchmakingStore.getState().conversations).toHaveLength(1);
      expect(useMatchmakingStore.getState().conversations[0].id).toBe("conv-1");
    });
  });

  describe("addMessageToConversation", () => {
    it("adds a message to an existing conversation", () => {
      const conversation: Conversation = {
        id: "conv-1",
        type: "apple",
        fruitId: "fruit-1",
        messages: [],
        status: "active",
        createdAt: new Date(),
      };

      useMatchmakingStore.getState().addConversation(conversation);

      const message: ConversationMessage = {
        id: "msg-1",
        role: "system",
        content: "A new apple has arrived!",
        timestamp: new Date(),
      };

      useMatchmakingStore.getState().addMessageToConversation("conv-1", message);

      const conv = useMatchmakingStore.getState().conversations[0];
      expect(conv.messages).toHaveLength(1);
      expect(conv.messages[0].content).toBe("A new apple has arrived!");
    });
  });

  describe("setActiveConversation", () => {
    it("sets the active conversation id", () => {
      useMatchmakingStore.getState().setActiveConversation("conv-1");
      expect(useMatchmakingStore.getState().activeConversationId).toBe("conv-1");
    });

    it("can clear the active conversation", () => {
      useMatchmakingStore.getState().setActiveConversation("conv-1");
      useMatchmakingStore.getState().setActiveConversation(null);
      expect(useMatchmakingStore.getState().activeConversationId).toBeNull();
    });
  });

  describe("selectActiveConversation", () => {
    it("returns the active conversation", () => {
      const conversation: Conversation = {
        id: "conv-1",
        type: "orange",
        fruitId: "fruit-1",
        messages: [],
        status: "active",
        createdAt: new Date(),
      };

      useMatchmakingStore.getState().addConversation(conversation);
      useMatchmakingStore.getState().setActiveConversation("conv-1");

      const active = selectActiveConversation(useMatchmakingStore.getState());
      expect(active).toBeDefined();
      expect(active!.id).toBe("conv-1");
    });

    it("returns undefined when no active conversation", () => {
      const active = selectActiveConversation(useMatchmakingStore.getState());
      expect(active).toBeUndefined();
    });
  });

  describe("reset", () => {
    it("resets the store to initial state", () => {
      const conversation: Conversation = {
        id: "conv-1",
        type: "apple",
        fruitId: "fruit-1",
        messages: [],
        status: "active",
        createdAt: new Date(),
      };
      useMatchmakingStore.getState().addConversation(conversation);
      useMatchmakingStore.getState().setActiveConversation("conv-1");

      useMatchmakingStore.getState().reset();

      expect(useMatchmakingStore.getState().conversations).toHaveLength(0);
      expect(useMatchmakingStore.getState().activeConversationId).toBeNull();
    });
  });
});
