const EmailVerificationModel = require('../modules/EmailVerification');
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
dotenv.config();

let transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT,
	secure: process.env.SMTP_PORT == 465,
	auth: {
		user: process.env.SMTP_MAIL,
		pass: process.env.SMTP_PASSWORD,
	},
});

const sendOtpVerificationEmail = async (req, res, user) => {

	const otp = Math.floor(100000 + Math.random() * 900000);
	await new EmailVerificationModel({ userId: user._id, otp: otp }).save();

	const mailOptions = {
		from: process.env.SMTP_MAIL,
		to: user.email,
		subject: "Email Veryfication by OTP",
		html: `<p>Dear ${user.name},</p><p>Thank you for signing up with our website. To complete your registration, please verify your email address by entering the following one-time password (OTP)</p>
		<h2>OTP: ${otp}</h2>
		<p>This OTP is valid for 1 minutes. If you didn't request this OTP, please ignore this email.</p>`
	};

	await transporter.sendMail(mailOptions);
};

module.exports = sendOtpVerificationEmail;
