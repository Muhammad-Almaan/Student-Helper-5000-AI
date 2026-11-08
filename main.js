// ============================================================
// CORE AI CALLER
// The browser never sees the API key. It sends the prompts to our own
// Netlify Function (netlify/functions/studyhelper-chat.js), which holds
// the key privately and talks to Groq on our behalf.
// ============================================================
const AI_ENDPOINT = "/.netlify/functions/studyhelper-chat";

async function callStudyHelper(systemPrompt, userPrompt, jsonMode = false) {
  const response = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemPrompt, userPrompt, jsonMode })
  });

  if (!response.ok) {
    throw new Error(`StudyHelper tripped over its own shoelaces: ${response.status}`);
  }

  const data = await response.json();
  return data.reply;
}

// ============================================================
// SUBJECT ROW MANAGEMENT (Study Planner)
// ============================================================
const subjectInputsContainer = document.getElementById("subjectInputs");
const addSubjectBtn = document.getElementById("addSubjectBtn");

function createSubjectRow() {
  const row = document.createElement("div");
  row.className = "subject-row";
  row.innerHTML = `
    <input type="text" class="subject-name" placeholder="Subject (e.g. Chemistry)">
    <input type="date" class="subject-deadline">
    <select class="subject-difficulty">
      <option value="easy">Easy mode</option>
      <option value="medium" selected>Medium mode</option>
      <option value="hard">Boss battle</option>
    </select>
  `;
  return row;
}

addSubjectBtn.addEventListener("click", () => {
  subjectInputsContainer.appendChild(createSubjectRow());
});

// ============================================================
// DAILY HOURS SLIDER
// ============================================================
const dailyHoursSlider = document.getElementById("dailyHours");
const dailyHoursValue = document.getElementById("dailyHoursValue");

dailyHoursSlider.addEventListener("input", () => {
  const val = dailyHoursSlider.value;
  dailyHoursValue.textContent = `${val} hour${val === "1" ? "" : "s"}`;
});

// ============================================================
// STUDY PLAN GENERATOR
// ============================================================
const generatePlanBtn = document.getElementById("generatePlanBtn");
const plannerLoading = document.getElementById("plannerLoading");
const plannerResult = document.getElementById("plannerResult");

generatePlanBtn.addEventListener("click", async () => {
  const rows = document.querySelectorAll(".subject-row");
  const subjects = [];

  rows.forEach(row => {
    const name = row.querySelector(".subject-name").value.trim();
    const deadline = row.querySelector(".subject-deadline").value;
    const difficulty = row.querySelector(".subject-difficulty").value;
    if (name) {
      subjects.push({ name, deadline: deadline || "no deadline set", difficulty });
    }
  });

  if (subjects.length === 0) {
    plannerResult.hidden = false;
    plannerResult.innerHTML = `<p>Uh, you didn't actually add a subject. StudyHelper can plan a lot of things, but not nothing.</p>`;
    return;
  }

  const dailyHours = dailyHoursSlider.value;

  plannerResult.hidden = true;
  plannerLoading.hidden = false;

  const systemPrompt = `You are StudyHelper, a witty, upbeat, slightly chaotic but genuinely helpful AI study coach for teenagers.
You create realistic, practical day-by-day study plans. You are encouraging but not cheesy, and you sprinkle in light humor
without being annoying. Respond ONLY with valid JSON in this exact shape, no extra text:
{
  "days": [
    { "day": "Day 1", "focus": "string - which subject(s) to focus on", "tasks": ["string", "string"], "funNote": "string - one short encouraging or funny line" }
  ]
}
Generate between 3 and 7 days depending on how many subjects and how urgent the deadlines are.`;

  const userPrompt = `Here are my subjects and deadlines: ${JSON.stringify(subjects)}.
I can realistically study ${dailyHours} hour(s) per day. Build me a study plan.`;

  try {
    const raw = await callStudyHelper(systemPrompt, userPrompt, true);
    const planData = JSON.parse(raw);
    renderPlan(planData);
  } catch (err) {
    plannerResult.innerHTML = `<p>StudyHelper short-circuited: ${err.message}. Double-check your API key in main.js and try again.</p>`;
  } finally {
    plannerLoading.hidden = true;
    plannerResult.hidden = false;
  }
});

