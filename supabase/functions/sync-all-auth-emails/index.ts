import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if requesting user is an admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get all host profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, email, full_name")
      .eq("role", "host");

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return new Response(
        JSON.stringify({ error: profilesError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const results: { synced: string[]; failed: string[]; skipped: string[] } = {
      synced: [],
      failed: [],
      skipped: [],
    };

    // Process each profile
    for (const profile of profiles || []) {
      try {
        // Get the auth user's current email
        const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
        
        if (authUserError || !authUser?.user) {
          console.error(`Error fetching auth user ${profile.user_id}:`, authUserError);
          results.failed.push(`${profile.full_name}: Could not fetch auth user`);
          continue;
        }

        const authEmail = authUser.user.email;
        const profileEmail = profile.email;

        // Check if emails match
        if (authEmail === profileEmail) {
          results.skipped.push(`${profile.full_name}: Already synced`);
          continue;
        }

        // Update auth email to match profile email
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          profile.user_id,
          { 
            email: profileEmail,
            email_confirm: true 
          }
        );

        if (updateError) {
          console.error(`Error updating auth email for ${profile.user_id}:`, updateError);
          results.failed.push(`${profile.full_name}: ${updateError.message}`);
        } else {
          console.log(`Synced email for ${profile.full_name}: ${authEmail} -> ${profileEmail}`);
          results.synced.push(`${profile.full_name}: ${authEmail} → ${profileEmail}`);
        }
      } catch (error: any) {
        console.error(`Error processing ${profile.user_id}:`, error);
        results.failed.push(`${profile.full_name}: ${error.message}`);
      }
    }

    console.log("Sync complete:", results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        summary: {
          synced: results.synced.length,
          failed: results.failed.length,
          skipped: results.skipped.length,
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in sync-all-auth-emails function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
