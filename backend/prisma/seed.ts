import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("ERROR: DATABASE_URL is not set in environment variables.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding started...");

  // 1. Create Roles with permissions matching plan
  console.log("Seeding roles...");
  const superAdminRole = await prisma.role.upsert({
    where: { name: "Super Admin" },
    update: {
      permissions: ["PRODUCT_MGT", "GALLERY_MGT", "REVIEW_APPR", "CMS_EDIT", "USER_MGT"],
    },
    create: {
      name: "Super Admin",
      permissions: ["PRODUCT_MGT", "GALLERY_MGT", "REVIEW_APPR", "CMS_EDIT", "USER_MGT"],
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: "Manager" },
    update: {
      permissions: ["PRODUCT_MGT", "GALLERY_MGT", "REVIEW_APPR"],
    },
    create: {
      name: "Manager",
      permissions: ["PRODUCT_MGT", "GALLERY_MGT", "REVIEW_APPR"],
    },
  });

  // 2. Create Default Admin
  console.log("Seeding admin...");
  const adminUsername = "admin";
  const adminPassword = "admin123";
  const hashedPassword = bcrypt.hashSync(adminPassword, 10);

  const adminUser = await prisma.admin.upsert({
    where: { username: adminUsername },
    update: { passwordHash: hashedPassword, roleId: superAdminRole.id },
    create: {
      username: adminUsername,
      passwordHash: hashedPassword,
      roleId: superAdminRole.id,
    },
  });
  console.log(`Admin account seeded: ${adminUser.username} (${superAdminRole.name})`);

  // 3. Create Categories
  console.log("Seeding categories...");
  const categories = [
    { name: "Desktop", slug: "desktop" },
    { name: "Laptop", slug: "laptop" },
    { name: "Gaming PC", slug: "gaming-pc" },
    { name: "Accessories", slug: "accessories" },
    { name: "Networking", slug: "networking" },
    { name: "CCTV", slug: "cctv" },
    { name: "Printer", slug: "printer" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: {
        name: cat.name,
        slug: cat.slug,
      },
    });
  }

  // 4. Create Services
  console.log("Seeding services...");
  const services = [
    { name: "Computer Sales", icon: "Monitor", description: "Premium customized corporate desktops, dual-GPU workstations, and retail computer systems.", displayOrder: 1, featured: true, active: true },
    { name: "Laptop Sales", icon: "Laptop", description: "Business-class ultrabooks, lightweight notebooks, and productivity laptops from leading brands.", displayOrder: 2, featured: true, active: true },
    { name: "Computer Repair", icon: "Wrench", description: "Hardware diagnostics, motherboard repair, component replacement, and system optimization.", displayOrder: 3, featured: true, active: true },
    { name: "Laptop Repair", icon: "Cpu", description: "Screen replacement, keyboard fix, battery swapping, and advanced chip-level diagnostics.", displayOrder: 4, featured: true, active: true },
    { name: "Networking Solutions", icon: "Wifi", description: "Structured LAN/WAN cabling, enterprise-grade routers, high-throughput switch networks, and WiFi audits.", displayOrder: 5, featured: true, active: true },
    { name: "CCTV Installation", icon: "Video", description: "High-fidelity IP security camera deployments, NVR storage setups, and remote mobile viewing links.", displayOrder: 6, featured: true, active: true },
    { name: "Printer Services", icon: "Printer", description: "Printer setup, toner refilling, scanner configuration, and routine printing hardware servicing.", displayOrder: 7, featured: false, active: true },
    { name: "Accessories", icon: "Keyboard", description: "Mechanical keypads, high-precision mice, SSD expansions, cables, and premium tech accessories.", displayOrder: 8, featured: false, active: true },
    { name: "Annual Maintenance Contracts (AMC)", icon: "ShieldCheck", description: "Comprehensive round-the-clock IT support, backup monitoring, and systems AMC for offices.", displayOrder: 9, featured: true, active: true }
  ];

  for (const srv of services) {
    await prisma.service.upsert({
      where: { name: srv.name },
      update: {
        icon: srv.icon,
        description: srv.description,
        displayOrder: srv.displayOrder,
        featured: srv.featured,
        active: srv.active,
      },
      create: {
        name: srv.name,
        icon: srv.icon,
        description: srv.description,
        displayOrder: srv.displayOrder,
        featured: srv.featured,
        active: srv.active,
      },
    });
  }

  // 5. Create Brands
  console.log("Seeding brands...");
  const brands = [
    { name: "HP", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/29/HP_New_Logo_2d.svg" },
    { name: "Dell", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg" },
    { name: "Lenovo", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg" },
    { name: "Asus", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/de/Asus_Logo.svg" },
    { name: "TP-Link", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/75/TP-Link_logo.svg" },
    { name: "D-Link", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6f/D-Link_logo.svg" },
  ];

  for (const b of brands) {
    await prisma.brand.upsert({
      where: { name: b.name },
      update: { logoUrl: b.logoUrl },
      create: b
    });
  }

  // 6. Create CMS Settings (Extended with columns type, group, description)
  console.log("Seeding CMS settings...");
  const cmsSettings = [
    // Hero Group
    { key: "hero_title", value: "Smart Technology. Better Solutions.", type: "text", group: "Hero", description: "The main bold heading of the homepage hero." },
    { key: "hero_subtitle", value: "One Stop Solution For All Your IT Needs.", type: "text", group: "Hero", description: "The secondary tagline under the hero title." },
    { key: "hero_bg_image", value: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600", type: "image", group: "Hero", description: "Hero section dynamic background image URL." },
    
    // About Group
    { key: "about_title", value: "Expert Tech Infrastructure & Services", type: "text", group: "About", description: "About us section block title." },
    { key: "about_text", value: "At HD Tech Solutions, we specialize in high-quality computer sales, laptop sales, networking solutions, CCTV installation, computer repair, laptop repair, accessories, AMC services, and complete office IT setups. With over 2 years of active industry experience and a firm customer-first approach, we aim to provide reliable, top-tier technology support and maintenance services tailored to the needs of both local homes and businesses.", type: "text", group: "About", description: "About us detailed descriptive text paragraph." },
    
    // Why Choose Us Group
    { key: "why_choose_us_title", value: "Why Choose Us", type: "text", group: "Why Choose Us", description: "Heading for the Choose section." },
    { key: "why_choose_us_subtitle", value: "We combine enterprise-level engineering standards with personalized local support to deliver unmatched technological reliability.", type: "text", group: "Why Choose Us", description: "Tagline text for the Choose section." },
    
    // General Settings
    { key: "company_name", value: "HD Tech Solutions", type: "text", group: "General", description: "Company branding name." },
    { key: "company_logo", value: "", type: "image", group: "General", description: "Brand logo image URL." },
    { key: "company_favicon", value: "", type: "image", group: "General", description: "Site favicon shortcut URL." },
    { key: "company_og_image", value: "", type: "image", group: "General", description: "Open Graph default metadata social card preview image." },

    // Contact Details
    { key: "contact_address", value: "Q4JX+M5Q, Mama Kotha Road, Near Khara Kuva, Hira Street, Karchaliya Para, Bhavnagar, Gujarat 364001", type: "text", group: "Contact", description: "The physical street address of the retail office." },
    { key: "contact_phone", value: "+91 75758 24006", type: "text", group: "Contact", description: "Hotline customer voice support line." },
    { key: "contact_whatsapp", value: "917575824006", type: "text", group: "Contact", description: "WhatsApp number query (no spaces or plus prefix)." },
    { key: "contact_email", value: "harshildumaniya28@gmail.com", type: "text", group: "Contact", description: "Corporate help mailbox address." },
    { key: "business_hours", value: "Mon - Sat: 10:00 AM - 8:00 PM, Sunday: Closed", type: "text", group: "Contact", description: "Operational working hours display string." },
    { key: "google_maps_url", value: "https://maps.google.com/?q=Q4JX%2BM5Q%2CMama%20Kotha%20Road%2CNear%20Khara%20Kuva%2CHira%20Street%2CKarchaliya%20Para%2CBhavnagar%2CGujarat%20364001", type: "text", group: "Contact", description: "Full maps.google directions redirect link." },
    { key: "google_maps_embed", value: "https://maps.google.com/maps?q=Q4JX%2BM5Q%2CMama%20Kotha%20Road%2CNear%20Khara%20Kuva%2CHira%20Street%2CKarchaliya%20Para%2CBhavnagar%2CGujarat%20364001&t=&z=14&ie=UTF8&iwloc=&output=embed", type: "text", group: "Contact", description: "Google Maps iframe integration URL." },

    // Social URLs
    { key: "social_facebook", value: "https://facebook.com", type: "text", group: "Footer", description: "Facebook social handle link." },
    { key: "social_instagram", value: "https://instagram.com", type: "text", group: "Footer", description: "Instagram social handle link." },
    { key: "social_linkedin", value: "https://linkedin.com", type: "text", group: "Footer", description: "LinkedIn business profile URL." },

    // Section Headings
    { key: "gallery_heading", value: "Completed Projects", type: "text", group: "Gallery", description: "Heading for the work gallery." },
    { key: "product_heading", value: "Our Hardware Inventory", type: "text", group: "Products", description: "Heading for the products page." },
    { key: "review_heading", value: "Client Testimonials", type: "text", group: "Reviews", description: "Heading for customer review quotes." },

    // Dynamic Achievements statistics
    { key: "Experience", value: "2+", type: "text", group: "Statistics", description: "Achievement card 1: Active industry duration." },
    { key: "SystemsInstalled", value: "350+", type: "text", group: "Statistics", description: "Achievement card 2: Custom PC towers built." },
    { key: "CCTVNodes", value: "40+", type: "text", group: "Statistics", description: "Achievement card 3: CCTV video nodes deployed." },
    { key: "HappyClients", value: "100%", type: "text", group: "Statistics", description: "Achievement card 4: Customer satisfaction metric." },
    { key: "ProjectsCompleted", value: "500+", type: "text", group: "Statistics", description: "Achievement card 5: Total completed services." },
  ];

  for (const setting of cmsSettings) {
    await prisma.cmsSetting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        type: setting.type,
        group: setting.group,
        description: setting.description,
      },
      create: setting,
    });
  }

  console.log("Seeding complete successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
