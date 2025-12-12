import Comment from "../models/comments.model.js";
import Task from "../models/tasks.model.js";

export const getComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const comments = await Comment.find({ taskId })
      .populate("userId", "fullName email profilePicture") // Populate commenter details
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

export const addComment = async (req, res) => {
  try {
    const { taskId, content, mentions } = req.body;
    const userId = req.user.id; // User ID from auth middleware

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user is allowed to comment (Creator, Assigned, or Admin)
    const isCreator = task.createdBy.toString() === userId;
    const isAssigned = task.assignedUsers.some(
      (id) => id.toString() === userId,
    );
    const isAdmin = req.user.roles && req.user.roles.includes("Admin");

    if (!isCreator && !isAssigned && !isAdmin) {
      return res
        .status(403)
        .json({ message: "You are not authorized to comment on this task" });
    }

    const newComment = new Comment({
      taskId,
      userId,
      content,
      mentions: mentions || [],
    });

    await newComment.save();

    // Populate user details for immediate frontend display
    await newComment.populate("userId", "fullName email profilePicture");

    res.status(201).json({ comment: newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};
