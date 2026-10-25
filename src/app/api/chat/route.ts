import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { jsonError } from "@/lib/http";
import { isLocale } from "@/lib/locale";
import { listProductsForChat, type ChatCatalogProduct } from "@/services/products";
import type { Locale } from "@/types";

export const maxDuration = 30;

const maxMessages = 20;
const maxMessageLength = 1000;

type ChatRequest = {
  locale: Locale;
  messages: UIMessage[];
  question: string;
};

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Send a question.", 400);
  }

  const parsed = parseChatRequest(body);
  if ("error" in parsed) return jsonError(parsed.error, 400);

  try {
    const products = await listProductsForChat(parsed.question);
    const result = streamText({
      model: google("gemini-3.8-flash"),
      providerOptions: {
        google: {
          thinkingConfig: { thinkingLevel: "low" },
        },
      },
      system: systemPrompt(parsed.locale, products),
      messages: await convertToModelMessages(parsed.messages),
      onError({ error }) {
        console.error("Chat stream error:", error);
      },
    });
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return jsonError("The assistant could not answer.", 500);
  }
}

function systemPrompt(locale: Locale, products: ChatCatalogProduct[]) {
  const language = locale === "ar" ? "Arabic" : "English";
  const catalog = products.map((product) => ({
    id: product.id,
    name_en: product.name_en,
    name_ar: product.name_ar,
    description_en: product.description_en?.slice(0, 300) ?? null,
    description_ar: product.description_ar?.slice(0, 300) ?? null,
    category_en: product.category_en,
    category_ar: product.category_ar,
    price: product.price,
    stock: product.stock,
  }));

  return `You are Mizan's shop assistant. Answer questions about products using only the catalog JSON below.
Reply in ${language}.
When the question asks for a price or whether an item is in stock, use the listed price and stock.
If the product is not in the catalog, say it is not in the shop.
Do not invent products, prices, or stock.
Do not help with checkout, payment, or orders.
Catalog:
${JSON.stringify(catalog)}`;
}

function parseChatRequest(body: unknown): ChatRequest | { error: string } {
  if (!isRecord(body) || !Array.isArray(body.messages)) {
    return { error: "Send a messages array." };
  }
  if (body.messages.length === 0 || body.messages.length > maxMessages) {
    return { error: "Send between 1 and 20 messages." };
  }
  if (body.locale !== undefined && !isLocale(String(body.locale))) {
    return { error: "Locale must be en or ar." };
  }

  const locale: Locale = body.locale === "ar" ? "ar" : "en";
  const messages: UIMessage[] = [];

  for (const message of body.messages) {
    const parsed = parseMessage(message);
    if ("error" in parsed) return parsed;
    messages.push(parsed.message);
  }

  const last = messages[messages.length - 1];
  const question = textFromMessage(last).trim();
  if (last.role !== "user" || !question) {
    return { error: "The latest message must be a question." };
  }

  return { locale, messages, question };
}

function parseMessage(message: unknown): { message: UIMessage } | { error: string } {
  if (!isRecord(message) || !Array.isArray(message.parts)) {
    return { error: "Each message needs text." };
  }
  if (message.role !== "user" && message.role !== "assistant") {
    return { error: "Only user and assistant messages are allowed." };
  }

  const parts: UIMessage["parts"] = [];
  let length = 0;
  for (const part of message.parts) {
    if (!isRecord(part) || part.type !== "text" || typeof part.text !== "string") continue;
    length += part.text.length;
    if (length > maxMessageLength) return { error: "A message is too long." };
    parts.push({ type: "text", text: part.text });
  }
  if (parts.length === 0) return { error: "Each message needs text." };

  return {
    message: {
      id: typeof message.id === "string" && message.id.length > 0 ? message.id.slice(0, 80) : crypto.randomUUID(),
      role: message.role,
      parts,
    },
  };
}

function textFromMessage(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
