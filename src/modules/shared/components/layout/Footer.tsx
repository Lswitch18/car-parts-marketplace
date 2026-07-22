import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'
import GaidLogo from '../GaidLogo'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { useI18n } from '@/modules/shared/lib/i18n'

const SE_BRANDS_BY_COUNTRY = [
  { country: '日本', brands: ['Toyota', 'Lexus', 'Honda', 'Acura', 'Nissan', 'Infiniti', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki', 'Daihatsu', 'Isuzu', 'Hino', 'Mitsuoka'] },
  { country: 'ドイツ', brands: ['BMW', 'MINI', 'Mercedes-Benz', 'Maybach', 'Smart', 'Audi', 'Volkswagen', 'Porsche', 'Opel', 'MAN', 'Alpina', 'RUF'] },
  { country: 'アメリカ', brands: ['Ford', 'Lincoln', 'Chevrolet', 'GMC', 'Cadillac', 'Buick', 'Chrysler', 'Dodge', 'Jeep', 'Ram', 'Tesla', 'Rivian', 'Lucid', 'Hummer', 'Pontiac', 'Oldsmobile', 'Saturn'] },
  { country: '韓国', brands: ['Hyundai', 'Kia', 'Genesis', 'Daewoo', 'SsangYong', 'KG Mobility'] },
  { country: '中国', brands: ['BYD', 'NIO', 'XPeng', 'Li Auto', 'Geely', 'Zeekr', 'Changan', 'Great Wall Motors (GWM)', 'Haval', 'Tank', 'ORA', 'Hongqi', 'Jetour', 'JAC', 'BAIC', 'SAIC', 'MG', 'Wuling', 'Dongfeng', 'Chery', 'Exeed'] },
  { country: 'フランス', brands: ['Renault', 'Peugeot', 'Citroën', 'DS Automobiles', 'Alpine', 'Bugatti'] },
  { country: 'イタリア', brands: ['Ferrari', 'Lamborghini', 'Maserati', 'Fiat', 'Abarth', 'Alfa Romeo', 'Lancia', 'Pagani', 'Iveco'] },
  { country: 'イギリス', brands: ['Rolls-Royce', 'Bentley', 'Jaguar', 'Land Rover', 'Range Rover', 'Lotus', 'McLaren', 'Aston Martin', 'Morgan'] },
  { country: 'スウェーデン', brands: ['Volvo', 'Polestar', 'Koenigsegg', 'Saab'] }
]

export default function Footer() {
  const { isAdmin } = useAuthStore()
  const { t } = useI18n()

  return (
    <footer className="mt-auto">
      {/* Seção Principal - FUNDO PRETO */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Coluna 1: Logo + Descrição */}
            <div>
              <div className="mb-4">
                <GaidLogo size={40} />
              </div>
              <p className="text-gray-300 text-sm mb-4">
                {t('O maior marketplace de peças automotivas JDM do Japão. Encontre peças genuínas para seu carro japonês com entrega em todo o Japão.')}
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Coluna 2: Navegação */}
            <div>
              <h3 className="font-bold text-white mb-4">{t('Navegação')}</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/catalog" className="text-gray-300 hover:text-[#ff3d00] transition-colors">
                    {t('Catálogo')}
                  </Link>
                </li>
                <li>
                  <Link to="/parts" className="text-gray-300 hover:text-[#ff3d00] transition-colors">
                    {t('Catálogo de Peças')}
                  </Link>
                </li>
                <li>
                  <Link to="/cars" className="text-gray-300 hover:text-[#ff3d00] transition-colors">
                    {t('Compatibilidade')}
                  </Link>
                </li>
                <li>
                  <Link to="/auctions" className="text-gray-300 hover:text-[#ff3d00] transition-colors">
                    {t('Leilões')}
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-gray-300 hover:text-[#ff3d00] transition-colors flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                    {t('Showroom 3D')}
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-gray-300 hover:text-[#ff3d00] transition-colors">
                    {t('Minha Conta')}
                  </Link>
                </li>
                <li>
                  <Link to="/create-listing" className="text-gray-300 hover:text-[#ff3d00] transition-colors">
                    {t('Vender Peças')}
                  </Link>
                </li>
                <li>
                  <Link to="/favorites" className="text-gray-300 hover:text-[#ff3d00] transition-colors">
                    {t('Favoritos')}
                  </Link>
                </li>
              </ul>
            </div>


            {/* Coluna 4: Recursos */}
            <div>
              <h3 className="font-bold text-white mb-4">{t('Recursos')}</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/rastreio" className="text-gray-300 hover:text-[#ff3d00] transition-colors">
                    {t('Rastrear Pedido')}
                  </Link>
                </li>
                <li>
                  <Link to="/catalog" className="text-gray-300 hover:text-[#ff3d00] transition-colors">
                    {t('Catálogo Completo')}
                  </Link>
                </li>
                <li>
                  <Link to="/cars" className="text-gray-300 hover:text-[#ff3d00] transition-colors">
                    {t('Compatibilidade')}
                  </Link>
                </li>
                <li>
                  <Link to="/parts" className="text-gray-300 hover:text-[#ff3d00] transition-colors">
                    {t('Catálogo de Peças')}
                  </Link>
                </li>
                <li>
                  <Link to="/auctions" className="text-gray-300 hover:text-[#ff3d00] transition-colors">
                    {t('Leilões')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Coluna 5: Contato */}
            <div>
              <h3 className="font-bold text-white mb-4">{t('Contato')}</h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-gray-300">
                  <Mail className="w-4 h-4" />
                  <span>contato@gaid.jp</span>
                </li>
                <li className="flex items-center space-x-2 text-gray-300">
                  <Phone className="w-4 h-4" />
                  <span>+81 90 1234 5678</span>
                </li>
                <li className="flex items-center space-x-2 text-gray-300">
                  <MapPin className="w-4 h-4" />
                  <span>{t('Nagoya, Japão')}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 my-10" />

          {/* Marcas por País */}
          <div>
            <h3 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">国別のブランド</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {SE_BRANDS_BY_COUNTRY.map(group => (
                <div key={group.country}>
                  <h4 className="font-semibold text-[#00E5FF] mb-2 text-xs uppercase tracking-wider">{group.country}</h4>
                  <p className="text-gray-400 text-xs leading-relaxed flex flex-wrap gap-x-1 gap-y-0.5">
                    {group.brands.map((brand, idx, arr) => (
                      <span key={brand} className="inline-flex items-center">
                        <Link
                          to={`/catalog?brand=${brand.toLowerCase()}`}
                          className="hover:text-[#0D75FF] transition-colors"
                        >
                          {brand}
                        </Link>
                        {idx < arr.length - 1 && <span className="ml-1 text-gray-600">•</span>}
                      </span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Seção Copyright - FUNDO QUASE PRETO */}
      <div className="bg-[#0a0a0a] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2026 GAID. {t('Todos os direitos reservados.')}
          </p>
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0 items-center">
            <Link to="/legal" className="text-gray-400 hover:text-white text-sm transition-colors">
              特定商取引法に基づく表記 (SCT)
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              {t('Termos de Uso')}
            </Link>
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              {t('Privacidade')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}