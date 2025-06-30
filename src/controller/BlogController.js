const BlogService = require("../services/BlogService");

exports.createBlog = async (req, res) => {
    try {
        const {title, content, authorId, imageUrl} = req.body;
        if(!title.trim() || !content.trim() || !authorId.trim()) {
            return res.status(400).json({
                status: "Err",
                message: "All fields are required except image URL"
            })
        }

        const dataRequest = {
            title,
            content,
            authorId,
            imageUrl
        }

        const newBlog = await BlogService.createBlog(dataRequest);

        if(!newBlog) {
            return res.status(400).json({
                status: "Err",
                message: "Cannot create new blog, try again!"
            })
        }

        return res.status(201).json({
            status: "OK",
            data: newBlog
        })
    } catch (error) {
        return res.status(404).json({message: error.message});
    }
}