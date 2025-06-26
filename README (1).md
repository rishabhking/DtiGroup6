# ⚔️ Coding Sphere

**Coding Sphere** is a real-time competitive programming duel platform designed to make Codeforces duels more interactive, transparent, and strategic. Whether you're challenging a friend or pushing your personal limits, Coding Sphere enhances your coding experience with real-time updates, fair matchmaking, and detailed performance insights.

---

## 🚀 Features

- 🔗 **Codeforces Integration** — Fetches user data and problems using the Codeforces Public API.
- ⚔️ **Duel System** — Create or join duels with synchronized problem sets and countdown timers.
- 📊 **Real-time Scoreboard** — Tracks verdicts, submissions, and rankings live during duels.
- 🧠 **Fair Problem Selection** — Balances difficulty based on rating history and solved problems.
- 🎯 **Smart Recommendations** — Suggests practice problems based on weak tags and unsolved history.
- 📈 **Post-Duel Insights** — Breakdown of accuracy, time to first solve, and solve/attempt ratio.

---

## 🛠️ Tech Stack

- **Frontend:** React + Material UI  
- **Backend:** Node.js / Express  
- **Database:** MongoDB  
- **External API:** Codeforces Public API

---

## 📦 Getting Started

Follow these steps to run Coding Sphere locally.

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/coding-sphere.git
cd coding-sphere
```

### 2️⃣ Setup the Backend
```bash
Copy
Edit
cd server
npm install


Create a .env file in the server/ directory:

bash
Copy
Edit
touch .env
Add the following environment variables inside .env:

env
Copy
Edit
PORT=5000
MONGO_URI=your_mongodb_connection_string

Start the backend server:
npm start
```
### 3️⃣ Setup the Frontend
```bash
Copy
Edit
cd ../client
npm install
npm start
```
4️⃣ Access the App
Visit the app in your browser:
```bash
http://localhost:3000
🤝 Contributing
Contributions are welcome! Please open an issue or a pull request for any improvements or bug fixes.
```
### 📄 License
This project is licensed under the MIT License.

