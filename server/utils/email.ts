import nodemailer from 'nodemailer';

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: (process.env.EMAIL_PORT || '') === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendWelcomeEmail = async (email: string, firstName: string) => {
  try {
    // If email environment variables are not configured, skip sending
    const emailConfigured = Boolean(
      process.env.EMAIL_HOST &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS &&
      process.env.EMAIL_FROM &&
      process.env.EMAIL_PASS !== 'your_smtp_password'
    );
    if (!emailConfigured) {
      console.log('Email not configured, skipping welcome email for:', email);
      return true;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to ExpenseTracker Pro! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background-color: #2563eb; width: 60px; height: 60px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px;">💰</span>
            </div>
            <h1 style="color: #1f2937; margin: 20px 0 10px 0;">Welcome to ExpenseTracker Pro!</h1>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${firstName}! 👋</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Thank you for joining ExpenseTracker Pro! We're excited to help you take control of your finances and achieve your financial goals.
            </p>
            
            <h3 style="color: #1f2937; margin-bottom: 15px;">What you can do with ExpenseTracker Pro:</h3>
            <ul style="color: #4b5563; line-height: 1.6; padding-left: 20px;">
              <li>📊 Track your income and expenses</li>
              <li>📈 Visualize your spending patterns</li>
              <li>🎯 Set and monitor financial goals</li>
              <li>📱 Access your data from anywhere</li>
              <li>🔒 Keep your financial information secure</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${process.env.FRONTEND_URL || 'https://your-app-domain.replit.app'}" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Get Started Now
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Need help? Contact our support team at 
              <a href="mailto:${process.env.EMAIL_FROM}" style="color: #2563eb;">${process.env.EMAIL_FROM}</a>
            </p>
            <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">
              © 2024 ExpenseTracker Pro. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};