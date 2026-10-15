import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";

// HustleMate uses an open-weight model through Transformers.js.
// The model is downloaded on first use and then cached by the browser.
const MODEL_ID = "onnx-community/SmolLM2-360M-Instruct";
env.allowLocalModels = false;

const $ = (selector) => document.querySelector(selector);
const form = $("#creatorForm");
const details = $("#details");
const detailsLabel = $("#detailsLabel");
const detailsHint = $("#detailsHint");
const businessName = $("#businessName");
const audience = $("#audience");
const tone = $("#tone");
const outputContent = $("#outputContent");
const outputActions = $("#outputActions");
const generateBtn = $("#generateBtn");
const modelStatus = $("#modelStatus");
const draftBadge = $("#draftBadge");

const tools = {
  product: {
    title: "Product description",
    label: "What are you selling?",
    placeholder: "e.g. Handmade soy candles with lavender scent, reusable glass jars, a calming gift for bedrooms...",
    hint: "Include features, audience, and what makes it special.",
    instruction: "Write an appealing online product listing with a short title, a concise description, 3 benefit bullets, and a gentle call to action. Do not invent facts not supplied."
  },
  social: {
    title: "Social caption",
    label: "What are you posting about?",
    placeholder: "e.g. Launching handmade lavender candles this weekend. Small batch, reusable jars...",
    hint: "Mention the platform, product, offer, or message if relevant.",
    instruction: "Write 3 distinct social media caption options. Keep them natural and easy to read. Include a few relevant hashtags, but do not overdo them. Do not invent discounts or claims."
  },
  proposal: {
    title: "Client proposal",
    label: "What service or project are you pitching?",
    placeholder: "e.g. I will design a five-page website for a local bakery, including mobile layout and contact form...",
    hint: "Include the client's needs, deliverables, and timeline if known.",
    instruction: "Draft a clear, friendly client proposal with sections for understanding the need, proposed work, deliverables, timeline (only if provided), and next step. Do not invent prices or commitments."
  },
  email: {
    title: "Client email",
    label: "What does the email need to say?",
    placeholder: "e.g. Follow up with a client after sending a logo design draft and ask for feedback...",
    hint: "Include the purpose, key details, and any action you need from the recipient.",
    instruction: "Write a polished, concise client email with a subject line, greeting, clear body, and professional sign-off. Do not invent facts."
  }
};

let selectedTool = "product";
let generator = null;
let modelPromise = null;
let currentDraft = "";
let savedDrafts = JSON.parse(localStorage.getItem("hustlemate-drafts") || "[]");

$("#charCount").textContent = `0 / ${details.maxLength}`;
details.addEventListener("input", () => {
  $("#charCount").textContent = `${details.value.length} / ${details.maxLength}`;
});

document.querySelectorAll(".tool-card").forEach((card) => {
  card.addEventListener("click", () => {
    selectedTool = card.dataset.tool;
    document.querySelectorAll(".tool-card").forEach((item) => item.classList.toggle("selected", item === card));
    const config = tools[selectedTool];
    detailsLabel.innerHTML = `${config.label} <span>*</span>`;
    details.placeholder = config.placeholder;
    detailsHint.textContent = config.hint;
    $("#crumb").textContent = config.title;
  });
});

function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove("show"), 2600);
}

async function loadModel() {
  if (generator) return generator;
  if (modelPromise) return modelPromise;
  modelStatus.textContent = "Loading open AI model…";
  modelStatus.previousElementSibling.style.background = "#e6b84e";
  modelPromise = pipeline("text-generation", MODEL_ID, {
    dtype: "q4",
    progress_callback: (progress) => {
      if (progress.status === "progress" && progress.file) {
        modelStatus.textContent = `Loading model: ${Math.round(progress.progress || 0)}%`;
      } else if (progress.status === "download") {
        modelStatus.textContent = "Downloading open AI model…";
      }
    }
  }).then((pipe) => {
    generator = pipe;
    modelStatus.textContent = "Open AI model ready";
    modelStatus.previousElementSibling.style.background = "#48a987";
    return generator;
  }).catch((error) => {
    modelPromise = null;
    modelStatus.textContent = "Model could not load";
    modelStatus.previousElementSibling.style.background = "#e18c83";
    throw error;
  });
  return modelPromise;
}

function makePrompt() {
  const config = tools[selectedTool];
  return `You are a helpful writing assistant for small businesses. Create a useful first draft.
Brand or business: ${businessName.value.trim()}
Audience: ${audience.value.trim() || "Not specified"}
Tone: ${tone.value}
Task: ${config.instruction}
User details: ${details.value.trim()}
Keep the output practical and readable. Do not claim to have done real-world actions.`;
}

