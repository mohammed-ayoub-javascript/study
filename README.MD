# EndLine 

**Cross the finish line. Reclaim your freedom.**

**EndLine** is a minimalist, open-source productivity platform designed for developers and students. It combines the **Pomodoro technique** with a robust **Session Management** system to help users grind through intense study blocks and eliminate procrastination.

[Image Placeholder: Clean, dark-mode dashboard of EndLine]

##  Tech Stack

Built with a modern, high-performance stack:

* **Frontend:** [Next.js 15](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/).
* **Backend:** [Go Fiber](https://gofiber.io/) (Lightning-fast HTTP engine).
* **Database:** PostgreSQL with [GORM](https://gorm.io/).
* **Auth:** Secure JWT-based authentication with protected middleware.
* **Local Engine:** IndexedDB for lightning-fast local settings and motivational message retrieval.

##  Key Features

*  **Precision Timer:** A highly customizable Pomodoro timer for deep work intervals.
*  **Session Tracking:** Organizes study materials into "Sessions" linked to your unique profile.
*  **Secure Isolation:** Full ownership-based data protection—only you can access your sessions.
*  **Motivation Engine:** Random, high-impact motivational cues fetched locally from IndexedDB.
*  **Vercel-esque UI:** A sleek, distraction-free interface inspired by the best modern design systems.

##  Getting Started

### Prerequisites

* Go 
* Node.js  & npm/pnpm
* PostgreSQL instance

### 1. Backend Setup (Go)

```bash
cd backend
go mod tidy
# Configure your .env (DB_URL, JWT_SECRET)
go run main.go

```

### 2. Frontend Setup (Next.js)

```bash
cd frontend
bun install
bun run dev

```

##  Architecture

```text
├── backend/
│   ├── auth/           # JWT & Encryption logic
│   ├── handlers/       # Clean architecture HTTP handlers
│   ├── models/         # GORM schemas
│   └── repositories/   # Database abstraction layer
├── frontend/
│   ├── components/     # shadcn/ui shared components
│   ├── app/            # Next.js App Router (pages & logic)
│   └── lib/            # Axios instance & IndexedDB helpers

```

##  Contributing

This is an open-source project and contributions are what make the open-source community such an amazing place to learn, inspire, and create.

1. **Fork** the Project.
2. Create your **Feature Branch** (`git checkout -b feature/AmazingFeature`).
3. **Commit** your Changes (`git commit -m 'Add some AmazingFeature'`).
4. **Push** to the Branch (`git push origin feature/AmazingFeature`).
5. Open a **Pull Request**.

##  License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

**Built for the focused. Built for the free.**

Would you like me to generate a **LICENSE** file (MIT) to include in your repository as well?