"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { text } from "@/lib/copy";
import type { Locale } from "@/types";

export function ChatLauncher({ locale }: { locale: Locale }) {
  const labels = text(locale);
  const panelId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { locale } }),
    [locale],
  );
  const { messages, sendMessage, status, error, clearError } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";
  const lastMessage = messages.at(-1);
  const waiting =
    busy && (lastMessage?.role !== "assistant" || messageText(lastMessage).length === 0);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) return;
    thread.scrollTop = thread.scrollHeight;
  }, [messages, status, error, open]);

  function submitMessage() {
    const body = draft.trim();
    if (!body || busy) return;
    clearError();
    setDraft("");
    void sendMessage({ text: body }).catch(() => undefined);
  }

  return (
    <>
      {open ? (
        <section
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-label={labels.chatTitle}
          className="fixed bottom-24 end-4 z-30 flex h-[min(32rem,calc(100dvh-8rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-[0_24px_70px_rgba(28,25,21,0.18)] sm:end-6"
        >
          <header className="flex items-start gap-3 border-b border-line px-4 py-4">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green text-white">
              <ChatIcon />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">
                {labels.brand}
              </p>
              <h2 className="font-display text-2xl leading-none text-green">{labels.chatTitle}</h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={labels.chatClose}
              className="rounded-full p-2 text-muted transition hover:bg-paper hover:text-ink"
            >
              <CloseIcon />
            </button>
          </header>

          <div ref={threadRef} className="flex flex-1 flex-col gap-3 overflow-y-auto bg-paper/60 px-4 py-4">
            <MessageBubble role="assistant">{labels.chatGreeting}</MessageBubble>
            {messages.map((message) => {
              const body = messageText(message);
              if (!body) return null;
              return (
                <MessageBubble key={message.id} role={message.role === "user" ? "user" : "assistant"}>
                  {body}
                </MessageBubble>
              );
            })}
            {waiting ? <MessageBubble role="assistant">{labels.chatThinking}</MessageBubble> : null}
            {error ? <p className="text-sm text-clay">{labels.chatFailed}</p> : null}
          </div>

          <form
            className="flex items-center gap-2 border-t border-line bg-card p-3"
            onSubmit={(event) => {
              event.preventDefault();
              submitMessage();
            }}
          >
            <input
              ref={inputRef}
              value={draft}
              disabled={busy}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={labels.chatPlaceholder}
              className="w-full rounded-full border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-green disabled:opacity-60"
            />
            <button
              type="submit"
              aria-label={labels.chatSend}
              disabled={busy || draft.trim().length === 0}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green text-white transition hover:bg-[#16382c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SendIcon />
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? labels.chatClose : labels.chatOpen}
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 end-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-green text-white shadow-[0_16px_40px_rgba(30,70,54,0.35)] transition hover:bg-[#16382c] sm:end-6 sm:h-16 sm:w-16"
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>
    </>
  );
}

function MessageBubble({ role, children }: { role: "user" | "assistant"; children: string }) {
  return (
    <p
      className={
        role === "user"
          ? "ms-10 self-end rounded-2xl rounded-ee-md bg-green px-4 py-3 text-sm leading-6 text-white"
          : "me-10 self-start rounded-2xl rounded-es-md border border-line bg-card px-4 py-3 text-sm leading-6 text-ink"
      }
    >
      {children}
    </p>
  );
}

function messageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current">
      <path
        d="M7 17.5 4.5 20V7.5A2.5 2.5 0 0 1 7 5h10a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 17 17H7Z"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M8.5 10h7M8.5 13h4" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current">
      <path d="M6 6l12 12M18 6 6 18" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 fill-none stroke-current rtl:-scale-x-100"
    >
      <path d="M5 12h14M13 6l6 6-6 6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
