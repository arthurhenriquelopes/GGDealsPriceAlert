# GGDeals Price Alert 🚀

A high-performance, full-stack automated system to track game deals and historical lows on [GG.deals](https://gg.deals). Built with Java Spring Boot, React, and Supabase.

[![Daily Scrape](https://github.com/arthurhenriquelopes/GGDealsPriceAlert/actions/workflows/daily_alerts.yml/badge.svg)](https://github.com/arthurhenriquelopes/GGDealsPriceAlert/actions/workflows/daily_alerts.yml)

## 🌟 Features

- **Personalized Alerts**: Configure your own filters (platforms, price range, rating) via a modern dashboard.
- **Premium Email Alerts**: Receive beautifully styled HTML emails with game thumbnails and direct links.
- **Daily Automation**: Fully automated daily checks powered by GitHub Actions.
- **Multi-user Support**: Secure authentication and individual configurations backed by Supabase.

## 🛠️ Technology Stack

- **Backend:** Java 21 / Spring Boot 3 / Maven
- **Frontend:** React 18 / Vite / Lucide Icons
- **Database:** PostgreSQL (Supabase)
- **Scraper:** Python 3.10 / Scrapling (StealthyFetcher)
- **Infrastructure:** GitHub Actions

## 🚀 Getting Started

### Prerequisites

- Java 21
- Node.js (Latest LTS)
- Python 3.10+
- A [Supabase](https://supabase.com/) account

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/arthurhenriquelopes/GGDealsPriceAlert.git
   cd                     GGDealsPriceAlert
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the root directory (using the variables set in your secrets):
   ```env
   EMAIL_SENDER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   SUPABASE_URL=your-project-url
   SUPABASE_KEY=your-anon-key
   ```

3. **Backend Setup:**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

4. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🤖 GitHub Actions Setup

To enable daily automation, navigate to your repository **Settings > Secrets and variables > Actions** and add the following secrets:

- `EMAIL_SENDER`: Your Gmail address.
- `EMAIL_PASSWORD`: Your 16-character Google App Password.
- `SUPABASE_URL`: Your Supabase API URL.
- `SUPABASE_KEY`: Your Supabase Service Role or Anon Key.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
