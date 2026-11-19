export type Field = {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "datetime";
  required?: boolean;
  options?: string[];                          // fixed choices
  ref?: { table: string; label: string };      // foreign key dropdown
};

export const TABLES: Record<string, { title: string; fields: Field[] }> = {
  customers: {
    title: "Customers",
    fields: [
      { name: "full_name", label: "Full Name", type: "text", required: true },
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
    ],
  },
  computers: {
    title: "Computers",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "specs", label: "Specs", type: "text" },
      { name: "hourly_rate", label: "Hourly Rate", type: "number", required: true },
      { name: "status", label: "Status", type: "select", options: ["available", "in_use", "maintenance"], required: true },
    ],
  },
  products: {
    title: "Products",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "category", label: "Category", type: "text" },
      { name: "price", label: "Price", type: "number", required: true },
      { name: "stock", label: "Stock", type: "number", required: true },
    ],
  },
  sessions: {
    title: "Sessions",
    fields: [
      { name: "customer_id", label: "Customer", type: "select", required: true, ref: { table: "customers", label: "full_name" } },
      { name: "computer_id", label: "Computer", type: "select", required: true, ref: { table: "computers", label: "name" } },
      { name: "start_time", label: "Start", type: "datetime" },
      { name: "end_time", label: "End", type: "datetime" },
      { name: "total_amount", label: "Total", type: "number" },
      { name: "status", label: "Status", type: "select", options: ["active", "completed"], required: true },
    ],
  },
};