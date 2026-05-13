import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  NEXT_PUBLIC_API_BASE_URL: z.string().url("Invalid API base URL"),
  // SESSION_SECRET: z
  //   .string()
  //   .min(32, "SESSION_SECRET must be at least 32 characters"),
})

export type EnvConfig = z.infer<typeof envSchema>

const validateEnv = (): EnvConfig => {
  const _env = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    // SESSION_SECRET: process.env.SESSION_SECRET,
  }

  const parsed = envSchema.safeParse(_env)

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.issues)
    throw new Error("Invalid environment variables")
  }

  return parsed.data
}

export const envConfig = {
  nodeEnv: validateEnv().NODE_ENV,
  apiBaseUrl: validateEnv().NEXT_PUBLIC_API_BASE_URL,
  // sessionSecret: validateEnv().SESSION_SECRET,
}
