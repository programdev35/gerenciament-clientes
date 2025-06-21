
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
    console.log('=== Iniciando criação de usuário ===')
    
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
    console.log('Verificando role de admin para usuário:', user.id)
    const { data: hasAdminRole, error: roleError } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    })

    console.log('Resultado da verificação de role:', { hasAdminRole, roleError })

    if (roleError) {
      console.error('Erro ao verificar role:', roleError)
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao verificar permissões: ' + roleError.message,
          details: roleError
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!hasAdminRole) {
      console.log('Usuário não possui role de admin')
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

    console.log('Dados para criação:', { email, name, hasPassword: !!password })

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email e senha são obrigatórios' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Formato de email inválido' }),
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
      console.error('Erro detalhado ao criar usuário:', createError)
      
      let errorMessage = 'Erro ao criar usuário'
      if (createError.message.includes('already been registered')) {
        errorMessage = 'Este email já está cadastrado no sistema'
      } else if (createError.message.includes('password')) {
        errorMessage = 'Senha deve ter pelo menos 6 caracteres'
      } else {
        errorMessage = createError.message
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: createError
        }),
        {
          status: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!newUser?.user) {
      console.error('Resposta inesperada - usuário não foi criado:', newUser)
      return new Response(
        JSON.stringify({ error: 'Falha ao criar usuário - resposta inesperada' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Usuário criado com sucesso:', newUser.user.id, newUser.user.email)

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
      console.log('Tentando fazer cleanup do usuário criado...')
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      if (deleteError) {
        console.error('Erro ao fazer cleanup:', deleteError)
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao atribuir permissões: ' + roleInsertError.message,
          details: roleInsertError
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Role atribuído com sucesso')
    console.log('=== Usuário criado completamente ===')

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          name: newUser.user.user_metadata?.name || name || ''
        },
        message: 'Usuário criado com sucesso!'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('=== Erro inesperado ===:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
