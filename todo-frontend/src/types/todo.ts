export type TodoStatus = "pending" | "in-progress" | "completed";

export interface Todo {
  id: number; // Matches backend auto-incremented integer ID
  name: string;
  due_date?: string | null; // ISO string from API (e.g., "YYYY-MM-DD HH:MM:SS")
  status: TodoStatus;
  created_at: string; // ISO string from API
  // is_active is handled by backend filtering, not usually part of the Todo object in frontend list
}

// Type for data coming from the form (due_date as Date object)
export interface TodoFormData {
  name: string;
  due_date?: Date | null;
  status: TodoStatus;
}

// Type for data sent to the API (due_date converted to string)
export interface TodoApiPayload {
  name: string;
  due_date?: string | null; // YYYY-MM-DD HH:MM:SS
  status: TodoStatus;
}