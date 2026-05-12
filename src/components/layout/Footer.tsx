import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'
import GaidLogo from '../GaidLogo'

export default function Footer() {
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
                O maior marketplace de peças automotivas JDM do Japão. Encontre peças genuínas para seu carro japonês com entrega em todo o Japão.
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
              <h3 className="font-bold text-white mb-4">Navegação</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/catalog" className="text-gray-300 hover:text-[#ff3d00] transition-colors">
                    Catálogo
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-gray-300 hover:text-[#ff3d00] transition-colors">
                    Minha Conta
                  </Link>
                </li>
                <li>
                  <Link to="/create-listing" className="text-gray-300 hover:text-[#ff3d00] transition-colors">
                    Vender Peças
                  </Link>
                </li>
                <li>
                  <Link to="/favorites" className="text-gray-300 hover:text-[#ff3d00] transition-colors">
                    Favoritos
                  </Link>
                </li>
              </ul>
            </div>

            {/* Coluna 3: Marcas */}
            <div>
              <h3 className="font-bold text-white mb-4">Marcas</h3>
              <ul className="space-y-2">
                <li><span className="text-gray-300">Nissan</span></li>
                <li><span className="text-gray-300">Toyota</span></li>
                <li><span className="text-gray-300">Honda</span></li>
                <li><span className="text-gray-300">Mazda</span></li>
                <li><span className="text-gray-300">Subaru</span></li>
                <li><span className="text-gray-300">Mitsubishi</span></li>
              </ul>
            </div>

            {/* Coluna 4: Contato */}
            <div>
              <h3 className="font-bold text-white mb-4">Contato</h3>
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
                  <span>Nagoya, Japão</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Seção Copyright - FUNDO QUASE PRETO */}
      <div className="bg-[#0a0a0a] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2026 GAID. Todos os direitos reservados.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacidade
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}