function showDraft(text) {
  currentDraft = text.trim();
  outputContent.innerHTML = "";
  const article = document.createElement("article");
  article.className = "output-text";
  article.textContent = currentDraft;
  outputContent.appendChild(article);
  outputActions.hidden = false;
  draftBadge.textContent = "DRAFT READY";
  draftBadge.classList.add("ready");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!businessName.value.trim() || !details.value.trim()) {
    toast("Please complete the required fields.");
    return;
  }
  const oldLabel = generateBtn.innerHTML;
  generateBtn.disabled = true;
  generateBtn.innerHTML = "Loading model and creating draft…";
  try {
    const pipe = await loadModel();
    const prompt = makePrompt();
    const result = await pipe(prompt, {
      max_new_tokens: 220,
      do_sample: true,
      temperature: 0.7,
      top_p: 0.9,
      repetition_penalty: 1.12
    });
    let generated = result?.[0]?.generated_text ?? "";
    if (typeof generated !== "string") generated = JSON.stringify(generated);
    // Some text-generation pipelines return the prompt plus the continuation.
    if (generated.startsWith(prompt)) generated = generated.slice(prompt.length);
    generated = generated.trim();
    if (!generated) throw new Error("The model returned an empty response.");
    showDraft(generated);
    toast("Your draft is ready. Review it before using.");
  } catch (error) {
    console.error(error);
    outputContent.innerHTML = "";
    const message = document.createElement("div");
    message.className = "output-text";
    message.textContent = "The AI model could not start. Check your internet connection for the first model download, then try again. A compatible browser and enough available memory are also needed. Details: " + (error?.message || "unknown error");
    outputContent.appendChild(message);
    outputActions.hidden = true;
    draftBadge.textContent = "MODEL ERROR";
    draftBadge.classList.remove("ready");
    toast("Could not generate. Please try again.");
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = oldLabel;
  }
});

$("#copyBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(currentDraft);
    toast("Draft copied to clipboard.");
  } catch {
    toast("Clipboard access was blocked by your browser.");
  }
});

$("#saveBtn").addEventListener("click", () => {
  if (!currentDraft) return;
  savedDrafts.unshift({
    id: Date.now(),
    title: `${tools[selectedTool].title} — ${businessName.value.trim()}`,
    type: tools[selectedTool].title,
    text: currentDraft,
    date: new Date().toLocaleDateString()
  });
  savedDrafts = savedDrafts.slice(0, 50);
  localStorage.setItem("hustlemate-drafts", JSON.stringify(savedDrafts));
  toast("Draft saved on this browser.");
});

$("#downloadBtn").addEventListener("click", () => {
  const blob = new Blob([currentDraft], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "hustlemate-draft.txt";
  link.click();
  URL.revokeObjectURL(url);
});

function renderSavedDrafts() {
  const list = $("#savedList");
  list.innerHTML = "";
  if (!savedDrafts.length) {
    list.innerHTML = '<div class="empty-history">No saved drafts yet. Create something in the studio and choose “Save draft”.</div>';
    return;
  }
  savedDrafts.forEach((draft) => {
    const card = document.createElement("article");
    card.className = "saved-card";
    const heading = document.createElement("h3");
    heading.textContent = draft.title;
    const meta = document.createElement("small");
    meta.textContent = `${draft.type} · ${draft.date}`;
    meta.style.color = "#9a96aa";
    const paragraph = document.createElement("p");
    paragraph.textContent = draft.text;
    const copy = document.createElement("button");
    copy.className = "secondary-btn";
    copy.textContent = "Copy";
    copy.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(draft.text); toast("Saved draft copied."); }
      catch { toast("Clipboard access was blocked."); }
    });
    const remove = document.createElement("button");
    remove.className = "secondary-btn";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => {
      savedDrafts = savedDrafts.filter((item) => item.id !== draft.id);
      localStorage.setItem("hustlemate-drafts", JSON.stringify(savedDrafts));
      renderSavedDrafts();
      toast("Draft deleted from this browser.");
    });
    card.append(heading, meta, paragraph, copy, remove);
    list.appendChild(card);
  });
}

function setView(view) {
  $("#studioView").hidden = view !== "studio";
  $("#historyView").hidden = view !== "history";
  $("#crumb").textContent = view === "history" ? "Saved drafts" : "AI Content Studio";
  if (view === "history") renderSavedDrafts();
}
document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => setView(item.dataset.view));
});
$("#backToStudio").addEventListener("click", () => setView("studio"));
