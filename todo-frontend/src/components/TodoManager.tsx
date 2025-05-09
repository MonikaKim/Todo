// src/components/TodoManager.tsx
import { useState, useEffect, useCallback } from "react";
import type { Todo, TodoFormData, TodoApiPayload } from "@/types/todo";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription as FormDialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Removed Switch and Label imports for API toggle
import { TodoForm } from "./TodoForm";
import { Pencil, Trash2, PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as api from '@/services/todoApi';
import { format as formatDateFn } from 'date-fns';

// Helper to format Date to 'YYYY-MM-DD HH:MM:SS' for backend (remains the same)
const formatDateTimeForApi = (date?: Date | null): string | undefined => {
  if (!date) return undefined;
  const d = new Date(date);
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export function TodoManager() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [todoIdToDelete, setTodoIdToDelete] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const loadTodos = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedTodos = await api.fetchTodos();
      setTodos(fetchedTodos.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      toast.error("Error fetching todos", {
        description: error instanceof Error ? error.message : "Could not connect to API.",
      });
      setTodos([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]); // Dependency array simplified

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleAddTodo = async (formData: TodoFormData) => {
    const apiPayload: TodoApiPayload = {
      name: formData.name,
      due_date: formatDateTimeForApi(formData.due_date),
      status: formData.status,
    };

    setIsLoading(true);
    try {
      const newTodo = await api.createTodo(apiPayload);
      setTodos((prevTodos) => [newTodo, ...prevTodos].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      toast.success(`Todo "${newTodo.name}" added.`);
      setIsAddDialogOpen(false); // Close dialog on success
      // Form reset is handled by key prop or could be done here if form instance is available
    } catch (error) {
      toast.error("API Error", {description: `Failed to add todo: ${error instanceof Error ? error.message : "Unknown error"}`});
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTodo = async (formData: TodoFormData) => {
    if (!editingTodo) return;

    const apiPayload: Partial<TodoApiPayload> = {
      name: formData.name,
      due_date: formatDateTimeForApi(formData.due_date),
      status: formData.status,
    };

    setIsLoading(true);
    try {
      const updatedTodo = await api.updateTodo(editingTodo.id, apiPayload);
      setTodos((prevTodos) =>
        prevTodos.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      );
      toast.success(`Todo "${updatedTodo.name}" updated.`);
      setIsEditDialogOpen(false); // Close dialog on success
      setEditingTodo(null);
    } catch (error) {
      toast.error("API Error",{ description: `Failed to update todo: ${error instanceof Error ? error.message : "Unknown error"}`});
    } finally {
      setIsLoading(false);
    }
  };

  const requestDeleteConfirmation = (id: number) => {
    setTodoIdToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTodo = async () => {
    if (todoIdToDelete === null) return;
    const todoToDelete = todos.find(todo => todo.id === todoIdToDelete);

    setIsLoading(true);
    try {
      await api.deleteTodoApi(todoIdToDelete);
      setTodos((prevTodos) => prevTodos.filter((t) => t.id !== todoIdToDelete));
      toast(`Todo "${todoToDelete?.name || ''}" deleted.`);
      setIsDeleteDialogOpen(false); // Close dialog on success
      setTodoIdToDelete(null);
    } catch (error) {
      toast.error("API Error", {description: `Failed to delete todo: ${error instanceof Error ? error.message : "Unknown error"}` });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (todo: Todo) => {
    setEditingTodo(todo);
    setIsEditDialogOpen(true);
  };

  const formatDateDisplay = (dateString?: string | null): string => {
    if (!dateString) return "N/A";
    try {
      const dateObj = new Date(dateString.includes('T') ? dateString : dateString.replace(' ', 'T'));
      if (isNaN(dateObj.getTime())) return "Invalid Date String"; // More specific error
      return formatDateFn(dateObj, "PPp"); // e.g., May 8, 2025, 3:30 PM
    } catch (e) {
      return "Date Formatting Error";
    }
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
          <div>
            <CardTitle className="text-2xl font-bold">My Todo List</CardTitle>
            <CardDescription>Manage your tasks efficiently.</CardDescription> {/* Removed API/Local mode text */}
          </div>
          {/* Removed API Switch and Label */}
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  Add Todo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Todo</DialogTitle>
                  <FormDialogDescription>
                    Fill in the details below to add a new task.
                  </FormDialogDescription>
                </DialogHeader>
                <TodoForm
                  onSubmit={handleAddTodo}
                  onCancel={() => setIsAddDialogOpen(false)}
                  key={isAddDialogOpen ? 'add-form-open' : 'add-form-closed'}
                />
              </DialogContent>
            </Dialog>
          </div>

          {isLoading && todos.length === 0 ? ( // Show loader if loading and no todos yet
            <div className="text-center py-10">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">Loading todos...</p>
            </div>
          ) : todos.length === 0 && !isLoading ? ( // Show no todos message if not loading and list is empty
            <div className="text-center text-gray-500 dark:text-gray-400 py-10">
              <p className="text-lg">No todos yet.</p>
              <p>Click "Add Todo" to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%] min-w-[150px]">Task Name</TableHead>
                    <TableHead className="w-[20%] min-w-[120px]">Due Date</TableHead>
                    <TableHead className="w-[15%] min-w-[100px] text-center">Status</TableHead>
                    <TableHead className="w-[20%] min-w-[150px]">Created At</TableHead>
                    <TableHead className="w-[15%] min-w-[120px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todos.map((todo) => (
                    <TableRow key={todo.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium py-3">{todo.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground py-3">{formatDateDisplay(todo.due_date)}</TableCell>
                      <TableCell className="text-center py-3">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full
                            ${todo.status === "pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300 border border-yellow-500/50" : ""}
                            ${todo.status === "in-progress" ? "bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-300 border border-blue-500/50" : ""}
                            ${todo.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300 border border-green-500/50" : ""}`}
                        >
                          {todo.status.charAt(0).toUpperCase() + todo.status.slice(1).replace("-", " ")}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground py-3">{formatDateDisplay(todo.created_at)}</TableCell>
                      <TableCell className="text-right space-x-2 py-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(todo)}
                          aria-label="Edit todo"
                          className="hover:bg-accent"
                          disabled={isLoading}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => requestDeleteConfirmation(todo.id)}
                          aria-label="Delete todo"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingTodo && (
        <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
          setIsEditDialogOpen(isOpen);
          if (!isOpen) setEditingTodo(null);
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Todo</DialogTitle>
              <FormDialogDescription>
                Update the details of your task below.
              </FormDialogDescription>
            </DialogHeader>
            <TodoForm
              onSubmit={handleUpdateTodo}
              initialData={editingTodo}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingTodo(null);
              }}
              key={editingTodo ? `edit-form-${editingTodo.id}`: 'edit-form-closed'}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              todo task: <span className="font-semibold">{todos.find(t => t.id === todoIdToDelete)?.name || 'this task'}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTodoIdToDelete(null)} disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTodo} disabled={isLoading} className={isLoading ? "bg-destructive/50" : ""}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}