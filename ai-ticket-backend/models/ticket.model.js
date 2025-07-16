import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ["open", "closed"],
        default: "open",
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    priority: String,
    deadline: Date,
    helpfullNotes: String,
    relatedSkills: [String],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Ticket", ticketSchema);
