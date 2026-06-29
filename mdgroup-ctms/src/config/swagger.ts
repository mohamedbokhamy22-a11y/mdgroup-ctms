// Prompt: "Configure swagger-jsdoc and swagger-ui-express for MDGroup CTMS.
// Generate OpenAPI 3.0 spec from JSDoc annotations across all route files.
// Include bearer auth security scheme and organized tag groups."

import swaggerJsdoc from "swagger-jsdoc";
import { Options } from "swagger-jsdoc";

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MDGroup Clinical Trial Management System API",
      version: "1.0.0",
      description: `
## MDGroup CTMS — REST API

MDGroup bridges pharmaceutical sponsors/CROs and clinical trial participants.
This API manages the full operational lifecycle:

- **Studies & Sponsors** — protocol management, pharma company records
- **Sites & Enrollments** — research sites, participant enrollment per study
- **Visits** — site-based and decentralized home visits
- **Patient Coordination** — travel arrangements, 24/7 messaging
- **Payments** — stipends, reimbursements with approval workflow
- **Clinical Logistics** — equipment dispatch and tracking
- **Safety** — adverse event reporting and resolution

### Authentication
All endpoints (except \`/api/auth/register\` and \`/api/auth/login\`) require a Bearer JWT token.
      `,
      contact: { name: "MDGroup Engineering", email: "engineering@mdgroup.com" },
    },
    servers: [
      { url: "http://localhost:3000", description: "Development" },
      { url: "https://api.mdgroup.com", description: "Production" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication and user profile" },
      { name: "Sponsors", description: "Pharmaceutical company management" },
      { name: "Studies", description: "Clinical trial protocol management" },
      { name: "Sites", description: "Research site management" },
      { name: "Participants", description: "Patient/participant records" },
      { name: "Enrollments", description: "Study enrollment lifecycle" },
      { name: "Visits", description: "Visit scheduling and tracking" },
      { name: "Travel", description: "Patient travel and accommodation" },
      { name: "Payments", description: "Stipends and reimbursements" },
      { name: "Equipment", description: "Clinical equipment logistics" },
      { name: "Messages", description: "Patient-navigator communication" },
      { name: "Adverse Events", description: "Safety event reporting" },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
