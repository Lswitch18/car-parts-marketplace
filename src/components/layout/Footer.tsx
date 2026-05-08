import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ffd700] to-[#ff0000] flex items-center justify-center">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <span className="font-display font-bold text-xl text-gray-900">
                JAPANCAR<span className="text-[#ffd700]">PARTS</span>
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              O maior marketplace de peças automotivas JDM do Japão.
              Encontre peças genuínas para seu carro japonês com entrega em todo o Japão.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-500 hover:text-[#ffd700] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-[#ffd700] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-[#ffd700] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/catalog" className="text-gray-600 hover:text-[#ffd700] transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-600 hover:text-[#ffd700] transition-colors">
                  Minha Conta
                </Link>
              </li>
              <li>
                <Link to="/create-listing" className="text-gray-600 hover:text-[#ffd700] transition-colors">
                  Vender Peças
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-gray-600 hover:text-[#ffd700] transition-colors">
                  Favoritos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Marcas</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-600">Nissan</span></li>
              <li><span className="text-gray-600">Toyota</span></li>
              <li><span className="text-gray-600">Honda</span></li>
              <li><span className="text-gray-600">Mazda</span></li>
              <li><span className="text-gray-600">Subaru</span></li>
              <li><span className="text-gray-600">Mitsubishi</span></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contato</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>contato@japancarparts.com</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>São Paulo, SP</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2024 JAPANCAR PARTS. Todos os direitos reservados.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-[#ffd700] text-sm">
              Termos de Uso
            </a>
            <a href="#" className="text-gray-500 hover:text-[#ffd700] text-sm">
              Privacidade
            </a>
            <a href="#" className="text-gray-500 hover:text-[#ffd700] text-sm">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}