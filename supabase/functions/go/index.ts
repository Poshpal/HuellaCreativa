import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const destinations = {
  terms: "terms_url",
  privacy: "privacy_url",
} as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response("Método no permitido", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const destination = new URL(req.url).searchParams.get("to") ?? "";
  const column = destinations[destination as keyof typeof destinations];
  if (!column) {
    return new Response("Enlace no disponible", {
      status: 404,
      headers: corsHeaders,
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response("Enlace no disponible", {
      status: 500,
      headers: corsHeaders,
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("site_links")
    .select("terms_url, privacy_url")
    .eq("id", 1)
    .maybeSingle();

  const target = data?.[column];
  if (error || typeof target !== "string" || !/^https:\/\//i.test(target)) {
    if (error) console.error("go:", error.message);
    return new Response("Enlace no disponible", {
      status: 404,
      headers: corsHeaders,
    });
  }

  return Response.redirect(target, 302);
});
