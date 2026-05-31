import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON payloads
  app.use(express.json());

  // API Routes MUST go first before Vite middleware
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Server-side email dispatch api
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: "Missing required fields (to, subject, body)" });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: RESEND_API_KEY environment variable is not defined. Email dispatch was simulated locally.");
      return res.json({ 
        success: true, 
        simulated: true, 
        message: "RESEND_API_KEY not configured. Email logged successfully in local simulator, but not dispatched. Please add RESEND_API_KEY in the application settings." 
      });
    }

    try {
      // Send API request to Resend
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          from: process.env.EMAIL_SENDER || "onboarding@resend.dev",
          to: to,
          subject: subject,
          text: body,
          html: body.split("\n").join("<br>")
        })
      });

      const data = await response.json() as any;

      if (!response.ok) {
        console.error("Resend API error response:", data);
        return res.status(response.status).json({ 
          error: data.message || "Failed to send email via Resend API", 
          details: data 
        });
      }

      console.log(`Email successfully routed via Resend API to ${to}. ID: ${data.id}`);
      return res.json({ success: true, id: data.id, message: "Email sent successfully!" });
    } catch (error: any) {
      console.error("Network error sending email via Resend:", error);
      return res.status(500).json({ 
        error: error.message || "Internal server error connecting to email API" 
      });
    }
  });

  // Vite middleware for development or Static Assets for production
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Fatal error starting the full-stack server:", error);
});
