import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { useTenantCore } from '@/modules/shared/hooks/useTenantCore'
import { fetchPostal } from '@/modules/shared/lib/postal'
import { supabase } from '@/modules/shared/lib/supabase'
import QRStickerPrint from '@/modules/backoffice/components/QRStickerPrint'
import GaidLogo from '@/modules/shared/components/GaidLogo'
import { Product } from '@/modules/shared/types'
import AiPartQuickUploadModal from '@/modules/backoffice/components/AiPartQuickUploadModal'
import { parseCompatibilityTextToTags } from '@/modules/shared/components/CompatibilityTagInput'
import { useTenantRealData } from '@/modules/shared/hooks/useTenantRealData'
import {
  Building2, Package, QrCode, Wrench, Globe, Sparkles,
  Search, ShieldCheck, AlertCircle, RefreshCw, Car, FileText,
  ShoppingCart, DollarSign, Key, Cpu, Tag, CheckCircle2,
  Plus, Eye, Filter, ArrowRight, Layers, Smartphone, Upload, Camera, Check,
  Printer, X, CreditCard, ChevronLeft, ChevronRight, Mic, MicOff, Command,
  MapPin, SlidersHorizontal, User, Mail, Phone, Save, LogOut, Grid, Zap, LayoutDashboard, Box, Loader2, Play, ArrowDownRight, CheckSquare, MinusCircle
} from 'lucide-react'

type TabType =
  | 'overview'
  | 'ai-hub'
  | 'wms-hierarchy'
  | 'workshop-kanban'
  | 'inventory'
  | 'sales'
  | 'purchases'
  | 'finance'
  | 'profile'
  | 'api-b2b'

interface WorkOrder {
  id: string
  title: string
  client: string
  vehicle: string
  mechanic: string
  status: 'aguardando' | 'em_manutencao' | 'testes' | 'pronto'
  amount: number
  partsUsed: string
  date: string
}

