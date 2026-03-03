// ======================
// CONFIG
// ======================
const BASE_URL = "https://todo-backend-1xyq.onrender.com";
const apiUrl = `${BASE_URL}/todos`;
let spinnerTimeout = null;

// ======================
// SPINNER + UI LOCK
// ======================
function showSpinner() {
  if (spinnerTimeout) return;

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
    if (!res.ok) throw new Error(data.message || "Login failed");

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
    if (!res.ok) throw new Error(data.error || "Registration failed");

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

    if (!todos.length) {
      const empty = document.createElement("li");
      empty.textContent =
        "You don't have any todos yet! Add your first one above 👆";
      empty.classList.add("empty-state");
      list.appendChild(empty);
      return;
    }

    todos.forEach(todo => {
      const li = document.createElement("li");
      li.tabIndex = 0;
      
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.completed;
      checkbox.addEventListener("change", () =>
        toggleTodo(todo._id)
      );

      const text = document.createElement("span");
      text.textContent = todo.text;

      if(todo.completed) {
        text.classList.add("completed"); // **Last change to cross out text and not delete button
      }

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", e => {
        e.stopPropagation();
        deleteTodo(todo._id);
      });

      li.appendChild(checkbox);
      li.appendChild(text);
      li.appendChild(delBtn);
      list.appendChild(li);


 li.addEventListener("keydown", e => {
        if (e.key === "Delete" || e.key === "Backspace")  {
          deleteTodo(todo._id);
        }});
    });
  } catch (err) {
    console.error(err.message);
  }
}

async function addTodo() {
  const input = document.getElementById("todo-input");
  const text = input.value.trim();

  if (!text) return;
  if (text.length < 2) {
    alert("Todo must be at least 2 characters long");
    return;
  }

  showSpinner();
  setButtonsDisabled(true);

  try {
    await apiFetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({ text })
    });

    input.value = "";
    await fetchTodos();
  } catch (err) {
    console.error(err.message);
  } finally {
    hideSpinner();
    setButtonsDisabled(false);
  }
}

async function deleteTodo(id) {
  showSpinner();
  setButtonsDisabled(true);

  try {
    await apiFetch(`${apiUrl}/${id}`, { method: "DELETE" });
    await fetchTodos();
  } catch (err) {
    console.error(err.message);
  } finally {
    hideSpinner();
    setButtonsDisabled(false);
  }
}

async function toggleTodo(id) {
  showSpinner();
  setButtonsDisabled(true);

  try {
    await apiFetch(`${apiUrl}/${id}`, { method: "PUT" });
    await fetchTodos();
  } catch (err) {
    console.error(err.message);
  } finally {
    hideSpinner();
    setButtonsDisabled(false);
  }
}

// ======================
// EVENTS
// ======================
document.getElementById("login-btn").addEventListener("click", login);
document.getElementById("register-btn").addEventListener("click", register);
document.getElementById("add-btn").addEventListener("click", addTodo);
document.getElementById("todo-input").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    addTodo();
  }
});
["email", "password"].forEach(id => {
  document.getElementById(id).addEventListener("keydown", e => {
    if (e.key === "Enter") {
      login();
    }
  });
});
["reg-email", "reg-password"].forEach(id => {
  document.getElementById(id).addEventListener("keydown", e => {
    if (e.key === "Enter") {
      register();
    }
  });
});
// ======================
// INIT
// ======================
updateUI();
if (localStorage.getItem("token")) {
  fetchTodos();
}