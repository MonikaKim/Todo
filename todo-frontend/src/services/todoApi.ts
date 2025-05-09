// src/services/todoApi.ts
import type { Todo, TodoApiPayload } from "@/types/todo";

const API_BASE_URL = '/api/api.php'; // Your PHP API endpoint

export const fetchTodos = async (): Promise<Todo[]> => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch todos and parse error' }));
    throw new Error(errorData.error || 'Failed to fetch todos');
  }
  return response.json();
};

export const createTodo = async (todoData: TodoApiPayload): Promise<Todo> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(todoData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create todo and parse error' }));
    throw new Error(errorData.error || 'Failed to create todo');
  }
  return response.json(); // PHP API returns the created todo
};

export const updateTodo = async (id: number, todoData: Partial<TodoApiPayload>): Promise<Todo> => {
  const payload = {
    _method: 'PUT',
    id,
    ...todoData,
  };
  const response = await fetch(API_BASE_URL, { // Or API_BASE_URL + `/${id}` if your API uses ID in URL for PUT
    method: 'POST', // Disguised as POST
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to update todo and parse error' }));
    throw new Error(errorData.error || 'Failed to update todo');
  }
  return response.json(); // PHP API returns the updated todo
};

export const deleteTodoApi = async (id: number): Promise<{ message: string }> => {
  const payload = {
    _method: 'DELETE',
    id,
  };
  const response = await fetch(API_BASE_URL, { // Or API_BASE_URL + `/${id}`
    method: 'POST', // Disguised as POST
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to delete todo and parse error' }));
    throw new Error(errorData.error || 'Failed to delete todo');
  }
  return response.json();
};