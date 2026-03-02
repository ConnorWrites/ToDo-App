// ======================
// CONFIG
// ======================
const BASE_URL = "https://todo-backend-1xyq.onrender.com";
const apiUrl = `${BASE_URL}/todos`;

// ======================
// UI STATE
// ======================
function updateUI() {
  const token = localStorage.getItem("token");

  const authSection = document.getElementById("log");
  const todoSection = document.getElementById("todo-section");

  if (token) {
    authSection.style.display = "none";
    todoSection.style.display = "block";
  } else {
    authSection.style.display = "block";
    todoSection.style.display = "none";
  }
}

// ======================
// AUTH
// ======================
async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

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
    updateUI();
    fetchTodos();

  } catch (err) {
    console.error(err);
    alert("Server error during login");
  }
}

async function register() {
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Registration failed");
      return;
    }

    localStorage.setItem("token", data.token);
    updateUI();
    fetchTodos();

  } catch (err) {
    console.error(err);
    alert("Server error during registration");
  }
}

function logout() {
  localStorage.removeItem("token");
  updateUI();
}

// ======================
// AUTHENTICATED FETCH
// ======================
async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  return res.status === 204 ? null : res.json();
}

// ======================
// TODOS
// ======================
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
  const text = input.value.trim();

  if (!text) return;

  try {
    await apiFetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({ text })
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

// ======================
// EVENTS
// ======================
document.getElementById("login-btn").addEventListener("click", login);
document.getElementById("register-btn").addEventListener("click", register);
document.getElementById("add-btn").addEventListener("click", addTodo);

// ======================
// INIT
// ======================
updateUI();

if (localStorage.getItem("token")) {
  fetchTodos();
}