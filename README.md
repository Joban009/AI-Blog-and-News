# AI News Blog System

A full-stack web application where admins and users can create, manage, and interact with news and blog content, with Gemini AI integration for content generation.

## Project Structure

```
AI-Blog/
├── frontend/          # React + Vite frontend
├── backend/           # Node.js + Express REST API
├── database/          # MySQL schema and migrations
└── .env         # Environment variables (fill in your keys)
```

## Quick Start

### 1. Configure Environment

Copy `.env.example` to `.env` and fill in your secrets:
```bash
cp .env.example .env
```

### 2. Database Setup
```bash
mysql -u root -p < database/schema.sql
```

### 3. Backend
```bash
cd backend
npm install
npm run dev
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Tech Stack

| Layer      | Technology                      |
|------------|---------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend    | Node.js, Express 5, JWT Auth   |
| Database   | MySQL 8                         |
| AI         | Google Gemini 1.5 Flash         |
| Auth       | JWT + bcrypt                    |

## User Roles

- **Admin** – Full access: manage posts, users, moderate comments, use AI generation
- **User** – Submit posts (pending approval), comment (pending approval)
- **Guest** – Read published content only
