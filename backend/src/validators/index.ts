import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const inquirySchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  serviceId: z.string().uuid("Invalid service selection"),
  message: z.string().min(5, "Message must be at least 5 characters long"),
  attachments: z.array(
    z.object({
      url: z.string().url("Invalid attachment URL"),
      name: z.string().min(1, "Attachment name is required"),
    })
  ).optional(),
});

export const inquiryStatusSchema = z.object({
  status: z.enum(["Unread", "In Progress", "Completed", "Closed"], {
    errorMap: () => ({ message: "Status must be: Unread, In Progress, Completed, or Closed" }),
  }),
});

export const inquiryNoteSchema = z.object({
  text: z.string().min(1, "Note content cannot be empty"),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.preprocess((val) => Number(val), z.number().min(0, "Price cannot be negative")),
  availability: z.boolean().optional().default(true),
  categoryId: z.string().uuid("Invalid category selected"),
  imageUrls: z.array(z.string().url("Invalid image URL")).min(1, "At least one product image is required"),
});

export const gallerySchema = z.object({
  title: z.string().min(3, "Project title must be at least 3 characters"),
  description: z.string().min(10, "Project description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  serviceId: z.string().uuid("Invalid service selected"),
  imageUrls: z.array(z.string().url("Invalid image URL")).min(1, "At least one project image is required"),
  beforeImageUrl: z.string().url("Invalid before image URL").optional().or(z.literal("")),
  afterImageUrl: z.string().url("Invalid after image URL").optional().or(z.literal("")),
  featured: z.boolean().optional().default(false),
  order: z.preprocess((val) => Number(val), z.number().int()).optional(),
});

export const cmsSchema = z.object({
  key: z.string().min(1, "CMS key cannot be empty"),
  value: z.string().min(1, "CMS value cannot be empty"),
});
