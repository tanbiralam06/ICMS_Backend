import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import errorHandler from "./middlewares/error.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import departmentRoutes from "./routes/departments.routes.js";
import userRoutes from "./routes/users.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import leaveRoutes from "./routes/leaves.routes.js";
import taskRoutes from "./routes/tasks.routes.js";
import commentRoutes from "./routes/comments.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import holidayRoutes from "./routes/holidays.routes.js";
import companyRoutes from "./routes/company.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";

const app = express();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/public", express.static("public"));

// Swagger
const swaggerDocument = YAML.load("./src/docs/openapi.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/invoices", invoiceRoutes);

app.get("/", (req, res) => {
  res.send("ICMS Backend API is running...");
});

// Error Handler
app.use(errorHandler);

export default app;