// 📦 LISTA COMPLETA DE 20 PEÇAS DE TESTE REALISTAS PARA O FLUXO SAAS
const DEMO_20_PARTS: any[] = [
  {
    id: 'part-demo-1',
    title: 'Farol Dianteiro Full LED Esquerdo (LHD/RHD)',
    oem_code: 'OEM-33100-47820',
    category: 'Lataria & Iluminação',
    price: 45000,
    cost_price: 15000,
    status: 'active',
    seller_id: 'tenant_demo',
    location: 'Yokohama, JP',
    wms_location: 'Galpão A ➔ Corredor 02 ➔ Estante C ➔ Prateleira 1 ➔ Posição 04',
    license_plate: '品川 300 な 45-89',
    vin: 'JTDKN3DU0J0129845',
    vehicle_origin: 'Toyota Prius ZVW30 (2018)',
    compatibility: 'Toyota Prius ZVW30 (2015-2022), Prius PHV ZVW35',
    images: ['/parts/farol_full_led.png'],
    description: 'Farol LED genuíno Toyota em estado impecável, testado no scanner óptico. Acompanha reator e lâmpadas.',
    created_at: new Date().toISOString()
  },
  {
    id: 'part-demo-2',
    title: 'Módulo de Injeção Eletrônica ECU Engine Control Unit',
    oem_code: 'OEM-37820-5R0-J61',
    category: 'Injeção Eletrônica & Sensores',
    price: 38000,
    cost_price: 12000,
    status: 'active',
    seller_id: 'tenant_demo',
    location: 'Tokyo, JP',
    wms_location: 'Galpão A ➔ Corredor 04 ➔ Estante B ➔ Prateleira 3 ➔ Caixa 12 ➔ Posição 08',
    license_plate: '横浜 501 き 12-34',
    vin: 'HGK31004589',
    vehicle_origin: 'Honda Fit GK3 (2017)',
    compatibility: 'Honda Fit GK3 (2015-2020), Honda Vezel RU1, Honda Shuttle GP7',
    images: ['/parts/modulo_ecu.png'],
    description: 'Módulo ECU testado no scanner diagnóstico. Sem falhas de circuito, com certidão de desmonte e garantia de 90 dias.',
    created_at: new Date().toISOString()
  },
  {
    id: 'part-demo-3',
    title: 'Turbocompressor IHI VF52 RHD JDM Genuíno',
    oem_code: 'OEM-14411-AA800',
    category: 'Motor & Periféricos',
    price: 88000,
    cost_price: 35000,
    status: 'active',
    seller_id: 'tenant_demo',
    location: 'Saitama, JP',
    wms_location: 'Galpão A ➔ Corredor 04 ➔ Estante A ➔ Prateleira 2 ➔ Posição 01',
    license_plate: '大宫 330 さ 99-88',
    vin: 'BNR34001928',
    vehicle_origin: 'Subaru Impreza WRX STI GRB (2012)',
    compatibility: 'Subaru Impreza WRX STI 2008-2014 EJ255/EJ257',
    images: ['/parts/turbo_ihi_vf52.png'],
    description: 'Turbocompressor IHI VF52 genuíno JDM. Folga zero de eixo, estado de conservação A+.',
    created_at: new Date().toISOString()
  },
  {
    id: 'part-demo-4',
    title: 'Kit Freio Esportivo Disco Perfurado Caliper Red',
    oem_code: 'OEM-20000-RRB-305',
    category: 'Freios & Suspensão',
    price: 145000,
    cost_price: 50000,
    status: 'active',
    seller_id: 'tenant_demo',
    location: 'Yokohama, JP',
    wms_location: 'Galpão A ➔ Corredor 04 ➔ Estante D ➔ Prateleira 1 ➔ Posição 02',
    license_plate: '品川 301 ふ 88-12',
    vin: 'FA5-1092847',
    vehicle_origin: 'Honda Civic Si FA5 (2008)',
    compatibility: 'Honda Civic Si FA5/FG2, Integra DC5 K20A/K20Z3',
    images: ['/parts/freio_brembo.png'],
    description: 'Câmbio manual de 6 marchas com diferencial autoblocante helicoidal LSD. Sincronizadores revisados.',
    created_at: new Date().toISOString()
  },
  {
    id: 'part-demo-5',
    title: 'Alternador High-Output Denso 130A',
    oem_code: 'OEM-27060-37020',
    category: 'Motor & Periféricos',
    price: 28000,
    cost_price: 8000,
    status: 'active',
    seller_id: 'tenant_demo',
    location: 'Tokyo, JP',
    wms_location: 'Galpão B ➔ Corredor 01 ➔ Estante A ➔ Prateleira 2 ➔ Posição 05',
    license_plate: '練馬 500 め 33-44',
    vin: 'ZRE152-701928',
    vehicle_origin: 'Toyota Corolla ZRE152 (2015)',
    compatibility: 'Toyota Corolla 2ZR-FE, Auris ZRE154, Wish ZGE20',
    images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&q=80'],
    description: 'Alternador original Denso 130 Amperes. Testado em bancada com carga total, regulador integrado.',
    created_at: new Date().toISOString()
  },
  {
    id: 'part-demo-6',
    title: 'Bomba de Combustível de Alta Pressão GDI',
    oem_code: 'OEM-42021-FG000',
    category: 'Injeção Eletrônica & Sensores',
    price: 32000,
    cost_price: 9500,
    status: 'draft',
    seller_id: 'tenant_demo',
    location: 'Osaka, JP',
    wms_location: 'Galpão B ➔ Corredor 03 ➔ Estante B ➔ Prateleira 4 ➔ Posição 12',
    license_plate: '多摩 300 せ 55-66',
    vin: 'VAB-009182',
    vehicle_origin: 'Subaru Impreza WRX STI (2016)',
    compatibility: 'Subaru Impreza WRX STI VAB/GRB/GVB EJ20/EJ25',
    images: ['https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400&q=80'],
    description: 'Bomba de combustível de alta vazão com bóia e pré-filtro inclusos. Pressão de 4.2 bar mantida sem oscilação.',
    created_at: new Date().toISOString()
  },
  {
    id: 'part-demo-7',
    title: 'Inversor Híbrido Hybrid Synergy Drive Power Management',
    oem_code: 'OEM-G9200-47190',
    category: 'Injeção Eletrônica & Sensores',
    price: 120000,
    cost_price: 40000,
    status: 'active',
    seller_id: 'tenant_demo',
    location: 'Kanagawa, JP',
    wms_location: 'Galpão A ➔ Corredor 01 ➔ Estante A ➔ Prateleira 1 ➔ Posição 03',
    license_plate: '湘南 300 て 11-22',
    vin: 'ZVW50-5019283',
    vehicle_origin: 'Toyota Prius ZVW50 (2019)',
    compatibility: 'Toyota Prius ZVW50/ZVW51/ZVW55 (2016-2022)',
    images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=80'],
    description: 'Módulo Inversor Híbrido com conversor DC-DC integrado. Testado no scanner sem códigos de erro DTC P0A78.',
    created_at: new Date().toISOString()
  },
  {
    id: 'part-demo-8',
    title: 'Jogo de Amortecedores Coilover Tein Flex Z Ajustáveis',
    oem_code: 'OEM-VSD30-C1SS1',
    category: 'Suspensão & Freios',
    price: 95000,
    cost_price: 32000,
    status: 'active',
    seller_id: 'tenant_demo',
    location: 'Hiroshima, JP',
    wms_location: 'Galpão C ➔ Corredor 02 ➔ Estante B ➔ Prateleira 3 ➔ Posição 06',
    license_plate: '広島 330 そ 77-88',
    vin: 'FD3S-401928',
    vehicle_origin: 'Mazda RX-7 FD3S (1999)',
    compatibility: 'Mazda RX-7 FD3S Séries 4, 5 e 6 (1992-2002)',
    images: ['https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&q=80'],
    description: 'Suspensão coilover completa com regulagem de altura e 16 níveis de amortecimento de carga. Sem vazamentos.',
    created_at: new Date().toISOString()
  },
  {
    id: 'part-demo-9',
    title: 'Painel de Instrumentos Digital Optitron Tricolor',
    oem_code: 'OEM-83800-22A10',
    category: 'Painel & Eletrônicos',
    price: 55000,
    cost_price: 18000,
    status: 'draft',
    seller_id: 'tenant_demo',
    location: 'Chiba, JP',
    wms_location: 'Galpão C ➔ Corredor 01 ➔ Estante C ➔ Prateleira 2 ➔ Posição 09',
    license_plate: '千葉 300 た 44-55',
    vin: 'JZX100-008192',
    vehicle_origin: 'Toyota Mark II JZX100 Tourer V (1998)',
    compatibility: 'Toyota Mark II, Chaser, Cresta JZX100 1JZ-GTE',
    images: ['https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=400&q=80'],
    description: 'Cluster Optitron tricolor original com 74.500 km marcados. Leds e serigrafia em estado de novo.',
    created_at: new Date().toISOString()
  },
  {
    id: 'part-demo-10',
    title: 'Volante Esportivo Momo Leather com Airbag Nardi',
    oem_code: 'OEM-MR621094',
    category: 'Acabamento Interno',
    price: 62000,
    cost_price: 20000,
    status: 'active',
    seller_id: 'tenant_demo',
    location: 'Nagoya, JP',
    wms_location: 'Galpão C ➔ Corredor 03 ➔ Estante A ➔ Prateleira 1 ➔ Posição 07',
    license_plate: '名古屋 300 に 99-00',
    vin: 'CT9A-040192',
    vehicle_origin: 'Mitsubishi Lancer Evolution IX (2006)',
    compatibility: 'Mitsubishi Lancer Evolution VII, VIII, IX (CT9A)',
    images: ['https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&q=80'],
    description: 'Volante original Momo em couro perfurado com costuras vermelhas. Airbag frontal incluso e intacto.',
    created_at: new Date().toISOString()
  },
  {
    id: 'part-demo-11',
    title: 'Diferencial Blocado LSD CusCo Type-RS 2-Way',
    oem_code: 'OEM-LSD-270-E2',
    category: 'Transmissão & Câmbio',
    price: 110000,
    cost_price: 38000,
    status: 'active',
    seller_id: 'tenant_demo',
    location: 'Fukuoka, JP',
    wms_location: 'Galpão A ➔ Corredor 04 ➔ Estante C ➔ Prateleira 1 ➔ Posição 05',
    license_plate: '福岡 300 と 12-99',
    vin: 'S15-029182',
    vehicle_origin: 'Nissan Silvia S15 Spec-R (2000)',
    compatibility: 'Nissan Silvia S14, S15 SR20DET',
    images: ['https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&q=80'],
    description: 'Diferencial de deslizamento limitado de discos Cusco 2-way para Drift e Track day. Pré-carga ajustada.',
    created_at: new Date().toISOString()
  },
  {
    id: 'part-demo-12',
    title: 'Parachoque Dianteiro Aerodinâmico Nismo Spec-2',
    oem_code: 'OEM-62022-RNZ30',
    category: 'Lataria & Iluminação',
    price: 78000,
    cost_price: 25000,
    status: 'active',
    seller_id: 'tenant_demo',
    location: 'Shizuoka, JP',
    wms_location: 'Galpão B ➔ Corredor 04 ➔ Estante D ➔ Prateleira 2 ➔ Posição 01',
    license_plate: '静岡 300 な 77-11',
    vin: 'Z33-109284',
    vehicle_origin: 'Nissan Fairlady Z Z33 350Z (2005)',
    compatibility: 'Nissan Fairlady Z Z33 / 350Z (2003-2008)',
    images: ['https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&q=80'],
    description: 'Parachoque dianteiro Nismo original com dutos de ar para freios. Cor prata metálico WV2.',
    created_at: new Date().toISOString()
  },
  {
    id: 'part-demo-13',
    title: 'Kit Pinças de Freio Brembo 4 Pistões Dianteiras',
    oem_code: 'OEM-26292-FE000',
    category: 'Suspensão & Freios',
    price: 88000,
    cost_price: 28000,
    status: 'active',
    seller_id: 'tenant_demo',
    location: 'Kyoto, JP',
    wms_location: 'Galpão B ➔ Corredor 02 ➔ Estante A ➔ Prateleira 3 ➔ Posição 10',
    license_plate: '京都 300 ぬ 33-22',
    vin: 'GRB-019283',
    vehicle_origin: 'Subaru Impreza WRX STI Hatch (2012)',
    compatibility: 'Subaru Impreza WRX STI, Legacy GT, Forester XT',
    images: ['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400&q=80'],
    description: 'Pinças de alumínio forjado Brembo douradas com reparos e reparos de vedação novos. Pastilhas Endless 70%.',
    created_at: new Date().toISOString()
  },
  {
    id: 'part-demo-14',
    title: 'Coletor de Admissão High-Flow Nismo Surge Tank',
    oem_code: 'OEM-14110-RSR45',
    category: 'Motor & Periféricos',
    price: 135000,
    cost_price: 45000,
    status: 'draft',
    seller_id: 'tenant_demo',
    location: 'Kanagawa, JP',
    wms_location: 'Galpão A ➔ Corredor 03 ➔ Estante B ➔ Prateleira 2 ➔ Posição 04',
    license_plate: '川崎 300 ね 88-99',
    vin: 'BCNR33-01928',
    vehicle_origin: 'Nissan Skyline GT-R R33 (1995)',
    compatibility: 'Nissan Skyline GT-R R32, R33, R34 (RB26DETT)',
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80'],
    description: 'Plenum Nismo de admissão com fluxo otimizado para distribuição igual de ar entre os 6 cilindros.',
    created_at: new Date().toISOString()
  },
  {
    id: 'part-demo-15',
    title: 'Radiador de Alumínio 3 Passos Koyorad Racing',
    oem_code: 'OEM-VH080703',
    category: 'Motor & Periféricos',
    price: 42000,
    cost_price: 14000,
    status: 'active',
    seller_id: 'tenant_demo',
    location: 'Tokyo, JP',
    wms_location: 'Galpão B ➔ Corredor 01 ➔ Estante C ➔ Prateleira 4 ➔ Posição 08',
    license_plate: '品川 330 の 12-34',
    vin: 'AP1-100291',
    vehicle_origin: 'Honda S2000 AP1 (2002)',
    compatibility: 'Honda S2000 AP1 / AP2 (F20C / F22C)',
    images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&q=80'],
    description: 'Radiador de alumínio brasado Koyorad com colmeia de 53mm. Dissipação térmica 35% superior ao original.',
    created_at: new Date().toISOString()
  },
  {
    id: 'part-demo-16',
    title: 'Sensor de Fluxo de Ar MAF Meter Hitachi',
    oem_code: 'OEM-22680-69F00',
    category: 'Injeção Eletrônica & Sensores',
    price: 19000,
    cost_price: 5000,
    status: 'active',
    seller_id: 'tenant_demo',
    location: 'Miyagi, JP',
    wms_location: 'Galpão C ➔ Corredor 04 ➔ Estante A ➔ Prateleira 1 ➔ Posição 14',
    license_plate: '仙台 500 は 77-66',
    vin: 'RPS13-091827',
    vehicle_origin: 'Nissan 180SX Type X (1996)',
    compatibility: 'Nissan 180SX, Silvia S14, Pulsar GTI-R (SR20DET)',
    images: ['https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400&q=80'],
    description: 'Sensor MAF de elemento aquecido testado em osciloscópio. Tensão de sinal perfeitamente calibrada.',
    created_at: new Date().toISOString()
  },
  {
    id: 'part-demo-17',
    title: 'Conjunto Lanternas Traseiras LED Valenti Smoke',
    oem_code: 'OEM-SU003-02540',
    category: 'Lataria & Iluminação',
    price: 48000,
    cost_price: 16000,
    status: 'active',
    seller_id: 'tenant_demo',
    location: 'Gunma, JP',
    wms_location: 'Galpão B ➔ Corredor 03 ➔ Estante D ➔ Prateleira 2 ➔ Posição 03',
    license_plate: '群馬 300 ひ 55-44',
    vin: 'ZN6-019284',
    vehicle_origin: 'Toyota GT86 / Subaru BRZ (2016)',
    compatibility: 'Toyota GT86 ZN6, Subaru BRZ ZC6, Scion FR-S (2012-2020)',
    images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=80'],
    description: 'Lanternas traseiras sequenciais Valenti Japão em acrílico fume. Vedação sem infiltração de umidade.',
    created_at: new Date().toISOString()
  },
  {
    id: 'part-demo-18',
    title: 'Compressor de Ar Condicionado Denso 10S15C',
    oem_code: 'OEM-38810-5R0-004',
    category: 'Motor & Periféricos',
    price: 36000,
    cost_price: 11000,
    status: 'active',
    seller_id: 'tenant_demo',
    location: 'Saitama, JP',
    wms_location: 'Galpão B ➔ Corredor 02 ➔ Estante B ➔ Prateleira 1 ➔ Posição 11',
    license_plate: '大宫 500 ふ 11-88',
    vin: 'RU1-201928',
    vehicle_origin: 'Honda Vezel RU1 (2018)',
    compatibility: 'Honda Vezel RU1/RU3, Fit GK5, Grace GM4',
    images: ['https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&q=80'],
    description: 'Compressor de A/C original com embreagem magnética e óleo R134a limpo. Pressão de succão de fábrica.',
    created_at: new Date().toISOString()
  },
  {
    id: 'part-demo-19',
    title: 'Bicos Injetores High-Flow 1000cc Injector Dynamics',
    oem_code: 'OEM-1000-48-14-14',
    category: 'Injeção Eletrônica & Sensores',
    price: 72000,
    cost_price: 24000,
    status: 'active',
    seller_id: 'tenant_demo',
    location: 'Tokyo, JP',
    wms_location: 'Galpão C ➔ Corredor 01 ➔ Estante B ➔ Prateleira 2 ➔ Posição 15',
    license_plate: '足立 300 へ 99-77',
    vin: 'JZA80-001928',
    vehicle_origin: 'Toyota Supra JZA80 2JZ-GTE (1997)',
    compatibility: 'Toyota Supra 2JZ-GTE, Aristo JZS161 2JZ, Soarer 1JZ',
    images: ['https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=400&q=80'],
    description: 'Jogo de 6 bicos de alta impedância ID1000 iguais em vazão (máximo 1% de desvio). O-rings de viton inclusos.',
    created_at: new Date().toISOString()
  },
  {
    id: 'part-demo-20',
    title: 'Módulo de Direção Elétrica EPS Steuergerät',
    oem_code: 'OEM-38720-68R00',
    category: 'Painel & Eletrônicos',
    price: 29000,
    cost_price: 9000,
    status: 'active',
    seller_id: 'tenant_demo',
    location: 'Shizuoka, JP',
    wms_location: 'Galpão C ➔ Corredor 02 ➔ Estante A ➔ Prateleira 3 ➔ Posição 12',
    license_plate: '沼津 500 ほ 44-11',
    vin: 'ZC33S-109283',
    vehicle_origin: 'Suzuki Swift Sport ZC33S (2020)',
    compatibility: 'Suzuki Swift Sport ZC33S (K14C Turbo)',
    images: ['https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&q=80'],
    description: 'Módulo de controle da caixa de direção elétrica. Calibrado para assistência esportiva, sem erros no CAN-BUS.',
    created_at: new Date().toISOString()
  }
]

