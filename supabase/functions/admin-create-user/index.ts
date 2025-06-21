
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Iniciando criação de usuário...')
    
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify that the user is authenticated and is an admin
    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser()

    console.log('Usuário atual:', user?.id, user?.email)

    if (userError || !user) {
      console.error('Erro de autenticação:', userError)
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if user has admin role
    console.log('Verificando role de admin...')
    const { data: hasAdminRole, error: roleError } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    })

    console.log('Role check result:', hasAdminRole, roleError)

    if (roleError) {
      console.error('Erro ao verificar role:', roleError)
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar permissões' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!hasAdminRole) {
      console.log('Usuário não é admin')
      return new Response(
        JSON.stringify({ error: 'Acesso negado. Apenas administradores podem criar usuários.' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get request body
    const body = await req.json()
    const { email, password, name } = body

    console.log('Dados recebidos:', { email, name })

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email e senha são obrigatórios' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create admin client for user creation
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Criando usuário via Admin API...')

    // Create user using admin client
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name: name || ''
      },
      email_confirm: true
    })

    if (createError) {
      console.error('Erro ao criar usuário:', createError)
      return new Response(
        JSON.stringify({ error: `Erro ao criar usuário: ${createError.message}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!newUser.user) {
      console.error('Usuário não foi criado')
      return new Response(
        JSON.stringify({ error: 'Falha ao criar usuário' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Usuário criado com sucesso:', newUser.user.id)

    // Create user role entry
    console.log('Atribuindo role de usuário...')
    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: 'user'
      })

    if (roleInsertError) {
      console.error('Erro ao atribuir role:', roleInsertError)
      // Try to cleanup the created user if role assignment fails
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      
      return new Response(
        JSON.stringify({ error: 'Erro ao atribuir permissões ao usuário' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Role atribuído com sucesso')

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          name: newUser.user.user_metadata?.name
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Erro inesperado:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
