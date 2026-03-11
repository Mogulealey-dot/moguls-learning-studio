# 🎓 Mogul's Learning Studio — Vite + React App

A full-featured personal academic dashboard built with React + Vite.

---

## 🚀 How to Run This App (Step by Step)

### Step 1 — Install Node.js (if you haven't already)
Go to **https://nodejs.org** and download the **LTS** version. Install it normally.

To verify it worked, open your terminal / command prompt and type:
```
node --version
npm --version
```
Both should print a version number.

---

### Step 2 — Extract this project
Unzip the downloaded folder somewhere on your computer, e.g. your Desktop.

---

### Step 3 — Open a terminal in the project folder
- **Windows**: Open the folder, hold Shift + right-click, choose "Open PowerShell window here"
- **Mac**: Right-click the folder in Finder → "New Terminal at Folder"

---

### Step 4 — Install dependencies
In the terminal, type:
```
npm install
```
This downloads React, Vite, and all packages. Takes about 1–2 minutes the first time.

---

### Step 5 — Start the app
```
npm run dev
```

You'll see something like:
```
  VITE v5.x.x  ready in 500ms
  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser. 🎉

---

### Step 6 — Register your account
On the sign-in screen, click **Register**, fill in your name, email, and a password (6+ characters), then click Create Account.

---

## 📁 Project Structure

```
moguls-studio/
├── index.html              ← HTML entry point
├── vite.config.js          ← Vite configuration
├── package.json            ← Project dependencies
└── src/
    ├── main.jsx            ← React entry point
    ├── App.jsx             ← Main app layout
    ├── index.css           ← Global styles
    ├── utils.js            ← Shared constants & localStorage helpers
    └── components/
        ├── AuthScreen.jsx  ← Sign in / Register
        ├── Navbar.jsx      ← Sticky navbar + search
        ├── HeroSlider.jsx  ← Image slideshow
        ├── Clocks.jsx      ← Digital + analog clocks
        ├── Calendar.jsx    ← Monthly calendar
        ├── UploadCard.jsx  ← File upload (notes/papers/results)
        ├── NotesApp.jsx    ← Personal notepad
        ├── AIAssistant.jsx ← AI chat (powered by Claude)
        └── Footer.jsx      ← Site footer
```

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🔐 Auth | Sign in / Register with localStorage |
| 🖼 Hero Slider | Auto-advancing image slideshow |
| 🕐 Clocks | Live digital + analog clock |
| 📅 Calendar | Navigate months, highlights today |
| 📚 File Uploads | Class notes, exam papers, results — drag & drop, open in new tab |
| 📓 Notepad | Create, edit, delete notes — saved between sessions |
| 🤖 AI Assistant | Ask study questions, get answers powered by Claude AI |
| 🔍 Search | Navbar search to jump to any section instantly |
| 🎨 Dark Academic Design | Gold + emerald theme, Playfair Display typography |

---

## 🛠 Build for Production

To create a production-ready build:
```
npm run build
```
The output goes to the `dist/` folder — you can host this on any static web host (Netlify, Vercel, GitHub Pages).

---

## 💡 Tips

- **Fonts**: Loaded from Google Fonts — requires internet connection
- **AI Assistant**: Uses the Anthropic API — requires internet connection
- **Files**: Uploaded files are accessible via the ↗ button. Note that browser security means blob URLs don't survive page refreshes — re-upload the file to open it again. File *names* are remembered across sessions.
- **Notes**: Fully persisted in localStorage — won't disappear on refresh

---

Built with ❤️ using React 18 + Vite 5
