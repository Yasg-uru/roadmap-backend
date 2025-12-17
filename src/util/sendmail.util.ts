import nodemailer from "nodemailer";
import { ApiResponse } from "../types/Response/ApiResponse";
const Transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,

  service: "yashpawar12122004@gmail.com",
  auth: {
    user: "yashpawar12122004@gmail.com",

    pass: "arhj ynqn zxbk dncj",
  },
});
const sendVerificationMail = async (
  username: string,
  email: string,
  verifyCode: string
): Promise<ApiResponse> => {
  try {
    const MailOptions = {
      from: "yashpawar12122004@gmail.com",
      to: email,
      subject: "Procoders verification code",
      text: `your verification code is ${verifyCode} for username :${username}`,
    };
    const response = await Transporter.sendMail(MailOptions);
    console.log("this is a mail response:", response);
    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error) {
    console.log("Error in sending email");
    return {
      success: false,
      message: "Failed to send verification email",
    };
  }
};
export const sendResetPasswordMail = async function (
  ResetLink: string,
  email: string
): Promise<ApiResponse> {
  const MailOptions = {
    from: "yashpawar12122004@gmail.com",
    to: email,
    subject: "Password Reset",
    text: `Please click on the following link to reset password:\n\n ${ResetLink}`,
  };
  try {
    const response = await Transporter.sendMail(MailOptions);
    return {
      success: true,
      message: "Reset password mail sent sucessfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error in sending forgot password mail",
    };
  }
};
export const sendContactFormMail = async (
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<ApiResponse> => {
  try {
    const MailOptions = {
      from: "yashpawar12122004@gmail.com",
      to: "yashpawar12122004@gmail.com", // Your email
      subject: `📩 New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #4CAF50; padding: 15px; text-align: center; color: white;">
            <h2 style="margin: 0;">New Contact Form Submission</h2>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 16px; color: #333;"><strong>Name:</strong> ${name}</p>
            <p style="font-size: 16px; color: #333;"><strong>Email:</strong> ${email}</p>
            <p style="font-size: 16px; color: #333;"><strong>Subject:</strong> ${subject}</p>
            <p style="font-size: 16px; color: #333;"><strong>Message:</strong></p>
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 5px solid #4CAF50; margin: 10px 0; font-style: italic; color: #555;">
              ${message}
            </div>
            <p style="text-align: center; font-size: 14px; color: #777;">This email was automatically generated from your contact form.</p>
          </div>
        </div>
      `,
    };

    const response = await Transporter.sendMail(MailOptions);
    console.log("📧 Contact Form Email Sent:", response);
    return { success: true, message: "Contact form email sent successfully" };
  } catch (error) {
    console.error("❌ Error sending contact form email:", error);
    return { success: false, message: "Failed to send contact form email" };
  }
};

export default sendVerificationMail;
