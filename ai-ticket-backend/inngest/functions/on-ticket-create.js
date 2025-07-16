import { inngest } from "../client.js";
import Ticket from "../../models/ticket.model.js";
import User from "../../models/user.model.js";

export const onTicketCreated = inngest.createFunction(
    { id: "on-ticket-created", retries: 2 },
    { event: "ticket/created" },
    async ({ event, step }) => {
        try {
            const { ticketId } = event.data;

            //fetch the ticket details from database
            const ticket = await step.run("fetch-ticket", async () => {
                const ticketObject = await Ticket.findById(ticketId);
                if (!ticket) {
                    throw new NonRetriableError("Ticket not exist in database");
                }
                return ticketObject;
            });

            await step.run("update-ticket-status", async () => {
                await Ticket.findByIdAndUpdate(ticket._id, { status: "OPEN" });
            });

            const aiResponse = await analyzeTicket(ticket);

            const relatedSkills = await step.run("ai-processing", async () => {
                let skills = [];
                if (aiResponse) {
                    await Ticket.findByIdAndUpdate(ticket._id, {
                        priority: !["low", "medium", "high"].includes(
                            aiResponse.priority
                        )
                            ? "medium"
                            : aiResponse.priority,

                        helpfullNotes: aiResponse.helpfullNotes,
                        status: "IN_PROGRESS",
                        relatedSkills: aiResponse.relatedSkills,
                    });
                    skills = aiResponse.relatedSkills;
                }
                return skills;
            });

            const moderator = await step.run("assign-moderator", async () => {
                let user = await User.findOne({
                    role: "moderator",
                    skills: {
                        $elementMatch: {
                            $regex: relatedSkills.join("|"),
                            $options: "i",
                        },
                    },
                });
                if (!user) {
                    user = await User.findOne({ role: "admin" });
                }
                await Ticket.findByIdAndUpdate(ticket._id, {
                    assignedTo: user?._id || null,
                });
                return user;
            });

            await step.run("send-email-notification", async () => {
                if (moderator) {
                    const finalTicket = await Ticket.findById(ticket._id);
                    await sendEmail(
                        moderator.email,
                        "New ticket",
                        `A new ticket has been assigned to you ${finalTicket.title}.`
                    );
                }
            });

            return { success: true };
        } catch (error) {
            console.error("Error running the steps", error.message);
            return { success: false };
        }
    }
);
