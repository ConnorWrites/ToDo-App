// config
const BASE_URL = "https://todo-backend-1xyq.onrender.com";
const apiUrl = `${BASE_URL}/todos`;

// --- LOGIN ---
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);
    alert("Logged in!");
    fetchTodos();

  } catch (err) {
    console.error(err);
    alert("Server error during login");
  }
}

document.getElementById("login-btn").addEventListener("click", login);

// --- HELPER FUNCTION FOR AUTHENTICATED REQUESTS ---
async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No auth token found. Please log in.");
  }

  const defaultHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const fetchOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  const res = await fetch(url, fetchOptions);

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API error: ${error}`);
  }

  return res.status !== 204 ? res.json() : null;
}

// --- TODOS FUNCTIONS ---
async function fetchTodos() {
  try {
    const todos = await apiFetch(apiUrl);
    const list = document.getElementById("todo-list");
    list.innerHTML = "";

    todos.forEach(todo => {
      const li = document.createElement("li");
      li.textContent = todo.text;
      li.className = todo.completed ? "completed" : "";

      li.addEventListener("click", () => toggleTodo(todo._id));

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", e => {
        e.stopPropagation();
        deleteTodo(todo._id);
      });

      li.appendChild(delBtn);
      list.appendChild(li);
    });

  } catch (err) {
    console.error(err.message);
  }
}

async function addTodo() {
  const input = document.getElementById("todo-input");
  if (!input.value.trim()) return;

  try {
    await apiFetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({ text: input.value })
    });

    input.value = "";
    fetchTodos();

  } catch (err) {
    console.error(err.message);
  }
}

async function deleteTodo(id) {
  try {
    await apiFetch(`${apiUrl}/${id}`, { method: "DELETE" });
    fetchTodos();
  } catch (err) {
    console.error(err.message);
  }
}

async function toggleTodo(id) {
  try {
    await apiFetch(`${apiUrl}/${id}`, { method: "PUT" });
    fetchTodos();
  } catch (err) {
    console.error(err.message);
  }
}

// --- EVENTS ---
document.getElementById("add-btn").addEventListener("click", addTodo);

// --- LOAD TODOS IF TOKEN EXISTS ---
if (localStorage.getItem("token")) {
  fetchTodos();
}