function renderPlan(planData) {
  plannerResult.innerHTML = "";
  const wrapper = document.createElement("div");

  planData.days.forEach(day => {
    const dayBlock = document.createElement("div");
    dayBlock.style.marginBottom = "24px";
    dayBlock.style.paddingBottom = "20px";
    dayBlock.style.borderBottom = "1px solid var(--border-color)";

    const taskList = day.tasks.map(t => `<li style="margin-left:20px; margin-bottom:4px;">${escapeHTML(t)}</li>`).join("");

    dayBlock.innerHTML = `
      <h4 style="color:var(--accent-purple); margin-bottom:8px;">${escapeHTML(day.day)} — ${escapeHTML(day.focus)}</h4>
      <ul>${taskList}</ul>
      <p style="margin-top:10px; color:var(--text-muted); font-style:italic;">💡 ${escapeHTML(day.funNote)}</p>
    `;
    wrapper.appendChild(dayBlock);
  });

  plannerResult.appendChild(wrapper);
  fireConfetti();
}

// ============================================================
// QUIZ GENERATOR
// ============================================================
const notesInput = document.getElementById("notesInput");
const questionCount = document.getElementById("questionCount");
const generateQuizBtn = document.getElementById("generateQuizBtn");
const quizLoading = document.getElementById("quizLoading");
const quizResult = document.getElementById("quizResult");

generateQuizBtn.addEventListener("click", async () => {
  const notes = notesInput.value.trim();

  if (!notes) {
    quizResult.hidden = false;
    quizResult.innerHTML = `<p>There's nothing in the notes box. StudyHelper can't quiz you on the void.</p>`;
    return;
  }

  quizResult.hidden = true;
  quizLoading.hidden = false;

  const count = questionCount.value;

  const systemPrompt = `You are StudyHelper, an AI that turns messy student notes into practice quizzes.
You are witty and encouraging. Respond ONLY with valid JSON in this exact shape, no extra text:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctIndex": 0,
      "explanation": "string - short explanation of why the answer is correct",
      "funFact": "string - one short, fun, relevant tidbit"
    }
  ]
}
Generate exactly ${count} questions based on the notes provided. Keep questions clear and exam-relevant, not trick questions.`;

  const userPrompt = `Here are my notes:\n\n${notes}`;

  try {
    const raw = await callStudyHelper(systemPrompt, userPrompt, true);
    const quizData = JSON.parse(raw);
    renderQuiz(quizData);
  } catch (err) {
    quizResult.innerHTML = `<p>StudyHelper short-circuited: ${err.message}. Double-check your API key in main.js and try again.</p>`;
  } finally {
    quizLoading.hidden = true;
    quizResult.hidden = false;
  }
});

function renderQuiz(quizData) {
  quizResult.innerHTML = "";
  let score = 0;
  let answered = 0;

  const scoreBar = document.createElement("p");
  scoreBar.style.fontWeight = "600";
  scoreBar.style.marginBottom = "16px";
  scoreBar.textContent = `Score: 0 / ${quizData.questions.length}`;
  quizResult.appendChild(scoreBar);

  quizData.questions.forEach((q, qIndex) => {
    const qBlock = document.createElement("div");
    qBlock.style.marginBottom = "24px";
    qBlock.style.paddingBottom = "20px";
    qBlock.style.borderBottom = "1px solid var(--border-color)";

    const optionsHTML = q.options.map((opt, i) => `
      <button class="quiz-option-btn" data-index="${i}" style="display:block; width:100%; text-align:left; margin-bottom:8px; padding:12px 16px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; color:var(--text-main); transition: background 0.2s ease;">
        ${escapeHTML(opt)}
      </button>
    `).join("");

    qBlock.innerHTML = `
      <p style="font-weight:600; margin-bottom:12px;">Q${qIndex + 1}. ${escapeHTML(q.question)}</p>
      <div class="quiz-options-list">${optionsHTML}</div>
      <p class="quiz-feedback" style="margin-top:10px; display:none;"></p>
    `;

    const optionButtons = qBlock.querySelectorAll(".quiz-option-btn");
    const feedbackEl = qBlock.querySelector(".quiz-feedback");

    optionButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        if (qBlock.dataset.locked === "true") return;
        qBlock.dataset.locked = "true";
        answered++;

        const chosenIndex = parseInt(btn.dataset.index, 10);
        const isCorrect = chosenIndex === q.correctIndex;

        optionButtons.forEach(b => {
          const bIndex = parseInt(b.dataset.index, 10);
          if (bIndex === q.correctIndex) {
            b.style.borderColor = "#22c55e";
            b.style.background = "rgba(34, 197, 94, 0.12)";
          } else if (bIndex === chosenIndex) {
            b.style.borderColor = "#ef4444";
            b.style.background = "rgba(239, 68, 68, 0.12)";
          }
        });

        if (isCorrect) score++;

        scoreBar.textContent = `Score: ${score} / ${quizData.questions.length}`;

        feedbackEl.style.display = "block";
        feedbackEl.innerHTML = `
          <strong>${isCorrect ? "Nailed it. 🎯" : "Close, but nope. 😬"}</strong><br>
          ${escapeHTML(q.explanation)}<br>
          <span style="color:var(--text-muted); font-style:italic;">Fun fact: ${escapeHTML(q.funFact)}</span>
        `;

        if (answered === quizData.questions.length) {
          fireConfetti();
        }
      });
    });

    quizResult.appendChild(qBlock);
  });
}

