# Habit Tracker

A modern habit tracking application built with Next.js, Express.js, and TypeScript.

## Features

- 🎯 Track daily, weekly, and custom habits
- 📊 Detailed analytics and progress tracking
- 🔔 Smart reminders and notifications
- 👥 Social features and challenges
- 🌐 Multi-language support
- 📱 PWA support for mobile devices

## Tech Stack

### Frontend
- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand/Redux Toolkit
- i18n

### Backend
- Express.js
- TypeScript
- MongoDB + Mongoose
- Redis
- Bull Queue
- JWT Authentication

### DevOps
- Docker + Kubernetes
- GitHub Actions
- Terraform
- Sentry + Prometheus + Grafana

## Getting Started

### Prerequisites

- Node.js >= 18
- PNPM >= 8.15.4
- Docker and Docker Compose
- MongoDB
- Redis

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/habit-tracker.git
cd habit-tracker
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start development servers:
```bash
pnpm dev
```

## Project Structure

```
habit-tracker/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express.js backend
├── packages/
│   ├── shared/       # Shared types and utilities
│   └── ui/           # Shared UI components
└── infrastructure/   # Infrastructure as Code
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 