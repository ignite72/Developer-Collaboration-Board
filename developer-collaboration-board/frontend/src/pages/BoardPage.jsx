import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { priorityOptions, statusOptions } from "../data";

const emptyTask = {
  title: "",
  project: "",
  assignedTo: "",
  priority: "Medium",
  status: "Todo",
  dueDate: "",
  notes: ""
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function BoardPage({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", status: "All" });
  const [activeColumn, setActiveColumn] = useState("All");
  const [form, setForm] = useState(emptyTask);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editForm, setEditForm] = useState(emptyTask);
  const [commentForms, setCommentForms] = useState({});
  const [assignableUsers, setAssignableUsers] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const canCreateTasks = user?.role === "admin";

  useEffect(() => {
    async function fetchTasks() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Please log in again to view tasks");
        }

        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  useEffect(() => {
    async function fetchAssignableUsers() {
      if (!canCreateTasks) {
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to load members");
        }

        const users = await response.json();
        setAssignableUsers(users);

        if (users.length > 0) {
          setForm((current) => ({
            ...current,
            assignedTo: current.assignedTo || users[0].id
          }));
        }
      } catch (error) {
        console.error("Failed to fetch assignable users:", error);
      }
    }

    fetchAssignableUsers();
  }, [canCreateTasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const search = filters.search.toLowerCase();
      const matchesSearch =
        task.title.toLowerCase().includes(search) ||
        task.project.toLowerCase().includes(search) ||
        task.assignee.toLowerCase().includes(search) ||
        (task.assigneeEmail || "").toLowerCase().includes(search);

      const matchesStatus =
        filters.status === "All" || task.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, filters]);

  const tasksByStatus = useMemo(() => {
    return statusOptions.reduce((groups, status) => {
      groups[status] = filteredTasks.filter((task) => task.status === status);
      return groups;
    }, {});
  }, [filteredTasks]);

  const visibleStatuses =
    activeColumn === "All" ? statusOptions : [activeColumn];

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter((task) => task.status === "Todo").length,
      progress: tasks.filter((task) => task.status === "In Progress").length,
      done: tasks.filter((task) => task.status === "Done").length
    };
  }, [tasks]);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleEditFormChange(event) {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  }

  function handleCommentChange(taskId, value) {
    setCommentForms((current) => ({
      ...current,
      [taskId]: value
    }));
  }

  async function handleAddTask(event) {
    event.preventDefault();

    if (!canCreateTasks) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const newTask = await response.json();
      setTasks((current) => [newTask, ...current]);
      setForm(emptyTask);
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  }

  async function handleStatusChange(taskId, status) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/tasks/${taskId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update task status");
      }

      const updatedTask = await response.json();
      setTasks((current) =>
        current.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  }

  function startEditTask(task) {
    setEditingTaskId(task.id);
    setEditForm({
      title: task.title,
      project: task.project,
      assignedTo: task.assignedTo || "",
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      notes: task.notes || ""
    });
  }

  function cancelEditTask() {
    setEditingTaskId(null);
    setEditForm(emptyTask);
  }

  async function handleUpdateTask(event) {
    event.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/tasks/${editingTaskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(editForm)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update task");
      }

      const updatedTask = await response.json();
      setTasks((current) =>
        current.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      cancelEditTask();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  }

  async function handleDeleteTask(taskId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete task");
      }

      setTasks((current) => current.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  }

  async function handleAddComment(event, taskId) {
    event.preventDefault();

    const text = commentForms[taskId]?.trim();

    if (!text) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/tasks/${taskId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ text })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add comment");
      }

      const updatedTask = await response.json();
      setTasks((current) =>
        current.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      handleCommentChange(taskId, "");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
    navigate("/login");
  }

  return (
    <div className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Software Developer Project</p>
          <h1>Developer Collaboration Board</h1>
          <p className="hero-copy">
            Manage projects, assign tasks, track progress, and keep teamwork
            visible in one focused workspace.
          </p>
        </div>

        <div className="hero-actions">
          <div className="hero-chip">
            {user ? `Welcome, ${user.name}` : "Team workflow starter"}
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="stats-grid">
        <StatCard label="Total Tasks" value={stats.total} />
        <StatCard label="Todo" value={stats.todo} />
        <StatCard label="In Progress" value={stats.progress} />
        <StatCard label="Done" value={stats.done} />
      </section>

      <main className="content-grid">
        <section className="panel">
          <div className="panel-head">
            <h2>Create Task</h2>
            <p>
              {canCreateTasks
                ? "Add work items with project, assignee, priority, and notes."
                : "You have member access. Ask an admin to create or assign tasks."}
            </p>
          </div>

          {canCreateTasks ? (
            <form className="job-form" onSubmit={handleAddTask}>
              <label>
                Task Title
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="Enter task title"
                  required
                />
              </label>

              <label>
                Project
                <input
                  name="project"
                  value={form.project}
                  onChange={handleFormChange}
                  placeholder="Enter project name"
                  required
                />
              </label>

              <div className="form-row">
                <label>
                  Status
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Priority
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleFormChange}
                  >
                    {priorityOptions.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  Assign To
                  <select
                    name="assignedTo"
                    value={form.assignedTo}
                    onChange={handleFormChange}
                    required
                  >
                    {assignableUsers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.role})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Due Date
                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleFormChange}
                    required
                  />
                </label>
              </div>

              <label>
                Notes
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleFormChange}
                  placeholder="Add short notes about the task"
                  rows="4"
                />
              </label>

              <button type="submit" disabled={assignableUsers.length === 0}>
                {assignableUsers.length === 0 ? "No Members Found" : "Create Task"}
              </button>
            </form>
          ) : (
            <div className="member-notice">
              <strong>Read-only member mode</strong>
              <p>Members can view the board. Only admins can create tasks.</p>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Team Board</h2>
            <p>Filter the workflow and review current delivery progress.</p>
          </div>

          <div className="filters">
            <input
              type="search"
              placeholder="Search task, project, or assignee"
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  search: event.target.value
                }))
              }
            />

            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status: event.target.value
                }))
              }
            >
              <option value="All">All Columns</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="kanban-tabs" aria-label="Kanban status views">
            <button
              type="button"
              className={activeColumn === "All" ? "active-tab" : ""}
              onClick={() => setActiveColumn("All")}
            >
              All
            </button>
            {statusOptions.map((status) => (
              <button
                type="button"
                key={status}
                className={activeColumn === status ? "active-tab" : ""}
                onClick={() => setActiveColumn(status)}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="kanban-board">
            {loading ? (
              <p>Loading tasks...</p>
            ) : (
              visibleStatuses.map((status) => (
                <section className="kanban-column" key={status}>
                  <div className="kanban-column-head">
                    <h3>{status}</h3>
                    <span>{tasksByStatus[status]?.length || 0}</span>
                  </div>

                  <div className="kanban-column-list">
                    {tasksByStatus[status]?.length ? (
                      tasksByStatus[status].map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          canCreateTasks={canCreateTasks}
                          editingTaskId={editingTaskId}
                          editForm={editForm}
                          assignableUsers={assignableUsers}
                          commentForms={commentForms}
                          onEditFormChange={handleEditFormChange}
                          onUpdateTask={handleUpdateTask}
                          onCancelEdit={cancelEditTask}
                          onStartEdit={startEditTask}
                          onDeleteTask={handleDeleteTask}
                          onStatusChange={handleStatusChange}
                          onCommentChange={handleCommentChange}
                          onAddComment={handleAddComment}
                        />
                      ))
                    ) : (
                      <p className="empty-column">No tasks here.</p>
                    )}
                  </div>
                </section>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function TaskCard({
  task,
  canCreateTasks,
  editingTaskId,
  editForm,
  assignableUsers,
  commentForms,
  onEditFormChange,
  onUpdateTask,
  onCancelEdit,
  onStartEdit,
  onDeleteTask,
  onStatusChange,
  onCommentChange,
  onAddComment
}) {
  if (editingTaskId === task.id) {
    return (
      <article className="job-card">
        <form className="edit-task-form" onSubmit={onUpdateTask}>
          <label>
            Task Title
            <input
              name="title"
              value={editForm.title}
              onChange={onEditFormChange}
              required
            />
          </label>

          <label>
            Project
            <input
              name="project"
              value={editForm.project}
              onChange={onEditFormChange}
              required
            />
          </label>

          <div className="form-row">
            <label>
              Assign To
              <select
                name="assignedTo"
                value={editForm.assignedTo}
                onChange={onEditFormChange}
                required
              >
                {assignableUsers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Status
              <select
                name="status"
                value={editForm.status}
                onChange={onEditFormChange}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Priority
              <select
                name="priority"
                value={editForm.priority}
                onChange={onEditFormChange}
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Due Date
              <input
                type="date"
                name="dueDate"
                value={editForm.dueDate}
                onChange={onEditFormChange}
                required
              />
            </label>
          </div>

          <label>
            Notes
            <textarea
              name="notes"
              value={editForm.notes}
              onChange={onEditFormChange}
              rows="3"
            />
          </label>

          <div className="task-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={onCancelEdit}>
              Cancel
            </button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article className="job-card">
      <div className="job-topline">
        <div>
          <h3>{task.title}</h3>
          <p>{task.project}</p>
        </div>
        <span
          className={`status-badge status-${task.status
            .toLowerCase()
            .replace(/\s+/g, "-")}`}
        >
          {task.status}
        </span>
      </div>

      <div className="job-meta">
        <span>{task.assignee}</span>
        {task.assigneeEmail ? <span>{task.assigneeEmail}</span> : null}
        <span>{task.priority} Priority</span>
        <span>{task.dueDate}</span>
      </div>

      <p className="job-notes">{task.notes}</p>

      <label className="status-control">
        Status
        <select
          value={task.status}
          onChange={(event) => onStatusChange(task.id, event.target.value)}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      {canCreateTasks ? (
        <div className="task-actions">
          <button type="button" onClick={() => onStartEdit(task)}>
            Edit
          </button>
          <button
            type="button"
            className="danger-button"
            onClick={() => onDeleteTask(task.id)}
          >
            Delete
          </button>
        </div>
      ) : null}

      <section className="comments-section">
        <h4>Comments</h4>
        <div className="comments-list">
          {task.comments?.length ? (
            task.comments.map((comment) => (
              <article className="comment-card" key={comment.id}>
                <div>
                  <strong>{comment.author.name}</strong>
                  <span>{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p>{comment.text}</p>
              </article>
            ))
          ) : (
            <p className="empty-comments">No comments yet.</p>
          )}
        </div>

        <form
          className="comment-form"
          onSubmit={(event) => onAddComment(event, task.id)}
        >
          <input
            value={commentForms[task.id] || ""}
            onChange={(event) => onCommentChange(task.id, event.target.value)}
            placeholder="Write a short update"
          />
          <button type="submit">Comment</button>
        </form>
      </section>
    </article>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="stat-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

export default BoardPage;
