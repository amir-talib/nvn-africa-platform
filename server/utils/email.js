import nodemailer from "nodemailer";

// Email transporter - supports multiple providers
let transporter;

const initializeTransporter = () => {
    const provider = process.env.EMAIL_PROVIDER || "brevo";

    if (provider === "brevo") {
        // Brevo - https://brevo.com (300 emails/day free)
        transporter = nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.BREVO_LOGIN || process.env.EMAIL_FROM,
                pass: process.env.BREVO_API_KEY,
            },
        });
    } else if (provider === "resend") {
        // Resend - https://resend.com
        transporter = nodemailer.createTransport({
            host: "smtp.resend.com",
            port: 465,
            secure: true,
            auth: {
                user: "resend",
                pass: process.env.RESEND_API_KEY,
            },
        });
    } else {
        // Gmail fallback
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });
    }

    console.log(`📧 Email provider initialized: ${provider}`);
};

// Initialize on first import
initializeTransporter();

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 */
export const sendEmail = async ({ to, subject, html, text }) => {
    try {
        if (!transporter) {
            initializeTransporter();
        }

        const fromEmail = process.env.EMAIL_FROM || "noreply@nvnafrica.org";

        const mailOptions = {
            from: `"NVN Africa" <${fromEmail}>`,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ""),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("❌ Email send error:", error.message);
        return { success: false, error: error.message };
    }
};

// Email templates
export const emailTemplates = {
    hoursVerified: (volunteerName, projectTitle, hours) => ({
        subject: `✅ Your ${hours} hours have been verified!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #22c55e;">Hours Verified! 🎉</h2>
                <p>Hi ${volunteerName},</p>
                <p>Great news! Your volunteer hours have been verified:</p>
                <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p><strong>Project:</strong> ${projectTitle}</p>
                    <p><strong>Hours:</strong> ${hours}</p>
                </div>
                <p>Keep up the amazing work!</p>
                <p>— The NVN Africa Team</p>
            </div>
        `,
    }),

    hoursRejected: (volunteerName, projectTitle, reason) => ({
        subject: `Hours submission needs attention`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ef4444;">Hours Review Update</h2>
                <p>Hi ${volunteerName},</p>
                <p>Your hours submission for <strong>${projectTitle}</strong> needs attention:</p>
                <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #ef4444;">
                    <p><strong>Reason:</strong> ${reason}</p>
                </div>
                <p>Please review and resubmit if needed.</p>
                <p>— The NVN Africa Team</p>
            </div>
        `,
    }),

    requestApproved: (volunteerName, projectTitle) => ({
        subject: `🎊 You've been accepted to ${projectTitle}!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #22c55e;">Welcome to the Project! 🎊</h2>
                <p>Hi ${volunteerName},</p>
                <p>Congratulations! Your request to join <strong>${projectTitle}</strong> has been approved.</p>
                <p>Log in to your dashboard to see project details and start making an impact!</p>
                <p>— The NVN Africa Team</p>
            </div>
        `,
    }),

    rankUp: (volunteerName, newRank, totalHours) => ({
        subject: `🏆 You've ranked up!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #8b5cf6;">Congratulations! 🏆</h2>
                <p>Hi ${volunteerName},</p>
                <p>You've reached a new rank: <strong>${newRank}</strong>!</p>
                <div style="background: #f5f3ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p><strong>Total verified hours:</strong> ${totalHours}</p>
                </div>
                <p>Keep volunteering to unlock more achievements!</p>
                <p>— The NVN Africa Team</p>
            </div>
        `,
    }),
};

export default { sendEmail, emailTemplates };
