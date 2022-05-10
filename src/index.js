const express = require('express');
const cors = require('cors');
const fs = require('fs');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // Complete aqui
  const { username } = request.headers;

  const userExist = users.find((user) => user.username === username);

  if (!userExist) {
    return response.status(404).json({
      error: 'Username not found',
    });
  }

  request.user = userExist;
  next();
}

app.post('/users', (request, response) => {
  // Complete aqui
  const { username, name } = request.body;

  const userAlreadyExist = users.some((user) => user.username === username);

  if (userAlreadyExist) {
    return response.status(400).json({
      error: 'User already registered',
    });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(newUser);

  response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;
  console.log(user);
  response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  users.forEach((usr, index) => {
    if (usr.username === user.username) {
      return users[index].todos.push(newTodo);
    }
    return usr;
  });

  response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { id: todoId } = request.params;
  const { deadline, title } = request.body;
  const { user } = request;

  const todoToUpdateIndex = user.todos.findIndex((todo) => todo.id === todoId);

  console.log(todoId);
  if (todoToUpdateIndex < 0) {
    return response.status(404).json({
      error: 'Todo not found',
    });
  }

  if (deadline) {
    user.todos[todoToUpdateIndex].deadline = new Date(deadline);
  }

  if (title) {
    user.todos[todoToUpdateIndex].title = title;
  }

  users.forEach((usr, index) => {
    if (usr.username === user.username) {
      users[index] = user;
    }
  });

  response.json(user.todos[todoToUpdateIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { id } = request.params;
  const { user } = request;

  const updatedTodo = user.todos.find((todo) => todo.id === id);

  if (!updatedTodo) {
    return response.status(404).json({ error: 'Todo not found' });
  }
  updatedTodo.done = true;

  const updatedTodos = user.todos.filter((todo) => todo.id !== id);
  updatedTodos.push(updatedTodo);

  users.map((usr, index) => {
    if (usr.username === user.usernmae) {
      users[index].todos = updatedTodos;
    }
    return usr;
  });

  response.json(updatedTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { id } = request.params;
  const { user } = request;

  const updatedTodo = user.todos.find((todo) => todo.id === id);

  if (!updatedTodo) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  const updatedTodos = user.todos.filter((todo) => todo.id !== id);

  users.map((usr, index) => {
    if (usr.username === user.username) {
      users[index].todos = updatedTodos;
    }
    return usr;
  });

  response.status(204).send();
});

module.exports = app;
