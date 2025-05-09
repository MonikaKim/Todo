// src/components/TodoForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format as formatDateFn, parseISO } from "date-fns"; // For date formatting and parsing

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Todo, TodoFormData, TodoStatus } from "@/types/todo"; // Updated types

// Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(1, "Task name cannot be empty"),
  due_date: z.date().nullable().optional(), // due_date is a Date object, optional
  status: z.enum(["pending", "in-progress", "completed"]),
});

// Type for form values inferred from Zod schema
type FormValues = z.infer<typeof formSchema>;

interface TodoFormProps {
  onSubmit: (data: TodoFormData) => void; // Expects TodoFormData
  initialData?: Partial<Todo>; // initialData from API might have due_date as string
  onCancel?: () => void;
}

export function TodoForm({ onSubmit, initialData, onCancel }: TodoFormProps) {
  const defaultDueDate = initialData?.due_date ? parseISO(initialData.due_date) : null;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      due_date: defaultDueDate,
      status: initialData?.status || "pending",
    },
  });

  const handleSubmit = (values: FormValues) => {
    // The form values already match TodoFormData structure (due_date is Date or null)
    onSubmit(values as TodoFormData);
    // form.reset(); // Resetting here might be too soon if dialog closes on submit
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Name</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Buy groceries" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        formatDateFn(field.value, "PPP") // e.g., May 8th, 2025
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ?? undefined} // Handle null explicitly for selected
                    onSelect={(date) => field.onChange(date || null)} // Pass null if date is cleared
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} // Disable past dates
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value as TodoStatus}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {initialData?.id ? "Update Task" : "Add Task"}
          </Button>
        </div>
      </form>
    </Form>
  );
}