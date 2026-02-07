"use client";

import { useRef, useEffect } from "react";
import {
  useMatchmakingStore,
  selectActiveConversation,
  type ConversationMessage,
} from "@/lib/store";
import {
  generateFruit,
  communicateAttributes,
  communicatePreferences,
  type Fruit,
  type FruitType,
} from "@/lib/fruit";
import { generateId, formatRelativeTime, cn } from "@/lib/utils";

export default function ConversationPanel() {
  const conversations = useMatchmakingStore((s) => s.conversations);
  const activeConversationId = useMatchmakingStore(
    (s) => s.activeConversationId
  );
  const activeConversation = useMatchmakingStore(selectActiveConversation);
  const setActiveConversation = useMatchmakingStore(
    (s) => s.setActiveConversation
  );
  const addConversation = useMatchmakingStore((s) => s.addConversation);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startNewConversation = (type: FruitType) => {
    const fruit = generateFruit(type);
    const conversationId = generateId();
    const fruitId = generateId();
    const otherType = type === "apple" ? "oranges" : "apples";

    const messages: ConversationMessage[] = [
      {
        id: generateId(),
        role: "system",
        content: `A new ${type} has arrived! Let's hear what they have to say...`,
        timestamp: new Date(),
      },
      {
        id: generateId(),
        role: "user",
        content: communicateAttributes(fruit),
        timestamp: new Date(),
      },
      {
        id: generateId(),
        role: "user",
        content: communicatePreferences(fruit),
        timestamp: new Date(),
      },
      {
        id: generateId(),
        role: "system",
        content: `Profile recorded. Searching for compatible ${otherType}...`,
        timestamp: new Date(),
      },
    ];

    addConversation({
      id: conversationId,
      type,
      fruitId,
      fruit,
      messages,
      status: "active",
      createdAt: new Date(),
    });
    setActiveConversation(conversationId);
  };

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversation?.messages.length]);

  return (
    <div className="flex h-[600px] overflow-hidden rounded-lg border border-border">
      {/* Sidebar */}
      <div className="flex w-64 flex-shrink-0 flex-col border-r border-border bg-card">
        <div className="border-b border-border p-3">
          <div className="flex gap-2">
            <button
              onClick={() => startNewConversation("apple")}
              className="flex-1 rounded-md px-3 py-2 text-sm font-medium text-apple transition hover:opacity-80"
              style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
            >
              + Apple
            </button>
            <button
              onClick={() => startNewConversation("orange")}
              className="flex-1 rounded-md px-3 py-2 text-sm font-medium text-orange transition hover:opacity-80"
              style={{ backgroundColor: "rgba(249, 115, 22, 0.1)" }}
            >
              + Orange
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted">
              No conversations yet.
              <br />
              Click above to start one.
            </div>
          ) : (
            [...conversations].reverse().map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                className={cn(
                  "w-full border-b border-border px-4 py-3 text-left transition",
                  activeConversationId === conv.id
                    ? "bg-zinc-100 dark:bg-zinc-800"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <span>{conv.type === "apple" ? "🍎" : "🍊"}</span>
                  <span className="text-sm font-medium capitalize">
                    {conv.type}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted">
                  {formatRelativeTime(conv.createdAt)}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col bg-background">
        {activeConversation ? (
          <>
            <div className="border-b border-border bg-card px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {activeConversation.type === "apple" ? "🍎" : "🍊"}
                </span>
                <span className="font-medium capitalize">
                  {activeConversation.type} Conversation
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    activeConversation.status === "active"
                      ? "bg-pear/20 text-pear"
                      : "text-muted"
                  )}
                >
                  {activeConversation.status}
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {activeConversation.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  fruitType={activeConversation.type}
                />
              ))}

              {activeConversation.fruit && (
                <FruitProfileCard fruit={activeConversation.fruit} />
              )}

              <div ref={messagesEndRef} />
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted">
            <div className="text-center">
              <p className="text-4xl">💬</p>
              <p className="mt-4 text-lg font-medium">
                No conversation selected
              </p>
              <p className="mt-1 text-sm">
                Start a new conversation or select one from the sidebar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  fruitType,
}: {
  message: ConversationMessage;
  fruitType: "apple" | "orange";
}) {
  const isSystem = message.role === "system";
  const isAssistant = message.role === "assistant";

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="max-w-md rounded-lg border border-border bg-card px-4 py-2 text-center text-sm text-muted">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex", isAssistant ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "flex max-w-lg gap-3",
          isAssistant && "flex-row-reverse"
        )}
      >
        <div className="mt-1 flex-shrink-0">
          <span className="text-xl">
            {isAssistant ? "🤖" : fruitType === "apple" ? "🍎" : "🍊"}
          </span>
        </div>
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm leading-relaxed",
            isAssistant
              ? "border-primary/20 bg-primary/10"
              : fruitType === "apple"
                ? "border-apple/20 bg-apple/5"
                : "border-orange/20 bg-orange/5"
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

function FruitProfileCard({ fruit }: { fruit: Fruit }) {
  const { attributes, preferences } = fruit;

  const formatValue = (val: unknown): string => {
    if (val === null || val === undefined) return "unknown";
    if (typeof val === "boolean") return val ? "yes" : "no";
    if (Array.isArray(val)) return val.join(", ");
    return String(val);
  };

  const formatPreference = (
    key: string,
    val: unknown
  ): string => {
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      const range = val as { min?: number; max?: number };
      const parts = [];
      if (range.min !== undefined) parts.push(`min ${range.min}`);
      if (range.max !== undefined) parts.push(`max ${range.max}`);
      return parts.join(", ");
    }
    return formatValue(val);
  };

  return (
    <div className="animate-fade-in max-w-lg rounded-lg border border-border bg-card p-4">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <span>📋</span>
        Profile Summary
      </h4>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
        <div>
          <h5 className="mb-1 font-medium text-muted">Attributes</h5>
          {Object.entries(attributes).map(([key, val]) => (
            <div key={key} className="flex justify-between py-0.5">
              <span className="text-muted">{key}</span>
              <span className="font-mono">
                {formatValue(val)}
                {key === "weight" && val !== null ? "g" : ""}
              </span>
            </div>
          ))}
        </div>
        <div>
          <h5 className="mb-1 font-medium text-muted">Preferences</h5>
          {Object.keys(preferences).length === 0 ? (
            <p className="italic text-muted">Open to anything</p>
          ) : (
            Object.entries(preferences).map(([key, val]) => (
              <div key={key} className="flex justify-between py-0.5">
                <span className="text-muted">{key}</span>
                <span className="font-mono">{formatPreference(key, val)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
