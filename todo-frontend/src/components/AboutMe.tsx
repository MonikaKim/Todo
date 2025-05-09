// src/components/AboutMe.tsx
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge"; // Added Badge for technologies
  
  export function AboutMe() {
    // --- (Developer: Please fill in your details here!) ---
    const developerName = "Kim Monika"; // Replace this
    const developerTitle = "Developer"; // Replace or adjust
    const developerBio = `
      Hello! I'm ${developerName}, the developer behind this Todo application.
I enjoy creating intuitive and efficient web solutions. This interactive Todo List
application showcases a complete full-stack development experience. It features a
responsive React frontend built with TypeScript and styled with Shadcn/ui,
communicating with a robust PHP backend API that manages tasks in a MySQL
database. You can add, update, view, and delete your tasks seamlessly.
  `;
  
    const frontendTech = ["React", "TypeScript", "Vite", "Shadcn/ui", "Tailwind CSS", "date-fns", "Lucide React Icons"];
    const backendTech = ["PHP", "PDO for MySQL"];
    const databaseTech = ["MySQL"];
    const concepts = ["RESTful API", "Client-Server Architecture", "CRUD Operations", "Component-Based UI"];
  
    return (
      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">{developerName}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            {developerTitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground whitespace-pre-line">{developerBio}</p>
          </div>
  
          <div className="space-y-4">
            <div>
              <h3 className="text-xl text-center font-semibold mb-2">Technologies Used</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-center text-primary">Frontend:</h4>
                  <div className="flex flex-wrap justify-center gap-2 mt-1">
                    {frontendTech.map(tech => <Badge key={tech} variant="secondary">{tech}</Badge>)}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-center text-primary">Backend:</h4>
                  <div className="flex flex-wrap justify-center gap-2 mt-1">
                    {backendTech.map(tech => <Badge key={tech} variant="secondary">{tech}</Badge>)}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-center text-primary">Database:</h4>
                  <div className="flex flex-wrap justify-center gap-2 mt-1">
                    {databaseTech.map(tech => <Badge key={tech} variant="secondary">{tech}</Badge>)}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-center text-primary">Concepts & Architecture:</h4>
                  <div className="flex flex-wrap justify-center gap-2 mt-1">
                    {concepts.map(tech => <Badge key={tech} variant="secondary">{tech}</Badge>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }