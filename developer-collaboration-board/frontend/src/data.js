export const initialTasks = [
  {
    id: 1,
    title: "Build login page UI",
    project: "DevBoard",
    assignee: "Avinash",
    priority: "High",
    status: "In Progress",
    dueDate: "2026-06-20",
    notes: "Finish responsive layout and form validation."
  },
  {
    id: 2,
    title: "Design task API routes",
    project: "DevBoard",
    assignee: "Rohit",
    priority: "Medium",
    status: "Todo",
    dueDate: "2026-06-22",
    notes: "Create task schema and basic CRUD endpoints."
  },
  {
    id: 3,
    title: "Connect comments panel",
    project: "SprintFlow",
    assignee: "Neha",
    priority: "Low",
    status: "Done",
    dueDate: "2026-06-18",
    notes: "Comments are stored locally for the first demo version."
  }
];

export const statusOptions = ["Todo", "In Progress", "Review", "Done"];
export const priorityOptions = ["Low", "Medium", "High"];
