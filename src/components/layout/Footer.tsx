import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'
import GaidLogo from '../GaidLogo'

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <GaidLogo size={40} className="-ml-8" />
            </div>
            <p className="text-text-secondary text-sm">
              Gaid - A plataforma definitiva para compra e venda de peças automotivas.
              Tecnologia e performance para o seu veículo em todo o Japão.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-text mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/catalog" className="text-text-secondary hover:text-primary transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-text-secondary hover:text-primary transition-colors">
                  Minha Conta
                </Link>
              </li>
              <li>
                <Link to="/create-listing" className="text-text-secondary hover:text-primary transition-colors">
                  Vender Peças
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-text-secondary hover:text-primary transition-colors">
                  Favoritos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-text mb-4">Marcas</h3>
            <ul className="space-y-2">
              <li><span className="text-text-secondary">Nissan</span></li>
              <li><span className="text-text-secondary">Toyota</span></li>
              <li><span className="text-text-secondary">Honda</span></li>
              <li><span className="text-text-secondary">Mazda</span></li>
              <li><span className="text-text-secondary">Subaru</span></li>
              <li><span className="text-text-secondary">Mitsubishi</span></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-text mb-4">Contato</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-text-secondary">
                <Mail className="w-4 h-4" />
                <span>contato@gaid.jp</span>
              </li>
              <li className="flex items-center space-x-2 text-text-secondary">
                <Phone className="w-4 h-4" />
                <span>+81 (0) 90 1234 5678</span>
              </li>
              <li className="flex items-center space-x-2 text-text-secondary">
                <MapPin className="w-4 h-4" />
                <span>Nagoya, Aichi, Japan</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-text-secondary text-sm">
            © 2026 GAID. Todos os direitos reservados.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-text-secondary hover:text-primary text-sm">
              Termos de Uso
            </a>
            <a href="#" className="text-text-secondary hover:text-primary text-sm">
              Privacidade
            </a>
            <a href="#" className="text-text-secondary hover:text-primary text-sm">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}