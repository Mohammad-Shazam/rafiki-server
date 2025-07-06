require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  },
  secure: true, // SSL
  tls: {
    rejectUnauthorized: false
  }
});

// Email template function
const createEmailTemplate = (data) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d3748;">New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name || 'Not provided'}</p>
      <p><strong>Email:</strong> ${data.email || 'Not provided'}</p>
      <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message || 'No message provided'}</p>
    </div>
  `;
};

// API endpoint for sending emails
app.post('/api/send-email', async (req, res) => {
  try {
    const { name, email, phone, message, subject } = req.body;

    const mailOptions = {
      from: `Rafiki Transport <${process.env.GMAIL_USER}>`,
      to: email || process.env.CONTACT_FORM_RECIPIENT,
      subject: subject || process.env.CONTACT_FORM_SUBJECT,
      html: message || createEmailTemplate({ name, email, phone, message })
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
