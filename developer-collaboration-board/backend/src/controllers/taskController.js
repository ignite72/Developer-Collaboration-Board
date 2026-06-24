import Task from "../models/task.js";

function formatTask(task) {
  return {
    id: task._id,
    title: task.title,
    project: task.project,
    assignee: task.assignedTo?.name || "Unassigned",
    assigneeEmail: task.assignedTo?.email || "",
    assignedTo: task.assignedTo?._id,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate,
    notes: task.notes,
    createdBy: task.createdBy,
    comments: (task.comments || []).map((comment) => ({
      id: comment._id,
      text: comment.text,
      createdAt: comment.createdAt,
      author: {
        id: comment.author?._id,
        name: comment.author?.name || "Unknown user",
        email: comment.author?.email || ""
      }
    }))
  };
}

function canAccessTask(req, task) {
  return (
    req.userRole === "admin" ||
    task.assignedTo.toString() === req.user._id.toString()
  );
}

function populateTask(taskId) {
  return Task.findById(taskId)
    .populate("assignedTo", "name email")
    .populate("comments.author", "name email");
}

export async function getTasks(req, res) {
  try {
    const query =
      req.userRole === "admin" ? {} : { assignedTo: req.user._id };

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email")
      .populate("comments.author", "name email")
      .sort({ createdAt: -1 });

    return res.json(tasks.map(formatTask));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load tasks",
      error: error.message
    });
  }
}

export async function createTask(req, res) {
  try {
    const { title, project, assignedTo, priority, status, dueDate, notes } =
      req.body;

    if (!title || !project || !assignedTo || !priority || !status || !dueDate) {
      return res.status(400).json({
        message:
          "title, project, assignedTo, priority, status, and dueDate are required"
      });
    }

    const task = await Task.create({
      title,
      project,
      assignedTo,
      priority,
      status,
      dueDate,
      notes: notes || "",
      createdBy: req.user._id
    });

    const populatedTask = await populateTask(task._id);

    return res.status(201).json(formatTask(populatedTask));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create task",
      error: error.message
    });
  }
}

export async function updateTaskStatus(req, res) {
  try {
    const { status } = req.body;

    if (!["Todo", "In Progress", "Review", "Done"].includes(status)) {
      return res.status(400).json({
        message: "Invalid task status"
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    if (!canAccessTask(req, task)) {
      return res.status(403).json({
        message: "You can only update tasks assigned to you"
      });
    }

    task.status = status;
    await task.save();

    const populatedTask = await populateTask(task._id);

    return res.json(formatTask(populatedTask));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update task status",
      error: error.message
    });
  }
}

export async function updateTask(req, res) {
  try {
    const { title, project, assignedTo, priority, status, dueDate, notes } =
      req.body;

    if (!title || !project || !assignedTo || !priority || !status || !dueDate) {
      return res.status(400).json({
        message:
          "title, project, assignedTo, priority, status, and dueDate are required"
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    task.title = title;
    task.project = project;
    task.assignedTo = assignedTo;
    task.priority = priority;
    task.status = status;
    task.dueDate = dueDate;
    task.notes = notes || "";

    await task.save();

    const populatedTask = await populateTask(task._id);

    return res.json(formatTask(populatedTask));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update task",
      error: error.message
    });
  }
}

export async function deleteTask(req, res) {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    await task.deleteOne();

    return res.json({
      message: "Task deleted successfully",
      id: req.params.id
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete task",
      error: error.message
    });
  }
}

export async function addTaskComment(req, res) {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Comment text is required"
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    if (!canAccessTask(req, task)) {
      return res.status(403).json({
        message: "You can only comment on tasks assigned to you"
      });
    }

    task.comments.push({
      text: text.trim(),
      author: req.user._id
    });

    await task.save();

    const populatedTask = await populateTask(task._id);

    return res.status(201).json(formatTask(populatedTask));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add comment",
      error: error.message
    });
  }
}
