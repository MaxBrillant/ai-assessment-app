import { createBrowserClient } from "@supabase/ssr";
import { getEnvVariable } from "../getEnvVariable";

// Create a single supabase client for interacting with your database
export async function CreateBrowserClient() {
  const SUPABASE_URL = await getEnvVariable("SUPABASE_URL");
  const SUPABASE_KEY = await getEnvVariable("SUPABASE_ANON_KEY");

  return createBrowserClient(SUPABASE_URL as string, SUPABASE_KEY as string);
}
