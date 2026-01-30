const { z } = require("zod");

const envSchema = z.object({
    // Server-side variables
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // Client-side variables (NEXT_PUBLIC_)
    NEXT_PUBLIC_API_URL: z.string().url(),

    // Firebase Configuration (Optional but recommended to validate if used)
    // We make these optional .or(z.literal('')) because sometimes they might not be needed for all builds
    // unless you strictly require them.
    NEXT_FIREBASE_API_KEY: z.string().min(1),
    NEXT_FIREBASE_AUTH_DOMAIN: z.string().min(1),
    NEXT_FIREBASE_PROJECT_ID: z.string().min(1),
    NEXT_FIREBASE_STORAGE_BUCKET: z.string().min(1),
    NEXT_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
    NEXT_FIREBASE_APP_ID: z.string().min(1),
});

try {
    envSchema.parse(process.env);
} catch (error) {
    if (error instanceof z.ZodError) {
        console.error("❌ Invalid environment variables:");
        error.errors.forEach((err) => {
            console.error(`   ${err.path.join(".")}: ${err.message}`);
        });
        process.exit(1);
    }
}

module.exports = {
    envSchema,
};
