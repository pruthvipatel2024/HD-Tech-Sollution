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
  status: z.enum(["UNREAD", "IN_PROGRESS", "COMPLETED", "CLOSED"], {
    errorMap: () => ({ message: "Status must be: UNREAD, IN_PROGRESS, COMPLETED, or CLOSED" }),
  }),
});

export const inquiryNoteSchema = z.object({
  text: z.string().min(1, "Note content cannot be empty"),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  slug: z.string().min(2, "Slug is required").optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.preprocess((val) => (val === "" || val === undefined ? null : Number(val)), z.number().min(0, "Price cannot be negative").nullable().optional()),
  availability: z.boolean().optional().default(true),
  categoryId: z.string().uuid("Invalid category selected"),
  brandId: z.string().uuid("Invalid brand selected").optional().nullable().or(z.literal("")),
  imageUrls: z.array(z.string().url("Invalid image URL")).min(1, "At least one product image is required"),
  sku: z.string().optional().nullable().or(z.literal("")),
  modelNumber: z.string().optional().nullable().or(z.literal("")),
  specifications: z.string().optional().nullable().or(z.literal("")),
  warranty: z.string().optional().nullable().or(z.literal("")),
  featured: z.boolean().optional().default(false),
  showPrice: z.boolean().optional().default(false),
  contactForPrice: z.boolean().optional().default(true),
});

export const gallerySchema = z.object({
  title: z.string().min(3, "Project title must be at least 3 characters"),
  slug: z.string().min(3, "Project slug is required").optional(),
  description: z.string().min(10, "Project description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  clientName: z.string().optional().nullable().or(z.literal("")),
  duration: z.string().optional().nullable().or(z.literal("")),
  serviceId: z.string().uuid("Invalid service selected"),
  imageUrls: z.array(z.string().url("Invalid image URL")).min(1, "At least one project image is required"),
  beforeImageUrl: z.string().url("Invalid before image URL").optional().nullable().or(z.literal("")),
  afterImageUrl: z.string().url("Invalid after image URL").optional().nullable().or(z.literal("")),
  featured: z.boolean().optional().default(false),
  order: z.preprocess((val) => (val === "" || val === undefined ? undefined : Number(val)), z.number().int().optional()),
  completionDate: z.string().optional(),
});

export const cmsSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
});
