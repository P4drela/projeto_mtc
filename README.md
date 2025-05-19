# 🗳️ Voting App – React + Supabase

This is a simple voting web app built with **React**, **Tailwind CSS**, and **Supabase**.

Users can vote **positive** 👍 or **negative** 👎 on a project. The vote counts are updated using Supabase as the backend.

---

## 🚀 Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + REST API)
- **Hosting**: (To be added if deployed)

---

## 📦 Setup Instructions

### 1. Clone the repository

```sh
git clone https://github.com/P4drela/projeto_mtc.git
cd projeto_mtc
```

### 2. Install dependencies

```sh
npm install
```

### 3. Add your Supabase credentials

Create a `.env` file in the root directory of the project:

```sh
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the app locally

```sh
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

---

## 🛠 Features

* 👍 / 👎 voting on a project
* Tailwind CSS styled interface
* Supabase integration for database and API
* Realtime updates (coming soon)
* Authentication (coming soon)

---

## 📌 To-Do

* [ ] Add Supabase Realtime for live vote updates
* [ ] Add user authentication (email or Google)  -  Not important to the University Course.
* [ ] Prevent multiple votes per user or device
* [ ] Admin dashboard to monitor voting statistics

---

## 📸 Preview

Coming soon...

---

## 🔒 Environment Variables

> ⚠️ **Important**: Do not commit your `.env` file to GitHub.

This file should contain your Supabase keys and should be added to your `.gitignore`:

---

## 🙌 Contributing

Feel free to fork and contribute to this project! Pull requests are welcome.

---

## 📄 License

**MIT** – Free to use, modify, and distribute.