export default function TenantDashboard() {
  const navigate = useNavigate()
  const { user, initialized, loading: authLoading, signOut, setUser } = useAuthStore()

  // Clean Architecture Hook
  const {
    filteredParts: originalFilteredParts,
    stats: rawStats,
    isLoading,
    refetch,
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    selectedPartIds,
    handleSelectAll,
    handleSelectOne,
    toastMessage,
    togglePublish,
    batchPublish,
  } = useTenantCore()

  // Hook de Dados Reais do Banco de Dados Supabase (Isolamento Multi-Tenant Estrito)
  const { 
    loading: realDataLoading, 
    realParts, 
    realWorkOrders, 
    realTransactions, 
    realMetrics,
    tenantInfo 
  } = useTenantRealData()

  // Peças Ativas (Prioriza banco de dados real do Tenant)
  const [localDemoParts, setLocalDemoParts] = useState<any[]>(DEMO_20_PARTS)

  const allParts = useMemo(() => {
    if (realParts && realParts.length > 0) return realParts
    return originalFilteredParts.length > 0 ? originalFilteredParts : localDemoParts
  }, [realParts, originalFilteredParts, localDemoParts])

  const stats = useMemo(() => {
    const totalSKUs = realParts && realParts.length > 0 ? realMetrics.totalSKUs : allParts.length
    const totalPrivateValue = realParts && realParts.length > 0 ? realMetrics.totalStockValue : allParts.reduce((sum, p) => sum + (Number(p.price) || 0), 0)
    const publishedCount = realParts && realParts.length > 0 ? realMetrics.activePublicCount : allParts.filter(p => p.status === 'active').length
    const privateCount = totalSKUs - publishedCount
    return { totalSKUs, totalPrivateValue, publishedCount, privateCount }
  }, [realMetrics, realParts, allParts])

  // Sidebar & Navigation state
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Command Palette (Cmd + K)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [cmdSearch, setCmdSearch] = useState('')

  // Listener para atalho Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setShowCommandPalette(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Modals States
  const [printingStickerPart, setPrintingStickerPart] = useState<any | null>(null)
  const [showPdvModal, setShowPdvModal] = useState(false)
  const [showNfeModal, setShowNfeModal] = useState(false)
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false)
  const [showAiUploadModal, setShowAiUploadModal] = useState(false)

  // IA Hub State
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null)
  const [isAiScanning, setIsAiScanning] = useState(false)
  const [isOcrScanning, setIsOcrScanning] = useState(false)
  const [ocrResult, setOcrResult] = useState<string | null>(null)
  const [voiceQuery, setVoiceQuery] = useState('')
  const [isListeningVoice, setIsListeningVoice] = useState(false)
  const [voiceSearchResult, setVoiceSearchResult] = useState<any | null>(null)

  // Hierarquia WMS State
  const [wmsFilter, setWmsFilter] = useState({
    warehouse: 'Galpão A (Principal)',
    aisle: 'Corredor 04 (Motor & Transmissão)',
    rack: 'Estante B',
    shelf: 'Prateleira 3',
    box: 'Caixa 12',
    position: 'Posição 08'
  })

  // Kanban O.S. State
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    { id: 'OS-801', title: 'Troca do Inversor Híbrido & Diagnóstico', client: 'Takahashi Auto Repair', vehicle: 'Toyota Prius ZVW30 (2018)', mechanic: 'Kenji Sato', status: 'aguardando', amount: 85000, partsUsed: 'Módulo Inversor Híbrido OEM', date: 'Hoje, 09:30' },
    { id: 'OS-802', title: 'Instalação de Kit Turbo & Acerto ECU', client: 'Yamada Drift Team', vehicle: 'Nissan Skyline BNR34 GT-R', mechanic: 'Hiroshi Tanaka', status: 'em_manutencao', amount: 240000, partsUsed: 'Turbo RB26DETT Nismo + ECU Remap', date: 'Hoje, 11:00' },
    { id: 'OS-803', title: 'Substituição de Amortecedores & Freios', client: 'Sora Tanaka (Particular)', vehicle: 'Honda Fit GK3 (2017)', mechanic: 'Takeshi Lin', status: 'testes', amount: 52000, partsUsed: 'Jogo Amortecedores KYB + Pastilhas', date: 'Ontem' },
    { id: 'OS-804', title: 'Revisão Geral e Alinhamento 3D', client: 'Kuroda Motors', vehicle: 'Subaru Impreza WRX STI', mechanic: 'Kenji Sato', status: 'pronto', amount: 68000, partsUsed: 'Óleo Motul 5W40 + Filtros OEM', date: '25/07' }
  ])

  const [newOrderForm, setNewOrderForm] = useState({
    title: '',
    client: '',
    vehicle: '',
    mechanic: 'Kenji Sato',
    amount: '',
    partsUsed: ''
  })

  // Estado do Módulo: Perfil & Configurações da Loja
  const [editingProfile, setEditingProfile] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [postalLoading, setPostalLoading] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: user?.name || user?.full_name || 'Tokyo Auto Parts Partner (DAIG SaaS)',
    email: user?.email || 'teste.partner@daig.jp',
    phone: user?.phone || '+81 90-1234-5678',
    address: user?.address || 'Kanagawa-ken, Yokohama-shi, Naka-ku, Honcho 1-2-3',
    city: user?.city || 'Yokohama',
    state: user?.state || 'Kanagawa',
    zip_code: user?.zip_code || '231-0005',
    store_name: 'Tokyo Auto Parts & Dismantler',
    japan_bank_name: 'MUFG Bank (三菱UFJ銀行)',
    japan_branch_name: 'Yokohama Branch (横浜支店 - 041)',
    japan_account_number: '1092847',
    japan_account_holder: 'TOKYO AUTO PARTS INC'
  })

  // Busca CEP Japonês / Brasileiro (Zipcloud / ViaCEP)
  const handlePostalBlur = useCallback(async () => {
    const raw = profileForm.zip_code.replace(/\D/g, '')
    if (raw.length < 5) return
    setPostalLoading(true)
    const result = await fetchPostal(raw)
    if (result) {
      setProfileForm(prev => ({
        ...prev,
        address: result.fullAddress || prev.address,
        city: result.city || prev.city,
        state: result.state || prev.state,
      }))
    }
    setPostalLoading(false)
  }, [profileForm.zip_code])

  // Salvar Perfil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      if (user?.id) {
        await supabase
          .from('profiles')
          .update({
            full_name: profileForm.name,
            phone: profileForm.phone,
            address: profileForm.address,
            city: profileForm.city,
            state: profileForm.state,
            zip_code: profileForm.zip_code
          })
          .eq('id', user.id)
      }
      setUser({
        ...user,
        name: profileForm.name,
        full_name: profileForm.name,
        phone: profileForm.phone,
        address: profileForm.address,
        city: profileForm.city,
        state: profileForm.state,
        zip_code: profileForm.zip_code
      } as any)
      setEditingProfile(false)
      alert('Perfil e Dados da Empresa salvos com sucesso!')
    } catch (err: any) {
      alert('Erro ao salvar perfil: ' + err.message)
    } finally {
      setSavingProfile(false)
    }
  }

  // PDV State
  const [salesList, setSalesList] = useState([
    { id: 'venda-881', customer: 'Oficina Takahashi Auto', items: 'Farol LED Prius ZVW30', total: 45000, date: 'Hoje, 14:30', channel: 'Balcão / PDV' },
    { id: 'venda-882', customer: 'Hiroshi Tanaka (Cliente B2C)', items: 'Turbo RB26DETT Nismo', total: 185000, date: 'Hoje, 11:15', channel: 'Marketplace DAIG (1-Clique)' },
  ])
  const [pdvForm, setPdvForm] = useState({
    partTitle: '',
    customer: 'Oficina / Cliente Balcão',
    price: '45000',
    paymentMethod: 'Espécie (Dinheiro JPY)',
    receivedAmount: '50000'
  })

  // NF-e Purchases State
  const [purchaseInvoices, setPurchaseInvoices] = useState([
    { id: 'nfe-1092', key: '35260710049284000192550010000010921', supplier: 'Leilão USS Tokyo Bay', date: '2026-07-22', value: 450000, status: 'Processada' },
    { id: 'nfe-1093', key: '35260710049284000192550010000010932', supplier: 'Seguradora Sompo Japan', date: '2026-07-26', value: 890000, status: 'Aguardando Estoque' },
  ])
  const [nfeForm, setNfeForm] = useState({
    supplier: 'Leilão USS Tokyo Bay',
    key: '35260710049284000192550010000010945',
    value: '520000'
  })

  // API Key State
  const [apiKey] = useState('daig_live_sk_tenant_99482710398412')
  const [copiedKey, setCopiedKey] = useState(false)

  // Redirecionar se não autenticado
  if (initialized && !authLoading && !user) {
    navigate('/login', { replace: true })
    return null
  }

  const tenantName = profileForm.store_name || user?.name || 'Tokyo Auto Parts & Dismantler'
  const tenantId = user?.id ? `tenant_${user.id.slice(0, 8)}` : 'tenant_demo_01'
  // Simular Venda & Baixa Automática de Peça
  const handleSellAndDeductPart = (partId: string, partTitle: string, price: number) => {
    setLocalDemoParts(prev => prev.filter(p => p.id !== partId))
    const newSale = {
      id: `venda-${Math.floor(100 + Math.random() * 900)}`,
      customer: 'Cliente Balcão (Baixa Automática)',
      items: partTitle,
      total: price,
      date: 'Agora',
      channel: 'Balcão (Baixa WMS IA)'
    }
    setSalesList([newSale, ...salesList])
    alert(`✅ VENDA & BAIXA CONCLUÍDA!\n\nA peça "${partTitle}" foi vendida por ¥ ${price.toLocaleString('ja-JP')} JPY e teve baixa automática do estoque WMS e do marketplace!`)
  }

  // Simular Reconhecimento por Foto IA
  const handleSimulateAiImageScan = () => {
    setIsAiScanning(true)
    setAiAnalysisResult(null)
    setTimeout(() => {
      setAiAnalysisResult({
        name: 'Módulo de Injeção Eletrônica ECU Engine Control Unit',
        oem: 'OEM-37820-5R0-J61',
        brand: 'Honda',
        model: 'Fit GK3 / Vezel RU1',
        yearRange: '2015 - 2020',
        side: 'Central de Painel',
        suggestedPrice: 38000,
        costPrice: 12000,
        condition: 'Usado Genuíno - Graus A (Testado Scanner 100%)',
        wmsLocation: 'Galpão A ➔ Corredor 04 ➔ Estante B ➔ Prateleira 3 ➔ Caixa 12 ➔ Posição 08',
        compatibility: ['Honda Fit GK3 (2015-2020)', 'Honda Vezel RU1', 'Honda Shuttle GP7']
      })
      setIsAiScanning(false)
    }, 1400)
  }

  // Simular Leitura OCR de Metal
  const handleSimulateOcr = () => {
    setIsOcrScanning(true)
    setOcrResult(null)
    setTimeout(() => {
      setOcrResult('GRAVURA DETECTADA: [RB26-778192-N] - BLOCO MOTOR NISSAN SKYLINE R34 GT-R NISMO')
      setIsOcrScanning(false)
    }, 1200)
  }

  // Simular Busca por Voz / Linguagem Natural
  const handleVoiceSearchSubmit = (queryText: string) => {
    const q = queryText.toLowerCase()
    setVoiceSearchResult(null)

    if (q.includes('farol') || q.includes('gol') || q.includes('prius')) {
      setVoiceSearchResult({
        found: true,
        title: 'Farol Dianteiro LED Esquerdo Prius ZVW30',
        oem: 'OEM-33100-47820',
        price: 45000,
        location: 'Galpão A ➔ Corredor 02 ➔ Estante C ➔ Prateleira 1',
        stockQty: 3,
        matchedQuery: queryText
      })
    } else if (q.includes('câmbio') || q.includes('civic') || q.includes('alternador')) {
      setVoiceSearchResult({
        found: true,
        title: 'Caixa de Câmbio Manual 6 Marchas Civic Si K20',
        oem: 'OEM-20000-RRB-305',
        price: 185000,
        location: 'Galpão A ➔ Corredor 04 ➔ Estante B ➔ Prateleira 4',
        stockQty: 1,
        matchedQuery: queryText
      })
    } else {
      setVoiceSearchResult({
        found: true,
        title: 'Bomba de Combustível Alta Pressão Bosch',
        oem: 'OEM-0261520044',
        price: 28000,
        location: 'Galpão B ➔ Corredor 01 ➔ Estante A ➔ Prateleira 2',
        stockQty: 5,
        matchedQuery: queryText
      })
    }
  }

  // Submeter Nova Ordem de Serviço
  const handleCreateWorkOrder = (e: React.FormEvent) => {
    e.preventDefault()
    const newWo: WorkOrder = {
      id: `OS-${Math.floor(800 + Math.random() * 100)}`,
      title: newOrderForm.title || 'Manutenção Corretiva Geral',
      client: newOrderForm.client || 'Cliente Oficina',
      vehicle: newOrderForm.vehicle || 'Veículo em Oficina',
      mechanic: newOrderForm.mechanic,
      status: 'aguardando',
      amount: Number(newOrderForm.amount || 35000),
      partsUsed: newOrderForm.partsUsed || 'Peças do Estoque Privado',
      date: 'Agora'
    }
    setWorkOrders([newWo, ...workOrders])
    setShowWorkOrderModal(false)
    setNewOrderForm({ title: '', client: '', vehicle: '', mechanic: 'Kenji Sato', amount: '', partsUsed: '' })
    alert('Ordem de Serviço criada com sucesso e adicionada ao Kanban!')
  }

  // Alternar Status Kanban
  const handleMoveKanban = (id: string, newStatus: WorkOrder['status']) => {
    setWorkOrders(prev => prev.map(wo => wo.id === id ? { ...wo, status: newStatus } : wo))
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex overflow-hidden font-sans">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-bounce border border-emerald-400/30">
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. SIDEBAR LATERAL RECOLHÍVEL (Linear / Stripe Style)
         ───────────────────────────────────────────────────────────── */}
      <aside
        className={`bg-[#121215] border-r border-zinc-800/80 flex flex-col justify-between transition-all duration-300 z-30 shrink-0 ${sidebarCollapsed ? 'w-20' : 'w-72'
          }`}
      >
        <div>
          {/* Header da Sidebar */}
          <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/20 shrink-0">
                <GaidLogo size={24} />
              </div>
              {!sidebarCollapsed && (
                <div className="leading-tight truncate">
                  <span className="font-extrabold text-sm tracking-tight text-white block truncate">
                    DAIG <span className="text-blue-400 font-normal">SaaS</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    ENTERPRISE ERP
                  </span>
                </div>
              )}
            </div>

            {/* Toggle Collapse */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition border border-zinc-800"
              title={sidebarCollapsed ? 'Expandir Sidebar' : 'Recolher Sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Atalho Command Palette */}
          <div className="p-3 border-b border-zinc-800/60">
            <button
              onClick={() => setShowCommandPalette(true)}
              className={`w-full py-2.5 px-3 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500/40 rounded-xl text-xs text-zinc-400 hover:text-white flex items-center justify-between transition group ${sidebarCollapsed ? 'justify-center' : ''
                }`}
            >
              <div className="flex items-center space-x-2">
                <Command className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
                {!sidebarCollapsed && <span>Buscar ou Comandar...</span>}
              </div>
              {!sidebarCollapsed && (
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-950 text-zinc-500 rounded border border-zinc-800">
                  ⌘K
                </kbd>
              )}
            </button>
          </div>

          {/* ITENS DE NAVEGAÇÃO */}
          <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-none">

            {/* GRUPO 1: PRINCIPAL */}
            <div>
              {!sidebarCollapsed && (
                <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-3 mb-2">
                  Gestão
                </p>
              )}
              <nav className="space-y-1">
                {[
                  { id: 'overview', label: 'Visão', icon: LayoutDashboard },
                  { id: 'ai-hub', label: 'Inteligência', icon: Sparkles, badge: 'PRO' },
                  { id: 'wms-hierarchy', label: 'Localização', icon: MapPin },
                  { id: 'workshop-kanban', label: 'Oficina', icon: Wrench, badge: `${workOrders.length}` },
                  { id: 'inventory', label: 'Estoque', icon: Package, badge: `${stats.totalSKUs}` },
                ].map(item => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as TabType)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                        }`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && item.badge && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-zinc-800 text-blue-400 border border-zinc-700'
                          }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* GRUPO 2: OPERAÇÕES & VENDAS */}
            <div>
              {!sidebarCollapsed && (
                <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-3 mb-2">
                  Operações
                </p>
              )}
              <nav className="space-y-1">
                {[
                  { id: 'sales', label: 'Vendas', icon: ShoppingCart },
                  { id: 'purchases', label: 'Compras', icon: FileText },
                  { id: 'finance', label: 'Finanças', icon: DollarSign },
                ].map(item => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as TabType)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                        }`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </div>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* GRUPO 3: CONFIGURAÇÕES */}
            <div>
              {!sidebarCollapsed && (
                <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-3 mb-2">
                  Ajustes
                </p>
              )}
              <nav className="space-y-1">
                {[
                  { id: 'profile', label: 'Perfil', icon: User },
                  { id: 'api-b2b', label: 'Integrações', icon: Key },
                ].map(item => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as TabType)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                        }`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </div>
                    </button>
                  )
                })}
              </nav>
            </div>

          </div>
        </div>

        {/* FOOTER DA SIDEBAR */}
        <div className="p-3 border-t border-zinc-800/80 bg-[#0d0d0f]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                {tenantName.slice(0, 2).toUpperCase()}
              </div>
              {!sidebarCollapsed && (
                <div className="leading-tight truncate">
                  <p className="text-xs font-bold text-white truncate">{tenantName}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{profileForm.email}</p>
                </div>
              )}
            </div>

            {!sidebarCollapsed && (
              <button
                onClick={() => signOut()}
                className="p-1.5 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 rounded-lg transition"
                title="Sair da Conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. CONTEÚDO PRINCIPAL (MAIN CONTENT)
         ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto bg-[#09090B] p-4 sm:p-6 lg:p-8">

        {/* TOP BAR / BANNER SUPERIOR */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl text-white shadow-xl shadow-blue-500/20">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white">{tenantName}</h1>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {tenantId}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 flex items-center space-x-2">
                <span>Plataforma SaaS Multi-Tenant para Autopeças, Oficina & Desmanche</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> WMS Sincronizado ({stats.totalSKUs} peças)
                </span>
              </p>
            </div>
          </div>

          {/* Ações Rápidas do Topbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAiUploadModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#0D75FF] via-blue-600 to-[#00E5FF] hover:opacity-95 text-white font-extrabold rounded-xl text-xs flex items-center space-x-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] border border-[#00E5FF]/40 transition cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
              <span>Cadastre uma Peça em 30s com IA</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-hub')}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-blue-600/20 transition"
            >
              <Sparkles className="w-4 h-4 text-blue-200 animate-spin" />
              <span>Scannear Peça com IA</span>
            </button>

            <Link
              to="/catalog"
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold flex items-center space-x-2 transition border border-zinc-700"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Marketplace DAIG</span>
            </Link>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            ABA 1: VISÃO GERAL / KPIS & DASHBOARD REAL-TIME
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 21st.dev Cyber Neon Professional ERP KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Card 1: Estoque WMS Privado */}
              <div className="group relative bg-gradient-to-b from-[#0B0E17] to-[#0A0D14] border border-blue-500/30 hover:border-[#00E5FF] rounded-2xl p-6 shadow-[0_0_30px_rgba(13,117,255,0.12)] backdrop-blur-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Estoque WMS Privado</span>
                  <div className="p-3 bg-blue-500/10 text-cyan-400 rounded-xl border border-[#00E5FF]/30 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-white tracking-tight flex items-baseline space-x-2">
                    <span>{stats.totalSKUs}</span>
                    <span className="text-xs font-semibold text-zinc-400 uppercase font-mono">peças catalogadas</span>
                  </div>
                  <p className="text-xs text-[#00E5FF] font-mono font-semibold mt-2 flex items-center space-x-1">
                    <span>Valor Total:</span>
                    <span className="text-white">¥ {stats.totalPrivateValue.toLocaleString('ja-JP')} JPY</span>
                  </p>
                </div>
              </div>

              {/* Card 2: Oficina (Ordens de Serviço) */}
              <div className="group relative bg-gradient-to-b from-[#0B0E17] to-[#0A0D14] border border-purple-500/30 hover:border-purple-400 rounded-2xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.12)] backdrop-blur-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Oficina (Ordens de Serviço)</span>
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    <Wrench className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-white tracking-tight flex items-baseline space-x-2">
                    <span>{realWorkOrders && realWorkOrders.length > 0 ? realWorkOrders.length : workOrders.length}</span>
                    <span className="text-xs font-semibold text-zinc-400 uppercase font-mono">O.S. ativas</span>
                  </div>
                  <p className="text-xs text-purple-300 font-mono font-semibold mt-2 flex items-center space-x-1">
                    <span>{workOrders.filter(w => w.status !== 'pronto').length} em andamento hoje</span>
                  </p>
                </div>
              </div>

              {/* Card 3: Faturamento do Mês */}
              <div className="group relative bg-gradient-to-b from-[#0B0E17] to-[#0A0D14] border border-emerald-500/30 hover:border-emerald-400 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.12)] backdrop-blur-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Faturamento do Mês</span>
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-emerald-400 tracking-tight font-mono">
                    ¥ {(realMetrics.monthlySalesVolume > 0 ? realMetrics.monthlySalesVolume : 1420000).toLocaleString('ja-JP')}
                  </div>
                  <p className="text-xs text-zinc-400 mt-2 font-mono">
                    Balcão PDV (65%) • Marketplace (35%)
                  </p>
                </div>
              </div>

              {/* Card 4: Divulgação 1-Clique */}
              <div className="group relative bg-gradient-to-b from-[#0B0E17] to-[#0A0D14] border border-amber-500/30 hover:border-amber-400 rounded-2xl p-6 shadow-[0_0_30px_rgba(245,158,11,0.12)] backdrop-blur-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Divulgação 1-Clique</span>
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <Globe className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-white tracking-tight flex items-baseline space-x-2">
                    <span>{stats.publishedCount}</span>
                    <span className="text-xs font-semibold text-emerald-400 uppercase font-mono">online</span>
                  </div>
                  <p className="text-xs text-amber-400 font-mono font-semibold mt-2">
                    {stats.privateCount} mantidas privadas no ERP
                  </p>
                </div>
              </div>

            </div>

            {/* Painel WMS Galpão & Atalhos Rápidos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Mapa de Galpão / Hierarquia */}
              <div className="lg:col-span-2 bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-400" />
                      Visão Física do Galpão & Armazém (WMS)
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Estrutura física registrada: Galpão ➔ Corredor ➔ Estante ➔ Prateleira ➔ Caixa ➔ Posição.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('wms-hierarchy')}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    <span>Navegar WMS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {[
                    { zone: 'Galpão A', label: 'Motores & Transmissão', count: '142 peças', color: 'from-blue-600/20 to-indigo-600/20 border-blue-500/30' },
                    { zone: 'Galpão B', label: 'Lataria & Iluminação', count: '98 peças', color: 'from-purple-600/20 to-pink-600/20 border-purple-500/30' },
                    { zone: 'Galpão C', label: 'Injeção & Sensores', count: '64 peças', color: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30' },
                    { zone: 'Corredor 04', label: 'Caixas de Câmbio JDM', count: '28 caixas', color: 'from-amber-600/20 to-orange-600/20 border-amber-500/30' },
                    { zone: 'Estante B-3', label: 'ECUs & Chicotes', count: '45 caixas', color: 'from-cyan-600/20 to-blue-600/20 border-cyan-500/30' },
                    { zone: 'Área de Doca', label: 'Carros em Desmonte', count: '3 veículos', color: 'from-red-600/20 to-rose-600/20 border-red-500/30' },
                  ].map((z, idx) => (
                    <div key={idx} className={`p-4 rounded-xl bg-gradient-to-br ${z.color} border text-left space-y-1`}>
                      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">{z.zone}</span>
                      <p className="font-bold text-xs text-white leading-tight">{z.label}</p>
                      <p className="text-[11px] font-mono text-zinc-300">{z.count}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status do Mecânico & Oficina */}
              <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-purple-400" />
                  Mecânicos da Oficina Hoje
                </h3>

                <div className="space-y-3">
                  {[
                    { name: 'Kenji Sato', role: 'Especialista Motores JDM', status: 'O.S. #801 em andamento', avatar: 'KS' },
                    { name: 'Hiroshi Tanaka', role: 'Técnico de Transmissão', status: 'O.S. #802 em andamento', avatar: 'HT' },
                    { name: 'Takeshi Lin', role: 'Suspensão & Freios 3D', status: 'Testes de Qualidade', avatar: 'TL' },
                  ].map((m, i) => (
                    <div key={i} className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {m.avatar}
                      </div>
                      <div className="leading-tight truncate">
                        <p className="text-xs font-bold text-white truncate">{m.name}</p>
                        <p className="text-[11px] text-zinc-400 truncate">{m.role}</p>
                        <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">{m.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            ABA 2: CENTRAL DE INTELIGÊNCIA ARTIFICIAL (RECONHECIMENTO, OCR & VOZ)
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'ai-hub' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
              <div className="border-b border-zinc-800 pb-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-blue-400" />
                      Hub de Inteligência Artificial & Visão Computacional
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Fotografe a peça para identificação visual: a IA autopreenche todo o formulário de cadastro em até 30 segundos!
                    </p>
                  </div>

                  <div className="px-3.5 py-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl flex items-center space-x-2 text-xs text-emerald-300 font-bold shrink-0">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>Cadastro por IA em 30s</span>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 1: RECONHECIMENTO POR FOTO E OCR */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                {/* Upload / Scanner por Foto */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-blue-400" />
                      1. Reconhecimento por Foto de Peça
                    </span>
                    <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                      OpenAI Vision
                    </span>
                  </div>

                  <div className="border-2 border-dashed border-zinc-800 hover:border-blue-500/60 rounded-xl p-6 text-center transition cursor-pointer bg-zinc-900/40">
                    <Camera className="w-10 h-10 text-blue-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-white">Arraste a foto da peça ou acione a câmera</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Identificação automática de OEM, lado, compatibilidade e preço sugerido</p>
                  </div>

                  <button
                    onClick={handleSimulateAiImageScan}
                    disabled={isAiScanning}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isAiScanning ? 'Analisando Imagem com IA...' : 'Simular Reconhecimento por Foto'}</span>
                  </button>
                </div>

                {/* OCR Gravura Metálica */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-purple-400" />
                      2. OCR (Leitura de Gravura & Etiquetas)
                    </span>
                    <span className="text-[10px] font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">
                      OCR Metal Scanner
                    </span>
                  </div>

                  <div className="border-2 border-dashed border-zinc-800 hover:border-purple-500/60 rounded-xl p-6 text-center transition cursor-pointer bg-zinc-900/40">
                    <QrCode className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-white">Fotografe códigos gravados no metal ou etiquetas</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Lê números de série em blocos de motor, turbos e chassis</p>
                  </div>

                  <button
                    onClick={handleSimulateOcr}
                    disabled={isOcrScanning}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition shadow-lg shadow-purple-600/20"
                  >
                    <Cpu className="w-4 h-4" />
                    <span>{isOcrScanning ? 'Executando OCR no Metal...' : 'Simular Leitura OCR em Bloco'}</span>
                  </button>
                </div>

              </div>

              {/* RESULTADO DA IA DE FOTO */}
              {aiAnalysisResult && (
                <div className="mb-6 p-5 bg-gradient-to-br from-blue-950/60 to-indigo-950/60 border border-blue-800/80 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <h3 className="font-bold text-white text-sm">Peça Identificada com Sucesso pela IA!</h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Precisão: 99.4%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-2">
                    <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                      <span className="text-zinc-400 block text-[10px]">Nome da Peça</span>
                      <span className="font-bold text-white">{aiAnalysisResult.name}</span>
                    </div>
                    <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                      <span className="text-zinc-400 block text-[10px]">Código OEM</span>
                      <span className="font-mono font-bold text-amber-300">{aiAnalysisResult.oem}</span>
                    </div>
                    <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                      <span className="text-zinc-400 block text-[10px]">Preço Sugerido (JPY)</span>
                      <span className="font-bold text-emerald-400">¥ {aiAnalysisResult.suggestedPrice.toLocaleString('ja-JP')}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 text-xs space-y-1">
                    <p className="text-zinc-300 font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" /> Localização WMS Recomendada:
                    </p>
                    <p className="font-mono text-amber-200 text-[11px]">{aiAnalysisResult.wmsLocation}</p>
                  </div>
                </div>
              )}

              {/* RESULTADO DO OCR */}
              {ocrResult && (
                <div className="mb-6 p-4 bg-purple-950/60 border border-purple-800/80 rounded-2xl text-purple-200 text-xs font-mono flex items-center space-x-3 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span>{ocrResult}</span>
                </div>
              )}

              {/* SEÇÃO 2: BUSCA POR VOZ E LINGUAGEM NATURAL */}
              <div className="pt-4 border-t border-zinc-800">
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <Mic className="w-5 h-5 text-cyan-400" />
                  Busca Inteligente por Voz & Linguagem Natural
                </h3>
                <p className="text-xs text-zinc-400 mb-4">
                  Digite ou fale frases como: "Preciso do farol direito de um Gol 2018" ou "Onde está a caixa de câmbio do Civic 2017?".
                </p>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder='Ex: "Farol direito do Gol 2018", "Alternador Bosch Corolla"...'
                      value={voiceQuery}
                      onChange={(e) => setVoiceQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && voiceQuery) handleVoiceSearchSubmit(voiceQuery)
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-cyan-500 transition"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!isListeningVoice) {
                        setIsListeningVoice(true)
                        setVoiceQuery('Preciso do farol direito do Prius ZVW30...')
                        setTimeout(() => {
                          setIsListeningVoice(false)
                          handleVoiceSearchSubmit('Preciso do farol direito do Prius ZVW30')
                        }, 1800)
                      }
                    }}
                    className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${isListeningVoice
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-zinc-700'
                      }`}
                  >
                    {isListeningVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isListeningVoice ? 'Ouvindo...' : 'Falar por Voz'}</span>
                  </button>

                  <button
                    onClick={() => voiceQuery && handleVoiceSearchSubmit(voiceQuery)}
                    className="px-5 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-cyan-600/20"
                  >
                    Consultar IA
                  </button>
                </div>

                {/* RESULTADO DA BUSCA POR VOZ */}
                {voiceSearchResult && (
                  <div className="mt-4 p-4 bg-cyan-950/60 border border-cyan-800/80 rounded-2xl text-xs space-y-2 animate-in fade-in">
                    <p className="text-cyan-300 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> IA localizou no estoque:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                        <span className="text-zinc-500 block text-[10px]">Item Encontrado</span>
                        <span className="font-bold text-white">{voiceSearchResult.title}</span>
                      </div>
                      <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                        <span className="text-zinc-500 block text-[10px]">Endereço WMS</span>
                        <span className="font-mono font-bold text-amber-300">{voiceSearchResult.location}</span>
                      </div>
                      <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                        <span className="text-zinc-500 block text-[10px]">Preço & Qtd</span>
                        <span className="font-bold text-emerald-400">¥ {voiceSearchResult.price.toLocaleString('ja-JP')} ({voiceSearchResult.stockQty} unidades)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            ABA 3: LOCALIZAÇÃO FISICA WMS & HIERARQUIA COMPLETA
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'wms-hierarchy' && (
          <div className="space-y-6">
            <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
              <div className="border-b border-zinc-800 pb-4 mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-amber-400" />
                  Hierarquia Física do Estoque WMS
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Navegue pela estrutura física de armazenagem do galpão em 6 níveis hierárquicos: Galpão ➔ Corredor ➔ Estante ➔ Prateleira ➔ Caixa ➔ Posição.
                </p>
              </div>

              {/* Seletor da Hierarquia */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {[
                  { label: '1. Galpão', key: 'warehouse', value: wmsFilter.warehouse, options: ['Galpão A (Principal)', 'Galpão B (Lataria)', 'Galpão C (Miudezas)'] },
                  { label: '2. Corredor', key: 'aisle', value: wmsFilter.aisle, options: ['Corredor 01', 'Corredor 02', 'Corredor 03', 'Corredor 04 (Motor & Transmissão)'] },
                  { label: '3. Estante', key: 'rack', value: wmsFilter.rack, options: ['Estante A', 'Estante B', 'Estante C', 'Estante D'] },
                  { label: '4. Prateleira', key: 'shelf', value: wmsFilter.shelf, options: ['Prateleira 1 (Térreo)', 'Prateleira 2', 'Prateleira 3', 'Prateleira 4 (Topo)'] },
                  { label: '5. Caixa', key: 'box', value: wmsFilter.box, options: ['Caixa 01', 'Caixa 12', 'Caixa 24', 'Sem Caixa'] },
                  { label: '6. Posição', key: 'position', value: wmsFilter.position, options: ['Posição 01', 'Posição 08', 'Posição 16'] },
                ].map(h => (
                  <div key={h.key} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-amber-400 uppercase">{h.label}</label>
                    <select
                      value={h.value}
                      onChange={(e) => setWmsFilter({ ...wmsFilter, [h.key]: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 text-xs text-white rounded-lg p-1.5 focus:border-amber-400"
                    >
                      {h.options.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              {/* Caminho Ativo & Etiqueta Inteligente */}
              <div className="p-4 bg-zinc-950 border border-amber-500/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">Posição Física Selecionada:</span>
                  <p className="text-sm font-mono font-bold text-amber-300">
                    {wmsFilter.warehouse} ➔ {wmsFilter.aisle} ➔ {wmsFilter.rack} ➔ {wmsFilter.shelf} ➔ {wmsFilter.box} ➔ {wmsFilter.position}
                  </p>
                </div>

                <button
                  onClick={() => setPrintingStickerPart({
                    id: `wms_pos_${Date.now()}`,
                    title: `Item em ${wmsFilter.position}`,
                    oem_code: 'OEM-JDM-9918',
                    price: 45000
                  })}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center space-x-2 shrink-0"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Etiqueta WMS QR</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            ABA 4: OFICINA MECÂNICA (QUADRO KANBAN DE O.S.)
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'workshop-kanban' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Wrench className="w-6 h-6 text-purple-400" />
                  Oficina Mecânica — Quadro Kanban de Ordens de Serviço
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Acompanhamento visual em tempo real de reparos, manutenções, peças utilizadas e orçamentos.
                </p>
              </div>

              <button
                onClick={() => setShowWorkOrderModal(true)}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-purple-600/20 flex items-center space-x-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Ordem de Serviço (O.S.)</span>
              </button>
            </div>

            {/* QUADRO KANBAN (4 COLUNAS) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { key: 'aguardando', title: '⏳ Aguardando Vistoria', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
                { key: 'em_manutencao', title: '🔧 Em Manutenção', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
                { key: 'testes', title: '🧪 Testes & Qualidade', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
                { key: 'pronto', title: '✅ Pronto para Entrega', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
              ].map(col => {
                const colOrders = workOrders.filter(w => w.status === col.key)
                return (
                  <div key={col.key} className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-4 space-y-3 min-h-[420px]">
                    <div className={`p-2.5 rounded-xl border ${col.color} flex items-center justify-between`}>
                      <span className="text-xs font-bold">{col.title}</span>
                      <span className="text-[11px] font-mono font-extrabold">{colOrders.length}</span>
                    </div>

                    <div className="space-y-3">
                      {colOrders.map(wo => (
                        <div key={wo.id} className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 space-y-2.5 shadow-lg group transition">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                              {wo.id}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">{wo.date}</span>
                          </div>

                          <h4 className="font-bold text-xs text-white leading-snug">{wo.title}</h4>

                          <div className="text-[11px] text-zinc-400 space-y-0.5 font-mono">
                            <p><span className="text-zinc-500">Cliente:</span> {wo.client}</p>
                            <p><span className="text-zinc-500">Veículo:</span> {wo.vehicle}</p>
                            <p><span className="text-zinc-500">Mecânico:</span> <span className="text-purple-300 font-bold">{wo.mechanic}</span></p>
                          </div>

                          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                            <span className="text-xs font-extrabold text-emerald-400 font-mono">¥ {wo.amount.toLocaleString('ja-JP')} JPY</span>

                            {/* Troca Rápida de Status */}
                            <select
                              value={wo.status}
                              onChange={(e) => handleMoveKanban(wo.id, e.target.value as WorkOrder['status'])}
                              className="bg-zinc-900 border border-zinc-700 text-[10px] text-zinc-300 rounded px-1.5 py-1 focus:outline-none"
                            >
                              <option value="aguardando">Aguardando</option>
                              <option value="em_manutencao">Manutenção</option>
                              <option value="testes">Testes</option>
                              <option value="pronto">Pronto</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            ABA 5: ESTOQUE PRIVADO & MARKETPLACE (COM FOTOS HD & 20 PEÇAS)
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'inventory' && (
          <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, OEM ou categoria..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 pl-10 pr-4 py-2.5 rounded-xl focus:border-blue-500 transition"
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${filterCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}
                >
                  Todas ({stats.totalSKUs})
                </button>
                <button
                  onClick={() => setFilterCategory('published')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${filterCategory === 'published' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}
                >
                  Marketplace DAIG ({stats.publishedCount})
                </button>
                <button
                  onClick={() => setFilterCategory('private')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${filterCategory === 'private' ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}
                >
                  Estoque Privado ({stats.privateCount})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-medium text-xs">
                    <th className="py-3 px-3 w-10">
                      <input
                        type="checkbox"
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        checked={selectedPartIds.length === allParts.length && allParts.length > 0}
                        className="rounded bg-zinc-950 border-zinc-700 text-blue-600"
                      />
                    </th>
                    <th className="py-3 px-4">Peça / Produto</th>
                    <th className="py-3 px-4">OEM / Código</th>
                    <th className="py-3 px-4">Posição WMS</th>
                    <th className="py-3 px-4">Preço Estoque</th>
                    <th className="py-3 px-4 text-center">Etiqueta QR</th>
                    <th className="py-3 px-4 text-center">Ação & Baixa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                  {allParts.map((part) => {
                    const isPublished = part.status === 'active'
                    const isSelected = selectedPartIds.includes(part.id)

                    return (
                      <tr key={part.id} className={`hover:bg-zinc-900/60 transition ${isSelected ? 'bg-blue-950/20' : ''}`}>
                        <td className="py-3.5 px-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(part.id)}
                            className="rounded bg-zinc-950 border-zinc-700 text-blue-600"
                          />
                        </td>
                        <td className="py-3.5 px-4 font-medium text-white">
                          <div className="flex items-center space-x-3">
                            {part.images?.[0] ? (
                              <img src={part.images[0]} alt={part.title} className="w-10 h-10 rounded-lg object-cover bg-zinc-800 border border-zinc-700 shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 shrink-0">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <p className="line-clamp-1 font-semibold text-white">{part.title}</p>
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                <span className="text-[10px] text-zinc-400 mr-1">{part.category || 'Peça Automotiva'}</span>
                                {part.compatibility && parseCompatibilityTextToTags(part.compatibility).slice(0, 3).map((tag, idx) => (
                                  <span 
                                    key={idx} 
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${
                                      tag.type === 'chassis' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' :
                                      tag.type === 'engine' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                                      'bg-blue-500/10 text-blue-300 border-blue-500/30'
                                    }`}
                                  >
                                    {tag.label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-zinc-300">{part.oem_code || 'OEM-PENDENTE'}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono bg-zinc-900 text-amber-300 border border-zinc-800">
                            <QrCode className="w-3 h-3 mr-1 text-amber-400" /> {part.wms_location?.split('➔')[0] || 'Galpão A'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">¥ {Number(part.price || 0).toLocaleString('ja-JP')} JPY</td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setPrintingStickerPart(part)}
                            className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition mx-auto"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Imprimir</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleSellAndDeductPart(part.id, part.title, Number(part.price || 0))}
                            className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[11px] font-semibold transition"
                          >
                            Dar Baixa
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            ABA 6: VENDAS & PDV BALCÃO
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'sales' && (
          <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-emerald-400" />
                  Vendas & PDV Balcão
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Registre vendas presenciais no balcão da loja com abate instantâneo de estoque e recibo.
                </p>
              </div>
              <button
                onClick={() => setShowPdvModal(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center space-x-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Venda no Balcão (PDV)</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-xs">
                    <th className="py-2.5 px-3">Pedido / Venda</th>
                    <th className="py-2.5 px-3">Cliente / Destino</th>
                    <th className="py-2.5 px-3">Itens</th>
                    <th className="py-2.5 px-3">Canal de Venda</th>
                    <th className="py-2.5 px-3">Total (JPY)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                  {salesList.map(sale => (
                    <tr key={sale.id} className="hover:bg-zinc-900/60">
                      <td className="py-3 px-3 font-mono text-xs text-white">{sale.id}</td>
                      <td className="py-3 px-3 font-semibold text-white">{sale.customer}</td>
                      <td className="py-3 px-3 text-xs text-zinc-300">{sale.items}</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {sale.channel}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-extrabold text-emerald-400">¥ {sale.total.toLocaleString('ja-JP')} JPY</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            ABA 7: COMPRAS & ENTRADA NF-E
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'purchases' && (
          <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-400" />
                  Compras & Entrada por Nota Fiscal (NF-e / XML)
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Gerencie compras de leilões e seguradoras no Japão com lançamento automático no estoque.
                </p>
              </div>
              <button
                onClick={() => setShowNfeModal(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center space-x-2 shrink-0"
              >
                <Upload className="w-4 h-4" />
                <span>Importar XML de NF-e</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-xs">
                    <th className="py-2.5 px-3">Nota Fiscal / Chave</th>
                    <th className="py-2.5 px-3">Fornecedor / Leilão</th>
                    <th className="py-2.5 px-3">Data de Entrada</th>
                    <th className="py-2.5 px-3">Valor Total (JPY)</th>
                    <th className="py-2.5 px-3">Status NF-e</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                  {purchaseInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-zinc-900/60">
                      <td className="py-3 px-3 font-mono text-xs text-white">{inv.id}</td>
                      <td className="py-3 px-3 font-semibold text-white">{inv.supplier}</td>
                      <td className="py-3 px-3 text-xs text-zinc-400">{inv.date}</td>
                      <td className="py-3 px-3 font-bold text-white">¥ {inv.value.toLocaleString('ja-JP')} JPY</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            ABA 8: FINANCEIRO & REPASSES STRIPE
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'finance' && (
          <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              Módulo Financeiro & Repasses Stripe Connect
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-400">Faturamento Bruto Mês</span>
                <p className="text-2xl font-bold text-white mt-1">¥ 1.420.000 JPY</p>
              </div>
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-400">Saldo em Custódia (Escrow)</span>
                <p className="text-2xl font-bold text-sky-400 mt-1">¥ 185.000 JPY</p>
              </div>
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-400">Repassado via Stripe Connect</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">¥ 755.000 JPY</p>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            ABA 9: PERFIL DO LOJISTA & BANCO DO JAPÃO (DADOS PRESERVADOS)
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 shadow-xl max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-400" />
                  Perfil do Lojista & Conta Bancária Japão (Furikomi)
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Gerencie informações da empresa, endereço de expedição no Japão e dados de repasse.
                </p>
              </div>

              {!editingProfile ? (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  Editar Informações
                </button>
              ) : (
                <button
                  onClick={() => setEditingProfile(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* DADOS DA CONTA */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Informações da Conta</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Nome Completo / Empresa *</label>
                    <input
                      type="text"
                      disabled={!editingProfile}
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white disabled:opacity-60"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">E-mail Cadastrado</label>
                    <input
                      type="email"
                      disabled
                      value={profileForm.email}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Telefone de Contato</label>
                    <input
                      type="text"
                      disabled={!editingProfile}
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Código Postal Japão (CEP)</label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled={!editingProfile}
                        value={profileForm.zip_code}
                        onChange={(e) => setProfileForm({ ...profileForm, zip_code: e.target.value })}
                        onBlur={handlePostalBlur}
                        placeholder="Ex: 231-0005"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white disabled:opacity-60"
                      />
                      {postalLoading && <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-3 text-blue-400" />}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Endereço de Expedição no Japão</label>
                  <input
                    type="text"
                    disabled={!editingProfile}
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white disabled:opacity-60"
                  />
                </div>
              </div>

              {/* CONTA BANCÁRIA JAPÃO */}
              <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Conta Bancária para Repasses (Furikomi 振込)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Banco</span>
                    <span className="font-bold text-white">{profileForm.japan_bank_name}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Agência</span>
                    <span className="font-bold text-white">{profileForm.japan_branch_name}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Número da Conta</span>
                    <span className="font-mono font-bold text-emerald-400">{profileForm.japan_account_number}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Titular (Katakana)</span>
                    <span className="font-mono font-bold text-white">{profileForm.japan_account_holder}</span>
                  </div>
                </div>
              </div>

              {editingProfile && (
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-600/20"
                >
                  {savingProfile ? 'Salvando Alterações...' : 'Salvar Alterações do Perfil'}
                </button>
              )}
            </form>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            ABA 10: API REST & REDE B2B
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'api-b2b' && (
          <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 shadow-xl max-w-3xl mx-auto space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Key className="w-6 h-6 text-amber-400" />
              API REST & Integração ERP Sincronizada
            </h2>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <label className="block text-xs text-zinc-400 mb-2">Sua Chave Secreta da API</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiKey}
                  readOnly
                  className="w-full bg-zinc-900 border border-zinc-700 text-xs font-mono text-amber-300 p-2.5 rounded-lg"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(apiKey)
                    setCopiedKey(true)
                    setTimeout(() => setCopiedKey(false), 2000)
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition"
                >
                  {copiedKey ? 'Copiado!' : 'Copiar Key'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ─────────────────────────────────────────────────────────────
          COMMAND PALETTE (Cmd + K) MODAL
         ───────────────────────────────────────────────────────────── */}
      {showCommandPalette && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4">
          <div className="bg-[#121215] border border-zinc-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-zinc-800 flex items-center space-x-3">
              <Command className="w-5 h-5 text-blue-400" />
              <input
                type="text"
                autoFocus
                placeholder="Digite um comando ou busque uma peça/O.S..."
                value={cmdSearch}
                onChange={(e) => setCmdSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
              />
              <button onClick={() => setShowCommandPalette(false)} className="text-zinc-500 hover:text-white text-xs">
                ESC
              </button>
            </div>

            <div className="p-3 max-h-80 overflow-y-auto space-y-1 text-xs">
              <p className="text-[10px] font-mono text-zinc-500 uppercase px-3 py-1">Atalhos Rápidos</p>

              <button
                onClick={() => { setActiveTab('ai-hub'); setShowCommandPalette(false); }}
                className="w-full p-2.5 hover:bg-zinc-900 rounded-xl text-left flex items-center justify-between text-zinc-300 hover:text-white transition"
              >
                <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-400" /> Scannear Peça por Imagem (IA)</span>
                <span className="text-[10px] font-mono text-zinc-500">Ir para IA Hub</span>
              </button>

              <button
                onClick={() => { setActiveTab('wms-hierarchy'); setShowCommandPalette(false); }}
                className="w-full p-2.5 hover:bg-zinc-900 rounded-xl text-left flex items-center justify-between text-zinc-300 hover:text-white transition"
              >
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-400" /> Navegar na Hierarquia WMS</span>
                <span className="text-[10px] font-mono text-zinc-500">Galpão ➔ Corredor</span>
              </button>

              <button
                onClick={() => { setShowWorkOrderModal(true); setShowCommandPalette(false); }}
                className="w-full p-2.5 hover:bg-zinc-900 rounded-xl text-left flex items-center justify-between text-zinc-300 hover:text-white transition"
              >
                <span className="flex items-center gap-2"><Plus className="w-4 h-4 text-purple-400" /> Criar Nova Ordem de Serviço (O.S.)</span>
                <span className="text-[10px] font-mono text-zinc-500">Oficina</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: IMPRESSÃO ETIQUETA QR */}
      {printingStickerPart && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <QRStickerPrint
              partTitle={printingStickerPart.title}
              oemCode={printingStickerPart.oem_code || 'OEM-JDM-7718'}
              price={Number(printingStickerPart.price || 0)}
              wmsLocation="Corredor B • Prateleira 04"
              licensePlate="品川 300 な 45-89"
              partId={printingStickerPart.id}
              tenantName={tenantName}
              onClose={() => setPrintingStickerPart(null)}
            />
          </div>
        </div>
      )}

      {/* MODAL: NOVA ORDEM DE SERVIÇO (O.S. OFICINA) */}
      {showWorkOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Wrench className="w-5 h-5 text-purple-400" />
                Nova Ordem de Serviço (O.S. Oficina)
              </h3>
              <button onClick={() => setShowWorkOrderModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkOrder} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Descrição do Serviço *</label>
                <input
                  type="text"
                  placeholder="Ex: Troca de Inversor Híbrido & Diagnóstico ECU"
                  value={newOrderForm.title}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, title: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Cliente *</label>
                  <input
                    type="text"
                    placeholder="Nome do cliente"
                    value={newOrderForm.client}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, client: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Veículo *</label>
                  <input
                    type="text"
                    placeholder="Ex: Toyota Prius 2018"
                    value={newOrderForm.vehicle}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, vehicle: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Mecânico Responsável</label>
                  <select
                    value={newOrderForm.mechanic}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, mechanic: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-purple-500"
                  >
                    <option>Kenji Sato</option>
                    <option>Hiroshi Tanaka</option>
                    <option>Takeshi Lin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Valor Orçamento (JPY)</label>
                  <input
                    type="number"
                    placeholder="85000"
                    value={newOrderForm.amount}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, amount: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-bold text-emerald-400 focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition mt-2"
              >
                Cadastrar Ordem de Serviço
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VENDAS PDV BALCÃO */}
      {showPdvModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                Nova Venda no Balcão (PDV)
              </h3>
              <button onClick={() => setShowPdvModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const priceNum = Number(pdvForm.price || 0)
                const newSale = {
                  id: `venda-${Math.floor(100 + Math.random() * 900)}`,
                  customer: pdvForm.customer || 'Cliente Balcão',
                  items: pdvForm.partTitle || 'Farol LED Prius ZVW30',
                  total: priceNum,
                  date: 'Hoje, Agora',
                  channel: `Balcão (${pdvForm.paymentMethod.split(' ')[0]})`
                }
                setSalesList([newSale, ...salesList])
                setShowPdvModal(false)
                alert(`Venda concluída com sucesso! Recibo impresso. Troco: ¥ ${Math.max(0, Number(pdvForm.receivedAmount || 0) - priceNum).toLocaleString('ja-JP')} JPY`)
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Peça / Item Vendido *</label>
                <input
                  type="text"
                  placeholder="Ex: Farol LED Prius ZVW30"
                  value={pdvForm.partTitle}
                  onChange={(e) => setPdvForm({ ...pdvForm, partTitle: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Cliente</label>
                  <input
                    type="text"
                    value={pdvForm.customer}
                    onChange={(e) => setPdvForm({ ...pdvForm, customer: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Valor Total (JPY ¥) *</label>
                  <input
                    type="number"
                    value={pdvForm.price}
                    onChange={(e) => setPdvForm({ ...pdvForm, price: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-bold text-emerald-400 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Forma de Pagamento</label>
                <select
                  value={pdvForm.paymentMethod}
                  onChange={(e) => setPdvForm({ ...pdvForm, paymentMethod: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-emerald-500"
                >
                  <option>Espécie (Dinheiro JPY)</option>
                  <option>Cartão de Crédito (Stripe Terminal)</option>
                  <option>Transferência Furikomi (Banco Japão)</option>
                  <option>PayPay / QR Code Mobile</option>
                </select>
              </div>

              {pdvForm.paymentMethod.includes('Espécie') && (
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Valor Recebido do Cliente:</span>
                    <input
                      type="number"
                      value={pdvForm.receivedAmount}
                      onChange={(e) => setPdvForm({ ...pdvForm, receivedAmount: e.target.value })}
                      className="bg-zinc-900 border border-zinc-700 text-right text-xs font-bold text-white px-2 py-1 rounded w-28"
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-800">
                    <span className="font-semibold text-zinc-300">Troco (Otsuri お釣り):</span>
                    <span className="font-extrabold text-amber-400 text-sm">
                      ¥ {Math.max(0, Number(pdvForm.receivedAmount || 0) - Number(pdvForm.price || 0)).toLocaleString('ja-JP')} JPY
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition mt-2"
              >
                Finalizar Venda & Emitir Recibo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPORTAR NF-E XML */}
      {showNfeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Importar Nota Fiscal XML (NF-e)
              </h3>
              <button onClick={() => setShowNfeModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const newInvoice = {
                  id: `nfe-${Math.floor(1000 + Math.random() * 9000)}`,
                  key: nfeForm.key,
                  supplier: nfeForm.supplier,
                  date: new Date().toISOString().split('T')[0],
                  value: Number(nfeForm.value || 0),
                  status: 'Processada'
                }
                setPurchaseInvoices([newInvoice, ...purchaseInvoices])
                setShowNfeModal(false)
                alert('Nota fiscal XML importada com sucesso! Lote de peças integrado ao estoque privado.')
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Fornecedor / Leilão *</label>
                <input
                  type="text"
                  value={nfeForm.supplier}
                  onChange={(e) => setNfeForm({ ...nfeForm, supplier: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Chave da Nota Fiscal / Documento</label>
                <input
                  type="text"
                  value={nfeForm.key}
                  onChange={(e) => setNfeForm({ ...nfeForm, key: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-white focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Valor Total (JPY ¥) *</label>
                <input
                  type="number"
                  value={nfeForm.value}
                  onChange={(e) => setNfeForm({ ...nfeForm, value: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-bold text-white focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition mt-2"
              >
                Confirmar Importação de Estoque
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cadastro em 30s com AI Auto Parts por DAIG */}
      <AiPartQuickUploadModal
        isOpen={showAiUploadModal}
        onClose={() => setShowAiUploadModal(false)}
        sellerId={user?.id}
      />

    </div>
  )
}
