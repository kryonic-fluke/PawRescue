var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  account: () => account,
  adoptionApplications: () => adoptionApplications,
  adoptionApplicationsNew: () => adoptionApplicationsNew,
  adoptionGuides: () => adoptionGuides,
  adoptionGuidesNew: () => adoptionGuidesNew,
  animalShelters: () => animalShelters,
  animals: () => animals,
  appUsers: () => appUsers,
  emailNotifications: () => emailNotifications,
  emailNotificationsNew: () => emailNotificationsNew,
  ngoReviews: () => ngoReviews,
  ngos: () => ngos,
  notificationSettings: () => notificationSettings,
  partnerships: () => partnerships,
  pets: () => pets,
  rescueReports: () => rescueReports,
  rescueReportsNew: () => rescueReportsNew,
  session: () => session,
  smsNotifications: () => smsNotifications,
  teamMembers: () => teamMembers,
  teamMembersNew: () => teamMembersNew,
  user: () => user,
  verification: () => verification,
  whatsappMessages: () => whatsappMessages,
  whatsappMessagesApp: () => whatsappMessagesApp,
  whatsappMessagesNew: () => whatsappMessagesNew
});
import { sqliteTable, integer, text, real } from "file:///C:/Users/risha/Downloads/pawrescuee-1-main/pawrescuee-1-main/node_modules/drizzle-orm/sqlite-core/index.js";
var user, session, account, verification, whatsappMessages, ngos, partnerships, ngoReviews, animalShelters, pets, adoptionGuides, emailNotifications, smsNotifications, notificationSettings, rescueReports, animals, teamMembers, adoptionApplications, whatsappMessagesNew, appUsers, rescueReportsNew, whatsappMessagesApp, adoptionApplicationsNew, adoptionGuidesNew, emailNotificationsNew, teamMembersNew;
var init_schema = __esm({
  "src/db/schema.ts"() {
    user = sqliteTable("user", {
      id: text("id").primaryKey(),
      name: text("name").notNull(),
      email: text("email").notNull().unique(),
      emailVerified: integer("email_verified", { mode: "boolean" }).$defaultFn(() => false).notNull(),
      image: text("image"),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
      updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    session = sqliteTable("session", {
      id: text("id").primaryKey(),
      expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
      token: text("token").notNull().unique(),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" })
    });
    account = sqliteTable("account", {
      id: text("id").primaryKey(),
      accountId: text("account_id").notNull(),
      providerId: text("provider_id").notNull(),
      userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
      accessToken: text("access_token"),
      refreshToken: text("refresh_token"),
      idToken: text("id_token"),
      accessTokenExpiresAt: integer("access_token_expires_at", {
        mode: "timestamp"
      }),
      refreshTokenExpiresAt: integer("refresh_token_expires_at", {
        mode: "timestamp"
      }),
      scope: text("scope"),
      password: text("password"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull()
    });
    verification = sqliteTable("verification", {
      id: text("id").primaryKey(),
      identifier: text("identifier").notNull(),
      value: text("value").notNull(),
      expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
        () => /* @__PURE__ */ new Date()
      ),
      updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
        () => /* @__PURE__ */ new Date()
      )
    });
    whatsappMessages = sqliteTable("whatsapp_messages", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      senderPhone: text("sender_phone").notNull(),
      receiverPhone: text("receiver_phone").notNull(),
      senderName: text("sender_name"),
      receiverName: text("receiver_name"),
      messageText: text("message_text").notNull(),
      timestamp: integer("timestamp", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
      read: integer("read", { mode: "boolean" }).default(false).notNull(),
      chatRoomId: text("chat_room_id").notNull(),
      messageType: text("message_type").default("text").notNull(),
      userId: text("user_id").references(() => user.id),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    ngos = sqliteTable("ngos", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      name: text("name").notNull(),
      description: text("description"),
      address: text("address").notNull(),
      city: text("city").notNull(),
      state: text("state").notNull(),
      phone: text("phone").notNull(),
      email: text("email").notNull(),
      website: text("website"),
      workingHours: text("working_hours"),
      specialization: text("specialization", { mode: "json" }),
      operatingHours: text("operating_hours"),
      servicesOffered: text("services_offered"),
      latitude: real("latitude"),
      longitude: real("longitude"),
      verified: integer("verified", { mode: "boolean" }).default(true).notNull(),
      rating: real("rating").default(0),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
      updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    partnerships = sqliteTable("partnerships", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      ngoId: integer("ngo_id").references(() => ngos.id),
      title: text("title").notNull(),
      description: text("description"),
      programType: text("program_type"),
      geographicFocus: text("geographic_focus"),
      beneficiaries: text("beneficiaries"),
      fundingSources: text("funding_sources"),
      startDate: integer("start_date", { mode: "timestamp" }),
      endDate: integer("end_date", { mode: "timestamp" }),
      contactName: text("contact_name"),
      contactEmail: text("contact_email"),
      contactPhone: text("contact_phone"),
      website: text("website"),
      status: text("status").default("active"),
      // active, paused, ended
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
      updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    ngoReviews = sqliteTable("ngo_reviews", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      ngoId: integer("ngo_id").references(() => ngos.id).notNull(),
      userId: integer("user_id").references(() => appUsers.id),
      rating: integer("rating").notNull(),
      // 1-5
      title: text("title"),
      body: text("body"),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    animalShelters = sqliteTable("animal_shelters", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      name: text("name").notNull(),
      description: text("description"),
      address: text("address").notNull(),
      city: text("city").notNull(),
      state: text("state").notNull(),
      phone: text("phone").notNull(),
      email: text("email").notNull(),
      website: text("website"),
      capacity: integer("capacity").notNull(),
      currentAnimals: integer("current_animals").default(0).notNull(),
      facilities: text("facilities", { mode: "json" }),
      operatingHours: text("operating_hours"),
      latitude: real("latitude"),
      longitude: real("longitude"),
      verified: integer("verified", { mode: "boolean" }).default(true).notNull(),
      rating: real("rating").default(0),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
      updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    pets = sqliteTable("pets", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      name: text("name").notNull(),
      species: text("species").notNull(),
      breed: text("breed"),
      age: integer("age"),
      gender: text("gender"),
      size: text("size"),
      color: text("color"),
      description: text("description"),
      healthStatus: text("health_status"),
      vaccinationStatus: text("vaccination_status"),
      neutered: integer("neutered", { mode: "boolean" }).default(false),
      shelterId: integer("shelter_id").references(() => animalShelters.id),
      ngoId: integer("ngo_id").references(() => ngos.id),
      adoptionStatus: text("adoption_status").default("available").notNull(),
      images: text("images", { mode: "json" }),
      imageUrl: text("image_url"),
      specialNeeds: text("special_needs"),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
      updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    adoptionGuides = sqliteTable("adoption_guides", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      title: text("title").notNull(),
      content: text("content").notNull(),
      category: text("category").notNull(),
      shelterId: integer("shelter_id").references(() => animalShelters.id),
      ngoId: integer("ngo_id").references(() => ngos.id),
      petSpecies: text("pet_species"),
      requirements: text("requirements", { mode: "json" }),
      procedures: text("procedures", { mode: "json" }),
      documentsNeeded: text("documents_needed", { mode: "json" }),
      fees: text("fees"),
      timeline: text("timeline"),
      species: text("species"),
      orderIndex: integer("order_index"),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
      updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    emailNotifications = sqliteTable("email_notifications", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      recipientEmail: text("recipient_email").notNull(),
      subject: text("subject").notNull(),
      message: text("message").notNull(),
      notificationType: text("notification_type").notNull(),
      sent: integer("sent", { mode: "boolean" }).default(false).notNull(),
      sentAt: integer("sent_at", { mode: "timestamp" }),
      userId: text("user_id").references(() => user.id),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    smsNotifications = sqliteTable("sms_notifications", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      phoneNumber: text("phone_number").notNull(),
      message: text("message").notNull(),
      notificationType: text("notification_type").notNull(),
      status: text("status").notNull().default("queued"),
      // queued, sent, failed
      sentAt: integer("sent_at", { mode: "timestamp" }),
      userId: text("user_id").references(() => user.id),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    notificationSettings = sqliteTable("notification_settings", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      userId: text("user_id").references(() => user.id).notNull(),
      emailUpdates: integer("email_updates", { mode: "boolean" }).default(true).notNull(),
      pushNotifications: integer("push_notifications", { mode: "boolean" }).default(true).notNull(),
      smsAlerts: integer("sms_alerts", { mode: "boolean" }).default(false).notNull(),
      adoptionMatches: integer("adoption_matches", { mode: "boolean" }).default(true).notNull(),
      rescueUpdates: integer("rescue_updates", { mode: "boolean" }).default(true).notNull(),
      newsletter: integer("newsletter", { mode: "boolean" }).default(false).notNull(),
      marketingEmails: integer("marketing_emails", { mode: "boolean" }).default(false).notNull(),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
      updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    rescueReports = sqliteTable("rescue_reports", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      userId: text("user_id").references(() => user.id),
      animalType: text("animal_type").notNull(),
      description: text("description").notNull(),
      location: text("location").notNull(),
      urgency: text("urgency").notNull(),
      // 'low', 'medium', 'high', 'critical'
      contactInfo: text("contact_info").notNull(),
      status: text("status").notNull().default("new"),
      // 'new', 'pending', 'in-progress', 'resolved'
      assignedTo: text("assigned_to"),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
      updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    animals = sqliteTable("animals", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      ngoId: text("ngo_id").references(() => user.id),
      name: text("name").notNull(),
      species: text("species").notNull(),
      breed: text("breed").notNull(),
      age: text("age").notNull(),
      size: text("size").notNull(),
      healthStatus: text("health_status").notNull(),
      adoptionStatus: text("adoption_status").notNull().default("available"),
      // 'available', 'pending', 'adopted'
      description: text("description"),
      imageUrl: text("image_url"),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    teamMembers = sqliteTable("team_members", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      ngoId: text("ngo_id").references(() => user.id).notNull(),
      name: text("name").notNull(),
      role: text("role").notNull(),
      email: text("email").notNull(),
      phone: text("phone"),
      specialization: text("specialization"),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    adoptionApplications = sqliteTable("adoption_applications", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      animalId: integer("animal_id").references(() => animals.id).notNull(),
      applicantName: text("applicant_name").notNull(),
      applicantEmail: text("applicant_email").notNull(),
      applicantPhone: text("applicant_phone").notNull(),
      status: text("status").notNull().default("pending"),
      // 'pending', 'approved', 'rejected'
      message: text("message"),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    whatsappMessagesNew = sqliteTable("whatsapp_messages_new", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      userId: text("user_id").references(() => user.id),
      phoneNumber: text("phone_number").notNull(),
      message: text("message").notNull(),
      direction: text("direction").notNull(),
      // 'sent', 'received'
      status: text("status").notNull().default("pending"),
      // 'pending', 'delivered', 'failed'
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    appUsers = sqliteTable("app_users", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      name: text("name").notNull(),
      email: text("email").notNull().unique(),
      passwordHash: text("password_hash").notNull(),
      phone: text("phone"),
      role: text("role").notNull().default("user"),
      avatarUrl: text("avatar_url"),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
      updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    rescueReportsNew = sqliteTable("rescue_reports_new", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      userId: integer("user_id").references(() => appUsers.id),
      animalType: text("animal_type").notNull(),
      location: text("location").notNull(),
      latitude: real("latitude"),
      longitude: real("longitude"),
      description: text("description").notNull(),
      urgency: text("urgency").notNull().default("medium"),
      status: text("status").notNull().default("pending"),
      imageUrl: text("image_url"),
      phone: text("phone").notNull(),
      email: text("email").notNull(),
      assignedNgoId: integer("assigned_ngo_id").references(() => ngos.id),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
      updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    whatsappMessagesApp = sqliteTable("whatsapp_messages_app", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      senderId: integer("sender_id").references(() => appUsers.id),
      receiverId: integer("receiver_id").references(() => appUsers.id),
      message: text("message").notNull(),
      phoneNumber: text("phone_number"),
      senderPhone: text("sender_phone"),
      receiverPhone: text("receiver_phone"),
      timestamp: integer("timestamp", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
      read: integer("read", { mode: "boolean" }).default(false).notNull(),
      messageType: text("message_type").default("text").notNull()
    });
    adoptionApplicationsNew = sqliteTable("adoption_applications_new", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      userId: integer("user_id").references(() => appUsers.id).notNull(),
      petId: integer("pet_id").references(() => pets.id).notNull(),
      status: text("status").notNull().default("pending"),
      applicationDate: integer("application_date", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
      notes: text("notes"),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    adoptionGuidesNew = sqliteTable("adoption_guides_new", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      title: text("title").notNull(),
      category: text("category").notNull(),
      content: text("content").notNull(),
      steps: text("steps", { mode: "json" }),
      requirements: text("requirements", { mode: "json" }),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    emailNotificationsNew = sqliteTable("email_notifications_new", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      userId: integer("user_id").references(() => appUsers.id),
      recipientEmail: text("recipient_email").notNull(),
      subject: text("subject").notNull(),
      message: text("message").notNull(),
      notificationType: text("notification_type").notNull(),
      sentAt: integer("sent_at", { mode: "timestamp" }),
      status: text("status").notNull().default("pending")
    });
    teamMembersNew = sqliteTable("team_members_new", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      name: text("name").notNull(),
      role: text("role").notNull(),
      specialty: text("specialty"),
      bio: text("bio"),
      imageUrl: text("image_url"),
      phone: text("phone"),
      email: text("email").notNull(),
      experienceYears: integer("experience_years"),
      createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
  }
});

// src/db/index.ts
var db;
var init_db = __esm({
  async "src/db/index.ts"() {
    init_schema();
    if (process.env.TURSO_CONNECTION_URL && process.env.TURSO_AUTH_TOKEN) {
      const { drizzle } = await import("file:///C:/Users/risha/Downloads/pawrescuee-1-main/pawrescuee-1-main/node_modules/drizzle-orm/libsql/index.js");
      const { createClient } = await import("file:///C:/Users/risha/Downloads/pawrescuee-1-main/pawrescuee-1-main/node_modules/@libsql/client/lib-esm/node.js");
      const client = createClient({
        url: process.env.TURSO_CONNECTION_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
      });
      db = drizzle(client, { schema: schema_exports });
    } else {
      const { drizzle } = await import("file:///C:/Users/risha/Downloads/pawrescuee-1-main/pawrescuee-1-main/node_modules/drizzle-orm/index.js");
      const Database = (await import("better-sqlite3")).default;
      const sqlitePath = process.env.SQLITE_DB_PATH || "./dev.sqlite3";
      const sqlite = new Database(sqlitePath);
      db = drizzle(sqlite, { schema: schema_exports });
    }
  }
});

// src/lib/auth.ts
import { betterAuth } from "file:///C:/Users/risha/Downloads/pawrescuee-1-main/pawrescuee-1-main/node_modules/better-auth/dist/index.mjs";
import { drizzleAdapter } from "file:///C:/Users/risha/Downloads/pawrescuee-1-main/pawrescuee-1-main/node_modules/better-auth/dist/adapters/drizzle-adapter/index.mjs";
import { bearer } from "file:///C:/Users/risha/Downloads/pawrescuee-1-main/pawrescuee-1-main/node_modules/better-auth/dist/plugins/index.mjs";
var auth;
var init_auth = __esm({
  async "src/lib/auth.ts"() {
    await init_db();
    auth = betterAuth({
      database: drizzleAdapter(db, {
        provider: "sqlite"
      }),
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false
      },
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID || "",
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
          enabled: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET
        }
      },
      plugins: [bearer()],
      trustedOrigins: ["http://localhost:3000", "http://127.0.0.1:3000"]
    });
  }
});

// src/server/auth-handler.ts
var auth_handler_exports = {};
__export(auth_handler_exports, {
  handleAuthRequest: () => handleAuthRequest
});
async function handleAuthRequest(request) {
  try {
    const url = new URL(request.url);
    const path2 = url.pathname.replace("/api/auth/", "");
    const authRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.method !== "GET" && request.method !== "HEAD" ? await request.text() : void 0
    });
    const response = await auth.handler(authRequest);
    return response;
  } catch (error) {
    console.error("Auth handler error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
var init_auth_handler = __esm({
  async "src/server/auth-handler.ts"() {
    await init_auth();
  }
});

// vite.config.ts
import { defineConfig } from "file:///C:/Users/risha/Downloads/pawrescuee-1-main/pawrescuee-1-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/risha/Downloads/pawrescuee-1-main/pawrescuee-1-main/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\risha\\Downloads\\pawrescuee-1-main\\pawrescuee-1-main";
var logErrorsPlugin = () => ({
  name: "log-errors-plugin",
  // Inject a small client-side script that mirrors Vite overlay errors to console
  transformIndexHtml() {
    return {
      tags: [
        {
          tag: "script",
          injectTo: "head",
          children: `(() => {
            try {
              const logOverlay = () => {
                const el = document.querySelector('vite-error-overlay');
                if (!el) return;
                const root = (el.shadowRoot || el);
                let text = '';
                try { text = root.textContent || ''; } catch (_) {}
                if (text && text.trim()) {
                  const msg = text.trim();
                  // Use console.error to surface clearly in DevTools
                  console.error('[Vite Overlay]', msg);
                  // Also mirror to parent iframe with structured payload
                  try {
                    if (window.parent && window.parent !== window) {
                      window.parent.postMessage({
                        type: 'ERROR_CAPTURED',
                        error: {
                          message: msg,
                          stack: undefined,
                          filename: undefined,
                          lineno: undefined,
                          colno: undefined,
                          source: 'vite.overlay',
                        },
                        timestamp: Date.now(),
                      }, '*');
                    }
                  } catch (_) {}
                }
              };

              const obs = new MutationObserver(() => logOverlay());
              obs.observe(document.documentElement, { childList: true, subtree: true });

              window.addEventListener('DOMContentLoaded', logOverlay);
              // Attempt immediately as overlay may already exist
              logOverlay();
            } catch (e) {
              console.warn('[Vite Overlay logger failed]', e);
            }
          })();`
        }
      ]
    };
  }
});
var authMiddlewarePlugin = () => ({
  name: "auth-middleware",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url?.startsWith("/api/auth/")) {
        try {
          const { handleAuthRequest: handleAuthRequest2 } = await init_auth_handler().then(() => auth_handler_exports);
          const protocol = req.headers["x-forwarded-proto"] || "http";
          const host = req.headers.host || "localhost:3000";
          const url = `${protocol}://${host}${req.url}`;
          const headers = new Headers();
          Object.entries(req.headers).forEach(([key, value]) => {
            if (value) headers.set(key, Array.isArray(value) ? value[0] : value);
          });
          let body = void 0;
          if (req.method !== "GET" && req.method !== "HEAD") {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            body = Buffer.concat(chunks).toString("utf-8");
          }
          const request = new Request(url, {
            method: req.method,
            headers,
            body
          });
          const response = await handleAuthRequest2(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => {
            res.setHeader(key, value);
          });
          const responseBody = await response.text();
          res.end(responseBody);
        } catch (error) {
          console.error("Auth middleware error:", error);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Auth handler error", details: error.message }));
        }
      } else {
        next();
      }
    });
  }
});
var vite_config_default = defineConfig(async ({ mode }) => {
  const componentTagger = null;
  return {
    server: {
      host: "::",
      port: 3e3,
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            proxy.on("proxyReq", (proxyReq, req, res) => {
              console.log(`[Proxy] ${req.method} ${req.url} -> http://localhost:3001${req.url}`);
            });
            proxy.on("error", (err, req, res) => {
              console.error("[Proxy Error]", err);
            });
          }
        }
      }
    },
    plugins: [
      react(),
      authMiddlewarePlugin(),
      logErrorsPlugin()
    ],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2RiL3NjaGVtYS50cyIsICJzcmMvZGIvaW5kZXgudHMiLCAic3JjL2xpYi9hdXRoLnRzIiwgInNyYy9zZXJ2ZXIvYXV0aC1oYW5kbGVyLnRzIiwgInZpdGUuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxccmlzaGFcXFxcRG93bmxvYWRzXFxcXHBhd3Jlc2N1ZWUtMS1tYWluXFxcXHBhd3Jlc2N1ZWUtMS1tYWluXFxcXHNyY1xcXFxkYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxccmlzaGFcXFxcRG93bmxvYWRzXFxcXHBhd3Jlc2N1ZWUtMS1tYWluXFxcXHBhd3Jlc2N1ZWUtMS1tYWluXFxcXHNyY1xcXFxkYlxcXFxzY2hlbWEudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3Jpc2hhL0Rvd25sb2Fkcy9wYXdyZXNjdWVlLTEtbWFpbi9wYXdyZXNjdWVlLTEtbWFpbi9zcmMvZGIvc2NoZW1hLnRzXCI7aW1wb3J0IHsgc3FsaXRlVGFibGUsIGludGVnZXIsIHRleHQsIHJlYWwgfSBmcm9tICdkcml6emxlLW9ybS9zcWxpdGUtY29yZSc7XG5cblxuXG4vLyBBdXRoIHRhYmxlcyBmb3IgYmV0dGVyLWF1dGhcbmV4cG9ydCBjb25zdCB1c2VyID0gc3FsaXRlVGFibGUoXCJ1c2VyXCIsIHtcbiAgaWQ6IHRleHQoXCJpZFwiKS5wcmltYXJ5S2V5KCksXG4gIG5hbWU6IHRleHQoXCJuYW1lXCIpLm5vdE51bGwoKSxcbiAgZW1haWw6IHRleHQoXCJlbWFpbFwiKS5ub3ROdWxsKCkudW5pcXVlKCksXG4gIGVtYWlsVmVyaWZpZWQ6IGludGVnZXIoXCJlbWFpbF92ZXJpZmllZFwiLCB7IG1vZGU6IFwiYm9vbGVhblwiIH0pXG4gICAgLiRkZWZhdWx0Rm4oKCkgPT4gZmFsc2UpXG4gICAgLm5vdE51bGwoKSxcbiAgaW1hZ2U6IHRleHQoXCJpbWFnZVwiKSxcbiAgY3JlYXRlZEF0OiBpbnRlZ2VyKFwiY3JlYXRlZF9hdFwiLCB7IG1vZGU6IFwidGltZXN0YW1wXCIgfSlcbiAgICAuJGRlZmF1bHRGbigoKSA9PiBuZXcgRGF0ZSgpKVxuICAgIC5ub3ROdWxsKCksXG4gIHVwZGF0ZWRBdDogaW50ZWdlcihcInVwZGF0ZWRfYXRcIiwgeyBtb2RlOiBcInRpbWVzdGFtcFwiIH0pXG4gICAgLiRkZWZhdWx0Rm4oKCkgPT4gbmV3IERhdGUoKSlcbiAgICAubm90TnVsbCgpLFxufSk7XG5cbmV4cG9ydCBjb25zdCBzZXNzaW9uID0gc3FsaXRlVGFibGUoXCJzZXNzaW9uXCIsIHtcbiAgaWQ6IHRleHQoXCJpZFwiKS5wcmltYXJ5S2V5KCksXG4gIGV4cGlyZXNBdDogaW50ZWdlcihcImV4cGlyZXNfYXRcIiwgeyBtb2RlOiBcInRpbWVzdGFtcFwiIH0pLm5vdE51bGwoKSxcbiAgdG9rZW46IHRleHQoXCJ0b2tlblwiKS5ub3ROdWxsKCkudW5pcXVlKCksXG4gIGNyZWF0ZWRBdDogaW50ZWdlcihcImNyZWF0ZWRfYXRcIiwgeyBtb2RlOiBcInRpbWVzdGFtcFwiIH0pLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiBpbnRlZ2VyKFwidXBkYXRlZF9hdFwiLCB7IG1vZGU6IFwidGltZXN0YW1wXCIgfSkubm90TnVsbCgpLFxuICBpcEFkZHJlc3M6IHRleHQoXCJpcF9hZGRyZXNzXCIpLFxuICB1c2VyQWdlbnQ6IHRleHQoXCJ1c2VyX2FnZW50XCIpLFxuICB1c2VySWQ6IHRleHQoXCJ1c2VyX2lkXCIpXG4gICAgLm5vdE51bGwoKVxuICAgIC5yZWZlcmVuY2VzKCgpID0+IHVzZXIuaWQsIHsgb25EZWxldGU6IFwiY2FzY2FkZVwiIH0pLFxufSk7XG5cbmV4cG9ydCBjb25zdCBhY2NvdW50ID0gc3FsaXRlVGFibGUoXCJhY2NvdW50XCIsIHtcbiAgaWQ6IHRleHQoXCJpZFwiKS5wcmltYXJ5S2V5KCksXG4gIGFjY291bnRJZDogdGV4dChcImFjY291bnRfaWRcIikubm90TnVsbCgpLFxuICBwcm92aWRlcklkOiB0ZXh0KFwicHJvdmlkZXJfaWRcIikubm90TnVsbCgpLFxuICB1c2VySWQ6IHRleHQoXCJ1c2VyX2lkXCIpXG4gICAgLm5vdE51bGwoKVxuICAgIC5yZWZlcmVuY2VzKCgpID0+IHVzZXIuaWQsIHsgb25EZWxldGU6IFwiY2FzY2FkZVwiIH0pLFxuICBhY2Nlc3NUb2tlbjogdGV4dChcImFjY2Vzc190b2tlblwiKSxcbiAgcmVmcmVzaFRva2VuOiB0ZXh0KFwicmVmcmVzaF90b2tlblwiKSxcbiAgaWRUb2tlbjogdGV4dChcImlkX3Rva2VuXCIpLFxuICBhY2Nlc3NUb2tlbkV4cGlyZXNBdDogaW50ZWdlcihcImFjY2Vzc190b2tlbl9leHBpcmVzX2F0XCIsIHtcbiAgICBtb2RlOiBcInRpbWVzdGFtcFwiLFxuICB9KSxcbiAgcmVmcmVzaFRva2VuRXhwaXJlc0F0OiBpbnRlZ2VyKFwicmVmcmVzaF90b2tlbl9leHBpcmVzX2F0XCIsIHtcbiAgICBtb2RlOiBcInRpbWVzdGFtcFwiLFxuICB9KSxcbiAgc2NvcGU6IHRleHQoXCJzY29wZVwiKSxcbiAgcGFzc3dvcmQ6IHRleHQoXCJwYXNzd29yZFwiKSxcbiAgY3JlYXRlZEF0OiBpbnRlZ2VyKFwiY3JlYXRlZF9hdFwiLCB7IG1vZGU6IFwidGltZXN0YW1wXCIgfSkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IGludGVnZXIoXCJ1cGRhdGVkX2F0XCIsIHsgbW9kZTogXCJ0aW1lc3RhbXBcIiB9KS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IGNvbnN0IHZlcmlmaWNhdGlvbiA9IHNxbGl0ZVRhYmxlKFwidmVyaWZpY2F0aW9uXCIsIHtcbiAgaWQ6IHRleHQoXCJpZFwiKS5wcmltYXJ5S2V5KCksXG4gIGlkZW50aWZpZXI6IHRleHQoXCJpZGVudGlmaWVyXCIpLm5vdE51bGwoKSxcbiAgdmFsdWU6IHRleHQoXCJ2YWx1ZVwiKS5ub3ROdWxsKCksXG4gIGV4cGlyZXNBdDogaW50ZWdlcihcImV4cGlyZXNfYXRcIiwgeyBtb2RlOiBcInRpbWVzdGFtcFwiIH0pLm5vdE51bGwoKSxcbiAgY3JlYXRlZEF0OiBpbnRlZ2VyKFwiY3JlYXRlZF9hdFwiLCB7IG1vZGU6IFwidGltZXN0YW1wXCIgfSkuJGRlZmF1bHRGbihcbiAgICAoKSA9PiBuZXcgRGF0ZSgpLFxuICApLFxuICB1cGRhdGVkQXQ6IGludGVnZXIoXCJ1cGRhdGVkX2F0XCIsIHsgbW9kZTogXCJ0aW1lc3RhbXBcIiB9KS4kZGVmYXVsdEZuKFxuICAgICgpID0+IG5ldyBEYXRlKCksXG4gICksXG59KTtcblxuLy8gV2hhdHNBcHAgbWVzc2FnZXMgdGFibGVcbmV4cG9ydCBjb25zdCB3aGF0c2FwcE1lc3NhZ2VzID0gc3FsaXRlVGFibGUoJ3doYXRzYXBwX21lc3NhZ2VzJywge1xuICBpZDogaW50ZWdlcignaWQnKS5wcmltYXJ5S2V5KHsgYXV0b0luY3JlbWVudDogdHJ1ZSB9KSxcbiAgc2VuZGVyUGhvbmU6IHRleHQoJ3NlbmRlcl9waG9uZScpLm5vdE51bGwoKSxcbiAgcmVjZWl2ZXJQaG9uZTogdGV4dCgncmVjZWl2ZXJfcGhvbmUnKS5ub3ROdWxsKCksXG4gIHNlbmRlck5hbWU6IHRleHQoJ3NlbmRlcl9uYW1lJyksXG4gIHJlY2VpdmVyTmFtZTogdGV4dCgncmVjZWl2ZXJfbmFtZScpLFxuICBtZXNzYWdlVGV4dDogdGV4dCgnbWVzc2FnZV90ZXh0Jykubm90TnVsbCgpLFxuICB0aW1lc3RhbXA6IGludGVnZXIoJ3RpbWVzdGFtcCcsIHsgbW9kZTogJ3RpbWVzdGFtcCcgfSkuJGRlZmF1bHRGbigoKSA9PiBuZXcgRGF0ZSgpKS5ub3ROdWxsKCksXG4gIHJlYWQ6IGludGVnZXIoJ3JlYWQnLCB7IG1vZGU6ICdib29sZWFuJyB9KS5kZWZhdWx0KGZhbHNlKS5ub3ROdWxsKCksXG4gIGNoYXRSb29tSWQ6IHRleHQoJ2NoYXRfcm9vbV9pZCcpLm5vdE51bGwoKSxcbiAgbWVzc2FnZVR5cGU6IHRleHQoJ21lc3NhZ2VfdHlwZScpLmRlZmF1bHQoJ3RleHQnKS5ub3ROdWxsKCksXG4gIHVzZXJJZDogdGV4dCgndXNlcl9pZCcpLnJlZmVyZW5jZXMoKCkgPT4gdXNlci5pZCksXG4gIGNyZWF0ZWRBdDogaW50ZWdlcignY3JlYXRlZF9hdCcsIHsgbW9kZTogJ3RpbWVzdGFtcCcgfSkuJGRlZmF1bHRGbigoKSA9PiBuZXcgRGF0ZSgpKS5ub3ROdWxsKCksXG59KTtcblxuLy8gTkdPcyB0YWJsZVxuZXhwb3J0IGNvbnN0IG5nb3MgPSBzcWxpdGVUYWJsZSgnbmdvcycsIHtcbiAgaWQ6IGludGVnZXIoJ2lkJykucHJpbWFyeUtleSh7IGF1dG9JbmNyZW1lbnQ6IHRydWUgfSksXG4gIG5hbWU6IHRleHQoJ25hbWUnKS5ub3ROdWxsKCksXG4gIGRlc2NyaXB0aW9uOiB0ZXh0KCdkZXNjcmlwdGlvbicpLFxuICBhZGRyZXNzOiB0ZXh0KCdhZGRyZXNzJykubm90TnVsbCgpLFxuICBjaXR5OiB0ZXh0KCdjaXR5Jykubm90TnVsbCgpLFxuICBzdGF0ZTogdGV4dCgnc3RhdGUnKS5ub3ROdWxsKCksXG4gIHBob25lOiB0ZXh0KCdwaG9uZScpLm5vdE51bGwoKSxcbiAgZW1haWw6IHRleHQoJ2VtYWlsJykubm90TnVsbCgpLFxuICB3ZWJzaXRlOiB0ZXh0KCd3ZWJzaXRlJyksXG4gIHdvcmtpbmdIb3VyczogdGV4dCgnd29ya2luZ19ob3VycycpLFxuICBzcGVjaWFsaXphdGlvbjogdGV4dCgnc3BlY2lhbGl6YXRpb24nLCB7IG1vZGU6ICdqc29uJyB9KSxcbiAgb3BlcmF0aW5nSG91cnM6IHRleHQoJ29wZXJhdGluZ19ob3VycycpLFxuICBzZXJ2aWNlc09mZmVyZWQ6IHRleHQoJ3NlcnZpY2VzX29mZmVyZWQnKSxcbiAgbGF0aXR1ZGU6IHJlYWwoJ2xhdGl0dWRlJyksXG4gIGxvbmdpdHVkZTogcmVhbCgnbG9uZ2l0dWRlJyksXG4gIHZlcmlmaWVkOiBpbnRlZ2VyKCd2ZXJpZmllZCcsIHsgbW9kZTogJ2Jvb2xlYW4nIH0pLmRlZmF1bHQodHJ1ZSkubm90TnVsbCgpLFxuICByYXRpbmc6IHJlYWwoJ3JhdGluZycpLmRlZmF1bHQoMC4wKSxcbiAgY3JlYXRlZEF0OiBpbnRlZ2VyKCdjcmVhdGVkX2F0JywgeyBtb2RlOiAndGltZXN0YW1wJyB9KS4kZGVmYXVsdEZuKCgpID0+IG5ldyBEYXRlKCkpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiBpbnRlZ2VyKCd1cGRhdGVkX2F0JywgeyBtb2RlOiAndGltZXN0YW1wJyB9KS4kZGVmYXVsdEZuKCgpID0+IG5ldyBEYXRlKCkpLm5vdE51bGwoKSxcbn0pO1xuXG4vLyBQYXJ0bmVyc2hpcHMgdGFibGUgLSBOR08gcHJvZ3JhbXMgYW5kIGNvbGxhYm9yYXRpb25zXG5leHBvcnQgY29uc3QgcGFydG5lcnNoaXBzID0gc3FsaXRlVGFibGUoJ3BhcnRuZXJzaGlwcycsIHtcbiAgaWQ6IGludGVnZXIoJ2lkJykucHJpbWFyeUtleSh7IGF1dG9JbmNyZW1lbnQ6IHRydWUgfSksXG4gIG5nb0lkOiBpbnRlZ2VyKCduZ29faWQnKS5yZWZlcmVuY2VzKCgpID0+IG5nb3MuaWQpLFxuICB0aXRsZTogdGV4dCgndGl0bGUnKS5ub3ROdWxsKCksXG4gIGRlc2NyaXB0aW9uOiB0ZXh0KCdkZXNjcmlwdGlvbicpLFxuICBwcm9ncmFtVHlwZTogdGV4dCgncHJvZ3JhbV90eXBlJyksXG4gIGdlb2dyYXBoaWNGb2N1czogdGV4dCgnZ2VvZ3JhcGhpY19mb2N1cycpLFxuICBiZW5lZmljaWFyaWVzOiB0ZXh0KCdiZW5lZmljaWFyaWVzJyksXG4gIGZ1bmRpbmdTb3VyY2VzOiB0ZXh0KCdmdW5kaW5nX3NvdXJjZXMnKSxcbiAgc3RhcnREYXRlOiBpbnRlZ2VyKCdzdGFydF9kYXRlJywgeyBtb2RlOiAndGltZXN0YW1wJyB9KSxcbiAgZW5kRGF0ZTogaW50ZWdlcignZW5kX2RhdGUnLCB7IG1vZGU6ICd0aW1lc3RhbXAnIH0pLFxuICBjb250YWN0TmFtZTogdGV4dCgnY29udGFjdF9uYW1lJyksXG4gIGNvbnRhY3RFbWFpbDogdGV4dCgnY29udGFjdF9lbWFpbCcpLFxuICBjb250YWN0UGhvbmU6IHRleHQoJ2NvbnRhY3RfcGhvbmUnKSxcbiAgd2Vic2l0ZTogdGV4dCgnd2Vic2l0ZScpLFxuICBzdGF0dXM6IHRleHQoJ3N0YXR1cycpLmRlZmF1bHQoJ2FjdGl2ZScpLCAvLyBhY3RpdmUsIHBhdXNlZCwgZW5kZWRcbiAgY3JlYXRlZEF0OiBpbnRlZ2VyKCdjcmVhdGVkX2F0JywgeyBtb2RlOiAndGltZXN0YW1wJyB9KS4kZGVmYXVsdEZuKCgpID0+IG5ldyBEYXRlKCkpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiBpbnRlZ2VyKCd1cGRhdGVkX2F0JywgeyBtb2RlOiAndGltZXN0YW1wJyB9KS4kZGVmYXVsdEZuKCgpID0+IG5ldyBEYXRlKCkpLm5vdE51bGwoKSxcbn0pO1xuXG4vLyBOR08gcmV2aWV3c1xuZXhwb3J0IGNvbnN0IG5nb1Jldmlld3MgPSBzcWxpdGVUYWJsZSgnbmdvX3Jldmlld3MnLCB7XG4gIGlkOiBpbnRlZ2VyKCdpZCcpLnByaW1hcnlLZXkoeyBhdXRvSW5jcmVtZW50OiB0cnVlIH0pLFxuICBuZ29JZDogaW50ZWdlcignbmdvX2lkJykucmVmZXJlbmNlcygoKSA9PiBuZ29zLmlkKS5ub3ROdWxsKCksXG4gIHVzZXJJZDogaW50ZWdlcigndXNlcl9pZCcpLnJlZmVyZW5jZXMoKCkgPT4gYXBwVXNlcnMuaWQpLFxuICByYXRpbmc6IGludGVnZXIoJ3JhdGluZycpLm5vdE51bGwoKSwgLy8gMS01XG4gIHRpdGxlOiB0ZXh0KCd0aXRsZScpLFxuICBib2R5OiB0ZXh0KCdib2R5JyksXG4gIGNyZWF0ZWRBdDogaW50ZWdlcignY3JlYXRlZF9hdCcsIHsgbW9kZTogJ3RpbWVzdGFtcCcgfSkuJGRlZmF1bHRGbigoKSA9PiBuZXcgRGF0ZSgpKS5ub3ROdWxsKCksXG59KTtcblxuLy8gQW5pbWFsIHNoZWx0ZXJzIHRhYmxlXG5leHBvcnQgY29uc3QgYW5pbWFsU2hlbHRlcnMgPSBzcWxpdGVUYWJsZSgnYW5pbWFsX3NoZWx0ZXJzJywge1xuICBpZDogaW50ZWdlcignaWQnKS5wcmltYXJ5S2V5KHsgYXV0b0luY3JlbWVudDogdHJ1ZSB9KSxcbiAgbmFtZTogdGV4dCgnbmFtZScpLm5vdE51bGwoKSxcbiAgZGVzY3JpcHRpb246IHRleHQoJ2Rlc2NyaXB0aW9uJyksXG4gIGFkZHJlc3M6IHRleHQoJ2FkZHJlc3MnKS5ub3ROdWxsKCksXG4gIGNpdHk6IHRleHQoJ2NpdHknKS5ub3ROdWxsKCksXG4gIHN0YXRlOiB0ZXh0KCdzdGF0ZScpLm5vdE51bGwoKSxcbiAgcGhvbmU6IHRleHQoJ3Bob25lJykubm90TnVsbCgpLFxuICBlbWFpbDogdGV4dCgnZW1haWwnKS5ub3ROdWxsKCksXG4gIHdlYnNpdGU6IHRleHQoJ3dlYnNpdGUnKSxcbiAgY2FwYWNpdHk6IGludGVnZXIoJ2NhcGFjaXR5Jykubm90TnVsbCgpLFxuICBjdXJyZW50QW5pbWFsczogaW50ZWdlcignY3VycmVudF9hbmltYWxzJykuZGVmYXVsdCgwKS5ub3ROdWxsKCksXG4gIGZhY2lsaXRpZXM6IHRleHQoJ2ZhY2lsaXRpZXMnLCB7IG1vZGU6ICdqc29uJyB9KSxcbiAgb3BlcmF0aW5nSG91cnM6IHRleHQoJ29wZXJhdGluZ19ob3VycycpLFxuICBsYXRpdHVkZTogcmVhbCgnbGF0aXR1ZGUnKSxcbiAgbG9uZ2l0dWRlOiByZWFsKCdsb25naXR1ZGUnKSxcbiAgdmVyaWZpZWQ6IGludGVnZXIoJ3ZlcmlmaWVkJywgeyBtb2RlOiAnYm9vbGVhbicgfSkuZGVmYXVsdCh0cnVlKS5ub3ROdWxsKCksXG4gIHJhdGluZzogcmVhbCgncmF0aW5nJykuZGVmYXVsdCgwLjApLFxuICBjcmVhdGVkQXQ6IGludGVnZXIoJ2NyZWF0ZWRfYXQnLCB7IG1vZGU6ICd0aW1lc3RhbXAnIH0pLiRkZWZhdWx0Rm4oKCkgPT4gbmV3IERhdGUoKSkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IGludGVnZXIoJ3VwZGF0ZWRfYXQnLCB7IG1vZGU6ICd0aW1lc3RhbXAnIH0pLiRkZWZhdWx0Rm4oKCkgPT4gbmV3IERhdGUoKSkubm90TnVsbCgpLFxufSk7XG5cbi8vIFBldHMgdGFibGVcbmV4cG9ydCBjb25zdCBwZXRzID0gc3FsaXRlVGFibGUoJ3BldHMnLCB7XG4gIGlkOiBpbnRlZ2VyKCdpZCcpLnByaW1hcnlLZXkoeyBhdXRvSW5jcmVtZW50OiB0cnVlIH0pLFxuICBuYW1lOiB0ZXh0KCduYW1lJykubm90TnVsbCgpLFxuICBzcGVjaWVzOiB0ZXh0KCdzcGVjaWVzJykubm90TnVsbCgpLFxuICBicmVlZDogdGV4dCgnYnJlZWQnKSxcbiAgYWdlOiBpbnRlZ2VyKCdhZ2UnKSxcbiAgZ2VuZGVyOiB0ZXh0KCdnZW5kZXInKSxcbiAgc2l6ZTogdGV4dCgnc2l6ZScpLFxuICBjb2xvcjogdGV4dCgnY29sb3InKSxcbiAgZGVzY3JpcHRpb246IHRleHQoJ2Rlc2NyaXB0aW9uJyksXG4gIGhlYWx0aFN0YXR1czogdGV4dCgnaGVhbHRoX3N0YXR1cycpLFxuICB2YWNjaW5hdGlvblN0YXR1czogdGV4dCgndmFjY2luYXRpb25fc3RhdHVzJyksXG4gIG5ldXRlcmVkOiBpbnRlZ2VyKCduZXV0ZXJlZCcsIHsgbW9kZTogJ2Jvb2xlYW4nIH0pLmRlZmF1bHQoZmFsc2UpLFxuICBzaGVsdGVySWQ6IGludGVnZXIoJ3NoZWx0ZXJfaWQnKS5yZWZlcmVuY2VzKCgpID0+IGFuaW1hbFNoZWx0ZXJzLmlkKSxcbiAgbmdvSWQ6IGludGVnZXIoJ25nb19pZCcpLnJlZmVyZW5jZXMoKCkgPT4gbmdvcy5pZCksXG4gIGFkb3B0aW9uU3RhdHVzOiB0ZXh0KCdhZG9wdGlvbl9zdGF0dXMnKS5kZWZhdWx0KCdhdmFpbGFibGUnKS5ub3ROdWxsKCksXG4gIGltYWdlczogdGV4dCgnaW1hZ2VzJywgeyBtb2RlOiAnanNvbicgfSksXG4gIGltYWdlVXJsOiB0ZXh0KCdpbWFnZV91cmwnKSxcbiAgc3BlY2lhbE5lZWRzOiB0ZXh0KCdzcGVjaWFsX25lZWRzJyksXG4gIGNyZWF0ZWRBdDogaW50ZWdlcignY3JlYXRlZF9hdCcsIHsgbW9kZTogJ3RpbWVzdGFtcCcgfSkuJGRlZmF1bHRGbigoKSA9PiBuZXcgRGF0ZSgpKS5ub3ROdWxsKCksXG4gIHVwZGF0ZWRBdDogaW50ZWdlcigndXBkYXRlZF9hdCcsIHsgbW9kZTogJ3RpbWVzdGFtcCcgfSkuJGRlZmF1bHRGbigoKSA9PiBuZXcgRGF0ZSgpKS5ub3ROdWxsKCksXG59KTtcblxuLy8gQWRvcHRpb24gZ3VpZGVzIHRhYmxlXG5leHBvcnQgY29uc3QgYWRvcHRpb25HdWlkZXMgPSBzcWxpdGVUYWJsZSgnYWRvcHRpb25fZ3VpZGVzJywge1xuICBpZDogaW50ZWdlcignaWQnKS5wcmltYXJ5S2V5KHsgYXV0b0luY3JlbWVudDogdHJ1ZSB9KSxcbiAgdGl0bGU6IHRleHQoJ3RpdGxlJykubm90TnVsbCgpLFxuICBjb250ZW50OiB0ZXh0KCdjb250ZW50Jykubm90TnVsbCgpLFxuICBjYXRlZ29yeTogdGV4dCgnY2F0ZWdvcnknKS5ub3ROdWxsKCksXG4gIHNoZWx0ZXJJZDogaW50ZWdlcignc2hlbHRlcl9pZCcpLnJlZmVyZW5jZXMoKCkgPT4gYW5pbWFsU2hlbHRlcnMuaWQpLFxuICBuZ29JZDogaW50ZWdlcignbmdvX2lkJykucmVmZXJlbmNlcygoKSA9PiBuZ29zLmlkKSxcbiAgcGV0U3BlY2llczogdGV4dCgncGV0X3NwZWNpZXMnKSxcbiAgcmVxdWlyZW1lbnRzOiB0ZXh0KCdyZXF1aXJlbWVudHMnLCB7IG1vZGU6ICdqc29uJyB9KSxcbiAgcHJvY2VkdXJlczogdGV4dCgncHJvY2VkdXJlcycsIHsgbW9kZTogJ2pzb24nIH0pLFxuICBkb2N1bWVudHNOZWVkZWQ6IHRleHQoJ2RvY3VtZW50c19uZWVkZWQnLCB7IG1vZGU6ICdqc29uJyB9KSxcbiAgZmVlczogdGV4dCgnZmVlcycpLFxuICB0aW1lbGluZTogdGV4dCgndGltZWxpbmUnKSxcbiAgc3BlY2llczogdGV4dCgnc3BlY2llcycpLFxuICBvcmRlckluZGV4OiBpbnRlZ2VyKCdvcmRlcl9pbmRleCcpLFxuICBjcmVhdGVkQXQ6IGludGVnZXIoJ2NyZWF0ZWRfYXQnLCB7IG1vZGU6ICd0aW1lc3RhbXAnIH0pLiRkZWZhdWx0Rm4oKCkgPT4gbmV3IERhdGUoKSkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IGludGVnZXIoJ3VwZGF0ZWRfYXQnLCB7IG1vZGU6ICd0aW1lc3RhbXAnIH0pLiRkZWZhdWx0Rm4oKCkgPT4gbmV3IERhdGUoKSkubm90TnVsbCgpLFxufSk7XG5cbi8vIEVtYWlsIG5vdGlmaWNhdGlvbnMgdGFibGVcbmV4cG9ydCBjb25zdCBlbWFpbE5vdGlmaWNhdGlvbnMgPSBzcWxpdGVUYWJsZSgnZW1haWxfbm90aWZpY2F0aW9ucycsIHtcbiAgaWQ6IGludGVnZXIoJ2lkJykucHJpbWFyeUtleSh7IGF1dG9JbmNyZW1lbnQ6IHRydWUgfSksXG4gIHJlY2lwaWVudEVtYWlsOiB0ZXh0KCdyZWNpcGllbnRfZW1haWwnKS5ub3ROdWxsKCksXG4gIHN1YmplY3Q6IHRleHQoJ3N1YmplY3QnKS5ub3ROdWxsKCksXG4gIG1lc3NhZ2U6IHRleHQoJ21lc3NhZ2UnKS5ub3ROdWxsKCksXG4gIG5vdGlmaWNhdGlvblR5cGU6IHRleHQoJ25vdGlmaWNhdGlvbl90eXBlJykubm90TnVsbCgpLFxuICBzZW50OiBpbnRlZ2VyKCdzZW50JywgeyBtb2RlOiAnYm9vbGVhbicgfSkuZGVmYXVsdChmYWxzZSkubm90TnVsbCgpLFxuICBzZW50QXQ6IGludGVnZXIoJ3NlbnRfYXQnLCB7IG1vZGU6ICd0aW1lc3RhbXAnIH0pLFxuICB1c2VySWQ6IHRleHQoJ3VzZXJfaWQnKS5yZWZlcmVuY2VzKCgpID0+IHVzZXIuaWQpLFxuICBjcmVhdGVkQXQ6IGludGVnZXIoJ2NyZWF0ZWRfYXQnLCB7IG1vZGU6ICd0aW1lc3RhbXAnIH0pLiRkZWZhdWx0Rm4oKCkgPT4gbmV3IERhdGUoKSkubm90TnVsbCgpLFxufSk7XG5cbi8vIFNNUyBub3RpZmljYXRpb25zIHRhYmxlIChtb2NrL3N0b3JhZ2UpXG5leHBvcnQgY29uc3Qgc21zTm90aWZpY2F0aW9ucyA9IHNxbGl0ZVRhYmxlKCdzbXNfbm90aWZpY2F0aW9ucycsIHtcbiAgaWQ6IGludGVnZXIoJ2lkJykucHJpbWFyeUtleSh7IGF1dG9JbmNyZW1lbnQ6IHRydWUgfSksXG4gIHBob25lTnVtYmVyOiB0ZXh0KCdwaG9uZV9udW1iZXInKS5ub3ROdWxsKCksXG4gIG1lc3NhZ2U6IHRleHQoJ21lc3NhZ2UnKS5ub3ROdWxsKCksXG4gIG5vdGlmaWNhdGlvblR5cGU6IHRleHQoJ25vdGlmaWNhdGlvbl90eXBlJykubm90TnVsbCgpLFxuICBzdGF0dXM6IHRleHQoJ3N0YXR1cycpLm5vdE51bGwoKS5kZWZhdWx0KCdxdWV1ZWQnKSwgLy8gcXVldWVkLCBzZW50LCBmYWlsZWRcbiAgc2VudEF0OiBpbnRlZ2VyKCdzZW50X2F0JywgeyBtb2RlOiAndGltZXN0YW1wJyB9KSxcbiAgdXNlcklkOiB0ZXh0KCd1c2VyX2lkJykucmVmZXJlbmNlcygoKSA9PiB1c2VyLmlkKSxcbiAgY3JlYXRlZEF0OiBpbnRlZ2VyKCdjcmVhdGVkX2F0JywgeyBtb2RlOiAndGltZXN0YW1wJyB9KS4kZGVmYXVsdEZuKCgpID0+IG5ldyBEYXRlKCkpLm5vdE51bGwoKSxcbn0pO1xuXG4vLyBOb3RpZmljYXRpb24gc2V0dGluZ3MgcGVyIHVzZXJcbmV4cG9ydCBjb25zdCBub3RpZmljYXRpb25TZXR0aW5ncyA9IHNxbGl0ZVRhYmxlKCdub3RpZmljYXRpb25fc2V0dGluZ3MnLCB7XG4gIGlkOiBpbnRlZ2VyKCdpZCcpLnByaW1hcnlLZXkoeyBhdXRvSW5jcmVtZW50OiB0cnVlIH0pLFxuICB1c2VySWQ6IHRleHQoJ3VzZXJfaWQnKS5yZWZlcmVuY2VzKCgpID0+IHVzZXIuaWQpLm5vdE51bGwoKSxcbiAgZW1haWxVcGRhdGVzOiBpbnRlZ2VyKCdlbWFpbF91cGRhdGVzJywgeyBtb2RlOiAnYm9vbGVhbicgfSkuZGVmYXVsdCh0cnVlKS5ub3ROdWxsKCksXG4gIHB1c2hOb3RpZmljYXRpb25zOiBpbnRlZ2VyKCdwdXNoX25vdGlmaWNhdGlvbnMnLCB7IG1vZGU6ICdib29sZWFuJyB9KS5kZWZhdWx0KHRydWUpLm5vdE51bGwoKSxcbiAgc21zQWxlcnRzOiBpbnRlZ2VyKCdzbXNfYWxlcnRzJywgeyBtb2RlOiAnYm9vbGVhbicgfSkuZGVmYXVsdChmYWxzZSkubm90TnVsbCgpLFxuICBhZG9wdGlvbk1hdGNoZXM6IGludGVnZXIoJ2Fkb3B0aW9uX21hdGNoZXMnLCB7IG1vZGU6ICdib29sZWFuJyB9KS5kZWZhdWx0KHRydWUpLm5vdE51bGwoKSxcbiAgcmVzY3VlVXBkYXRlczogaW50ZWdlcigncmVzY3VlX3VwZGF0ZXMnLCB7IG1vZGU6ICdib29sZWFuJyB9KS5kZWZhdWx0KHRydWUpLm5vdE51bGwoKSxcbiAgbmV3c2xldHRlcjogaW50ZWdlcignbmV3c2xldHRlcicsIHsgbW9kZTogJ2Jvb2xlYW4nIH0pLmRlZmF1bHQoZmFsc2UpLm5vdE51bGwoKSxcbiAgbWFya2V0aW5nRW1haWxzOiBpbnRlZ2VyKCdtYXJrZXRpbmdfZW1haWxzJywgeyBtb2RlOiAnYm9vbGVhbicgfSkuZGVmYXVsdChmYWxzZSkubm90TnVsbCgpLFxuICBjcmVhdGVkQXQ6IGludGVnZXIoJ2NyZWF0ZWRfYXQnLCB7IG1vZGU6ICd0aW1lc3RhbXAnIH0pLiRkZWZhdWx0Rm4oKCkgPT4gbmV3IERhdGUoKSkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IGludGVnZXIoJ3VwZGF0ZWRfYXQnLCB7IG1vZGU6ICd0aW1lc3RhbXAnIH0pLiRkZWZhdWx0Rm4oKCkgPT4gbmV3IERhdGUoKSkubm90TnVsbCgpLFxufSk7XG5cbi8vIEFkZCBuZXcgdGFibGVzIGZvciByZXNjdWUgcmVwb3J0cywgYW5pbWFscywgdGVhbSBtZW1iZXJzLCBhZG9wdGlvbiBhcHBsaWNhdGlvbnMsIGFuZCB3aGF0c2FwcCBtZXNzYWdlc1xuXG5leHBvcnQgY29uc3QgcmVzY3VlUmVwb3J0cyA9IHNxbGl0ZVRhYmxlKCdyZXNjdWVfcmVwb3J0cycsIHtcbiAgaWQ6IGludGVnZXIoJ2lkJykucHJpbWFyeUtleSh7IGF1dG9JbmNyZW1lbnQ6IHRydWUgfSksXG4gIHVzZXJJZDogdGV4dCgndXNlcl9pZCcpLnJlZmVyZW5jZXMoKCkgPT4gdXNlci5pZCksXG4gIGFuaW1hbFR5cGU6IHRleHQoJ2FuaW1hbF90eXBlJykubm90TnVsbCgpLFxuICBkZXNjcmlwdGlvbjogdGV4dCgnZGVzY3JpcHRpb24nKS5ub3ROdWxsKCksXG4gIGxvY2F0aW9uOiB0ZXh0KCdsb2NhdGlvbicpLm5vdE51bGwoKSxcbiAgdXJnZW5jeTogdGV4dCgndXJnZW5jeScpLm5vdE51bGwoKSwgLy8gJ2xvdycsICdtZWRpdW0nLCAnaGlnaCcsICdjcml0aWNhbCdcbiAgY29udGFjdEluZm86IHRleHQoJ2NvbnRhY3RfaW5mbycpLm5vdE51bGwoKSxcbiAgc3RhdHVzOiB0ZXh0KCdzdGF0dXMnKS5ub3ROdWxsKCkuZGVmYXVsdCgnbmV3JyksIC8vICduZXcnLCAncGVuZGluZycsICdpbi1wcm9ncmVzcycsICdyZXNvbHZlZCdcbiAgYXNzaWduZWRUbzogdGV4dCgnYXNzaWduZWRfdG8nKSxcbiAgY3JlYXRlZEF0OiBpbnRlZ2VyKCdjcmVhdGVkX2F0JywgeyBtb2RlOiAndGltZXN0YW1wJyB9KS4kZGVmYXVsdEZuKCgpID0+IG5ldyBEYXRlKCkpLm5vdE51bGwoKSxcbiAgdXBkYXRlZEF0OiBpbnRlZ2VyKCd1cGRhdGVkX2F0JywgeyBtb2RlOiAndGltZXN0YW1wJyB9KS4kZGVmYXVsdEZuKCgpID0+IG5ldyBEYXRlKCkpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgY29uc3QgYW5pbWFscyA9IHNxbGl0ZVRhYmxlKCdhbmltYWxzJywge1xuICBpZDogaW50ZWdlcignaWQnKS5wcmltYXJ5S2V5KHsgYXV0b0luY3JlbWVudDogdHJ1ZSB9KSxcbiAgbmdvSWQ6IHRleHQoJ25nb19pZCcpLnJlZmVyZW5jZXMoKCkgPT4gdXNlci5pZCksXG4gIG5hbWU6IHRleHQoJ25hbWUnKS5ub3ROdWxsKCksXG4gIHNwZWNpZXM6IHRleHQoJ3NwZWNpZXMnKS5ub3ROdWxsKCksXG4gIGJyZWVkOiB0ZXh0KCdicmVlZCcpLm5vdE51bGwoKSxcbiAgYWdlOiB0ZXh0KCdhZ2UnKS5ub3ROdWxsKCksXG4gIHNpemU6IHRleHQoJ3NpemUnKS5ub3ROdWxsKCksXG4gIGhlYWx0aFN0YXR1czogdGV4dCgnaGVhbHRoX3N0YXR1cycpLm5vdE51bGwoKSxcbiAgYWRvcHRpb25TdGF0dXM6IHRleHQoJ2Fkb3B0aW9uX3N0YXR1cycpLm5vdE51bGwoKS5kZWZhdWx0KCdhdmFpbGFibGUnKSwgLy8gJ2F2YWlsYWJsZScsICdwZW5kaW5nJywgJ2Fkb3B0ZWQnXG4gIGRlc2NyaXB0aW9uOiB0ZXh0KCdkZXNjcmlwdGlvbicpLFxuICBpbWFnZVVybDogdGV4dCgnaW1hZ2VfdXJsJyksXG4gIGNyZWF0ZWRBdDogaW50ZWdlcignY3JlYXRlZF9hdCcsIHsgbW9kZTogJ3RpbWVzdGFtcCcgfSkuJGRlZmF1bHRGbigoKSA9PiBuZXcgRGF0ZSgpKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IGNvbnN0IHRlYW1NZW1iZXJzID0gc3FsaXRlVGFibGUoJ3RlYW1fbWVtYmVycycsIHtcbiAgaWQ6IGludGVnZXIoJ2lkJykucHJpbWFyeUtleSh7IGF1dG9JbmNyZW1lbnQ6IHRydWUgfSksXG4gIG5nb0lkOiB0ZXh0KCduZ29faWQnKS5yZWZlcmVuY2VzKCgpID0+IHVzZXIuaWQpLm5vdE51bGwoKSxcbiAgbmFtZTogdGV4dCgnbmFtZScpLm5vdE51bGwoKSxcbiAgcm9sZTogdGV4dCgncm9sZScpLm5vdE51bGwoKSxcbiAgZW1haWw6IHRleHQoJ2VtYWlsJykubm90TnVsbCgpLFxuICBwaG9uZTogdGV4dCgncGhvbmUnKSxcbiAgc3BlY2lhbGl6YXRpb246IHRleHQoJ3NwZWNpYWxpemF0aW9uJyksXG4gIGNyZWF0ZWRBdDogaW50ZWdlcignY3JlYXRlZF9hdCcsIHsgbW9kZTogJ3RpbWVzdGFtcCcgfSkuJGRlZmF1bHRGbigoKSA9PiBuZXcgRGF0ZSgpKS5ub3ROdWxsKCksXG59KTtcblxuZXhwb3J0IGNvbnN0IGFkb3B0aW9uQXBwbGljYXRpb25zID0gc3FsaXRlVGFibGUoJ2Fkb3B0aW9uX2FwcGxpY2F0aW9ucycsIHtcbiAgaWQ6IGludGVnZXIoJ2lkJykucHJpbWFyeUtleSh7IGF1dG9JbmNyZW1lbnQ6IHRydWUgfSksXG4gIGFuaW1hbElkOiBpbnRlZ2VyKCdhbmltYWxfaWQnKS5yZWZlcmVuY2VzKCgpID0+IGFuaW1hbHMuaWQpLm5vdE51bGwoKSxcbiAgYXBwbGljYW50TmFtZTogdGV4dCgnYXBwbGljYW50X25hbWUnKS5ub3ROdWxsKCksXG4gIGFwcGxpY2FudEVtYWlsOiB0ZXh0KCdhcHBsaWNhbnRfZW1haWwnKS5ub3ROdWxsKCksXG4gIGFwcGxpY2FudFBob25lOiB0ZXh0KCdhcHBsaWNhbnRfcGhvbmUnKS5ub3ROdWxsKCksXG4gIHN0YXR1czogdGV4dCgnc3RhdHVzJykubm90TnVsbCgpLmRlZmF1bHQoJ3BlbmRpbmcnKSwgLy8gJ3BlbmRpbmcnLCAnYXBwcm92ZWQnLCAncmVqZWN0ZWQnXG4gIG1lc3NhZ2U6IHRleHQoJ21lc3NhZ2UnKSxcbiAgY3JlYXRlZEF0OiBpbnRlZ2VyKCdjcmVhdGVkX2F0JywgeyBtb2RlOiAndGltZXN0YW1wJyB9KS4kZGVmYXVsdEZuKCgpID0+IG5ldyBEYXRlKCkpLm5vdE51bGwoKSxcbn0pO1xuXG5leHBvcnQgY29uc3Qgd2hhdHNhcHBNZXNzYWdlc05ldyA9IHNxbGl0ZVRhYmxlKCd3aGF0c2FwcF9tZXNzYWdlc19uZXcnLCB7XG4gIGlkOiBpbnRlZ2VyKCdpZCcpLnByaW1hcnlLZXkoeyBhdXRvSW5jcmVtZW50OiB0cnVlIH0pLFxuICB1c2VySWQ6IHRleHQoJ3VzZXJfaWQnKS5yZWZlcmVuY2VzKCgpID0+IHVzZXIuaWQpLFxuICBwaG9uZU51bWJlcjogdGV4dCgncGhvbmVfbnVtYmVyJykubm90TnVsbCgpLFxuICBtZXNzYWdlOiB0ZXh0KCdtZXNzYWdlJykubm90TnVsbCgpLFxuICBkaXJlY3Rpb246IHRleHQoJ2RpcmVjdGlvbicpLm5vdE51bGwoKSwgLy8gJ3NlbnQnLCAncmVjZWl2ZWQnXG4gIHN0YXR1czogdGV4dCgnc3RhdHVzJykubm90TnVsbCgpLmRlZmF1bHQoJ3BlbmRpbmcnKSwgLy8gJ3BlbmRpbmcnLCAnZGVsaXZlcmVkJywgJ2ZhaWxlZCdcbiAgY3JlYXRlZEF0OiBpbnRlZ2VyKCdjcmVhdGVkX2F0JywgeyBtb2RlOiAndGltZXN0YW1wJyB9KS4kZGVmYXVsdEZuKCgpID0+IG5ldyBEYXRlKCkpLm5vdE51bGwoKSxcbn0pO1xuXG4vLyBBZGQgbmV3IHVzZXJzIHRhYmxlIGZvciBhcHBsaWNhdGlvbiB1c2VycyAoc2VwYXJhdGUgZnJvbSBhdXRoIHVzZXIgdGFibGUpXG5leHBvcnQgY29uc3QgYXBwVXNlcnMgPSBzcWxpdGVUYWJsZSgnYXBwX3VzZXJzJywge1xuICBpZDogaW50ZWdlcignaWQnKS5wcmltYXJ5S2V5KHsgYXV0b0luY3JlbWVudDogdHJ1ZSB9KSxcbiAgbmFtZTogdGV4dCgnbmFtZScpLm5vdE51bGwoKSxcbiAgZW1haWw6IHRleHQoJ2VtYWlsJykubm90TnVsbCgpLnVuaXF1ZSgpLFxuICBwYXNzd29yZEhhc2g6IHRleHQoJ3Bhc3N3b3JkX2hhc2gnKS5ub3ROdWxsKCksXG4gIHBob25lOiB0ZXh0KCdwaG9uZScpLFxuICByb2xlOiB0ZXh0KCdyb2xlJykubm90TnVsbCgpLmRlZmF1bHQoJ3VzZXInKSxcbiAgYXZhdGFyVXJsOiB0ZXh0KCdhdmF0YXJfdXJsJyksXG4gIGNyZWF0ZWRBdDogaW50ZWdlcignY3JlYXRlZF9hdCcsIHsgbW9kZTogJ3RpbWVzdGFtcCcgfSkuJGRlZmF1bHRGbigoKSA9PiBuZXcgRGF0ZSgpKS5ub3ROdWxsKCksXG4gIHVwZGF0ZWRBdDogaW50ZWdlcigndXBkYXRlZF9hdCcsIHsgbW9kZTogJ3RpbWVzdGFtcCcgfSkuJGRlZmF1bHRGbigoKSA9PiBuZXcgRGF0ZSgpKS5ub3ROdWxsKCksXG59KTtcblxuLy8gVXBkYXRlIHJlc2N1ZV9yZXBvcnRzIHRvIHVzZSBuZXcgc2NoZW1hXG5leHBvcnQgY29uc3QgcmVzY3VlUmVwb3J0c05ldyA9IHNxbGl0ZVRhYmxlKCdyZXNjdWVfcmVwb3J0c19uZXcnLCB7XG4gIGlkOiBpbnRlZ2VyKCdpZCcpLnByaW1hcnlLZXkoeyBhdXRvSW5jcmVtZW50OiB0cnVlIH0pLFxuICB1c2VySWQ6IGludGVnZXIoJ3VzZXJfaWQnKS5yZWZlcmVuY2VzKCgpID0+IGFwcFVzZXJzLmlkKSxcbiAgYW5pbWFsVHlwZTogdGV4dCgnYW5pbWFsX3R5cGUnKS5ub3ROdWxsKCksXG4gIGxvY2F0aW9uOiB0ZXh0KCdsb2NhdGlvbicpLm5vdE51bGwoKSxcbiAgbGF0aXR1ZGU6IHJlYWwoJ2xhdGl0dWRlJyksXG4gIGxvbmdpdHVkZTogcmVhbCgnbG9uZ2l0dWRlJyksXG4gIGRlc2NyaXB0aW9uOiB0ZXh0KCdkZXNjcmlwdGlvbicpLm5vdE51bGwoKSxcbiAgdXJnZW5jeTogdGV4dCgndXJnZW5jeScpLm5vdE51bGwoKS5kZWZhdWx0KCdtZWRpdW0nKSxcbiAgc3RhdHVzOiB0ZXh0KCdzdGF0dXMnKS5ub3ROdWxsKCkuZGVmYXVsdCgncGVuZGluZycpLFxuICBpbWFnZVVybDogdGV4dCgnaW1hZ2VfdXJsJyksXG4gIHBob25lOiB0ZXh0KCdwaG9uZScpLm5vdE51bGwoKSxcbiAgZW1haWw6IHRleHQoJ2VtYWlsJykubm90TnVsbCgpLFxuICBhc3NpZ25lZE5nb0lkOiBpbnRlZ2VyKCdhc3NpZ25lZF9uZ29faWQnKS5yZWZlcmVuY2VzKCgpID0+IG5nb3MuaWQpLFxuICBjcmVhdGVkQXQ6IGludGVnZXIoJ2NyZWF0ZWRfYXQnLCB7IG1vZGU6ICd0aW1lc3RhbXAnIH0pLiRkZWZhdWx0Rm4oKCkgPT4gbmV3IERhdGUoKSkubm90TnVsbCgpLFxuICB1cGRhdGVkQXQ6IGludGVnZXIoJ3VwZGF0ZWRfYXQnLCB7IG1vZGU6ICd0aW1lc3RhbXAnIH0pLiRkZWZhdWx0Rm4oKCkgPT4gbmV3IERhdGUoKSkubm90TnVsbCgpLFxufSk7XG5cbi8vIFVwZGF0ZSB3aGF0c2FwcF9tZXNzYWdlcyB0byB1c2UgbmV3IHNjaGVtYVxuZXhwb3J0IGNvbnN0IHdoYXRzYXBwTWVzc2FnZXNBcHAgPSBzcWxpdGVUYWJsZSgnd2hhdHNhcHBfbWVzc2FnZXNfYXBwJywge1xuICBpZDogaW50ZWdlcignaWQnKS5wcmltYXJ5S2V5KHsgYXV0b0luY3JlbWVudDogdHJ1ZSB9KSxcbiAgc2VuZGVySWQ6IGludGVnZXIoJ3NlbmRlcl9pZCcpLnJlZmVyZW5jZXMoKCkgPT4gYXBwVXNlcnMuaWQpLFxuICByZWNlaXZlcklkOiBpbnRlZ2VyKCdyZWNlaXZlcl9pZCcpLnJlZmVyZW5jZXMoKCkgPT4gYXBwVXNlcnMuaWQpLFxuICBtZXNzYWdlOiB0ZXh0KCdtZXNzYWdlJykubm90TnVsbCgpLFxuICBwaG9uZU51bWJlcjogdGV4dCgncGhvbmVfbnVtYmVyJyksXG4gIHNlbmRlclBob25lOiB0ZXh0KCdzZW5kZXJfcGhvbmUnKSxcbiAgcmVjZWl2ZXJQaG9uZTogdGV4dCgncmVjZWl2ZXJfcGhvbmUnKSxcbiAgdGltZXN0YW1wOiBpbnRlZ2VyKCd0aW1lc3RhbXAnLCB7IG1vZGU6ICd0aW1lc3RhbXAnIH0pLiRkZWZhdWx0Rm4oKCkgPT4gbmV3IERhdGUoKSkubm90TnVsbCgpLFxuICByZWFkOiBpbnRlZ2VyKCdyZWFkJywgeyBtb2RlOiAnYm9vbGVhbicgfSkuZGVmYXVsdChmYWxzZSkubm90TnVsbCgpLFxuICBtZXNzYWdlVHlwZTogdGV4dCgnbWVzc2FnZV90eXBlJykuZGVmYXVsdCgndGV4dCcpLm5vdE51bGwoKSxcbn0pO1xuXG4vLyBVcGRhdGUgYWRvcHRpb25fYXBwbGljYXRpb25zIHRvIHVzZSBuZXcgc2NoZW1hXG5leHBvcnQgY29uc3QgYWRvcHRpb25BcHBsaWNhdGlvbnNOZXcgPSBzcWxpdGVUYWJsZSgnYWRvcHRpb25fYXBwbGljYXRpb25zX25ldycsIHtcbiAgaWQ6IGludGVnZXIoJ2lkJykucHJpbWFyeUtleSh7IGF1dG9JbmNyZW1lbnQ6IHRydWUgfSksXG4gIHVzZXJJZDogaW50ZWdlcigndXNlcl9pZCcpLnJlZmVyZW5jZXMoKCkgPT4gYXBwVXNlcnMuaWQpLm5vdE51bGwoKSxcbiAgcGV0SWQ6IGludGVnZXIoJ3BldF9pZCcpLnJlZmVyZW5jZXMoKCkgPT4gcGV0cy5pZCkubm90TnVsbCgpLFxuICBzdGF0dXM6IHRleHQoJ3N0YXR1cycpLm5vdE51bGwoKS5kZWZhdWx0KCdwZW5kaW5nJyksXG4gIGFwcGxpY2F0aW9uRGF0ZTogaW50ZWdlcignYXBwbGljYXRpb25fZGF0ZScsIHsgbW9kZTogJ3RpbWVzdGFtcCcgfSkuJGRlZmF1bHRGbigoKSA9PiBuZXcgRGF0ZSgpKS5ub3ROdWxsKCksXG4gIG5vdGVzOiB0ZXh0KCdub3RlcycpLFxuICBjcmVhdGVkQXQ6IGludGVnZXIoJ2NyZWF0ZWRfYXQnLCB7IG1vZGU6ICd0aW1lc3RhbXAnIH0pLiRkZWZhdWx0Rm4oKCkgPT4gbmV3IERhdGUoKSkubm90TnVsbCgpLFxufSk7XG5cbi8vIFVwZGF0ZSBhZG9wdGlvbl9ndWlkZXMgdG8gdXNlIG5ldyBzY2hlbWFcbmV4cG9ydCBjb25zdCBhZG9wdGlvbkd1aWRlc05ldyA9IHNxbGl0ZVRhYmxlKCdhZG9wdGlvbl9ndWlkZXNfbmV3Jywge1xuICBpZDogaW50ZWdlcignaWQnKS5wcmltYXJ5S2V5KHsgYXV0b0luY3JlbWVudDogdHJ1ZSB9KSxcbiAgdGl0bGU6IHRleHQoJ3RpdGxlJykubm90TnVsbCgpLFxuICBjYXRlZ29yeTogdGV4dCgnY2F0ZWdvcnknKS5ub3ROdWxsKCksXG4gIGNvbnRlbnQ6IHRleHQoJ2NvbnRlbnQnKS5ub3ROdWxsKCksXG4gIHN0ZXBzOiB0ZXh0KCdzdGVwcycsIHsgbW9kZTogJ2pzb24nIH0pLFxuICByZXF1aXJlbWVudHM6IHRleHQoJ3JlcXVpcmVtZW50cycsIHsgbW9kZTogJ2pzb24nIH0pLFxuICBjcmVhdGVkQXQ6IGludGVnZXIoJ2NyZWF0ZWRfYXQnLCB7IG1vZGU6ICd0aW1lc3RhbXAnIH0pLiRkZWZhdWx0Rm4oKCkgPT4gbmV3IERhdGUoKSkubm90TnVsbCgpLFxufSk7XG5cbi8vIFVwZGF0ZSBlbWFpbF9ub3RpZmljYXRpb25zIHRvIHVzZSBuZXcgc2NoZW1hXG5leHBvcnQgY29uc3QgZW1haWxOb3RpZmljYXRpb25zTmV3ID0gc3FsaXRlVGFibGUoJ2VtYWlsX25vdGlmaWNhdGlvbnNfbmV3Jywge1xuICBpZDogaW50ZWdlcignaWQnKS5wcmltYXJ5S2V5KHsgYXV0b0luY3JlbWVudDogdHJ1ZSB9KSxcbiAgdXNlcklkOiBpbnRlZ2VyKCd1c2VyX2lkJykucmVmZXJlbmNlcygoKSA9PiBhcHBVc2Vycy5pZCksXG4gIHJlY2lwaWVudEVtYWlsOiB0ZXh0KCdyZWNpcGllbnRfZW1haWwnKS5ub3ROdWxsKCksXG4gIHN1YmplY3Q6IHRleHQoJ3N1YmplY3QnKS5ub3ROdWxsKCksXG4gIG1lc3NhZ2U6IHRleHQoJ21lc3NhZ2UnKS5ub3ROdWxsKCksXG4gIG5vdGlmaWNhdGlvblR5cGU6IHRleHQoJ25vdGlmaWNhdGlvbl90eXBlJykubm90TnVsbCgpLFxuICBzZW50QXQ6IGludGVnZXIoJ3NlbnRfYXQnLCB7IG1vZGU6ICd0aW1lc3RhbXAnIH0pLFxuICBzdGF0dXM6IHRleHQoJ3N0YXR1cycpLm5vdE51bGwoKS5kZWZhdWx0KCdwZW5kaW5nJyksXG59KTtcblxuLy8gVXBkYXRlIHRlYW1fbWVtYmVycyB0byB1c2UgbmV3IHNjaGVtYVxuZXhwb3J0IGNvbnN0IHRlYW1NZW1iZXJzTmV3ID0gc3FsaXRlVGFibGUoJ3RlYW1fbWVtYmVyc19uZXcnLCB7XG4gIGlkOiBpbnRlZ2VyKCdpZCcpLnByaW1hcnlLZXkoeyBhdXRvSW5jcmVtZW50OiB0cnVlIH0pLFxuICBuYW1lOiB0ZXh0KCduYW1lJykubm90TnVsbCgpLFxuICByb2xlOiB0ZXh0KCdyb2xlJykubm90TnVsbCgpLFxuICBzcGVjaWFsdHk6IHRleHQoJ3NwZWNpYWx0eScpLFxuICBiaW86IHRleHQoJ2JpbycpLFxuICBpbWFnZVVybDogdGV4dCgnaW1hZ2VfdXJsJyksXG4gIHBob25lOiB0ZXh0KCdwaG9uZScpLFxuICBlbWFpbDogdGV4dCgnZW1haWwnKS5ub3ROdWxsKCksXG4gIGV4cGVyaWVuY2VZZWFyczogaW50ZWdlcignZXhwZXJpZW5jZV95ZWFycycpLFxuICBjcmVhdGVkQXQ6IGludGVnZXIoJ2NyZWF0ZWRfYXQnLCB7IG1vZGU6ICd0aW1lc3RhbXAnIH0pLiRkZWZhdWx0Rm4oKCkgPT4gbmV3IERhdGUoKSkubm90TnVsbCgpLFxufSk7IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxyaXNoYVxcXFxEb3dubG9hZHNcXFxccGF3cmVzY3VlZS0xLW1haW5cXFxccGF3cmVzY3VlZS0xLW1haW5cXFxcc3JjXFxcXGRiXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxyaXNoYVxcXFxEb3dubG9hZHNcXFxccGF3cmVzY3VlZS0xLW1haW5cXFxccGF3cmVzY3VlZS0xLW1haW5cXFxcc3JjXFxcXGRiXFxcXGluZGV4LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9yaXNoYS9Eb3dubG9hZHMvcGF3cmVzY3VlZS0xLW1haW4vcGF3cmVzY3VlZS0xLW1haW4vc3JjL2RiL2luZGV4LnRzXCI7XG5pbXBvcnQgKiBhcyBzY2hlbWEgZnJvbSAnLi9zY2hlbWEnO1xuXG4vLyBTdXBwb3J0IHR3byBiYWNrZW5kczogbGlic3FsIChUdXJzbykgd2hlbiBlbnYgdmFycyBhcmUgcHJvdmlkZWQsIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gYmV0dGVyLXNxbGl0ZTMgZm9yIGxvY2FsIGRldmVsb3BtZW50LlxubGV0IGRiOiBhbnk7XG5cbmlmIChwcm9jZXNzLmVudi5UVVJTT19DT05ORUNUSU9OX1VSTCAmJiBwcm9jZXNzLmVudi5UVVJTT19BVVRIX1RPS0VOKSB7XG4gIC8vIFVzZSBsaWJzcWwgY2xpZW50IGZvciByZW1vdGUgREJcbiAgY29uc3QgeyBkcml6emxlIH0gPSBhd2FpdCBpbXBvcnQoJ2RyaXp6bGUtb3JtL2xpYnNxbCcpO1xuICBjb25zdCB7IGNyZWF0ZUNsaWVudCB9ID0gYXdhaXQgaW1wb3J0KCdAbGlic3FsL2NsaWVudCcpO1xuICBjb25zdCBjbGllbnQgPSBjcmVhdGVDbGllbnQoe1xuICAgIHVybDogcHJvY2Vzcy5lbnYuVFVSU09fQ09OTkVDVElPTl9VUkwsXG4gICAgYXV0aFRva2VuOiBwcm9jZXNzLmVudi5UVVJTT19BVVRIX1RPS0VOLFxuICB9KTtcbiAgZGIgPSBkcml6emxlKGNsaWVudCwgeyBzY2hlbWEgfSk7XG59IGVsc2Uge1xuICAvLyBMb2NhbCBTUUxpdGUgZmFsbGJhY2sgdXNpbmcgYmV0dGVyLXNxbGl0ZTNcbiAgY29uc3QgeyBkcml6emxlIH0gPSBhd2FpdCBpbXBvcnQoJ2RyaXp6bGUtb3JtJyk7XG4gIGNvbnN0IERhdGFiYXNlID0gKGF3YWl0IGltcG9ydCgnYmV0dGVyLXNxbGl0ZTMnKSkuZGVmYXVsdDtcbiAgY29uc3Qgc3FsaXRlUGF0aCA9IHByb2Nlc3MuZW52LlNRTElURV9EQl9QQVRIIHx8ICcuL2Rldi5zcWxpdGUzJztcbiAgY29uc3Qgc3FsaXRlID0gbmV3IERhdGFiYXNlKHNxbGl0ZVBhdGgpO1xuICBkYiA9IGRyaXp6bGUoc3FsaXRlLCB7IHNjaGVtYSB9KTtcbn1cblxuZXhwb3J0IHsgZGIgfTtcblxuZXhwb3J0IHR5cGUgRGF0YWJhc2UgPSB0eXBlb2YgZGI7IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxyaXNoYVxcXFxEb3dubG9hZHNcXFxccGF3cmVzY3VlZS0xLW1haW5cXFxccGF3cmVzY3VlZS0xLW1haW5cXFxcc3JjXFxcXGxpYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxccmlzaGFcXFxcRG93bmxvYWRzXFxcXHBhd3Jlc2N1ZWUtMS1tYWluXFxcXHBhd3Jlc2N1ZWUtMS1tYWluXFxcXHNyY1xcXFxsaWJcXFxcYXV0aC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvcmlzaGEvRG93bmxvYWRzL3Bhd3Jlc2N1ZWUtMS1tYWluL3Bhd3Jlc2N1ZWUtMS1tYWluL3NyYy9saWIvYXV0aC50c1wiO2ltcG9ydCB7IGJldHRlckF1dGggfSBmcm9tIFwiYmV0dGVyLWF1dGhcIjtcbmltcG9ydCB7IGRyaXp6bGVBZGFwdGVyIH0gZnJvbSBcImJldHRlci1hdXRoL2FkYXB0ZXJzL2RyaXp6bGVcIjtcbmltcG9ydCB7IGJlYXJlciB9IGZyb20gXCJiZXR0ZXItYXV0aC9wbHVnaW5zXCI7XG5pbXBvcnQgeyBkYiB9IGZyb20gXCIuLi9kYlwiO1xuIFxuZXhwb3J0IGNvbnN0IGF1dGggPSBiZXR0ZXJBdXRoKHtcblx0ZGF0YWJhc2U6IGRyaXp6bGVBZGFwdGVyKGRiLCB7XG5cdFx0cHJvdmlkZXI6IFwic3FsaXRlXCIsXG5cdH0pLFxuXHRlbWFpbEFuZFBhc3N3b3JkOiB7ICAgIFxuXHRcdGVuYWJsZWQ6IHRydWUsXG5cdFx0cmVxdWlyZUVtYWlsVmVyaWZpY2F0aW9uOiBmYWxzZSxcblx0fSxcblx0c29jaWFsUHJvdmlkZXJzOiB7XG5cdFx0Z29vZ2xlOiB7XG5cdFx0XHRjbGllbnRJZDogcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9JRCB8fCBcIlwiLFxuXHRcdFx0Y2xpZW50U2VjcmV0OiBwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX1NFQ1JFVCB8fCBcIlwiLFxuXHRcdFx0ZW5hYmxlZDogISFwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX0lEICYmICEhcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9TRUNSRVQsXG5cdFx0fSxcblx0fSxcblx0cGx1Z2luczogW2JlYXJlcigpXSxcblx0dHJ1c3RlZE9yaWdpbnM6IFtcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMFwiLCBcImh0dHA6Ly8xMjcuMC4wLjE6MzAwMFwiXSxcbn0pOyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxccmlzaGFcXFxcRG93bmxvYWRzXFxcXHBhd3Jlc2N1ZWUtMS1tYWluXFxcXHBhd3Jlc2N1ZWUtMS1tYWluXFxcXHNyY1xcXFxzZXJ2ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHJpc2hhXFxcXERvd25sb2Fkc1xcXFxwYXdyZXNjdWVlLTEtbWFpblxcXFxwYXdyZXNjdWVlLTEtbWFpblxcXFxzcmNcXFxcc2VydmVyXFxcXGF1dGgtaGFuZGxlci50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvcmlzaGEvRG93bmxvYWRzL3Bhd3Jlc2N1ZWUtMS1tYWluL3Bhd3Jlc2N1ZWUtMS1tYWluL3NyYy9zZXJ2ZXIvYXV0aC1oYW5kbGVyLnRzXCI7aW1wb3J0IHsgYXV0aCB9IGZyb20gXCIuLi9saWIvYXV0aFwiO1xuXG4vLyBWaXRlLWNvbXBhdGlibGUgYXV0aCBoYW5kbGVyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlQXV0aFJlcXVlc3QocmVxdWVzdDogUmVxdWVzdCk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHJlcXVlc3QudXJsKTtcbiAgICBjb25zdCBwYXRoID0gdXJsLnBhdGhuYW1lLnJlcGxhY2UoJy9hcGkvYXV0aC8nLCAnJyk7XG4gICAgXG4gICAgLy8gQ3JlYXRlIGEgcHJvcGVyIHJlcXVlc3Qgb2JqZWN0IGZvciBiZXR0ZXItYXV0aFxuICAgIGNvbnN0IGF1dGhSZXF1ZXN0ID0gbmV3IFJlcXVlc3QocmVxdWVzdC51cmwsIHtcbiAgICAgIG1ldGhvZDogcmVxdWVzdC5tZXRob2QsXG4gICAgICBoZWFkZXJzOiByZXF1ZXN0LmhlYWRlcnMsXG4gICAgICBib2R5OiByZXF1ZXN0Lm1ldGhvZCAhPT0gJ0dFVCcgJiYgcmVxdWVzdC5tZXRob2QgIT09ICdIRUFEJyA/IGF3YWl0IHJlcXVlc3QudGV4dCgpIDogdW5kZWZpbmVkLFxuICAgIH0pO1xuXG4gICAgLy8gQ2FsbCBiZXR0ZXItYXV0aCBoYW5kbGVyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhdXRoLmhhbmRsZXIoYXV0aFJlcXVlc3QpO1xuICAgIFxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdBdXRoIGhhbmRsZXIgZXJyb3I6JywgZXJyb3IpO1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoXG4gICAgICBKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJywgZGV0YWlsczogZXJyb3IubWVzc2FnZSB9KSxcbiAgICAgIHtcbiAgICAgICAgc3RhdHVzOiA1MDAsXG4gICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgfVxuICAgICk7XG4gIH1cbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxccmlzaGFcXFxcRG93bmxvYWRzXFxcXHBhd3Jlc2N1ZWUtMS1tYWluXFxcXHBhd3Jlc2N1ZWUtMS1tYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxyaXNoYVxcXFxEb3dubG9hZHNcXFxccGF3cmVzY3VlZS0xLW1haW5cXFxccGF3cmVzY3VlZS0xLW1haW5cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3Jpc2hhL0Rvd25sb2Fkcy9wYXdyZXNjdWVlLTEtbWFpbi9wYXdyZXNjdWVlLTEtbWFpbi92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbi8vIExvYWQgdmlzdWFsIGVkaXRzIHBsdWdpbiBkeW5hbWljYWxseSBpbiBkZXZlbG9wbWVudCBvbmx5IChhdm9pZHMgdG9wLWxldmVsIHJlc29sdXRpb24gaXNzdWVzKVxuXG4vLyBNaW5pbWFsIHBsdWdpbiB0byBsb2cgYnVpbGQtdGltZSBhbmQgZGV2LXRpbWUgZXJyb3JzIHRvIGNvbnNvbGVcbmNvbnN0IGxvZ0Vycm9yc1BsdWdpbiA9ICgpID0+ICh7XG4gIG5hbWU6IFwibG9nLWVycm9ycy1wbHVnaW5cIixcbiAgLy8gSW5qZWN0IGEgc21hbGwgY2xpZW50LXNpZGUgc2NyaXB0IHRoYXQgbWlycm9ycyBWaXRlIG92ZXJsYXkgZXJyb3JzIHRvIGNvbnNvbGVcbiAgdHJhbnNmb3JtSW5kZXhIdG1sKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0YWdzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0YWc6IFwic2NyaXB0XCIsXG4gICAgICAgICAgaW5qZWN0VG86IFwiaGVhZFwiLFxuICAgICAgICAgIGNoaWxkcmVuOiBgKCgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnN0IGxvZ092ZXJsYXkgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCd2aXRlLWVycm9yLW92ZXJsYXknKTtcbiAgICAgICAgICAgICAgICBpZiAoIWVsKSByZXR1cm47XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vdCA9IChlbC5zaGFkb3dSb290IHx8IGVsKTtcbiAgICAgICAgICAgICAgICBsZXQgdGV4dCA9ICcnO1xuICAgICAgICAgICAgICAgIHRyeSB7IHRleHQgPSByb290LnRleHRDb250ZW50IHx8ICcnOyB9IGNhdGNoIChfKSB7fVxuICAgICAgICAgICAgICAgIGlmICh0ZXh0ICYmIHRleHQudHJpbSgpKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSB0ZXh0LnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgIC8vIFVzZSBjb25zb2xlLmVycm9yIHRvIHN1cmZhY2UgY2xlYXJseSBpbiBEZXZUb29sc1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1ZpdGUgT3ZlcmxheV0nLCBtc2cpO1xuICAgICAgICAgICAgICAgICAgLy8gQWxzbyBtaXJyb3IgdG8gcGFyZW50IGlmcmFtZSB3aXRoIHN0cnVjdHVyZWQgcGF5bG9hZFxuICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5wYXJlbnQgJiYgd2luZG93LnBhcmVudCAhPT0gd2luZG93KSB7XG4gICAgICAgICAgICAgICAgICAgICAgd2luZG93LnBhcmVudC5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnRVJST1JfQ0FQVFVSRUQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogbXNnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFjazogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZTogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lbm86IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbm86IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiAndml0ZS5vdmVybGF5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgICAgICAgfSwgJyonKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoXykge31cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgY29uc3Qgb2JzID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4gbG9nT3ZlcmxheSgpKTtcbiAgICAgICAgICAgICAgb2JzLm9ic2VydmUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSB9KTtcblxuICAgICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGxvZ092ZXJsYXkpO1xuICAgICAgICAgICAgICAvLyBBdHRlbXB0IGltbWVkaWF0ZWx5IGFzIG92ZXJsYXkgbWF5IGFscmVhZHkgZXhpc3RcbiAgICAgICAgICAgICAgbG9nT3ZlcmxheSgpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tWaXRlIE92ZXJsYXkgbG9nZ2VyIGZhaWxlZF0nLCBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSgpO2BcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH07XG4gIH0sXG59KTtcblxuLy8gQXV0aCBtaWRkbGV3YXJlIHBsdWdpbiBmb3IgVml0ZVxuY29uc3QgYXV0aE1pZGRsZXdhcmVQbHVnaW4gPSAoKSA9PiAoe1xuICBuYW1lOiBcImF1dGgtbWlkZGxld2FyZVwiLFxuICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyOiBhbnkpIHtcbiAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGFzeW5jIChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkgPT4ge1xuICAgICAgaWYgKHJlcS51cmw/LnN0YXJ0c1dpdGgoJy9hcGkvYXV0aC8nKSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHsgaGFuZGxlQXV0aFJlcXVlc3QgfSA9IGF3YWl0IGltcG9ydCgnLi9zcmMvc2VydmVyL2F1dGgtaGFuZGxlcicpO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIEJ1aWxkIGZ1bGwgVVJMXG4gICAgICAgICAgY29uc3QgcHJvdG9jb2wgPSByZXEuaGVhZGVyc1sneC1mb3J3YXJkZWQtcHJvdG8nXSB8fCAnaHR0cCc7XG4gICAgICAgICAgY29uc3QgaG9zdCA9IHJlcS5oZWFkZXJzLmhvc3QgfHwgJ2xvY2FsaG9zdDozMDAwJztcbiAgICAgICAgICBjb25zdCB1cmwgPSBgJHtwcm90b2NvbH06Ly8ke2hvc3R9JHtyZXEudXJsfWA7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gQ29udmVydCB0byBXZWIgUmVxdWVzdFxuICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSGVhZGVycygpO1xuICAgICAgICAgIE9iamVjdC5lbnRyaWVzKHJlcS5oZWFkZXJzKS5mb3JFYWNoKChba2V5LCB2YWx1ZV06IFtzdHJpbmcsIGFueV0pID0+IHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkgaGVhZGVycy5zZXQoa2V5LCBBcnJheS5pc0FycmF5KHZhbHVlKSA/IHZhbHVlWzBdIDogdmFsdWUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIFxuICAgICAgICAgIGxldCBib2R5OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgaWYgKHJlcS5tZXRob2QgIT09ICdHRVQnICYmIHJlcS5tZXRob2QgIT09ICdIRUFEJykge1xuICAgICAgICAgICAgY29uc3QgY2h1bmtzOiBCdWZmZXJbXSA9IFtdO1xuICAgICAgICAgICAgZm9yIGF3YWl0IChjb25zdCBjaHVuayBvZiByZXEpIHtcbiAgICAgICAgICAgICAgY2h1bmtzLnB1c2goY2h1bmspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYm9keSA9IEJ1ZmZlci5jb25jYXQoY2h1bmtzKS50b1N0cmluZygndXRmLTgnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc3QgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KHVybCwge1xuICAgICAgICAgICAgbWV0aG9kOiByZXEubWV0aG9kLFxuICAgICAgICAgICAgaGVhZGVycyxcbiAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBoYW5kbGVBdXRoUmVxdWVzdChyZXF1ZXN0KTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSByZXNwb25zZS5zdGF0dXM7XG4gICAgICAgICAgcmVzcG9uc2UuaGVhZGVycy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKGtleSwgdmFsdWUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlQm9keSA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgICByZXMuZW5kKHJlc3BvbnNlQm9keSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignQXV0aCBtaWRkbGV3YXJlIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMDtcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ0F1dGggaGFuZGxlciBlcnJvcicsIGRldGFpbHM6IGVycm9yLm1lc3NhZ2UgfSkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG59KTtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyhhc3luYyAoeyBtb2RlIH0pID0+IHtcbiAgLy8gU2tpcCBkeW5hbWljIHBsdWdpbiBsb2FkaW5nIGR1cmluZyBjb25maWcgdGltZSB0byBhdm9pZCBALyBhbGlhcyByZXNvbHV0aW9uIGlzc3Vlc1xuICBjb25zdCBjb21wb25lbnRUYWdnZXIgPSBudWxsO1xuXG4gIHJldHVybiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogMzAwMCxcbiAgICBwcm94eToge1xuICAgICAgJy9hcGknOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJlOiAocHJveHksIG9wdGlvbnMpID0+IHtcbiAgICAgICAgICBwcm94eS5vbigncHJveHlSZXEnLCAocHJveHlSZXEsIHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW1Byb3h5XSAke3JlcS5tZXRob2R9ICR7cmVxLnVybH0gLT4gaHR0cDovL2xvY2FsaG9zdDozMDAxJHtyZXEudXJsfWApO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnIsIHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbUHJveHkgRXJyb3JdJywgZXJyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgYXV0aE1pZGRsZXdhcmVQbHVnaW4oKSxcbiAgICBsb2dFcnJvcnNQbHVnaW4oKSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxuICB9KTtcbn0pO1xuLy8gT3JjaGlkcyByZXN0YXJ0OiAxNzYyMTcyOTMwMDAwIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQWlZLFNBQVMsYUFBYSxTQUFTLE1BQU0sWUFBWTtBQUFsYixJQUthLE1BZ0JBLFNBYUEsU0FzQkEsY0FjQSxrQkFnQkEsTUF1QkEsY0FxQkEsWUFXQSxnQkF1QkEsTUF3QkEsZ0JBb0JBLG9CQWFBLGtCQVlBLHNCQWdCQSxlQWNBLFNBZUEsYUFXQSxzQkFXQSxxQkFXQSxVQWFBLGtCQW1CQSxxQkFjQSx5QkFXQSxtQkFXQSx1QkFZQTtBQXZZYjtBQUFBO0FBS08sSUFBTSxPQUFPLFlBQVksUUFBUTtBQUFBLE1BQ3RDLElBQUksS0FBSyxJQUFJLEVBQUUsV0FBVztBQUFBLE1BQzFCLE1BQU0sS0FBSyxNQUFNLEVBQUUsUUFBUTtBQUFBLE1BQzNCLE9BQU8sS0FBSyxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU87QUFBQSxNQUN0QyxlQUFlLFFBQVEsa0JBQWtCLEVBQUUsTUFBTSxVQUFVLENBQUMsRUFDekQsV0FBVyxNQUFNLEtBQUssRUFDdEIsUUFBUTtBQUFBLE1BQ1gsT0FBTyxLQUFLLE9BQU87QUFBQSxNQUNuQixXQUFXLFFBQVEsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDLEVBQ25ELFdBQVcsTUFBTSxvQkFBSSxLQUFLLENBQUMsRUFDM0IsUUFBUTtBQUFBLE1BQ1gsV0FBVyxRQUFRLGNBQWMsRUFBRSxNQUFNLFlBQVksQ0FBQyxFQUNuRCxXQUFXLE1BQU0sb0JBQUksS0FBSyxDQUFDLEVBQzNCLFFBQVE7QUFBQSxJQUNiLENBQUM7QUFFTSxJQUFNLFVBQVUsWUFBWSxXQUFXO0FBQUEsTUFDNUMsSUFBSSxLQUFLLElBQUksRUFBRSxXQUFXO0FBQUEsTUFDMUIsV0FBVyxRQUFRLGNBQWMsRUFBRSxNQUFNLFlBQVksQ0FBQyxFQUFFLFFBQVE7QUFBQSxNQUNoRSxPQUFPLEtBQUssT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPO0FBQUEsTUFDdEMsV0FBVyxRQUFRLGNBQWMsRUFBRSxNQUFNLFlBQVksQ0FBQyxFQUFFLFFBQVE7QUFBQSxNQUNoRSxXQUFXLFFBQVEsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDLEVBQUUsUUFBUTtBQUFBLE1BQ2hFLFdBQVcsS0FBSyxZQUFZO0FBQUEsTUFDNUIsV0FBVyxLQUFLLFlBQVk7QUFBQSxNQUM1QixRQUFRLEtBQUssU0FBUyxFQUNuQixRQUFRLEVBQ1IsV0FBVyxNQUFNLEtBQUssSUFBSSxFQUFFLFVBQVUsVUFBVSxDQUFDO0FBQUEsSUFDdEQsQ0FBQztBQUVNLElBQU0sVUFBVSxZQUFZLFdBQVc7QUFBQSxNQUM1QyxJQUFJLEtBQUssSUFBSSxFQUFFLFdBQVc7QUFBQSxNQUMxQixXQUFXLEtBQUssWUFBWSxFQUFFLFFBQVE7QUFBQSxNQUN0QyxZQUFZLEtBQUssYUFBYSxFQUFFLFFBQVE7QUFBQSxNQUN4QyxRQUFRLEtBQUssU0FBUyxFQUNuQixRQUFRLEVBQ1IsV0FBVyxNQUFNLEtBQUssSUFBSSxFQUFFLFVBQVUsVUFBVSxDQUFDO0FBQUEsTUFDcEQsYUFBYSxLQUFLLGNBQWM7QUFBQSxNQUNoQyxjQUFjLEtBQUssZUFBZTtBQUFBLE1BQ2xDLFNBQVMsS0FBSyxVQUFVO0FBQUEsTUFDeEIsc0JBQXNCLFFBQVEsMkJBQTJCO0FBQUEsUUFDdkQsTUFBTTtBQUFBLE1BQ1IsQ0FBQztBQUFBLE1BQ0QsdUJBQXVCLFFBQVEsNEJBQTRCO0FBQUEsUUFDekQsTUFBTTtBQUFBLE1BQ1IsQ0FBQztBQUFBLE1BQ0QsT0FBTyxLQUFLLE9BQU87QUFBQSxNQUNuQixVQUFVLEtBQUssVUFBVTtBQUFBLE1BQ3pCLFdBQVcsUUFBUSxjQUFjLEVBQUUsTUFBTSxZQUFZLENBQUMsRUFBRSxRQUFRO0FBQUEsTUFDaEUsV0FBVyxRQUFRLGNBQWMsRUFBRSxNQUFNLFlBQVksQ0FBQyxFQUFFLFFBQVE7QUFBQSxJQUNsRSxDQUFDO0FBRU0sSUFBTSxlQUFlLFlBQVksZ0JBQWdCO0FBQUEsTUFDdEQsSUFBSSxLQUFLLElBQUksRUFBRSxXQUFXO0FBQUEsTUFDMUIsWUFBWSxLQUFLLFlBQVksRUFBRSxRQUFRO0FBQUEsTUFDdkMsT0FBTyxLQUFLLE9BQU8sRUFBRSxRQUFRO0FBQUEsTUFDN0IsV0FBVyxRQUFRLGNBQWMsRUFBRSxNQUFNLFlBQVksQ0FBQyxFQUFFLFFBQVE7QUFBQSxNQUNoRSxXQUFXLFFBQVEsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDLEVBQUU7QUFBQSxRQUN0RCxNQUFNLG9CQUFJLEtBQUs7QUFBQSxNQUNqQjtBQUFBLE1BQ0EsV0FBVyxRQUFRLGNBQWMsRUFBRSxNQUFNLFlBQVksQ0FBQyxFQUFFO0FBQUEsUUFDdEQsTUFBTSxvQkFBSSxLQUFLO0FBQUEsTUFDakI7QUFBQSxJQUNGLENBQUM7QUFHTSxJQUFNLG1CQUFtQixZQUFZLHFCQUFxQjtBQUFBLE1BQy9ELElBQUksUUFBUSxJQUFJLEVBQUUsV0FBVyxFQUFFLGVBQWUsS0FBSyxDQUFDO0FBQUEsTUFDcEQsYUFBYSxLQUFLLGNBQWMsRUFBRSxRQUFRO0FBQUEsTUFDMUMsZUFBZSxLQUFLLGdCQUFnQixFQUFFLFFBQVE7QUFBQSxNQUM5QyxZQUFZLEtBQUssYUFBYTtBQUFBLE1BQzlCLGNBQWMsS0FBSyxlQUFlO0FBQUEsTUFDbEMsYUFBYSxLQUFLLGNBQWMsRUFBRSxRQUFRO0FBQUEsTUFDMUMsV0FBVyxRQUFRLGFBQWEsRUFBRSxNQUFNLFlBQVksQ0FBQyxFQUFFLFdBQVcsTUFBTSxvQkFBSSxLQUFLLENBQUMsRUFBRSxRQUFRO0FBQUEsTUFDNUYsTUFBTSxRQUFRLFFBQVEsRUFBRSxNQUFNLFVBQVUsQ0FBQyxFQUFFLFFBQVEsS0FBSyxFQUFFLFFBQVE7QUFBQSxNQUNsRSxZQUFZLEtBQUssY0FBYyxFQUFFLFFBQVE7QUFBQSxNQUN6QyxhQUFhLEtBQUssY0FBYyxFQUFFLFFBQVEsTUFBTSxFQUFFLFFBQVE7QUFBQSxNQUMxRCxRQUFRLEtBQUssU0FBUyxFQUFFLFdBQVcsTUFBTSxLQUFLLEVBQUU7QUFBQSxNQUNoRCxXQUFXLFFBQVEsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDLEVBQUUsV0FBVyxNQUFNLG9CQUFJLEtBQUssQ0FBQyxFQUFFLFFBQVE7QUFBQSxJQUMvRixDQUFDO0FBR00sSUFBTSxPQUFPLFlBQVksUUFBUTtBQUFBLE1BQ3RDLElBQUksUUFBUSxJQUFJLEVBQUUsV0FBVyxFQUFFLGVBQWUsS0FBSyxDQUFDO0FBQUEsTUFDcEQsTUFBTSxLQUFLLE1BQU0sRUFBRSxRQUFRO0FBQUEsTUFDM0IsYUFBYSxLQUFLLGFBQWE7QUFBQSxNQUMvQixTQUFTLEtBQUssU0FBUyxFQUFFLFFBQVE7QUFBQSxNQUNqQyxNQUFNLEtBQUssTUFBTSxFQUFFLFFBQVE7QUFBQSxNQUMzQixPQUFPLEtBQUssT0FBTyxFQUFFLFFBQVE7QUFBQSxNQUM3QixPQUFPLEtBQUssT0FBTyxFQUFFLFFBQVE7QUFBQSxNQUM3QixPQUFPLEtBQUssT0FBTyxFQUFFLFFBQVE7QUFBQSxNQUM3QixTQUFTLEtBQUssU0FBUztBQUFBLE1BQ3ZCLGNBQWMsS0FBSyxlQUFlO0FBQUEsTUFDbEMsZ0JBQWdCLEtBQUssa0JBQWtCLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFBQSxNQUN2RCxnQkFBZ0IsS0FBSyxpQkFBaUI7QUFBQSxNQUN0QyxpQkFBaUIsS0FBSyxrQkFBa0I7QUFBQSxNQUN4QyxVQUFVLEtBQUssVUFBVTtBQUFBLE1BQ3pCLFdBQVcsS0FBSyxXQUFXO0FBQUEsTUFDM0IsVUFBVSxRQUFRLFlBQVksRUFBRSxNQUFNLFVBQVUsQ0FBQyxFQUFFLFFBQVEsSUFBSSxFQUFFLFFBQVE7QUFBQSxNQUN6RSxRQUFRLEtBQUssUUFBUSxFQUFFLFFBQVEsQ0FBRztBQUFBLE1BQ2xDLFdBQVcsUUFBUSxjQUFjLEVBQUUsTUFBTSxZQUFZLENBQUMsRUFBRSxXQUFXLE1BQU0sb0JBQUksS0FBSyxDQUFDLEVBQUUsUUFBUTtBQUFBLE1BQzdGLFdBQVcsUUFBUSxjQUFjLEVBQUUsTUFBTSxZQUFZLENBQUMsRUFBRSxXQUFXLE1BQU0sb0JBQUksS0FBSyxDQUFDLEVBQUUsUUFBUTtBQUFBLElBQy9GLENBQUM7QUFHTSxJQUFNLGVBQWUsWUFBWSxnQkFBZ0I7QUFBQSxNQUN0RCxJQUFJLFFBQVEsSUFBSSxFQUFFLFdBQVcsRUFBRSxlQUFlLEtBQUssQ0FBQztBQUFBLE1BQ3BELE9BQU8sUUFBUSxRQUFRLEVBQUUsV0FBVyxNQUFNLEtBQUssRUFBRTtBQUFBLE1BQ2pELE9BQU8sS0FBSyxPQUFPLEVBQUUsUUFBUTtBQUFBLE1BQzdCLGFBQWEsS0FBSyxhQUFhO0FBQUEsTUFDL0IsYUFBYSxLQUFLLGNBQWM7QUFBQSxNQUNoQyxpQkFBaUIsS0FBSyxrQkFBa0I7QUFBQSxNQUN4QyxlQUFlLEtBQUssZUFBZTtBQUFBLE1BQ25DLGdCQUFnQixLQUFLLGlCQUFpQjtBQUFBLE1BQ3RDLFdBQVcsUUFBUSxjQUFjLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFBQSxNQUN0RCxTQUFTLFFBQVEsWUFBWSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQUEsTUFDbEQsYUFBYSxLQUFLLGNBQWM7QUFBQSxNQUNoQyxjQUFjLEtBQUssZUFBZTtBQUFBLE1BQ2xDLGNBQWMsS0FBSyxlQUFlO0FBQUEsTUFDbEMsU0FBUyxLQUFLLFNBQVM7QUFBQSxNQUN2QixRQUFRLEtBQUssUUFBUSxFQUFFLFFBQVEsUUFBUTtBQUFBO0FBQUEsTUFDdkMsV0FBVyxRQUFRLGNBQWMsRUFBRSxNQUFNLFlBQVksQ0FBQyxFQUFFLFdBQVcsTUFBTSxvQkFBSSxLQUFLLENBQUMsRUFBRSxRQUFRO0FBQUEsTUFDN0YsV0FBVyxRQUFRLGNBQWMsRUFBRSxNQUFNLFlBQVksQ0FBQyxFQUFFLFdBQVcsTUFBTSxvQkFBSSxLQUFLLENBQUMsRUFBRSxRQUFRO0FBQUEsSUFDL0YsQ0FBQztBQUdNLElBQU0sYUFBYSxZQUFZLGVBQWU7QUFBQSxNQUNuRCxJQUFJLFFBQVEsSUFBSSxFQUFFLFdBQVcsRUFBRSxlQUFlLEtBQUssQ0FBQztBQUFBLE1BQ3BELE9BQU8sUUFBUSxRQUFRLEVBQUUsV0FBVyxNQUFNLEtBQUssRUFBRSxFQUFFLFFBQVE7QUFBQSxNQUMzRCxRQUFRLFFBQVEsU0FBUyxFQUFFLFdBQVcsTUFBTSxTQUFTLEVBQUU7QUFBQSxNQUN2RCxRQUFRLFFBQVEsUUFBUSxFQUFFLFFBQVE7QUFBQTtBQUFBLE1BQ2xDLE9BQU8sS0FBSyxPQUFPO0FBQUEsTUFDbkIsTUFBTSxLQUFLLE1BQU07QUFBQSxNQUNqQixXQUFXLFFBQVEsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDLEVBQUUsV0FBVyxNQUFNLG9CQUFJLEtBQUssQ0FBQyxFQUFFLFFBQVE7QUFBQSxJQUMvRixDQUFDO0FBR00sSUFBTSxpQkFBaUIsWUFBWSxtQkFBbUI7QUFBQSxNQUMzRCxJQUFJLFFBQVEsSUFBSSxFQUFFLFdBQVcsRUFBRSxlQUFlLEtBQUssQ0FBQztBQUFBLE1BQ3BELE1BQU0sS0FBSyxNQUFNLEVBQUUsUUFBUTtBQUFBLE1BQzNCLGFBQWEsS0FBSyxhQUFhO0FBQUEsTUFDL0IsU0FBUyxLQUFLLFNBQVMsRUFBRSxRQUFRO0FBQUEsTUFDakMsTUFBTSxLQUFLLE1BQU0sRUFBRSxRQUFRO0FBQUEsTUFDM0IsT0FBTyxLQUFLLE9BQU8sRUFBRSxRQUFRO0FBQUEsTUFDN0IsT0FBTyxLQUFLLE9BQU8sRUFBRSxRQUFRO0FBQUEsTUFDN0IsT0FBTyxLQUFLLE9BQU8sRUFBRSxRQUFRO0FBQUEsTUFDN0IsU0FBUyxLQUFLLFNBQVM7QUFBQSxNQUN2QixVQUFVLFFBQVEsVUFBVSxFQUFFLFFBQVE7QUFBQSxNQUN0QyxnQkFBZ0IsUUFBUSxpQkFBaUIsRUFBRSxRQUFRLENBQUMsRUFBRSxRQUFRO0FBQUEsTUFDOUQsWUFBWSxLQUFLLGNBQWMsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUFBLE1BQy9DLGdCQUFnQixLQUFLLGlCQUFpQjtBQUFBLE1BQ3RDLFVBQVUsS0FBSyxVQUFVO0FBQUEsTUFDekIsV0FBVyxLQUFLLFdBQVc7QUFBQSxNQUMzQixVQUFVLFFBQVEsWUFBWSxFQUFFLE1BQU0sVUFBVSxDQUFDLEVBQUUsUUFBUSxJQUFJLEVBQUUsUUFBUTtBQUFBLE1BQ3pFLFFBQVEsS0FBSyxRQUFRLEVBQUUsUUFBUSxDQUFHO0FBQUEsTUFDbEMsV0FBVyxRQUFRLGNBQWMsRUFBRSxNQUFNLFlBQVksQ0FBQyxFQUFFLFdBQVcsTUFBTSxvQkFBSSxLQUFLLENBQUMsRUFBRSxRQUFRO0FBQUEsTUFDN0YsV0FBVyxRQUFRLGNBQWMsRUFBRSxNQUFNLFlBQVksQ0FBQyxFQUFFLFdBQVcsTUFBTSxvQkFBSSxLQUFLLENBQUMsRUFBRSxRQUFRO0FBQUEsSUFDL0YsQ0FBQztBQUdNLElBQU0sT0FBTyxZQUFZLFFBQVE7QUFBQSxNQUN0QyxJQUFJLFFBQVEsSUFBSSxFQUFFLFdBQVcsRUFBRSxlQUFlLEtBQUssQ0FBQztBQUFBLE1BQ3BELE1BQU0sS0FBSyxNQUFNLEVBQUUsUUFBUTtBQUFBLE1BQzNCLFNBQVMsS0FBSyxTQUFTLEVBQUUsUUFBUTtBQUFBLE1BQ2pDLE9BQU8sS0FBSyxPQUFPO0FBQUEsTUFDbkIsS0FBSyxRQUFRLEtBQUs7QUFBQSxNQUNsQixRQUFRLEtBQUssUUFBUTtBQUFBLE1BQ3JCLE1BQU0sS0FBSyxNQUFNO0FBQUEsTUFDakIsT0FBTyxLQUFLLE9BQU87QUFBQSxNQUNuQixhQUFhLEtBQUssYUFBYTtBQUFBLE1BQy9CLGNBQWMsS0FBSyxlQUFlO0FBQUEsTUFDbEMsbUJBQW1CLEtBQUssb0JBQW9CO0FBQUEsTUFDNUMsVUFBVSxRQUFRLFlBQVksRUFBRSxNQUFNLFVBQVUsQ0FBQyxFQUFFLFFBQVEsS0FBSztBQUFBLE1BQ2hFLFdBQVcsUUFBUSxZQUFZLEVBQUUsV0FBVyxNQUFNLGVBQWUsRUFBRTtBQUFBLE1BQ25FLE9BQU8sUUFBUSxRQUFRLEVBQUUsV0FBVyxNQUFNLEtBQUssRUFBRTtBQUFBLE1BQ2pELGdCQUFnQixLQUFLLGlCQUFpQixFQUFFLFFBQVEsV0FBVyxFQUFFLFFBQVE7QUFBQSxNQUNyRSxRQUFRLEtBQUssVUFBVSxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBQUEsTUFDdkMsVUFBVSxLQUFLLFdBQVc7QUFBQSxNQUMxQixjQUFjLEtBQUssZUFBZTtBQUFBLE1BQ2xDLFdBQVcsUUFBUSxjQUFjLEVBQUUsTUFBTSxZQUFZLENBQUMsRUFBRSxXQUFXLE1BQU0sb0JBQUksS0FBSyxDQUFDLEVBQUUsUUFBUTtBQUFBLE1BQzdGLFdBQVcsUUFBUSxjQUFjLEVBQUUsTUFBTSxZQUFZLENBQUMsRUFBRSxXQUFXLE1BQU0sb0JBQUksS0FBSyxDQUFDLEVBQUUsUUFBUTtBQUFBLElBQy9GLENBQUM7QUFHTSxJQUFNLGlCQUFpQixZQUFZLG1CQUFtQjtBQUFBLE1BQzNELElBQUksUUFBUSxJQUFJLEVBQUUsV0FBVyxFQUFFLGVBQWUsS0FBSyxDQUFDO0FBQUEsTUFDcEQsT0FBTyxLQUFLLE9BQU8sRUFBRSxRQUFRO0FBQUEsTUFDN0IsU0FBUyxLQUFLLFNBQVMsRUFBRSxRQUFRO0FBQUEsTUFDakMsVUFBVSxLQUFLLFVBQVUsRUFBRSxRQUFRO0FBQUEsTUFDbkMsV0FBVyxRQUFRLFlBQVksRUFBRSxXQUFXLE1BQU0sZUFBZSxFQUFFO0FBQUEsTUFDbkUsT0FBTyxRQUFRLFFBQVEsRUFBRSxXQUFXLE1BQU0sS0FBSyxFQUFFO0FBQUEsTUFDakQsWUFBWSxLQUFLLGFBQWE7QUFBQSxNQUM5QixjQUFjLEtBQUssZ0JBQWdCLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFBQSxNQUNuRCxZQUFZLEtBQUssY0FBYyxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBQUEsTUFDL0MsaUJBQWlCLEtBQUssb0JBQW9CLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFBQSxNQUMxRCxNQUFNLEtBQUssTUFBTTtBQUFBLE1BQ2pCLFVBQVUsS0FBSyxVQUFVO0FBQUEsTUFDekIsU0FBUyxLQUFLLFNBQVM7QUFBQSxNQUN2QixZQUFZLFFBQVEsYUFBYTtBQUFBLE1BQ2pDLFdBQVcsUUFBUSxjQUFjLEVBQUUsTUFBTSxZQUFZLENBQUMsRUFBRSxXQUFXLE1BQU0sb0JBQUksS0FBSyxDQUFDLEVBQUUsUUFBUTtBQUFBLE1BQzdGLFdBQVcsUUFBUSxjQUFjLEVBQUUsTUFBTSxZQUFZLENBQUMsRUFBRSxXQUFXLE1BQU0sb0JBQUksS0FBSyxDQUFDLEVBQUUsUUFBUTtBQUFBLElBQy9GLENBQUM7QUFHTSxJQUFNLHFCQUFxQixZQUFZLHVCQUF1QjtBQUFBLE1BQ25FLElBQUksUUFBUSxJQUFJLEVBQUUsV0FBVyxFQUFFLGVBQWUsS0FBSyxDQUFDO0FBQUEsTUFDcEQsZ0JBQWdCLEtBQUssaUJBQWlCLEVBQUUsUUFBUTtBQUFBLE1BQ2hELFNBQVMsS0FBSyxTQUFTLEVBQUUsUUFBUTtBQUFBLE1BQ2pDLFNBQVMsS0FBSyxTQUFTLEVBQUUsUUFBUTtBQUFBLE1BQ2pDLGtCQUFrQixLQUFLLG1CQUFtQixFQUFFLFFBQVE7QUFBQSxNQUNwRCxNQUFNLFFBQVEsUUFBUSxFQUFFLE1BQU0sVUFBVSxDQUFDLEVBQUUsUUFBUSxLQUFLLEVBQUUsUUFBUTtBQUFBLE1BQ2xFLFFBQVEsUUFBUSxXQUFXLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFBQSxNQUNoRCxRQUFRLEtBQUssU0FBUyxFQUFFLFdBQVcsTUFBTSxLQUFLLEVBQUU7QUFBQSxNQUNoRCxXQUFXLFFBQVEsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDLEVBQUUsV0FBVyxNQUFNLG9CQUFJLEtBQUssQ0FBQyxFQUFFLFFBQVE7QUFBQSxJQUMvRixDQUFDO0FBR00sSUFBTSxtQkFBbUIsWUFBWSxxQkFBcUI7QUFBQSxNQUMvRCxJQUFJLFFBQVEsSUFBSSxFQUFFLFdBQVcsRUFBRSxlQUFlLEtBQUssQ0FBQztBQUFBLE1BQ3BELGFBQWEsS0FBSyxjQUFjLEVBQUUsUUFBUTtBQUFBLE1BQzFDLFNBQVMsS0FBSyxTQUFTLEVBQUUsUUFBUTtBQUFBLE1BQ2pDLGtCQUFrQixLQUFLLG1CQUFtQixFQUFFLFFBQVE7QUFBQSxNQUNwRCxRQUFRLEtBQUssUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLFFBQVE7QUFBQTtBQUFBLE1BQ2pELFFBQVEsUUFBUSxXQUFXLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFBQSxNQUNoRCxRQUFRLEtBQUssU0FBUyxFQUFFLFdBQVcsTUFBTSxLQUFLLEVBQUU7QUFBQSxNQUNoRCxXQUFXLFFBQVEsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDLEVBQUUsV0FBVyxNQUFNLG9CQUFJLEtBQUssQ0FBQyxFQUFFLFFBQVE7QUFBQSxJQUMvRixDQUFDO0FBR00sSUFBTSx1QkFBdUIsWUFBWSx5QkFBeUI7QUFBQSxNQUN2RSxJQUFJLFFBQVEsSUFBSSxFQUFFLFdBQVcsRUFBRSxlQUFlLEtBQUssQ0FBQztBQUFBLE1BQ3BELFFBQVEsS0FBSyxTQUFTLEVBQUUsV0FBVyxNQUFNLEtBQUssRUFBRSxFQUFFLFFBQVE7QUFBQSxNQUMxRCxjQUFjLFFBQVEsaUJBQWlCLEVBQUUsTUFBTSxVQUFVLENBQUMsRUFBRSxRQUFRLElBQUksRUFBRSxRQUFRO0FBQUEsTUFDbEYsbUJBQW1CLFFBQVEsc0JBQXNCLEVBQUUsTUFBTSxVQUFVLENBQUMsRUFBRSxRQUFRLElBQUksRUFBRSxRQUFRO0FBQUEsTUFDNUYsV0FBVyxRQUFRLGNBQWMsRUFBRSxNQUFNLFVBQVUsQ0FBQyxFQUFFLFFBQVEsS0FBSyxFQUFFLFFBQVE7QUFBQSxNQUM3RSxpQkFBaUIsUUFBUSxvQkFBb0IsRUFBRSxNQUFNLFVBQVUsQ0FBQyxFQUFFLFFBQVEsSUFBSSxFQUFFLFFBQVE7QUFBQSxNQUN4RixlQUFlLFFBQVEsa0JBQWtCLEVBQUUsTUFBTSxVQUFVLENBQUMsRUFBRSxRQUFRLElBQUksRUFBRSxRQUFRO0FBQUEsTUFDcEYsWUFBWSxRQUFRLGNBQWMsRUFBRSxNQUFNLFVBQVUsQ0FBQyxFQUFFLFFBQVEsS0FBSyxFQUFFLFFBQVE7QUFBQSxNQUM5RSxpQkFBaUIsUUFBUSxvQkFBb0IsRUFBRSxNQUFNLFVBQVUsQ0FBQyxFQUFFLFFBQVEsS0FBSyxFQUFFLFFBQVE7QUFBQSxNQUN6RixXQUFXLFFBQVEsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDLEVBQUUsV0FBVyxNQUFNLG9CQUFJLEtBQUssQ0FBQyxFQUFFLFFBQVE7QUFBQSxNQUM3RixXQUFXLFFBQVEsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDLEVBQUUsV0FBVyxNQUFNLG9CQUFJLEtBQUssQ0FBQyxFQUFFLFFBQVE7QUFBQSxJQUMvRixDQUFDO0FBSU0sSUFBTSxnQkFBZ0IsWUFBWSxrQkFBa0I7QUFBQSxNQUN6RCxJQUFJLFFBQVEsSUFBSSxFQUFFLFdBQVcsRUFBRSxlQUFlLEtBQUssQ0FBQztBQUFBLE1BQ3BELFFBQVEsS0FBSyxTQUFTLEVBQUUsV0FBVyxNQUFNLEtBQUssRUFBRTtBQUFBLE1BQ2hELFlBQVksS0FBSyxhQUFhLEVBQUUsUUFBUTtBQUFBLE1BQ3hDLGFBQWEsS0FBSyxhQUFhLEVBQUUsUUFBUTtBQUFBLE1BQ3pDLFVBQVUsS0FBSyxVQUFVLEVBQUUsUUFBUTtBQUFBLE1BQ25DLFNBQVMsS0FBSyxTQUFTLEVBQUUsUUFBUTtBQUFBO0FBQUEsTUFDakMsYUFBYSxLQUFLLGNBQWMsRUFBRSxRQUFRO0FBQUEsTUFDMUMsUUFBUSxLQUFLLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUE7QUFBQSxNQUM5QyxZQUFZLEtBQUssYUFBYTtBQUFBLE1BQzlCLFdBQVcsUUFBUSxjQUFjLEVBQUUsTUFBTSxZQUFZLENBQUMsRUFBRSxXQUFXLE1BQU0sb0JBQUksS0FBSyxDQUFDLEVBQUUsUUFBUTtBQUFBLE1BQzdGLFdBQVcsUUFBUSxjQUFjLEVBQUUsTUFBTSxZQUFZLENBQUMsRUFBRSxXQUFXLE1BQU0sb0JBQUksS0FBSyxDQUFDLEVBQUUsUUFBUTtBQUFBLElBQy9GLENBQUM7QUFFTSxJQUFNLFVBQVUsWUFBWSxXQUFXO0FBQUEsTUFDNUMsSUFBSSxRQUFRLElBQUksRUFBRSxXQUFXLEVBQUUsZUFBZSxLQUFLLENBQUM7QUFBQSxNQUNwRCxPQUFPLEtBQUssUUFBUSxFQUFFLFdBQVcsTUFBTSxLQUFLLEVBQUU7QUFBQSxNQUM5QyxNQUFNLEtBQUssTUFBTSxFQUFFLFFBQVE7QUFBQSxNQUMzQixTQUFTLEtBQUssU0FBUyxFQUFFLFFBQVE7QUFBQSxNQUNqQyxPQUFPLEtBQUssT0FBTyxFQUFFLFFBQVE7QUFBQSxNQUM3QixLQUFLLEtBQUssS0FBSyxFQUFFLFFBQVE7QUFBQSxNQUN6QixNQUFNLEtBQUssTUFBTSxFQUFFLFFBQVE7QUFBQSxNQUMzQixjQUFjLEtBQUssZUFBZSxFQUFFLFFBQVE7QUFBQSxNQUM1QyxnQkFBZ0IsS0FBSyxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsUUFBUSxXQUFXO0FBQUE7QUFBQSxNQUNyRSxhQUFhLEtBQUssYUFBYTtBQUFBLE1BQy9CLFVBQVUsS0FBSyxXQUFXO0FBQUEsTUFDMUIsV0FBVyxRQUFRLGNBQWMsRUFBRSxNQUFNLFlBQVksQ0FBQyxFQUFFLFdBQVcsTUFBTSxvQkFBSSxLQUFLLENBQUMsRUFBRSxRQUFRO0FBQUEsSUFDL0YsQ0FBQztBQUVNLElBQU0sY0FBYyxZQUFZLGdCQUFnQjtBQUFBLE1BQ3JELElBQUksUUFBUSxJQUFJLEVBQUUsV0FBVyxFQUFFLGVBQWUsS0FBSyxDQUFDO0FBQUEsTUFDcEQsT0FBTyxLQUFLLFFBQVEsRUFBRSxXQUFXLE1BQU0sS0FBSyxFQUFFLEVBQUUsUUFBUTtBQUFBLE1BQ3hELE1BQU0sS0FBSyxNQUFNLEVBQUUsUUFBUTtBQUFBLE1BQzNCLE1BQU0sS0FBSyxNQUFNLEVBQUUsUUFBUTtBQUFBLE1BQzNCLE9BQU8sS0FBSyxPQUFPLEVBQUUsUUFBUTtBQUFBLE1BQzdCLE9BQU8sS0FBSyxPQUFPO0FBQUEsTUFDbkIsZ0JBQWdCLEtBQUssZ0JBQWdCO0FBQUEsTUFDckMsV0FBVyxRQUFRLGNBQWMsRUFBRSxNQUFNLFlBQVksQ0FBQyxFQUFFLFdBQVcsTUFBTSxvQkFBSSxLQUFLLENBQUMsRUFBRSxRQUFRO0FBQUEsSUFDL0YsQ0FBQztBQUVNLElBQU0sdUJBQXVCLFlBQVkseUJBQXlCO0FBQUEsTUFDdkUsSUFBSSxRQUFRLElBQUksRUFBRSxXQUFXLEVBQUUsZUFBZSxLQUFLLENBQUM7QUFBQSxNQUNwRCxVQUFVLFFBQVEsV0FBVyxFQUFFLFdBQVcsTUFBTSxRQUFRLEVBQUUsRUFBRSxRQUFRO0FBQUEsTUFDcEUsZUFBZSxLQUFLLGdCQUFnQixFQUFFLFFBQVE7QUFBQSxNQUM5QyxnQkFBZ0IsS0FBSyxpQkFBaUIsRUFBRSxRQUFRO0FBQUEsTUFDaEQsZ0JBQWdCLEtBQUssaUJBQWlCLEVBQUUsUUFBUTtBQUFBLE1BQ2hELFFBQVEsS0FBSyxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsU0FBUztBQUFBO0FBQUEsTUFDbEQsU0FBUyxLQUFLLFNBQVM7QUFBQSxNQUN2QixXQUFXLFFBQVEsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDLEVBQUUsV0FBVyxNQUFNLG9CQUFJLEtBQUssQ0FBQyxFQUFFLFFBQVE7QUFBQSxJQUMvRixDQUFDO0FBRU0sSUFBTSxzQkFBc0IsWUFBWSx5QkFBeUI7QUFBQSxNQUN0RSxJQUFJLFFBQVEsSUFBSSxFQUFFLFdBQVcsRUFBRSxlQUFlLEtBQUssQ0FBQztBQUFBLE1BQ3BELFFBQVEsS0FBSyxTQUFTLEVBQUUsV0FBVyxNQUFNLEtBQUssRUFBRTtBQUFBLE1BQ2hELGFBQWEsS0FBSyxjQUFjLEVBQUUsUUFBUTtBQUFBLE1BQzFDLFNBQVMsS0FBSyxTQUFTLEVBQUUsUUFBUTtBQUFBLE1BQ2pDLFdBQVcsS0FBSyxXQUFXLEVBQUUsUUFBUTtBQUFBO0FBQUEsTUFDckMsUUFBUSxLQUFLLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxTQUFTO0FBQUE7QUFBQSxNQUNsRCxXQUFXLFFBQVEsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDLEVBQUUsV0FBVyxNQUFNLG9CQUFJLEtBQUssQ0FBQyxFQUFFLFFBQVE7QUFBQSxJQUMvRixDQUFDO0FBR00sSUFBTSxXQUFXLFlBQVksYUFBYTtBQUFBLE1BQy9DLElBQUksUUFBUSxJQUFJLEVBQUUsV0FBVyxFQUFFLGVBQWUsS0FBSyxDQUFDO0FBQUEsTUFDcEQsTUFBTSxLQUFLLE1BQU0sRUFBRSxRQUFRO0FBQUEsTUFDM0IsT0FBTyxLQUFLLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTztBQUFBLE1BQ3RDLGNBQWMsS0FBSyxlQUFlLEVBQUUsUUFBUTtBQUFBLE1BQzVDLE9BQU8sS0FBSyxPQUFPO0FBQUEsTUFDbkIsTUFBTSxLQUFLLE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxNQUFNO0FBQUEsTUFDM0MsV0FBVyxLQUFLLFlBQVk7QUFBQSxNQUM1QixXQUFXLFFBQVEsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDLEVBQUUsV0FBVyxNQUFNLG9CQUFJLEtBQUssQ0FBQyxFQUFFLFFBQVE7QUFBQSxNQUM3RixXQUFXLFFBQVEsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDLEVBQUUsV0FBVyxNQUFNLG9CQUFJLEtBQUssQ0FBQyxFQUFFLFFBQVE7QUFBQSxJQUMvRixDQUFDO0FBR00sSUFBTSxtQkFBbUIsWUFBWSxzQkFBc0I7QUFBQSxNQUNoRSxJQUFJLFFBQVEsSUFBSSxFQUFFLFdBQVcsRUFBRSxlQUFlLEtBQUssQ0FBQztBQUFBLE1BQ3BELFFBQVEsUUFBUSxTQUFTLEVBQUUsV0FBVyxNQUFNLFNBQVMsRUFBRTtBQUFBLE1BQ3ZELFlBQVksS0FBSyxhQUFhLEVBQUUsUUFBUTtBQUFBLE1BQ3hDLFVBQVUsS0FBSyxVQUFVLEVBQUUsUUFBUTtBQUFBLE1BQ25DLFVBQVUsS0FBSyxVQUFVO0FBQUEsTUFDekIsV0FBVyxLQUFLLFdBQVc7QUFBQSxNQUMzQixhQUFhLEtBQUssYUFBYSxFQUFFLFFBQVE7QUFBQSxNQUN6QyxTQUFTLEtBQUssU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLFFBQVE7QUFBQSxNQUNuRCxRQUFRLEtBQUssUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLFNBQVM7QUFBQSxNQUNsRCxVQUFVLEtBQUssV0FBVztBQUFBLE1BQzFCLE9BQU8sS0FBSyxPQUFPLEVBQUUsUUFBUTtBQUFBLE1BQzdCLE9BQU8sS0FBSyxPQUFPLEVBQUUsUUFBUTtBQUFBLE1BQzdCLGVBQWUsUUFBUSxpQkFBaUIsRUFBRSxXQUFXLE1BQU0sS0FBSyxFQUFFO0FBQUEsTUFDbEUsV0FBVyxRQUFRLGNBQWMsRUFBRSxNQUFNLFlBQVksQ0FBQyxFQUFFLFdBQVcsTUFBTSxvQkFBSSxLQUFLLENBQUMsRUFBRSxRQUFRO0FBQUEsTUFDN0YsV0FBVyxRQUFRLGNBQWMsRUFBRSxNQUFNLFlBQVksQ0FBQyxFQUFFLFdBQVcsTUFBTSxvQkFBSSxLQUFLLENBQUMsRUFBRSxRQUFRO0FBQUEsSUFDL0YsQ0FBQztBQUdNLElBQU0sc0JBQXNCLFlBQVkseUJBQXlCO0FBQUEsTUFDdEUsSUFBSSxRQUFRLElBQUksRUFBRSxXQUFXLEVBQUUsZUFBZSxLQUFLLENBQUM7QUFBQSxNQUNwRCxVQUFVLFFBQVEsV0FBVyxFQUFFLFdBQVcsTUFBTSxTQUFTLEVBQUU7QUFBQSxNQUMzRCxZQUFZLFFBQVEsYUFBYSxFQUFFLFdBQVcsTUFBTSxTQUFTLEVBQUU7QUFBQSxNQUMvRCxTQUFTLEtBQUssU0FBUyxFQUFFLFFBQVE7QUFBQSxNQUNqQyxhQUFhLEtBQUssY0FBYztBQUFBLE1BQ2hDLGFBQWEsS0FBSyxjQUFjO0FBQUEsTUFDaEMsZUFBZSxLQUFLLGdCQUFnQjtBQUFBLE1BQ3BDLFdBQVcsUUFBUSxhQUFhLEVBQUUsTUFBTSxZQUFZLENBQUMsRUFBRSxXQUFXLE1BQU0sb0JBQUksS0FBSyxDQUFDLEVBQUUsUUFBUTtBQUFBLE1BQzVGLE1BQU0sUUFBUSxRQUFRLEVBQUUsTUFBTSxVQUFVLENBQUMsRUFBRSxRQUFRLEtBQUssRUFBRSxRQUFRO0FBQUEsTUFDbEUsYUFBYSxLQUFLLGNBQWMsRUFBRSxRQUFRLE1BQU0sRUFBRSxRQUFRO0FBQUEsSUFDNUQsQ0FBQztBQUdNLElBQU0sMEJBQTBCLFlBQVksNkJBQTZCO0FBQUEsTUFDOUUsSUFBSSxRQUFRLElBQUksRUFBRSxXQUFXLEVBQUUsZUFBZSxLQUFLLENBQUM7QUFBQSxNQUNwRCxRQUFRLFFBQVEsU0FBUyxFQUFFLFdBQVcsTUFBTSxTQUFTLEVBQUUsRUFBRSxRQUFRO0FBQUEsTUFDakUsT0FBTyxRQUFRLFFBQVEsRUFBRSxXQUFXLE1BQU0sS0FBSyxFQUFFLEVBQUUsUUFBUTtBQUFBLE1BQzNELFFBQVEsS0FBSyxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsU0FBUztBQUFBLE1BQ2xELGlCQUFpQixRQUFRLG9CQUFvQixFQUFFLE1BQU0sWUFBWSxDQUFDLEVBQUUsV0FBVyxNQUFNLG9CQUFJLEtBQUssQ0FBQyxFQUFFLFFBQVE7QUFBQSxNQUN6RyxPQUFPLEtBQUssT0FBTztBQUFBLE1BQ25CLFdBQVcsUUFBUSxjQUFjLEVBQUUsTUFBTSxZQUFZLENBQUMsRUFBRSxXQUFXLE1BQU0sb0JBQUksS0FBSyxDQUFDLEVBQUUsUUFBUTtBQUFBLElBQy9GLENBQUM7QUFHTSxJQUFNLG9CQUFvQixZQUFZLHVCQUF1QjtBQUFBLE1BQ2xFLElBQUksUUFBUSxJQUFJLEVBQUUsV0FBVyxFQUFFLGVBQWUsS0FBSyxDQUFDO0FBQUEsTUFDcEQsT0FBTyxLQUFLLE9BQU8sRUFBRSxRQUFRO0FBQUEsTUFDN0IsVUFBVSxLQUFLLFVBQVUsRUFBRSxRQUFRO0FBQUEsTUFDbkMsU0FBUyxLQUFLLFNBQVMsRUFBRSxRQUFRO0FBQUEsTUFDakMsT0FBTyxLQUFLLFNBQVMsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUFBLE1BQ3JDLGNBQWMsS0FBSyxnQkFBZ0IsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUFBLE1BQ25ELFdBQVcsUUFBUSxjQUFjLEVBQUUsTUFBTSxZQUFZLENBQUMsRUFBRSxXQUFXLE1BQU0sb0JBQUksS0FBSyxDQUFDLEVBQUUsUUFBUTtBQUFBLElBQy9GLENBQUM7QUFHTSxJQUFNLHdCQUF3QixZQUFZLDJCQUEyQjtBQUFBLE1BQzFFLElBQUksUUFBUSxJQUFJLEVBQUUsV0FBVyxFQUFFLGVBQWUsS0FBSyxDQUFDO0FBQUEsTUFDcEQsUUFBUSxRQUFRLFNBQVMsRUFBRSxXQUFXLE1BQU0sU0FBUyxFQUFFO0FBQUEsTUFDdkQsZ0JBQWdCLEtBQUssaUJBQWlCLEVBQUUsUUFBUTtBQUFBLE1BQ2hELFNBQVMsS0FBSyxTQUFTLEVBQUUsUUFBUTtBQUFBLE1BQ2pDLFNBQVMsS0FBSyxTQUFTLEVBQUUsUUFBUTtBQUFBLE1BQ2pDLGtCQUFrQixLQUFLLG1CQUFtQixFQUFFLFFBQVE7QUFBQSxNQUNwRCxRQUFRLFFBQVEsV0FBVyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQUEsTUFDaEQsUUFBUSxLQUFLLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxTQUFTO0FBQUEsSUFDcEQsQ0FBQztBQUdNLElBQU0saUJBQWlCLFlBQVksb0JBQW9CO0FBQUEsTUFDNUQsSUFBSSxRQUFRLElBQUksRUFBRSxXQUFXLEVBQUUsZUFBZSxLQUFLLENBQUM7QUFBQSxNQUNwRCxNQUFNLEtBQUssTUFBTSxFQUFFLFFBQVE7QUFBQSxNQUMzQixNQUFNLEtBQUssTUFBTSxFQUFFLFFBQVE7QUFBQSxNQUMzQixXQUFXLEtBQUssV0FBVztBQUFBLE1BQzNCLEtBQUssS0FBSyxLQUFLO0FBQUEsTUFDZixVQUFVLEtBQUssV0FBVztBQUFBLE1BQzFCLE9BQU8sS0FBSyxPQUFPO0FBQUEsTUFDbkIsT0FBTyxLQUFLLE9BQU8sRUFBRSxRQUFRO0FBQUEsTUFDN0IsaUJBQWlCLFFBQVEsa0JBQWtCO0FBQUEsTUFDM0MsV0FBVyxRQUFRLGNBQWMsRUFBRSxNQUFNLFlBQVksQ0FBQyxFQUFFLFdBQVcsTUFBTSxvQkFBSSxLQUFLLENBQUMsRUFBRSxRQUFRO0FBQUEsSUFDL0YsQ0FBQztBQUFBO0FBQUE7OztBQ2xaRCxJQUlJO0FBSko7QUFBQTtBQUNBO0FBS0EsUUFBSSxRQUFRLElBQUksd0JBQXdCLFFBQVEsSUFBSSxrQkFBa0I7QUFFcEUsWUFBTSxFQUFFLFFBQVEsSUFBSSxNQUFNLE9BQU8sK0dBQW9CO0FBQ3JELFlBQU0sRUFBRSxhQUFhLElBQUksTUFBTSxPQUFPLGtIQUFnQjtBQUN0RCxZQUFNLFNBQVMsYUFBYTtBQUFBLFFBQzFCLEtBQUssUUFBUSxJQUFJO0FBQUEsUUFDakIsV0FBVyxRQUFRLElBQUk7QUFBQSxNQUN6QixDQUFDO0FBQ0QsV0FBSyxRQUFRLFFBQVEsRUFBRSx1QkFBTyxDQUFDO0FBQUEsSUFDakMsT0FBTztBQUVMLFlBQU0sRUFBRSxRQUFRLElBQUksTUFBTSxPQUFPLHdHQUFhO0FBQzlDLFlBQU0sWUFBWSxNQUFNLE9BQU8sZ0JBQWdCLEdBQUc7QUFDbEQsWUFBTSxhQUFhLFFBQVEsSUFBSSxrQkFBa0I7QUFDakQsWUFBTSxTQUFTLElBQUksU0FBUyxVQUFVO0FBQ3RDLFdBQUssUUFBUSxRQUFRLEVBQUUsdUJBQU8sQ0FBQztBQUFBLElBQ2pDO0FBQUE7QUFBQTs7O0FDdEJnWSxTQUFTLGtCQUFrQjtBQUMzWixTQUFTLHNCQUFzQjtBQUMvQixTQUFTLGNBQWM7QUFGdkIsSUFLYTtBQUxiO0FBQUE7QUFHQTtBQUVPLElBQU0sT0FBTyxXQUFXO0FBQUEsTUFDOUIsVUFBVSxlQUFlLElBQUk7QUFBQSxRQUM1QixVQUFVO0FBQUEsTUFDWCxDQUFDO0FBQUEsTUFDRCxrQkFBa0I7QUFBQSxRQUNqQixTQUFTO0FBQUEsUUFDVCwwQkFBMEI7QUFBQSxNQUMzQjtBQUFBLE1BQ0EsaUJBQWlCO0FBQUEsUUFDaEIsUUFBUTtBQUFBLFVBQ1AsVUFBVSxRQUFRLElBQUksb0JBQW9CO0FBQUEsVUFDMUMsY0FBYyxRQUFRLElBQUksd0JBQXdCO0FBQUEsVUFDbEQsU0FBUyxDQUFDLENBQUMsUUFBUSxJQUFJLG9CQUFvQixDQUFDLENBQUMsUUFBUSxJQUFJO0FBQUEsUUFDMUQ7QUFBQSxNQUNEO0FBQUEsTUFDQSxTQUFTLENBQUMsT0FBTyxDQUFDO0FBQUEsTUFDbEIsZ0JBQWdCLENBQUMseUJBQXlCLHVCQUF1QjtBQUFBLElBQ2xFLENBQUM7QUFBQTtBQUFBOzs7QUN0QkQ7QUFBQTtBQUFBO0FBQUE7QUFHQSxlQUFzQixrQkFBa0IsU0FBcUM7QUFDM0UsTUFBSTtBQUNGLFVBQU0sTUFBTSxJQUFJLElBQUksUUFBUSxHQUFHO0FBQy9CLFVBQU1BLFFBQU8sSUFBSSxTQUFTLFFBQVEsY0FBYyxFQUFFO0FBR2xELFVBQU0sY0FBYyxJQUFJLFFBQVEsUUFBUSxLQUFLO0FBQUEsTUFDM0MsUUFBUSxRQUFRO0FBQUEsTUFDaEIsU0FBUyxRQUFRO0FBQUEsTUFDakIsTUFBTSxRQUFRLFdBQVcsU0FBUyxRQUFRLFdBQVcsU0FBUyxNQUFNLFFBQVEsS0FBSyxJQUFJO0FBQUEsSUFDdkYsQ0FBQztBQUdELFVBQU0sV0FBVyxNQUFNLEtBQUssUUFBUSxXQUFXO0FBRS9DLFdBQU87QUFBQSxFQUNULFNBQVMsT0FBTztBQUNkLFlBQVEsTUFBTSx1QkFBdUIsS0FBSztBQUMxQyxXQUFPLElBQUk7QUFBQSxNQUNULEtBQUssVUFBVSxFQUFFLE9BQU8seUJBQXlCLFNBQVMsTUFBTSxRQUFRLENBQUM7QUFBQSxNQUN6RTtBQUFBLFFBQ0UsUUFBUTtBQUFBLFFBQ1IsU0FBUyxFQUFFLGdCQUFnQixtQkFBbUI7QUFBQSxNQUNoRDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7QUE3QkE7QUFBQTtBQUF5WjtBQUFBO0FBQUE7OztBQ0F2QyxTQUFTLG9CQUFvQjtBQUMvWSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBRmpCLElBQU0sbUNBQW1DO0FBTXpDLElBQU0sa0JBQWtCLE9BQU87QUFBQSxFQUM3QixNQUFNO0FBQUE7QUFBQSxFQUVOLHFCQUFxQjtBQUNuQixXQUFPO0FBQUEsTUFDTCxNQUFNO0FBQUEsUUFDSjtBQUFBLFVBQ0UsS0FBSztBQUFBLFVBQ0wsVUFBVTtBQUFBLFVBQ1YsVUFBVTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQTBDWjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGO0FBR0EsSUFBTSx1QkFBdUIsT0FBTztBQUFBLEVBQ2xDLE1BQU07QUFBQSxFQUNOLGdCQUFnQixRQUFhO0FBQzNCLFdBQU8sWUFBWSxJQUFJLE9BQU8sS0FBVSxLQUFVLFNBQWM7QUFDOUQsVUFBSSxJQUFJLEtBQUssV0FBVyxZQUFZLEdBQUc7QUFDckMsWUFBSTtBQUNGLGdCQUFNLEVBQUUsbUJBQUFDLG1CQUFrQixJQUFJLE1BQU07QUFHcEMsZ0JBQU0sV0FBVyxJQUFJLFFBQVEsbUJBQW1CLEtBQUs7QUFDckQsZ0JBQU0sT0FBTyxJQUFJLFFBQVEsUUFBUTtBQUNqQyxnQkFBTSxNQUFNLEdBQUcsUUFBUSxNQUFNLElBQUksR0FBRyxJQUFJLEdBQUc7QUFHM0MsZ0JBQU0sVUFBVSxJQUFJLFFBQVE7QUFDNUIsaUJBQU8sUUFBUSxJQUFJLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxLQUFLLEtBQUssTUFBcUI7QUFDbkUsZ0JBQUksTUFBTyxTQUFRLElBQUksS0FBSyxNQUFNLFFBQVEsS0FBSyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUs7QUFBQSxVQUNyRSxDQUFDO0FBRUQsY0FBSSxPQUEyQjtBQUMvQixjQUFJLElBQUksV0FBVyxTQUFTLElBQUksV0FBVyxRQUFRO0FBQ2pELGtCQUFNLFNBQW1CLENBQUM7QUFDMUIsNkJBQWlCLFNBQVMsS0FBSztBQUM3QixxQkFBTyxLQUFLLEtBQUs7QUFBQSxZQUNuQjtBQUNBLG1CQUFPLE9BQU8sT0FBTyxNQUFNLEVBQUUsU0FBUyxPQUFPO0FBQUEsVUFDL0M7QUFFQSxnQkFBTSxVQUFVLElBQUksUUFBUSxLQUFLO0FBQUEsWUFDL0IsUUFBUSxJQUFJO0FBQUEsWUFDWjtBQUFBLFlBQ0E7QUFBQSxVQUNGLENBQUM7QUFFRCxnQkFBTSxXQUFXLE1BQU1BLG1CQUFrQixPQUFPO0FBR2hELGNBQUksYUFBYSxTQUFTO0FBQzFCLG1CQUFTLFFBQVEsUUFBUSxDQUFDLE9BQU8sUUFBUTtBQUN2QyxnQkFBSSxVQUFVLEtBQUssS0FBSztBQUFBLFVBQzFCLENBQUM7QUFDRCxnQkFBTSxlQUFlLE1BQU0sU0FBUyxLQUFLO0FBQ3pDLGNBQUksSUFBSSxZQUFZO0FBQUEsUUFDdEIsU0FBUyxPQUFPO0FBQ2Qsa0JBQVEsTUFBTSwwQkFBMEIsS0FBSztBQUM3QyxjQUFJLGFBQWE7QUFDakIsY0FBSSxVQUFVLGdCQUFnQixrQkFBa0I7QUFDaEQsY0FBSSxJQUFJLEtBQUssVUFBVSxFQUFFLE9BQU8sc0JBQXNCLFNBQVMsTUFBTSxRQUFRLENBQUMsQ0FBQztBQUFBLFFBQ2pGO0FBQUEsTUFDRixPQUFPO0FBQ0wsYUFBSztBQUFBLE1BQ1A7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQ0Y7QUFHQSxJQUFPLHNCQUFRLGFBQWEsT0FBTyxFQUFFLEtBQUssTUFBTTtBQUU5QyxRQUFNLGtCQUFrQjtBQUV4QixTQUFRO0FBQUEsSUFDUixRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTCxRQUFRO0FBQUEsVUFDTixRQUFRO0FBQUEsVUFDUixjQUFjO0FBQUEsVUFDZCxRQUFRO0FBQUEsVUFDUixXQUFXLENBQUMsT0FBTyxZQUFZO0FBQzdCLGtCQUFNLEdBQUcsWUFBWSxDQUFDLFVBQVUsS0FBSyxRQUFRO0FBQzNDLHNCQUFRLElBQUksV0FBVyxJQUFJLE1BQU0sSUFBSSxJQUFJLEdBQUcsNEJBQTRCLElBQUksR0FBRyxFQUFFO0FBQUEsWUFDbkYsQ0FBQztBQUNELGtCQUFNLEdBQUcsU0FBUyxDQUFDLEtBQUssS0FBSyxRQUFRO0FBQ25DLHNCQUFRLE1BQU0saUJBQWlCLEdBQUc7QUFBQSxZQUNwQyxDQUFDO0FBQUEsVUFDSDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLE1BQ04scUJBQXFCO0FBQUEsTUFDckIsZ0JBQWdCO0FBQUEsSUFDbEI7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUN0QztBQUFBLElBQ0Y7QUFBQSxFQUNBO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFsicGF0aCIsICJoYW5kbGVBdXRoUmVxdWVzdCJdCn0K
