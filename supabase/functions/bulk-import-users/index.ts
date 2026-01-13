import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserImportData {
  email?: string;
  password: string;
  full_name: string;
  phone?: string;
  address?: string;
  max_students_capacity?: number;
  pets?: string;
  preferred_locations?: string[];
  role?: string;
}

interface ImportResult {
  identifier: string;
  success: boolean;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the request is from an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify the user is an admin using anon client
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: isAdmin } = await anonClient.rpc('is_admin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Only admins can import users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { users }: { users: UserImportData[] } = await req.json();

    if (!users || !Array.isArray(users) || users.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No users provided for import' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role client for admin operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const results: ImportResult[] = [];

    for (const userData of users) {
      const identifier = userData.email || userData.full_name || 'unknown';
      try {
        // Validate required fields
        if (!userData.password || !userData.full_name) {
          results.push({
            identifier,
            success: false,
            error: 'Missing required fields (password, full_name)'
          });
          continue;
        }

        // Generate email if not provided (using full_name as basis)
        const email = userData.email || `${userData.full_name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '')}@host.local`;

        // Create user in Auth
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
          email: email,
          password: userData.password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            full_name: userData.full_name,
            role: userData.role || 'host'
          }
        });

        if (authError) {
          results.push({
            identifier,
            success: false,
            error: authError.message
          });
          continue;
        }

        if (!authData.user) {
          results.push({
            identifier,
            success: false,
            error: 'User creation failed - no user returned'
          });
          continue;
        }

        // Update the profile with additional data (profile is auto-created by trigger)
        const { error: profileError } = await adminClient
          .from('profiles')
          .update({
            phone: userData.phone || null,
            address: userData.address || null,
            max_students_capacity: userData.max_students_capacity || 0,
            pets: userData.pets || null,
            preferred_locations: userData.preferred_locations || [],
            role: userData.role || 'host',
            is_active: true
          })
          .eq('user_id', authData.user.id);

        if (profileError) {
          console.error('Profile update error for', identifier, ':', profileError);
          // User was created but profile update failed - still count as partial success
          results.push({
            identifier,
            success: true,
            error: `User created but profile update failed: ${profileError.message}`
          });
          continue;
        }

        // Add host role to user_roles table if role is host
        if (userData.role === 'host' || !userData.role) {
          const { error: roleError } = await adminClient
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role: 'host'
            });

          if (roleError) {
            console.error('Role insert error for', identifier, ':', roleError);
          }
        }

        results.push({
          identifier,
          success: true
        });

      } catch (err) {
        results.push({
          identifier,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        message: `Import completed: ${successCount} successful, ${failureCount} failed`,
        results,
        summary: { total: users.length, successful: successCount, failed: failureCount }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Bulk import error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
