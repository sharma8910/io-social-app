import dotenv from "dotenv";
dotenv.config();

export const sendEmailOTP = async (email, otp, type = "verification") => {
  const subject = type === "verification" 
    ? "io. Social - Verify Your Email" 
    : "io. Social - Reset Your Password";
  
  const text = type === "verification"
    ? `Welcome to io. Social! Your verification OTP code is: ${otp}. This code expires in 10 minutes.`
    : `You requested to reset your password. Your password reset OTP code is: ${otp}. This code expires in 10 minutes.`;

  // Always log to terminal console for local developer convenience
  console.log(`\n=============================================`);
  console.log(`✉️  EMAIL OTP SENT TO: ${email}`);
  console.log(`🔑 CODE: ${otp} (${type.toUpperCase()})`);
  console.log(`=============================================\n`);

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn("⚠️  EMAIL_USER or EMAIL_PASS not configured in .env. Falling back to terminal log only.");
    return true;
  }

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from: `"io. Social" <${user}>`,
      to: email,
      subject,
      text,
    });
    console.log(`📬 Real email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send email via SMTP:", error.message);
    console.log("Ensure you run 'npm install nodemailer' and use a Gmail App Password.");
    return false;
  }
};
