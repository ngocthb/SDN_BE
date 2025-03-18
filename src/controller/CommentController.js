const CommentService = require("../services/CommentService.js");
const UserModel = require("../models/UserModel.js");

const checkRole = async (userID) => {
  try {
    const user = await UserModel.findById(userID).populate(
      "role_id",
      "name -_id"
    );
    if (!user) {
      return { status: "ERR", message: "User not found" };
    }

    return { status: "OK", role: user.role_id.name, id: user._id };
  } catch (error) {
    return { status: "ERR", message: error.message };
  }
};

const createComment = async (req, res) => {
  try {
    const userID = req.user.id;
    const role = await checkRole(userID);
    if (role.status === "ERR") {
      return res.status(200).json({ status: "ERR", message: role.message });
    } else if (role.role === "Claimer") {
      return res
        .status(200)
        .json({ status: "ERR", message: "You are not allowed to access" });
    }
    const { claim_id, content } = req.body;
    const response = await CommentService.createComment(
      userID,
      claim_id,
      content,
      role
    );
    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const claim_id = req.params.claim_id;
    const response = await CommentService.getComments(claim_id);
    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const replyComment = async (req, res) => {
  try {
    const userID = req.user.id;
    const role = await checkRole(userID);
    if (role.status === "ERR") {
      return res.status(200).json({ status: "ERR", message: role.message });
    }
    const { comment_id, content } = req.body;
    let response = await CommentService.checkComment(comment_id);
    if (response.status === "ERR") {
      return res.status(200).json({ status: "ERR", message: response.message });
    }
    const claim_id = response.data.claim_id;
    response = await CommentService.createComment(
      userID,
      claim_id,
      content,
      role
    );
    response = await CommentService.replyComment(
      userID,
      comment_id,
      response.data._id,
      claim_id,
      content,
      role
    );
    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
module.exports = {
  createComment,
  getComments,
  replyComment,
};
