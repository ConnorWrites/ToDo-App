// ======================
// CONFIG
// ======================
const BASE_URL = "https://todo-backend-1xyq.onrender.com";
const apiUrl = `${BASE_URL}/todos`;
let spinnerTimeout = null;

// ======================
// SPINNER
// ======================
function showSpinner() {
  spinnerTimeout = setTimeout(() => {
    document
      .getElementById("spinner-overlay")
      .classList.remove("hidden");
  }, 300);
}

function hideSpinner() {
  clearTimeout(spinnerTimeout);
  spinnerTimeout = null;
  document
    .getElementById("spinner-overlay")
    .classList.add("hidden");
}

function setButtonsDisabled(disabled) {
  document.querySelectorAll("button").forEach(btn => {
    btn.disabled = disabled;
  });
}

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

  showSpinner();
  setButtonsDisabled(true);

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    localStorage.setItem("token", data.token);
    updateUI();
    await fetchTodos();
  } catch (err) {
    alert(err.message);
  } finally {
    hideSpinner();
    setButtonsDisabled(false);
  }
}

async function register() {
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  showSpinner();
  setButtonsDisabled(true);

  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Registration failed");
    }

    localStorage.setItem("token", data.token);
    updateUI();
    await fetchTodos();
  } catch (err) {
    alert(err.message);
  } finally {
    hideSpinner();
    setButtonsDisabled(false);
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
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    throw new Error(await res.text());
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
  await apiFetch(`${apiUrl}/${id}`, { method: "DELETE" });
  fetchTodos();
}

async function toggleTodo(id) {
  await apiFetch(`${apiUrl}/${id}`, { method: "PUT" });
  fetchTodos();
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
if (localStorage.getItem("token")) fetchTodos();