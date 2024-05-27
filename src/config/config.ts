export const config = () => ({
  databases: {
    mongooseURL: process.env.DBURL,
  },
  port: process.env.PORT,
  salt: process.env.SALT,
  jwt_secret: process.env.JWT_SECRET,
  auth_email_user: process.env.AUTH_EMAIL_USER,
  auth_email_pass: process.env.AUTH_EMAIL_PASS,
  email_port: process.env.EMAIL_PORT,
});
