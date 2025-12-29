# 📋 Pastebin Clone - Complete Railway Deployment Guide

A full-featured Pastebin application deployed on Railway with PostgreSQL database.

**🌐 Live Demo:** https://three-tier-project-production.up.railway.app/

---

## 📑 Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Local Development Setup](#local-development-setup)
5. [Railway Deployment Guide](#railway-deployment-guide)

---

## ✨ Features

- ✅ Create and share text pastes with unique URLs
- ⏱️ Optional expiration times (10 minutes, 1 hour, 1 day, 1 week)
- 👁️ Optional maximum view limits
- 📊 Real-time view counter
- 🎨 Modern, responsive dark-themed UI
- 🔒 Automatic cleanup of expired pastes
- 🚀 RESTful API design
- 💾 PostgreSQL database persistence

---

## 🛠 Tech Stack

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with modern features (Grid, Flexbox, Animations)
- **JavaScript** - 

### Backend
Node.js with Express
PostgreSQL for the database (using Neon's free tier)

### Deployment
- **Railway** - Hosting platform (Backend + Database)

---

## 📁 Project Structure

```
pastebin-clone/
├── public/
│   ├── index.html      # main page
│   ├── styles.css      # all the styling
│   └── app.js          # frontend logic
├── server.js           # backend API
├── package.json        
├── .env                # don't commit this!
└── README.md
```

---

Running Locally

You'll need Node.js installed first.

1. Clone the repo
git clone <repo-url>
cd pastebin-clone

2. Install dependencies
npm install

3. Set up the database

Go to Neon
 and create a free account.

Create a new project and copy the connection string. It looks like:

postgresql://username:password@ep-something-123456.us-east-2.aws.neon.tech/neondb


Create a .env file in the project root and add:

DATABASE_URL=your-neon-connection-string-here
PORT=3000

4. Start the server
npm start


Open http://localhost:3000
 to see the app in action.

🌐 Deploying to Railway

Push your code to GitHub (make sure .env is in .gitignore).

Go to Railway
 and sign up.

Click New Project → Deploy from GitHub repo and select your repository.

In the project, go to the Variables tab and add:

DATABASE_URL = your Neon connection string


Under Settings → Networking, click Generate Domain.

Railway automatically detects it’s a Node.js app and deploys it.
Future updates are automatic—just push to GitHub, and Railway redeploys.

📝 API Endpoints
Create a paste
POST /api/paste
Content-Type: application/json

{
  "title": "Optional title",
  "content": "Your text here",
  "expiry": "1hour",     // optional: 10min, 1hour, 1day, 1week
  "maxViews": 5          // optional
}

Get a paste
GET /api/paste/:id


Returns JSON with paste content or 404 if not found.

🗄️ Database Setup

The app creates the table automatically on startup. Structure:

CREATE TABLE pastes (
    id VARCHAR(10) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    max_views INTEGER,
    views INTEGER DEFAULT 0
);


A cleanup job runs every hour to delete expired pastes.

⚠️ Common Issues

Can't connect to database:
Make sure DATABASE_URL is set correctly and your Neon database is running.

Paste not found immediately after creating:
Usually means the write failed. Check Railway logs.

Changes not showing:
Railway caches sometimes—force redeploy or clear browser cache.

Port errors locally:
Something else might be using port 3000. Change it in .env.

🧪 Testing

Try creating pastes:

Regular paste without options

Paste that expires in 10 minutes

Paste with max 2 views (then refresh 3 times to see it disappear)

Also try accessing a fake URL to test the 404 page.

Notes:

IDs are random 8-character strings

Content is stored as plain text

Database uses SSL in production

Free tiers on Neon and Railway are sufficient

⚙️ Environment Variables

Required:

DATABASE_URL - Your Neon PostgreSQL connection string


Optional:

PORT - Defaults to 3000


Set them in Railway under the Variables tab.

📚 References & Links

Live app: https://three-tier-project-production.up.railway.app/

Railway: https://railway.app

Neon: https://neon.tech


<img width="1901" height="887" alt="image" src="https://github.com/user-attachments/assets/3cb97af2-a77a-4ac7-b0f4-9aeda8e4ba88" />




build by Amar Kumar Nayak

contact by email-amarkumarnayak12345@gmail.com
