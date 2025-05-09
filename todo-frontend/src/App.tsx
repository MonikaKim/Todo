// src/App.tsx
import { useState } from "react"; // Import useState
import { TodoManager } from "./components/TodoManager";
import { AboutMe } from "./components/AboutMe"; // Import AboutMe
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button"; // Import Button
import { Separator } from "@/components/ui/separator"; // Optional: for visual separation
import "./App.css";
import logo from './assets/todo-list-svgrepo-com.svg'; 
function App() {
  const [currentView, setCurrentView] = useState<'todos' | 'about'>('todos');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-4xl mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <img src={logo} alt="TaskToDo Logo" className="w-8 h-8" />
            <h1 className="text-4xl font-bold text-primary pb-2 sm:pb-0">TaskToDo</h1>
          </div>
          <nav className="flex space-x-2">
            <Button
              onClick={() => setCurrentView('todos')}
              variant={currentView === 'todos' ? 'default' : 'outline'}
              size="sm"
            >
              Todo List
            </Button>
            <Button
              onClick={() => setCurrentView('about')}
              variant={currentView === 'about' ? 'default' : 'outline'}
              size="sm"
            >
              About Me
            </Button>
          </nav>
        </div>
        <Separator /> {/* Optional: Adds a horizontal line */}
      </header>

      <main className="w-full">
        {currentView === 'todos' && <TodoManager />}
        {currentView === 'about' && <AboutMe />}
      </main>

      <Toaster position="top-center" />
      <footer className="w-full max-w-4xl mt-12 text-center text-sm text-muted-foreground">
        <Separator className="mb-4"/>
        <p>&copy; {new Date().getFullYear()} Kim Monika ToDo App. All rights reserved.</p>
        <p>Built with React, PHP, and Shadcn/ui.</p>
      </footer>
    </div>
  );
}

export default App;