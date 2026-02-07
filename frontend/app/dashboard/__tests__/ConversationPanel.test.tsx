import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import ConversationPanel from "../ConversationPanel";
import { useMatchmakingStore } from "@/lib/store";

describe("ConversationPanel", () => {
  beforeEach(() => {
    useMatchmakingStore.getState().reset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders empty state when no conversations exist", () => {
    render(<ConversationPanel />);
    expect(screen.getByText(/no conversation selected/i)).toBeInTheDocument();
  });

  it("renders new conversation buttons", () => {
    render(<ConversationPanel />);
    expect(screen.getByRole("button", { name: /apple/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /orange/i })).toBeInTheDocument();
  });

  it("creates a new apple conversation when button is clicked", () => {
    render(<ConversationPanel />);
    fireEvent.click(screen.getByRole("button", { name: /apple/i }));

    const state = useMatchmakingStore.getState();
    expect(state.conversations).toHaveLength(1);
    expect(state.conversations[0].type).toBe("apple");
    expect(state.conversations[0].messages.length).toBeGreaterThan(0);
  });

  it("creates a new orange conversation when button is clicked", () => {
    render(<ConversationPanel />);
    fireEvent.click(screen.getByRole("button", { name: /orange/i }));

    const state = useMatchmakingStore.getState();
    expect(state.conversations).toHaveLength(1);
    expect(state.conversations[0].type).toBe("orange");
  });

  it("displays conversation messages after creation", () => {
    render(<ConversationPanel />);
    fireEvent.click(screen.getByRole("button", { name: /apple/i }));

    expect(screen.getByText(/a new apple has arrived/i)).toBeInTheDocument();
  });

  it("shows conversation in sidebar after creation", () => {
    render(<ConversationPanel />);
    fireEvent.click(screen.getByRole("button", { name: /apple/i }));

    // Sidebar should have an entry with the fruit type (lowercase, CSS capitalizes)
    const sidebarEntries = screen.getAllByText("apple");
    // At least one should be in the sidebar (not the + button)
    expect(sidebarEntries.length).toBeGreaterThanOrEqual(1);
  });

  it("switches between conversations", () => {
    render(<ConversationPanel />);

    fireEvent.click(screen.getByRole("button", { name: /\+ apple/i }));
    fireEvent.click(screen.getByRole("button", { name: /\+ orange/i }));

    const state = useMatchmakingStore.getState();
    expect(state.conversations).toHaveLength(2);
    expect(state.activeConversationId).toBe(state.conversations[1].id);
  });

  it("displays profile summary card", () => {
    render(<ConversationPanel />);
    fireEvent.click(screen.getByRole("button", { name: /\+ apple/i }));

    expect(screen.getByText("Profile Summary")).toBeInTheDocument();
  });
});
