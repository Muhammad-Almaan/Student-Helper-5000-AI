# 🧠 StudyHelper AI

> *"Because your homework deserves a sidekick, not a villain arc."*

**A submission for the International Academic School STEM Innovation Challenge 2026**
**Track: AI & Automation for a Better Future (Grades 9–12)**

---

## 🎯 The Problem (a.k.a. "Why This Exists")

Every student has been here: it's 9pm, you have three tests this week, your notes look
like a crime scene, and your "study plan" is just vibes and mild panic. Teachers keep
saying "manage your time better," but nobody hands you the actual tool to do it.

StudyHelper AI is that tool. It's an AI-powered study sidekick that automates the three
most painful parts of being a student: **planning**, **reviewing**, and **understanding**.
No cap, it actually works.

---

## ✨ What It Does

### 📅 Smart Study Planner
Type in your subjects, deadlines, and how many hours you can *realistically* study
(be honest, we won't tell your parents). StudyHelper generates a day-by-day plan that
doesn't just say "study more" — it tells you exactly what to do, when, so you're not
relearning an entire semester the night before finals.

### 📝 Notes → Quiz Generator
Paste in your class notes — messy, disorganized, written mid-panic, doesn't matter —
and StudyHelper turns them into an actual graded practice quiz with explanations and
fun facts. It's like a pop quiz, except you saw it coming and it's on your side.

### 💬 AI Tutor Chat
Got a concept you don't get? Ask StudyHelper. It explains things in plain English,
with zero judgment and zero "you should already know this" energy — unlike certain
group project members (you know who you are, Kevin).

### 🎉 Bonus Features
- Confetti explosion when your study plan generates or you finish a quiz, because
  dopamine is a legitimate UX strategy.
- A hidden **Konami Code Easter egg** (↑ ↑ ↓ ↓ ← → ← → b a) for anyone who tries it —
  including judges. We see you.

---

## 🏆 Why This Fits the Challenge

| Judging Criteria | How StudyHelper Delivers |
|---|---|
| **Innovation** | Real AI generates a personalized plan and quiz — not a static to-do list template. |
| **Functionality** | Fully working demo: type real subjects/notes and get real, usable output on the spot. |
| **Real-world impact** | Every single student procrastinates and struggles to organize study time. This isn't a hypothetical problem — it's Tuesday. |
| **Presentation** | Built to demo live: type something in front of the judges and watch it build a plan in real time. |

---

## 🛠️ Tech Stack

Kept it simple — no database, no drama, just one tiny serverless function that guards the API key:

- **HTML** — page structure (`index.html`)
- **CSS** — dark, glassmorphism-inspired styling (`style.css`)
- **JavaScript** — all the logic, including AI calls, quiz grading, chat, and confetti physics (`main.js`)
- **AI Model** — [Groq](https://groq.com) running Llama 3.3 70B, called through a small Netlify Function so the API key never reaches the browser

No frameworks, no build step, no `npm install` purgatory. Deploy it on Netlify and go.

---

## ⚙️ Setup (a.k.a. "How to Not Get an Error on Stage")

The AI key never touches the browser. The page talks to a tiny Netlify Function
(`netlify/functions/studyhelper-chat.js`), which holds the key and talks to Groq.

1. Get a **free** Groq API key at [console.groq.com/keys](https://console.groq.com/keys)
   (takes about 2 minutes, no credit card required — yes, actually free, we checked).
2. Deploy the project on [Netlify](https://www.netlify.com) by importing this repo.
3. In Netlify, open **Site configuration → Environment variables** and add a variable
   named `GROQ_API_KEY` with your key as the value.
4. Trigger a new deploy so the function picks the key up. That's it.

> 🔒 **Never** paste your key into `main.js` or any other file in this repo. It belongs
> in Netlify's environment variables only.

---

## 🎮 Easter Egg (Shhh)

Try the Konami Code (↑ ↑ ↓ ↓ ← → ← → b a) anywhere on the page. Achievement will
unlock. No, it does not give you bonus points on your actual homework. We asked.

---

## 🙏 Credits

Built for the IAS STEM Innovation Challenge 2026, fueled by questionable sleep
schedules and the collective trauma of every group project ever assigned.

StudyHelper AI is not liable for your actual grades, but it is legally obligated to
try its absolute best.