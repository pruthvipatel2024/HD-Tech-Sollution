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

  // 1. Create Roles
  console.log("Seeding roles...");
  const superAdminRole = await prisma.role.upsert({
    where: { name: "Super Admin" },
    update: { permissions: ["*"] },
    create: {
      name: "Super Admin",
      permissions: ["*"],
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: { permissions: ["manage_products", "manage_gallery", "manage_inquiries"] },
    create: {
      name: "Admin",
      permissions: ["manage_products", "manage_gallery", "manage_inquiries"],
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

  const dbCategories: any[] = [];
  for (const cat of categories) {
    const dbCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: {
        name: cat.name,
        slug: cat.slug,
      },
    });
    dbCategories.push(dbCat);
  }

  // 4. Create Services
  console.log("Seeding services...");
  const services = [
    { name: "Computer Sales", icon: "Monitor", description: "Premium customized corporate desktops, dual-GPU workstations, and retail computer systems.", category: "Sales", isCore: true },
    { name: "Laptop Sales", icon: "Laptop", description: "Business-class ultrabooks, lightweight notebooks, and productivity laptops from leading brands.", category: "Sales", isCore: true },
    { name: "Computer Repair", icon: "Wrench", description: "Hardware diagnostics, motherboard repair, component replacement, and system optimization.", category: "Repair", isCore: true },
    { name: "Laptop Repair", icon: "Cpu", description: "Screen replacement, keyboard fix, battery swapping, and advanced chip-level diagnostics.", category: "Repair", isCore: true },
    { name: "Networking Solutions", icon: "Wifi", description: "Structured LAN/WAN cabling, enterprise-grade routers, high-throughput switch networks, and WiFi audits.", category: "Networking", isCore: true },
    { name: "CCTV Installation", icon: "Video", description: "High-fidelity IP security camera deployments, NVR storage setups, and remote mobile viewing links.", category: "CCTV", isCore: true },
    { name: "Printer Services", icon: "Printer", description: "Printer setup, toner refilling, scanner configuration, and routine printing hardware servicing.", category: "Services", isCore: false },
    { name: "Accessories", icon: "Keyboard", description: "Mechanical keypads, high-precision mice, SSD expansions, cables, and premium tech accessories.", category: "Sales", isCore: false },
    { name: "Annual Maintenance Contracts (AMC)", icon: "ShieldCheck", description: "Comprehensive round-the-clock IT support, backup monitoring, and systems AMC for offices.", category: "AMC", isCore: true }
  ];

  const dbServices: any[] = [];
  for (const srv of services) {
    const dbSrv = await prisma.service.upsert({
      where: { name: srv.name },
      update: {
        icon: srv.icon,
        description: srv.description,
        category: srv.category,
        isCore: srv.isCore,
      },
      create: {
        name: srv.name,
        icon: srv.icon,
        description: srv.description,
        category: srv.category,
        isCore: srv.isCore,
      },
    });
    dbServices.push(dbSrv);
  }

  // 5. Create Products & Product Images
  console.log("Seeding products...");
  const desktopCat = dbCategories.find(c => c.slug === "desktop");
  const gamingCat = dbCategories.find(c => c.slug === "gaming-pc");
  const laptopCat = dbCategories.find(c => c.slug === "laptop");
  const accessoriesCat = dbCategories.find(c => c.slug === "accessories");
  const cctvCat = dbCategories.find(c => c.slug === "cctv");
  const networkingCat = dbCategories.find(c => c.slug === "networking");

  const productsData = [
    {
      name: "Crystalline Quantum Workstation",
      description: "Intel Core i9 14900K, 64GB DDR5 RAM, 2TB NVMe SSD, NVIDIA RTX 4080 Super. Built for professional 3D, CAD, and local AI computation models.",
      price: 2499.99,
      availability: true,
      categoryId: desktopCat.id,
      imageUrl: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Helix Stream Gaming PC",
      description: "AMD Ryzen 7 7800X3D, Liquid AIO Cooler, 32GB RGB RAM, RTX 4070 Ti. Optimised for maximum frame output in high refresh 4K gaming.",
      price: 1899.99,
      availability: true,
      categoryId: gamingCat.id,
      imageUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "AeroBook Pro 16",
      description: "16\" OLED display, 32GB RAM, 1TB SSD, Next-gen CPU. Battery lifespan rated at 18 hours. Sleek CNC aluminum anodized finish.",
      price: 1999.00,
      availability: true,
      categoryId: laptopCat.id,
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "SecurX Dome CCTV Camera",
      description: "4K Resolution, IP67 Waterproof, Night Vision with integrated AI tracking for intruder alerts. Ideal for retail and warehouses.",
      price: 149.99,
      availability: true,
      categoryId: cctvCat.id,
      imageUrl: "https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "AX6000 WiFi 6 Router",
      description: "Dual-band WiFi 6 Router, Quad-Core processor, 8x Gigabit LAN ports. Supports up to 200 client nodes simultaneously.",
      price: 349.50,
      availability: true,
      categoryId: networkingCat.id,
      imageUrl: "https://images.unsplash.com/photo-1631553127988-5f750d4f1073?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Obsidian Mechanical Keyboard",
      description: "Hot-swappable linear key switches, CNC aluminum board base, triple-mode Bluetooth and USB-C connectivity.",
      price: 129.99,
      availability: true,
      categoryId: accessoriesCat.id,
      imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800"
    }
  ];

  for (const prod of productsData) {
    const dbProd = await prisma.product.create({
      data: {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        availability: prod.availability,
        categoryId: prod.categoryId,
      }
    });

    await prisma.productImage.create({
      data: {
        url: prod.imageUrl,
        productId: dbProd.id
      }
    });
  }

  // 6. Create Gallery Items & Gallery Images
  console.log("Seeding gallery...");
  const cctvService = dbServices.find(s => s.name === "CCTV Installation") || dbServices[0];
  const netService = dbServices.find(s => s.name === "Networking Solutions") || dbServices[0];
  const salesService = dbServices.find(s => s.name === "Computer Sales") || dbServices[0];

  const galleryData = [
    {
      title: "Vortex HQ Surveillance Deployment",
      description: "Integrated 32-camera surveillance matrix with automated local NVR array storage and network remote configuration.",
      location: "Corporate District, NY",
      serviceId: cctvService.id,
      featured: true,
      order: 1,
      imageUrl: "https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "NexaCorp Multi-Floor WiFi Network",
      description: "Structured Cat6 layout design and deployment of 8 load-balanced wireless access points for unified staff roaming.",
      location: "Financial Hub, CA",
      serviceId: netService.id,
      featured: true,
      order: 2,
      imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Design Studio PC Workstations Build",
      description: "Commissioned assembly and benchmark testing of 5 rendering workstations with liquid loop setups.",
      location: "Soho Arts, NY",
      serviceId: salesService.id,
      featured: false,
      order: 3,
      imageUrl: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=800"
    }
  ];

  for (const item of galleryData) {
    const dbGal = await prisma.gallery.create({
      data: {
        title: item.title,
        description: item.description,
        location: item.location,
        serviceId: item.serviceId,
        featured: item.featured,
        order: item.order,
      }
    });

    await prisma.galleryImage.create({
      data: {
        url: item.imageUrl,
        galleryId: dbGal.id
      }
    });
  }

  // 7. Create Testimonials
  console.log("Seeding testimonials...");
  const testimonials = [
    {
      customerName: "Sarah Jenkins",
      role: "IT Director, NexaCorp",
      content: "HD Tech Solutions overhauled our entire office networking infrastructure. Their staff was professional, fast, and the WiFi coverage is flawless throughout our 3-story office building.",
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    },
    {
      customerName: "Marcus Vance",
      role: "Operations Head, Helix Retail",
      content: "The CCTV security system installed by their team is top-notch. Clear night vision, easy mobile access, and zero downtime since deployment. Highly recommended!",
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
    },
    {
      customerName: "Devon Carter",
      role: "Lead Software Architect",
      content: "I ordered a custom AI workstation. The cable management, thermal throttling tests, and overall performance tuning they did exceeded my expectations. Outstanding build quality.",
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    },
  ];

  for (const test of testimonials) {
    await prisma.testimonial.create({
      data: test
    });
  }

  // 8. Create Brands
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

  // 9. Create CMS Settings
  console.log("Seeding CMS settings...");
  const cmsSettings = [
    { key: "hero_title", value: "Smart Technology. Better Solutions." },
    { key: "hero_subtitle", value: "One Stop Solution For All Your IT Needs." },
    { key: "about_title", value: "Expert Tech Infrastructure & Services" },
    { key: "about_text", value: "At HD Tech Solutions, we specialize in high-quality computer sales, laptop sales, networking solutions, CCTV installation, computer repair, laptop repair, accessories, AMC services, and complete office IT setups. With over 2 years of active industry experience and a firm customer-first approach, we aim to provide reliable, top-tier technology support and maintenance services tailored to the needs of both local homes and businesses." },
    { key: "company_name", value: "HD Tech Solutions" },
    { key: "contact_address", value: "Q4JX+M5Q, Mama Kotha Road, Near Khara Kuva, Hira Street, Karchaliya Para, Bhavnagar, Gujarat 364001" },
    { key: "contact_phone", value: "+91 75758 24006" },
    { key: "contact_whatsapp", value: "917575824006" },
    { key: "contact_email", value: "harshildumaniya28@gmail.com" },
    { key: "business_hours", value: "Mon - Sat: 10:00 AM - 8:00 PM, Sunday: Closed" },
    { key: "google_maps_url", value: "https://maps.google.com/?q=Q4JX%2BM5Q%2C%20Mama%20Kotha%20Road%2C%20Near%20Khara%20Kuva%2C%20Hira%20Street%2C%20Karchaliya%20Para%2C%20Bhavnagar%2C%20Gujarat%20364001" },
    { key: "social_facebook", value: "https://facebook.com" },
    { key: "social_instagram", value: "https://instagram.com" },
    { key: "social_linkedin", value: "https://linkedin.com" },
    { key: "stat_experience_value", value: "2+" },
    { key: "stat_experience_label", value: "Years of Experience" },
    { key: "stat_assembled_value", value: "350+" },
    { key: "stat_assembled_label", value: "Computer Systems Assembled" },
    { key: "stat_cctv_value", value: "40+" },
    { key: "stat_cctv_label", value: "Active CCTV Nodes Installed" },
    { key: "stat_partner_value", value: "Trusted" },
    { key: "stat_partner_label", value: "IT Partner for Homes & Businesses" },
    { key: "why_choose_us_pillars", value: "Genuine Products, Certified Technicians, Affordable Pricing, Fast Support, Professional Installation, Warranty Assistance, After-Sales Support, Customer Satisfaction" }
  ];

  for (const setting of cmsSettings) {
    await prisma.cmsSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting
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
