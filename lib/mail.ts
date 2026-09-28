import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  // If SMTP credentials exist in .env, use them to send real email
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const emailPort = Number(process.env.EMAIL_PORT) || 465;

  if (emailUser && emailPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465, // true for 465, false for other ports
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      const mailOptions = {
        from: `"Facebook Security" <${emailUser}>`,
        to: email,
        subject: "პაროლის აღდგენის კოდი / Password Reset Request",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e4e6eb; rounded: 12px; background-color: #ffffff;">
            <div style="border-bottom: 2px solid #0866ff; padding-bottom: 12px; margin-bottom: 20px;">
              <h1 style="color: #0866ff; margin: 0; font-size: 32px; font-weight: bold;">facebook</h1>
            </div>
            
            <p style="font-size: 16px; color: #1c1e21; line-height: 1.5;">გამარჯობა,</p>
            <p style="font-size: 16px; color: #1c1e21; line-height: 1.5;">
              ჩვენ მივიღეთ თქვენი Facebook ანგარიშის პაროლის აღდგენის მოთხოვნა.
            </p>
            
            <div style="margin: 28px 0; text-align: center;">
              <a href="${resetUrl}" style="background-color: #0866ff; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block;">
                პაროლის შეცვლა
              </a>
            </div>

            <p style="font-size: 14px; color: #65676b; line-height: 1.4;">
              თუ ღილაკი არ მუშაობს, გადადით ამ ბმულზე:<br/>
              <a href="${resetUrl}" style="color: #0866ff; word-break: break-all;">${resetUrl}</a>
            </p>

            <hr style="border: none; border-top: 1px solid #e4e6eb; margin: 24px 0;" />

            <p style="font-size: 12px; color: #8a8d91; line-height: 1.4;">
              თუ პაროლის აღდგენა თქვენ არ მოგითხოვიათ, უბრალოდ უგულებელყავით ეს წერილი. თქვენი ანგარიში უსაფრთხოდაა.
            </p>
            <p style="font-size: 12px; color: #8a8d91; margin-top: 8px;">
              Meta Platforms, Inc., 1 Hacker Way, Menlo Park, CA 94025
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`[REAL EMAIL SENT] Password reset email delivered to ${email}`);
      return { sent: true };
    } catch (error) {
      console.error("[EMAIL ERROR] Failed to send via SMTP:", error);
      // Fallback to console link if SMTP fails
    }
  }

  // Fallback: Always log to console so the app never fails even without credentials
  console.log(`\n======================================================`);
  console.log(`[PASSWORD RESET LINK for ${email}]:`);
  console.log(`${resetUrl}`);
  console.log(`======================================================\n`);

  return { sent: false };
}
