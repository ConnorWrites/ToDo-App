const apiUrl = 'http://localhost:3000/todos';

    // Fetch and display todos
    async function fetchTodos() {
      const res = await fetch(apiUrl);
      const todos = await res.json();
      const list = document.getElementById('todo-list');
      list.innerHTML = '';
      todos.forEach(todo => {
        const li = document.createElement('li');
        li.textContent = todo.text;
        li.className = todo.completed ? 'completed' : '';
        li.addEventListener('click', () => toggleTodo(todo._id));
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', e => {
          e.stopPropagation();
          deleteTodo(todo._id);
        });
        li.appendChild(delBtn);
        list.appendChild(li);
      });
    }

    // Add todo
    async function addTodo() {
      const input = document.getElementById('todo-input');
      if (!input.value) return;
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.value })
      });
      input.value = '';
      fetchTodos();
    }

    // Delete todo
    async function deleteTodo(id) {
      await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
      fetchTodos();
    }

    // Toggle completed
    async function toggleTodo(id) {
      await fetch(`${apiUrl}/${id}`, { method: 'PUT' });
      fetchTodos();
    }

    document.getElementById('add-btn').addEventListener('click', addTodo);

    // Initial load
    fetchTodos();
