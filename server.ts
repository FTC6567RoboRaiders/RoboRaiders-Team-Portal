import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import 'dotenv/config';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Use nodemailer for emails using system ENV connections
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS, // App Password goes here
    },
  });

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/email/status", (req, res) => {
    const isConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
    res.json({ configured: isConfigured, user: process.env.SMTP_USER || null });
  });

  app.post("/api/email/send", async (req, res) => {
    try {
      const { to, subject, body } = req.body;
      
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return res.status(500).json({ error: "System SMTP has not been configured with an App Password yet." });
      }

      const info = await transporter.sendMail({
        from: `"Roboraiders System" <${process.env.SMTP_USER}>`,
        to: to,
        subject: subject,
        html: body.replace(/\n/g, '<br>'),
      });

      res.status(200).json({ success: true, messageId: info.messageId });
    } catch (error: any) {
      console.error("Nodemailer error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
