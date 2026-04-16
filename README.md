# GGDeals Price Alert 🚀

A high-performance, full-stack automated system to track game deals and historical lows on [GG.deals](https://gg.deals). Built with a distributed architecture using Java Spring Boot, React, and Python.

## 🌟 Features

- **Personalized Alerts**: Configure your own filters (platforms, price range, DRM, stores, rating) via a modern, dark-themed, monochromatic dashboard.
- **Dynamic Indicators**: Visually track high-quality deals with dynamic rating Fire icons (Orange for 6+, Red for 8+).
- **Premium Email Alerts**: Receive beautifully styled, high-contrast HTML emails with game thumbnails, deep links, and deal insights directly to your inbox.
- **Automated Workloads**: Headless scraping tasks powered by stealth automation (`scrapling`) deployed via GitHub Actions for daily delivery.

## 🛠️ Technology Stack

- **Backend:** Java 21 / Spring Boot 3 / Maven
- **Frontend:** React 18 / Vite / Lucide Icons
- **Database / Auth:** PostgreSQL (Supabase)
- **Scraper:** Python 3.10 / Scrapling / Playwright
- **Infrastructure:** GitHub Actions (CI/CD and Cron Tasks)

## 🏗️ Cloud Infrastructure (Hybrid Multi-Cloud)

The system is designed to run 24/7 with zero maintenance costs using a fully detached, serverless architectural pattern:

- **Frontend (Vercel):** The React/Vite dashboard deployed as a static site.
- **Backend API (Render):** Java Spring Boot 3 running seamlessly inside a Docker container natively connected to the database.
- **Database (Supabase):** Remote PostgreSQL instance acting as the central source of truth for user configs. Connected via IPv4 Session Pooler (`port 6543`).
- **Automation (GitHub Actions):** The Python scraper wakes up every day at 08:00 AM, fetches the active configs directly from Supabase, scrapes the GG.Deals endpoints seamlessly, and fires the email alerts.

## 🚀 Deployment Guide

### 1. Database (Supabase)
Create a new project. Navigate to Database Settings and select **Session pooler** (IPv4 compatibility) to grab your connection string.

### 2. Backend (Render)
Deploy the `backend` directly using the existing `Dockerfile` as the root. Provide the following Environment Variables in the Render dashboard:
- `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<your-pooler-domain>:6543/postgres?sslmode=require`
- `SPRING_DATASOURCE_USERNAME`: `postgres.<your-project-id>`
- `SPRING_DATASOURCE_PASSWORD`: `<your-db-password>`

### 3. Frontend (Vercel)
Deploy the `frontend` folder as a standard Vite project. Provide the following Environment Variable so React knows where the API lives:
- `VITE_API_URL`: `https://<your-render-app>.onrender.com`

### 4. Scraper Automation (GitHub)
Navigate to **Settings > Secrets and variables > Actions** in your repository and configure:
- `SUPABASE_URL`: Setup inside Supabase > Project Settings > API.
- `SUPABASE_KEY`: Setup inside Supabase > Project Settings > API (anon or service_role).
- `EMAIL_SENDER`: Your Gmail address.
- `EMAIL_PASSWORD`: Your 16-character Google App Password.

The scraper will now run autonomously every day without requiring a local machine.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
