import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://clqubcryhbrjlupkgeva.supabase.co'
const supabaseKey = 'sb_publishable_qmK1AvvoZuK_Vgc5ZE26uw_KeLoNOFt'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createUser(email: string, password: string, fullName: string, phone?: string) {
  console.log(`Criando usuário: ${email}`)
  
  // Criar usuário no auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Confirmar email automaticamente
    user_metadata: {
      full_name: fullName,
      phone
    }
  })

  if (authError) {
    console.error('Erro ao criar usuário no auth:', authError.message)
    return null
  }

  console.log('Usuário criado no auth:', authData.user?.id)

  // Criar perfil
  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user?.id,
    email,
    full_name: fullName,
    phone,
    rating: 0,
    total_sales: 0,
    is_verified: false
  })

  if (profileError) {
    console.error('Erro ao criar perfil:', profileError.message)
  } else {
    console.log('Perfil criado com sucesso!')
  }

  return authData.user
}

async function main() {
  // Lista de usuários para criar
  const users = [
    { email: 'wellynton@teste.com', password: 'teste123', fullName: 'Wellynton Jeronimo', phone: '4199626043' },
    { email: 'admin@japancarparts.com', password: 'admin123', fullName: 'Admin JAPANCAR', phone: '11999999999' },
    { email: 'vendedor@japancarparts.com', password: 'venda123', fullName: 'Vendedor Teste', phone: '11988887777' },
  ]

  for (const user of users) {
    await createUser(user.email, user.password, user.fullName, user.phone)
    console.log('---')
  }
  
  console.log('Processo concluído!')
}

main()