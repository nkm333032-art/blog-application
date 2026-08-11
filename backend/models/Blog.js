const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true
        },

        content: {
            type: String,
            required: true
        },

        author: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Blog", blogSchema);