// ============================================================
// CHAT TOOL
// ============================================================
const chatWindow = document.getElementById("chatWindow");
const chatInput = document.getElementById("chatInput");
const chatSendBtn = document.getElementById("chatSendBtn");

let chatHistory = [];

function appendChatMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `chat-message ${role === "user" ? "user" : "bot"}`;
  msg.innerHTML = `
    <span class="chat-avatar">${role === "user" ? "🙋" : "🧠"}</span>
    <div class="chat-bubble">${escapeHTML(text)}</div>
  `;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function sendChatMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  appendChatMessage("user", text);
  chatHistory.push({ role: "user", content: text });
  chatInput.value = "";

  const typingMsg = document.createElement("div");
  typingMsg.className = "chat-message bot";
  typingMsg.id = "typingIndicator";
  typingMsg.innerHTML = `<span class="chat-avatar">🧠</span><div class="chat-bubble">thinking...</div>`;
  chatWindow.appendChild(typingMsg);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  const systemPrompt = `You are StudyHelper, a friendly, witty AI tutor for teenagers. You explain concepts clearly and simply,
using relatable examples. You keep a light, encouraging tone and the occasional joke, but you never sacrifice accuracy for humor.
Keep answers focused and not overly long unless the student asks for depth.`;

  try {
    const conversationText = chatHistory.map(m => `${m.role}: ${m.content}`).join("\n");
    const reply = await callStudyHelper(systemPrompt, conversationText, false);

    document.getElementById("typingIndicator")?.remove();
    appendChatMessage("bot", reply);
    chatHistory.push({ role: "assistant", content: reply });
  } catch (err) {
    document.getElementById("typingIndicator")?.remove();
    appendChatMessage("bot", `I tripped over a cable somewhere: ${err.message}`);
  }
}

chatSendBtn.addEventListener("click", sendChatMessage);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendChatMessage();
});

// ============================================================
// CONFETTI (vanilla, no dependencies)
// ============================================================
function fireConfetti() {
  const colors = ["#8b5cf6", "#3b82f6", "#22d3ee", "#ec4899"];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement("div");
    piece.textContent = ["🎉", "✨", "🧠", "🔥"][Math.floor(Math.random() * 4)];
    piece.style.position = "fixed";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.top = "-30px";
    piece.style.fontSize = `${12 + Math.random() * 14}px`;
    piece.style.zIndex = "9999";
    piece.style.pointerEvents = "none";
    piece.style.transition = "transform 1.8s ease-out, opacity 1.8s ease-out";
    document.body.appendChild(piece);

    requestAnimationFrame(() => {
      piece.style.transform = `translateY(${80 + Math.random() * 20}vh) rotate(${Math.random() * 360}deg)`;
      piece.style.opacity = "0";
    });

    setTimeout(() => piece.remove(), 2000);
  }
}

// ============================================================
// EASTER EGG — KONAMI CODE
// ============================================================
const konamiCode = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
let konamiProgress = 0;

document.addEventListener("keydown", (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (key === konamiCode[konamiProgress]) {
    konamiProgress++;
    if (konamiProgress === konamiCode.length) {
      triggerEasterEgg();
      konamiProgress = 0;
    }
  } else {
    konamiProgress = 0;
  }
});

function triggerEasterEgg() {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0,0,0,0.85)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "10000";
  overlay.style.cursor = "pointer";
  overlay.innerHTML = `
    <div style="text-align:center; padding:40px; max-width:500px;">
      <div style="font-size:3rem; margin-bottom:16px;">🎮🧠✨</div>
      <h2 style="margin-bottom:12px;">Achievement Unlocked: Konami Scholar</h2>
      <p style="color:var(--text-muted);">You found the secret code. StudyHelper respects a true gamer.
      Unfortunately this does not grant bonus points on your actual homework. Click anywhere to continue studying like a normal person.</p>
    </div>
  `;
  overlay.addEventListener("click", () => overlay.remove());
  document.body.appendChild(overlay);
  fireConfetti();
}

// ============================================================
// UTILITY
// ============================================================
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}