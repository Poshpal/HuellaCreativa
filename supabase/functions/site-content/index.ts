import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: jsonHeaders,
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Contenido no disponible" }), {
      status: 500,
      headers: jsonHeaders,
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const [linksRes, testimonialsRes, modelsRes, petpopsRes, editionsRes] =
    await Promise.all([
      supabase
        .from("site_links")
        .select(
          "email, whatsapp_number, facebook_url, instagram_url, tiktok_url",
        )
        .eq("id", 1)
        .maybeSingle(),
      supabase
        .from("testimonials")
        .select("rating,message,pet,image,alt,place")
        .order("id", { ascending: false }),
      supabase
        .from("models")
        .select("name,image,alt,description,video,type")
        .order("id", { ascending: true }),
      supabase
        .from("petpops")
        .select("pet,place,image,alt")
        .order("id", { ascending: false }),
      supabase
        .from("special_editions")
        .select(
          "title,slug,theme,description,image,alt,badge,year,is_available,is_featured,sort_order",
        )
        .eq("is_available", true)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: false }),
    ]);

  const failed = [
    linksRes.error,
    testimonialsRes.error,
    modelsRes.error,
    petpopsRes.error,
    editionsRes.error,
  ].find(Boolean);

  if (failed) {
    console.error("site-content:", failed.message);
    return new Response(JSON.stringify({ error: "Contenido no disponible" }), {
      status: 500,
      headers: jsonHeaders,
    });
  }

  return new Response(
    JSON.stringify({
      links: linksRes.data,
      testimonials: testimonialsRes.data ?? [],
      models: modelsRes.data ?? [],
      petpops: petpopsRes.data ?? [],
      special_editions: editionsRes.data ?? [],
    }),
    {
      headers: {
        ...jsonHeaders,
        "Cache-Control": "public, max-age=60",
      },
    },
  );
});
