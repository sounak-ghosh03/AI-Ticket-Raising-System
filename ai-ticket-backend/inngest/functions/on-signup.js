import { NonRetriableError } from "inngest";
import User from "../../models/user.model.js";
import { inngest } from "../client.js";
import { sendEmail } from "../../utils/mailer.js";

export const onUserSignup = inngest.createFunction(
    { id: "on-user-signup", retries: 2 },
    { event: "user/signup" },
    async ({ event, step }) => {
        try {
            const { email } = event.data;
            const user = await step.run("get-user-email", async () => {
                const userObject = await User.findOne({ email });
                if (!userObject) {
                    throw new NonRetriableError("User not exist in database");
                }
                return userObject;
            });

            await step.run("send-welcome-email", async () => {
                const subject = `Welcome to our platform!!`;
                const message = `Hi,
                \n\n
                Thanks for signing up to our platform. We're excited to have you on board!`;
                await sendEmail(user.email, subject, message);
            });
            return { success: true };
        } catch (error) {
            console.error("Error running steps", error.message);
            return { success: false };
        }
    }
);
