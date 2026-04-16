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

## 🚀 Getting Started

### Prerequisites

- Java 21
- Node.js (Latest LTS)
- Python 3.10+

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/arthurhenriquelopes/GGDealsPriceAlert.git
   cd \GGDealsPriceAlert
   ```

2. **Configure Environment Variables:**
   The backend app and Python scraper require environment variables to operate. Set your `.env` securely matching:
   ```env
   EMAIL_SENDER=your-email@example.com
   EMAIL_PASSWORD=your-app-password
   ```

3. **Backend Setup:**
   Navigate to the `backend` boundary and start the application on port `8080`.
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

4. **Frontend Setup:**
   Run the vite dashboard interface.
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🤖 Automations & CI

The `.github/workflows` directory houses action setups for daily cron jobs (`daily_alerts.yml`).
To ensure your daily digests trigger seamlessly:
1. Navigate to **Repository Settings > Secrets and variables > Actions**.
2. Create repository secrets matching `EMAIL_SENDER` and `EMAIL_PASSWORD`.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
