import { useState, useEffect } from 'react';
import { User, FileText, Smartphone, Truck, ShieldCheck, Camera, CheckCircle, Mail, Download, X } from 'lucide-react';
import BiometricScanner from '../../components/mobile/BiometricScanner';

interface DriverProfile {
  name: string;
  email: string;
  cnh: string;
  plate: string;
  phone: string;
  docPhoto?: string;
  faceTemplate?: string;
}

export default function WorkerCadastro() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cnh, setCnh] = useState('');
  const [plate, setPlate] = useState('');
  const [phone, setPhone] = useState('');
  const [docPhoto, setDocPhoto] = useState<string | null>(null);
  const [faceTemplate, setFaceTemplate] = useState<string | null>(null);

  const [activeScanner, setActiveScanner] = useState<'face' | 'document' | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  // Load existing profile if any
  useEffect(() => {
    const savedProfileStr = localStorage.getItem('driver_profile');
    const savedFace = localStorage.getItem('driver_face_template');
    
    if (savedProfileStr) {
      try {
        const profile = JSON.parse(savedProfileStr) as DriverProfile;
        setName(profile.name || '');
        setEmail(profile.email || '');
        setCnh(profile.cnh || '');
        setPlate(profile.plate || '');
        setPhone(profile.phone || '');
        setDocPhoto(profile.docPhoto || null);
      } catch (e) {
        console.error('Failed to parse saved driver profile', e);
      }
    }
    if (savedFace) {
      setFaceTemplate(savedFace);
    }
  }, []);

  const handleSave = () => {
    if (!name || !email || !cnh || !plate || !phone) {
      alert('Por favor, preencha todos os campos cadastrais.');
      return;
    }
    if (!docPhoto) {
      alert('Por favor, escaneie a foto da sua CNH / documento.');
      return;
    }
    if (!faceTemplate) {
      alert('Por favor, realize o escaneamento da sua Biometria Facial.');
      return;
    }

    const profile: DriverProfile = {
      name,
      email,
      cnh,
      plate,
      phone,
      docPhoto
    };

    localStorage.setItem('driver_profile', JSON.stringify(profile));
    localStorage.setItem('driver_face_template', faceTemplate);
    
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowEmailPreview(true); // Open the mock email download preview modal
    }, 1500);
  };

  const handleCapture = (image: string) => {
    if (activeScanner === 'face') {
      setFaceTemplate(image);
    } else if (activeScanner === 'document') {
      setDocPhoto(image);
    }
    setActiveScanner(null);
  };

  return (
    <div className="p-4 pb-24 space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white">Cadastro do Motorista</h1>
        <p className="text-xs text-gray-400 mt-1">
          Complete seu perfil e envie sua biometria facial e documentos para validações de segurança.
        </p>
      </div>

      {/* Success Banner */}
      {savedSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
          <CheckCircle className="text-green-400 shrink-0" size={24} />
          <div>
            <p className="text-sm font-bold text-green-400">Cadastro Salvo com Sucesso!</p>
            <p className="text-xs text-green-500/80">Enviando e-mail de instalação para {email}...</p>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="bg-[#111827] rounded-2xl border border-white/5 p-4 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">Dados do Condutor</h2>
        
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-400 block font-medium">Nome Completo</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
              <User size={16} />
            </span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Digite seu nome completo"
              className="w-full h-11 pl-10 pr-4 bg-[#0B1220] border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-400 block font-medium">E-mail</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
              <Mail size={16} />
            </span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Ex: motorista@provedor.com"
              className="w-full h-11 pl-10 pr-4 bg-[#0B1220] border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* CNH Number */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-400 block font-medium">Número da CNH</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
              <FileText size={16} />
            </span>
            <input
              type="text"
              value={cnh}
              onChange={e => setCnh(e.target.value)}
              placeholder="Digite o número da habilitação"
              className="w-full h-11 pl-10 pr-4 bg-[#0B1220] border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Vehicle Plate */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-400 block font-medium">Placa do Veículo</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
              <Truck size={16} />
            </span>
            <input
              type="text"
              value={plate}
              onChange={e => setPlate(e.target.value.toUpperCase())}
              placeholder="Ex: ABC-1234 ou ABC1D23"
              className="w-full h-11 pl-10 pr-4 bg-[#0B1220] border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-400 block font-medium">Celular / Telefone</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
              <Smartphone size={16} />
            </span>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="(00) 90000-0000"
              className="w-full h-11 pl-10 pr-4 bg-[#0B1220] border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Safety Uploads & Biometrics */}
      <div className="bg-[#111827] rounded-2xl border border-white/5 p-4 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">Segurança & Biometria</h2>

        {/* CNH Photo capture */}
        <div className="flex items-center justify-between p-3 bg-[#0B1220] rounded-xl border border-white/5">
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-white flex items-center gap-1.5">
              <FileText size={15} className="text-blue-400" />
              Foto da CNH
            </p>
            <p className="text-[10px] text-gray-500">Foto nítida da frente do documento</p>
          </div>
          <button
            onClick={() => setActiveScanner('document')}
            className={`h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              docPhoto 
                ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                : 'bg-blue-500 text-black'
            }`}
          >
            <Camera size={14} /> {docPhoto ? 'Re-escanear' : 'Escanear'}
          </button>
        </div>

        {/* CNH Photo Preview */}
        {docPhoto && (
          <div className="relative rounded-xl border border-white/5 overflow-hidden h-32 bg-black flex items-center justify-center">
            <img src={docPhoto} alt="CNH Document Preview" className="h-full object-contain" />
          </div>
        )}

        {/* Face Biometrics capture */}
        <div className="flex items-center justify-between p-3 bg-[#0B1220] rounded-xl border border-white/5">
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-white flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-blue-400" />
              Biometria Facial
            </p>
            <p className="text-[10px] text-gray-500">Reconhecimento facial para coletas</p>
          </div>
          <button
            onClick={() => setActiveScanner('face')}
            className={`h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              faceTemplate 
                ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                : 'bg-blue-500 text-black'
            }`}
          >
            <Camera size={14} /> {faceTemplate ? 'Re-escanear' : 'Escanear'}
          </button>
        </div>

        {/* Face Template Preview */}
        {faceTemplate && (
          <div className="flex justify-center py-2">
            <div className="relative rounded-full border-2 border-green-500/40 overflow-hidden w-24 h-24 bg-black">
              <img src={faceTemplate} alt="Face Template Preview" className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-black font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
      >
        <ShieldCheck size={18} /> SALVAR PERFIL DO MOTORISTA
      </button>

      {/* Active Scanner Modal */}
      {activeScanner && (
        <BiometricScanner
          mode={activeScanner}
          onCapture={handleCapture}
          onClose={() => setActiveScanner(null)}
          title={activeScanner === 'face' ? 'Escanear Rosto' : 'Escanear CNH'}
        />
      )}

      {/* Mock Email Client Preview Modal */}
      {showEmailPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <div className="bg-[#111827] rounded-3xl border border-white/10 w-full max-w-lg overflow-hidden shadow-2xl">
            
            {/* Header simulated inbox */}
            <div className="bg-[#1F2937] p-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-red-500 rounded-full" />
                <div className="w-3.5 h-3.5 bg-yellow-500 rounded-full" />
                <div className="w-3.5 h-3.5 bg-green-500 rounded-full" />
                <span className="text-xs text-gray-400 font-bold ml-2 font-mono">Caixa de Entrada (Simulação)</span>
              </div>
              <button onClick={() => setShowEmailPreview(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Email Headers info */}
            <div className="p-4 bg-[#182232] space-y-1 text-xs border-b border-white/5">
              <p><span className="text-gray-500">De:</span> <span className="text-blue-400 font-bold">DAIG Logistix Express</span> &lt;noreply@daiglogistix.com&gt;</p>
              <p><span className="text-gray-500">Para:</span> <span className="text-gray-300 font-medium">{email}</span></p>
              <p><span className="text-gray-500">Assunto:</span> <span className="text-white font-bold">Bem-vindo ao DAIG Logistix Express - Link para Download do App</span></p>
            </div>

            {/* Email Body template */}
            <div className="p-6 space-y-6 text-sm text-gray-300 max-h-[50vh] overflow-y-auto font-sans leading-relaxed">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto text-blue-400">
                  <Truck size={24} />
                </div>
                <h2 className="text-lg font-black text-white">Olá, {name}!</h2>
                <p className="text-xs text-gray-400">Seu cadastro biométrico foi aprovado no painel administrativo.</p>
              </div>

              <div className="bg-[#0B1220] rounded-2xl p-4 border border-white/5 space-y-2">
                <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Suas Credenciais do Motorista:</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <p className="text-gray-500">CNH: <span className="text-white font-bold">{cnh}</span></p>
                  <p className="text-gray-500">Placa: <span className="text-white font-bold">{plate}</span></p>
                </div>
              </div>

              <p>
                Para começar a realizar coletas e entregas em campo, faça o download e instalação do aplicativo móvel dedicado **DAIG Logistix Express** no seu dispositivo Android.
              </p>

              <div className="text-center pt-2">
                <a
                  href="/app/worker/install"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowEmailPreview(false)}
                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-black font-black py-3 px-6 rounded-2xl text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                >
                  <Download size={14} /> Baixar Aplicativo (APK)
                </a>
              </div>

              <p className="text-[10px] text-gray-500 text-center pt-4 border-t border-white/5">
                Caso tenha dúvidas sobre a instalação, acesse a central de suporte em campo.
              </p>
            </div>

            {/* Footer action */}
            <div className="bg-[#1F2937] p-4 flex justify-end border-t border-white/5">
              <button
                onClick={() => setShowEmailPreview(false)}
                className="h-10 px-5 bg-blue-500 text-black font-bold rounded-xl text-xs uppercase"
              >
                Concluir
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
