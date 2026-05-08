import { createContext, useContext, useState, ReactNode } from 'react'

interface Translation {
  [key: string]: string
}

const translations: { [lang: string]: Translation } = {
  ja: {
    'Catálogo': 'カタログ',
    'Entrar': 'ログイン',
    'Cadastrar': '登録',
    'Vender': '出品',
    'Favoritos': 'お気に入り',
    'Mensagens': 'メッセージ',
    'Dashboard': 'ダッシュボード',
    'Perfil': 'プロフィール',
    'Sair': 'ログアウト',
    'Buscar peças, marcas, modelos...': '部品、ブランド、モデルを検索...',
    'Encontre as melhores': '最高の',
    'para seu carro': 'お車の部品を見つけましょう',
    'O maior marketplace de peças automotivas japonesas do Brasil': 'ブラジル最大の日本車部品マーケットプレイス',
    'Qualidade garantida, entrega rápida e segurança total': '品質保証、迅速な配送、完全なセキュリティ',
    'Explorar Catálogo': 'カタログを見る',
    'Vender Peças': '部品を出品',
    'Categorias': 'カテゴリー',
    'Marcas Disponíveis': '利用可能なブランド',
    'Últimas Novidades': '最新の新着商品',
    'Ver todas': 'すべて見る',
    'Compra Segura': '安全な購入',
    'Entrega Rápida': '迅速な配送',
    'Qualidade Garantida': '保証された品質',
    'Pronto para vender suas peças?': '部品を出品しますか？',
    'Começar a Vender': '出品を開始',
    'Peças à venda': '出品中の部品',
    'Vendedores': '出品者',
    'Satisfação': '満足度',
    'Novo': '新品',
    'Usado': '中古',
    'marketplace JDM #1 do Brasil': 'ブラジルNo.1 JDMマーケットプレイス',
    'Encontre exatamente o que precisa para seu projeto': 'プロジェクトに必要なものを正確に見つける',
    'As melhores marcas japonesas em um só lugar': '最高の日本ブランドが一箇所に',
    'Proteção total para suas compras com garantia de entrega e devolução': '配送と返品の保証付きで買い物を完全保護',
    'Envio para todo Brasil com rastreamento em tempo real': 'ブラジル全土への追跡可能な配送',
    'Peças originais e de procedência com verificação de autenticidade': '真正性確認済みの正規部品',
    'Junte-se a milhares de vendedores e alcance milhões de compradores!': '何千もの出品者に参加して何百万もの買い手にリーチ！',
    'O maior marketplace de peças automotivas JDM do Brasil. Encontre peças genuínas para seu carro japonês.': 'ブラジル最大のJDM自動車部品マーケットプレイス。日本車の真正な部品を見つけましょう。',
    'Navegação': 'ナビゲーション',
    'Minha Conta': 'マイアカウント',
    'Marcas': 'ブランド',
    'Contato': 'お問い合わせ',
    'Termos de Uso': '利用規約',
    'Privacidade': 'プライバシー',
    'Cookies': 'クッキー',
    'Todos os direitos reservados.': '全著作権所有',
    'Criar Conta': 'アカウント作成',
    'Junte-se ao maior marketplace JDM do Brasil': 'ブラジル最大のJDMマーケットプレイスに参加しましょう',
    'Nome completo': 'フルネーム',
    'Seu nome': 'お名前',
    'Email': 'メールアドレス',
    'Telefone (opcional)': '電話番号（任意）',
    'Senha': 'パスワード',
    'Confirmar senha': 'パスワード確認',
    'Criando conta...': 'アカウント作成中...',
    'Já tem conta?': 'すでにアカウントをお持ちですか？',
    'Acesse sua conta JAPANCAR PARTS': 'JAPANCAR PARTSアカウントにアクセス',
    'Continuar com Google': 'Googleで続行',
    'ou': 'または',
    'Lembrar-me': 'ログイン状態を保存',
    'Esqueceu a senha?': 'パスワードをお忘れですか？',
    'Entrando...': 'ログイン中...',
    'Não tem conta?': 'アカウントをお持ちでないですか？',
    'Bem-vindo de volta': 'おかえりなさい',
    'Nova Listagem': '新しい出品',
    'Anúncios Ativos': '有効な広告',
    'Total de Visualizações': '総閲覧数',
    'Vendas Totais': '総売上',
    'Meus Anúncios': 'マイ広告',
    'Ver todos': 'すべて見る',
    'Você ainda não tem anúncios': 'まだ広告がありません',
    'Criar primeiro anúncio': '最初の広告を作成',
    'Meu Perfil': 'マイプロフィール',
    'Editar': '編集',
    'Cancelar': 'キャンセル',
    'Nome': '名前',
    'Endereço': '住所',
    'Cidade': '市区町村',
    'Estado': '都道府県',
    'CEP': '郵便番号',
    'Salvando...': '保存中...',
    'Salvar': '保存',
    'Nome não definido': '名前が未設定',
    'Ações Rápidas': 'クイックアクション',
  },
  en: {
    'Catálogo': 'Catalog',
    'Entrar': 'Login',
    'Cadastrar': 'Register',
    'Vender': 'Sell',
    'Favoritos': 'Favorites',
    'Mensagens': 'Messages',
    'Dashboard': 'Dashboard',
    'Perfil': 'Profile',
    'Sair': 'Logout',
    'Buscar peças, marcas, modelo...': 'Search parts, brands, models...',
    'Encontre as melhores': 'Find the best',
    'para seu carro': 'for your car',
    'O maior marketplace': 'The largest marketplace',
    'Qualidade garantida': 'Quality guaranteed',
    'Explorar Catálogo': 'Browse Catalog',
    'Vender Peças': 'Sell Parts',
    'Categorias': 'Categories',
    'Marcas Disponíveis': 'Available Brands',
    'Ver todas': 'See all',
    'Compra Segura': 'Secure Purchase',
    'Entrega Rápida': 'Fast Delivery',
    'Criar Conta': 'Create Account',
    'Junte-se ao maior marketplace JDM do Brasil': 'Join the largest JDM marketplace in Brazil',
    'Nome completo': 'Full name',
    'Seu nome': 'Your name',
    'Email': 'Email',
    'Senha': 'Password',
    'Confirmar senha': 'Confirm password',
    'Criando conta...': 'Creating account...',
    'Já tem conta?': 'Already have an account?',
    'Acesse sua conta JAPANCAR PARTS': 'Access your JAPANCAR PARTS account',
    'Continuar com Google': 'Continue with Google',
    'ou': 'or',
    'Lembrar-me': 'Remember me',
    'Esqueceu a senha?': 'Forgot password?',
    'Entrando...': 'Logging in...',
    'Não tem conta?': "Don't have an account?",
    'Bem-vindo de volta': 'Welcome back',
    'Nova Listagem': 'New Listing',
    'Anúncios Ativos': 'Active Listings',
    'Total de Visualizações': 'Total Views',
    'Vendas Totais': 'Total Sales',
    'Meus Anúncios': 'My Listings',
    'Ver todos': 'See all',
    'Você ainda não tem anúncios': "You don't have any listings yet",
    'Criar primeiro anúncio': 'Create your first listing',
    'Meu Perfil': 'My Profile',
    'Editar': 'Edit',
    'Cancelar': 'Cancel',
    'Nome': 'Name',
    'Endereço': 'Address',
    'Cidade': 'City',
    'Estado': 'State',
    'CEP': 'ZIP Code',
    'Salvando...': 'Saving...',
    'Salvar': 'Save',
    'Nome não definido': 'Name not set',
    'Ações Rápidas': 'Quick Actions',
  }
}

interface I18nContextType {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType>({
  language: 'pt-BR',
  setLanguage: () => {},
  t: (key) => key
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState('pt-BR')

  useState(() => {
    const saved = localStorage.getItem('language')
    if (saved) setLanguageState(saved)
    else if (navigator.language.startsWith('ja')) setLanguageState('ja')
    else if (navigator.language.startsWith('en')) setLanguageState('en')
  })

  const setLanguage = (lang: string) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    const lang = language.split('-')[0]
    return translations[lang]?.[key] || translations['pt-BR']?.[key] || key
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => useContext(I18nContext)