import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  ClipboardCheck, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  HardHat, 
  Flame, 
  Zap, 
  Trash2, 
  Building2,
  Calendar,
  User,
  MapPin,
  Camera,
  Loader2,
  Briefcase,
  Store,
  Map,
  FileText,
  Accessibility,
  Siren,
  FlaskConical,
  ShieldAlert,
  Plus,
  Trash,
  ImagePlus,
  Printer,
  Mail,
  Download,
  ArrowLeft,
  Info,
  FileDown
} from 'lucide-react';

// --- Firebase Configuration ---
// CORREÇÃO: Utilizando a configuração do ambiente para que o preview funcione.
// NOTA PARA DEPLOY: Quando copiar este código para o seu computador, substitua
// a linha abaixo (JSON.parse...) pelo objeto de configuração real do seu projeto Firebase.
const firebaseConfig = JSON.parse(__firebase_config);

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// Definindo um ID de app do ambiente ou padrão
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Constants ---
const COMPANY_REPORT_EMAIL = "seguranca.trabalho@tim.com.br"; 

const CATEGORY_TITLES = {
  electricity: "1. ELETRICIDADE",
  sanitary: "2. CONDIÇÕES SANITÁRIAS",
  accessibility: "3. ACESSIBILIDADE E ERGONOMIA",
  fire: "4. COMBATE A INCÊNDIO / SINALIZAÇÃO DE SEGURANÇA",
  brigade: "5. BRIGADA / PLANO DE EMERGÊNCIA",
  unsafe: "6. CONDIÇÕES INSEGURAS - ESTRUTURA E EQUIPAMENTOS",
  chemicals: "7. PRODUTOS QUÍMICOS",
  procedures: "8. PROCEDIMENTOS INTERNOS - TIM"
};

// --- Components ---

// Logótipo com dimensões explícitas para garantir renderização no PDF
const TimLogo = ({ className, style }) => (
  <svg 
    viewBox="0 0 180 80" 
    className={className || "h-12 w-auto"} 
    style={style}
    width="180" 
    height="80" 
    xmlns="http://www.w3.org/2000/svg"
    aria-label="TIM Logo"
  >
    <rect x="0" y="10" width="55" height="12" rx="2" fill="#E30613" />
    <rect x="0" y="34" width="55" height="12" rx="2" fill="#E30613" />
    <rect x="0" y="58" width="55" height="12" rx="2" fill="#E30613" />
    <g fill="#002D72">
       <path d="M70 10 H110 V22 H96 V70 H84 V22 H70 V10 Z" />
       <path d="M115 10 H127 V70 H115 V10 Z" />
       <path d="M132 10 H146 L156 45 L166 10 H180 V70 H168 V28 L159 58 H153 L144 28 V70 H132 V10 Z" />
    </g>
  </svg>
);

// Componente Visual do Relatório (O que será impresso/convertido)
const ReportContent = ({ formData, checklist, actionPlan, photos, categoryObservations, id }) => {
  return (
    <div id={id} className="bg-white p-10 text-black shadow-xl w-full">
      {/* Cabeçalho do Relatório */}
      <div className="flex justify-between items-start border-b-4 border-blue-900 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">RELATÓRIO TÉCNICO</h1>
          <p className="text-lg text-gray-600 font-medium mt-1">PC&O - Safety Governance</p>
        </div>
        <div style={{ width: '160px' }}>
          <TimLogo className="" style={{ width: '100%', height: 'auto' }} />
        </div>
      </div>

      {/* Dados Gerais */}
      <div className="mb-8 break-inside-avoid">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Identificação</h2>
        <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div><span className="font-bold text-gray-700">Data:</span> {formData.date}</div>
          <div><span className="font-bold text-gray-700">Regional:</span> {formData.regional}</div>
          <div><span className="font-bold text-gray-700">Loja:</span> {formData.storeName}</div>
          <div><span className="font-bold text-gray-700">CNPJ:</span> {formData.cnpj}</div>
          <div><span className="font-bold text-gray-700">Tipo:</span> {formData.storeType}</div>
          <div><span className="font-bold text-gray-700">Inspetor:</span> {formData.inspectorName}</div>
          <div><span className="font-bold text-gray-700">Resp. TIM:</span> {formData.timResponsible}</div>
          <div><span className="font-bold text-gray-700">E-mail:</span> {formData.timResponsibleEmail}</div>
        </div>
      </div>

      {/* Checklist */}
      <div className="mb-8">
        <h2 className="text-lg font-bold bg-blue-900 text-white p-2 pl-4 mb-4 rounded">1. RESULTADOS DA INSPEÇÃO</h2>
        {Object.keys(checklist).map(cat => {
           const hasItems = checklist[cat].length > 0;
           if (!hasItems) return null;

           return (
            <div key={cat} className="mb-6 break-inside-avoid page-break-inside-avoid">
              <h3 className="font-bold text-blue-800 border-b-2 border-gray-100 mb-3 pb-1">{CATEGORY_TITLES[cat]}</h3>
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-200">
                    <th className="pb-2 pl-2 font-medium w-3/4">Item de Verificação</th>
                    <th className="pb-2 font-medium w-1/4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {checklist[cat].map((item, idx) => {
                    if (item.id.startsWith('temp_') && !item.status) return null;
                    const isEven = idx % 2 === 0;
                    return (
                      <tr key={item.id} className={`border-b border-gray-50 ${isEven ? 'bg-gray-50' : ''}`}>
                        <td className="py-2 pl-2 pr-4">{item.label}</td>
                        <td className="py-2 text-center font-bold">
                          {item.status === 'ok' && <span className="text-green-700 text-xs border border-green-200 bg-green-50 px-2 py-1 rounded-full">CONFORME</span>}
                          {item.status === 'nok' && <span className="text-red-700 text-xs border border-red-200 bg-red-50 px-2 py-1 rounded-full">NÃO CONFORME</span>}
                          {item.status === 'na' && <span className="text-gray-500 text-xs border border-gray-200 bg-gray-50 px-2 py-1 rounded-full">N/A</span>}
                          {!item.status && <span className="text-gray-300">-</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {categoryObservations[cat] && (
                <div className="mt-3 text-sm bg-yellow-50 p-3 border-l-4 border-yellow-400 rounded-r text-gray-800">
                  <strong>Observações:</strong> {categoryObservations[cat]}
                </div>
              )}
            </div>
           );
        })}
      </div>

      {/* Plano de Ação */}
      {actionPlan.length > 0 && (
        <div className="mb-8 break-inside-avoid">
          <h2 className="text-lg font-bold bg-blue-900 text-white p-2 pl-4 mb-4 rounded">2. PLANO DE AÇÃO</h2>
          <table className="w-full text-xs border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left font-bold text-gray-700">Item</th>
                <th className="border border-gray-300 p-2 text-left font-bold text-gray-700">Ação Corretiva</th>
                <th className="border border-gray-300 p-2 text-left font-bold text-gray-700 w-24">Prazo</th>
                <th className="border border-gray-300 p-2 text-left font-bold text-gray-700">Responsável</th>
              </tr>
            </thead>
            <tbody>
              {actionPlan.map((action, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 p-2">{action.item}</td>
                  <td className="border border-gray-300 p-2">{action.action}</td>
                  <td className="border border-gray-300 p-2 text-center">{action.deadline}</td>
                  <td className="border border-gray-300 p-2">{action.responsible}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Observações Gerais */}
      {formData.observations && (
        <div className="mb-8 break-inside-avoid">
          <h2 className="text-lg font-bold bg-blue-900 text-white p-2 pl-4 mb-4 rounded">3. CONSIDERAÇÕES FINAIS</h2>
          <div className="text-sm p-4 border border-gray-200 rounded bg-gray-50 text-justify leading-relaxed">
            {formData.observations}
          </div>
        </div>
      )}

      {/* Fotos */}
      {photos.length > 0 && (
        <div className="break-inside-avoid">
          <h2 className="text-lg font-bold bg-blue-900 text-white p-2 pl-4 mb-4 rounded">4. EVIDÊNCIAS FOTOGRÁFICAS</h2>
          <div className="grid grid-cols-2 gap-6">
            {photos.map((photo, idx) => (
              <div key={idx} className="border border-gray-200 p-2 rounded bg-white shadow-sm break-inside-avoid">
                <img src={photo} alt={`Evidência ${idx+1}`} className="w-full h-48 object-contain mb-2 bg-gray-50 border border-gray-100" />
                <p className="text-center text-xs font-bold text-gray-500 uppercase">Foto {idx + 1}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Assinaturas */}
      <div className="mt-20 grid grid-cols-2 gap-20 break-inside-avoid">
        <div className="text-center">
          <div className="border-t border-black pt-2 w-4/5 mx-auto"></div>
          <p className="font-bold text-sm uppercase">{formData.inspectorName}</p>
          <p className="text-xs text-gray-500">Inspetor / Representante CIPAA</p>
        </div>
        <div className="text-center">
          <div className="border-t border-black pt-2 w-4/5 mx-auto"></div>
          <p className="font-bold text-sm uppercase">{formData.timResponsible}</p>
          <p className="text-xs text-gray-500">Responsável Loja TIM</p>
        </div>
      </div>

      {/* Rodapé */}
      <div className="mt-12 text-center text-[10px] text-gray-400 border-t border-gray-100 pt-4">
        <p>Relatório gerado digitalmente via Sistema PC&O - Safety Governance - {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Carregar biblioteca html2pdf
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    }
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    inspectorName: '', 
    date: new Date().toISOString().split('T')[0],
    regional: '',
    storeName: '',
    cnpj: '',
    storeType: '',
    timResponsible: '',
    timResponsibleRole: '',
    timResponsibleEmail: '',
    observations: ''
  });

  // Action Plan State
  const [actionPlan, setActionPlan] = useState([]);

  // Photos State
  const [photos, setPhotos] = useState([]);

  // State para observações pontuais
  const [categoryObservations, setCategoryObservations] = useState({
    electricity: '',
    sanitary: '',
    accessibility: '',
    fire: '',
    brigade: '',
    unsafe: '',
    chemicals: '',
    procedures: ''
  });

  // Checklist State structure
  const [checklist, setChecklist] = useState({
    electricity: [
      { id: 'elec_ground', label: '1.1 Os dispositivos elétricos da loja encontram-se aterrados?', status: null },
      { id: 'elec_conduit', label: '1.2 Fiação está devidamente isolada em conduítes ou eletrodutos?', status: null },
      { id: 'elec_id', label: '1.3 Chaves / circuitos estão identificados? Tomadas com identificação de tensão?', status: null },
      { id: 'elec_covers', label: '1.4 Interruptores/tomadas de parede com coberturas instaladas?', status: null },
      { id: 'elec_panels', label: '1.5 Os painéis elétricos estão devidamente protegidos, sinalizados e fechados?', status: null },
      { id: 'elec_ext', label: '1.6 Os cabos de extensão e outros tipos de conexões estão livres de objetos que possam rompê-los?', status: null },
      { id: 'elec_reguas', label: '1.7 As réguas (ampliação de tomadas) estão colocadas em local apropriado e estão em bom estado de conservação?', status: null },
      { id: 'elec_splices', label: '1.8 Todos os cabeamentos estão livres de emendas?', status: null }
    ],
    sanitary: [
      { id: 'san_hygiene', label: '2.1 Os locais apresentam boas condições de higiene e limpeza?', status: null },
      { id: 'san_facilities', label: '2.2 Os sanitários e vestiários estão em quantidade suficiciente e com dispositivos para higiene (papel higiênico, sabão, papel toalha)?', status: null },
      { id: 'san_water_supply', label: '2.3 O local possui fornecimento de água?', status: null },
      { id: 'san_water_quality', label: '2.4 A verificação da qualidade da água potável é feita periódicamente?', status: null },
      { id: 'san_fountains', label: '2.5 É feita manutenção e limpeza regular dos bebedouros?', status: null }
    ],
    accessibility: [
      { id: 'acc_furniture', label: '3.1 As mesas e cadeiras possuem dispositivos de regulagem para conforto e adequação no trabalho?', status: null },
      { id: 'acc_monitors', label: '3.2 Os monitores estão em altura e posicionamento adequados?', status: null },
      { id: 'acc_supports', label: '3.3 Existem dispositivos de apoio para os pés e suporte de punhos?', status: null },
      { id: 'acc_breaks', label: '3.4 Existe a prática de pausas regulares para evitar fadiga?', status: null },
      { id: 'acc_ramps', label: '3.5 A loja dispõe de rampas e corrimãos de acesso?', status: null },
      { id: 'acc_corridors', label: '3.6 Os corredores são acessíveis para passagem de pessoas cadeirantes?', status: null },
      { id: 'acc_signals', label: '3.7 A loja possui sinalização adequada para deficientes visuais e auditivos?', status: null }
    ],
    fire: [
      { id: 'fire_loc', label: '4.1 A loja dispõe de extintores em locais vísiveis e desobstruídos?', status: null },
      { id: 'fire_press', label: '4.2 Os extintores da loja estão pressurizados e dentro do prazo de validade?', status: null },
      { id: 'fire_other', label: '4.3 A loja dispões de outros dispositivos de combate a incêndio (hidrante, sprinkler, detector de fumaça, etc.)?', status: null },
      { id: 'fire_insp', label: '4.4 A inspeção periódica desses dispositivos é feita periódicamente?', status: null },
      { id: 'fire_emerg', label: '4.5 O local tem dispositivo de acionamento de emergência local (brigada, segurança, alarme, etc.)?', status: null },
      { id: 'fire_sign_exit', label: '4.6 O local dispõe de dispositivo de sinalização para saída de emergência?', status: null },
      { id: 'fire_sign_cond', label: '4.7 As placas indicativas de extintores e rota de emergência estão em perfeitas condições?', status: null }
    ],
    brigade: [
      { id: 'brig_trained', label: '5.1 O local tem brigadistas treinados?', status: null },
      { id: 'brig_firefighters', label: '5.2 A loja tem contato/acesso aos bombeiros civís do local?', status: null },
      { id: 'brig_routine', label: '5.3 O local tem rotina de atualização de treinamento dos brigadistas?', status: null },
      { id: 'brig_plan', label: '5.4 O local tem plano de emergência definido?', status: null },
      { id: 'brig_plan_training', label: '5.5 Os colaboradores são treinados no plano de emergência do local?', status: null },
      { id: 'brig_plan_update', label: '5.6 O plano de emergência do local é atualizado anualmente ou por demanda?', status: null },
      { id: 'brig_simulated', label: '5.7 A loja já passou por exercício simulado?', status: null }
    ],
    unsafe: [
      { id: 'unsafe_stairs_light', label: '6.1 A escada da loja está bem iluminada?', status: null },
      { id: 'unsafe_handrails', label: '6.2 Os corrimãos da escada estão em boas condições?', status: null },
      { id: 'unsafe_floors', label: '6.3 Os pisos e degraus da escada possuem alguma irregularidade?', status: null },
      { id: 'unsafe_maintenance', label: '6.4 Todos os equipamentos passam por manutenção preventiva e corretiva regularmente?', status: null },
      { id: 'unsafe_protection', label: '6.5 Os equipamentos da loja possuem todas as proteções e dispositivos de segurança adequados?', status: null },
      { id: 'unsafe_third_party', label: '6.6 Há inspeções regulares de empresas terceiras para identificar condições inseguras nas áreas de trabalho?', status: null },
      { id: 'unsafe_correction', label: '6.7 As condições inseguras são corrigidas imediatamente e as ações corretivas são registradas?', status: null },
      { id: 'unsafe_sensors', label: '6.8 Os sensores de presença dos dispositivos de fim de curso da porta de acesso a loja estão em bom funcionamento?', status: null }
    ],
    chemicals: [
      { id: 'chem_storage', label: '7.1 Os produtos químicos utilizados na loja são armazenados em local adequado?', status: null },
      { id: 'chem_epi', label: '7.2 O(s) colaborador(es) que manuseiam produtos químicos utilizam EPI?', status: null },
      { id: 'chem_label', label: '7.3 Os produtos quiímicos são rotulados corretamente?', status: null },
      { id: 'chem_fds', label: '7.4 Existem no local de armazenamento dos produtos químicos a FDS (antiga FISPQ)?', status: null }
    ],
    procedures: [
      { id: 'proc_cipaa', label: '8.1 A loja tem um designado de CIPAA treinado e capacitado?', status: null },
      { id: 'proc_cos', label: '8.2 Os colaboradores da loja tem conhecimento da COS e sabe acioná-la?', status: null },
      { id: 'proc_avcb', label: '8.3 A loja possui um AVCB (Auto de Vistoria do Corpo de Bombeiros) válido e atualizado?', status: null },
      { id: 'proc_training', label: '8.4 Os funcionários estão cientes e treinados nos procedimentos internos de segurança?', status: null },
      { id: 'proc_maint_req', label: '8.5 A gerencia tem conhecimento do procedimento interno de solicitação de manutenção e reparo de dispositivos e equipamentos da loja?', status: null }
    ]
  });

  // --- Auth & Init ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
        } else {
            await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
        setValidationError("Erro ao autenticar. Recarregue a página.");
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const handleCategoryObservationChange = (category, value) => {
    setCategoryObservations(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleStatusChange = (category, itemId, status) => {
    setChecklist(prev => ({
      ...prev,
      [category]: prev[category].map(item => 
        item.id === itemId ? { ...item, status } : item
      )
    }));
  };

  // --- Action Plan Handlers ---
  const addAction = () => {
    setActionPlan([...actionPlan, { id: Date.now(), item: '', action: '', deadline: '', responsible: '' }]);
  };

  const removeAction = (id) => {
    setActionPlan(actionPlan.filter(a => a.id !== id));
  };

  const updateAction = (id, field, value) => {
    setActionPlan(actionPlan.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  // --- Photo Handlers ---
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        
        if (scaleSize < 1) {
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
        } else {
            canvas.width = img.width;
            canvas.height = img.height;
        }

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setPhotos(prev => [...prev, dataUrl]);
      }
      img.src = event.target.result;
    }
    reader.readAsDataURL(file);
  };

  const removePhoto = (indexToRemove) => {
    setPhotos(photos.filter((_, index) => index !== indexToRemove));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ok': return 'bg-green-100 text-green-700 border-green-300';
      case 'nok': return 'bg-red-100 text-red-700 border-red-300';
      case 'na': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50';
    }
  };

  // --- PDF GENERATION FIX ---
  const handleDownloadPDF = () => {
    if (!window.html2pdf) {
      alert("Ferramenta PDF carregando... Tente em 3 segundos.");
      return;
    }
    setPdfGenerating(true);

    const originalElement = document.getElementById('report-content');
    
    // 1. Clonar o relatório
    const clonedElement = originalElement.cloneNode(true);
    
    // 2. Aplicar estilos FIXOS ao clone para garantir que cabe no A4
    // Largura de 794px = A4 a 96DPI (padrão web)
    const contentWidth = '750px';

    clonedElement.style.width = contentWidth;
    clonedElement.style.maxWidth = contentWidth;
    clonedElement.style.minWidth = contentWidth;
    clonedElement.style.margin = '0'; // CRUCIAL: Alinhamento à esquerda, sem auto
    clonedElement.style.padding = '20px'; 
    clonedElement.style.backgroundColor = 'white';
    clonedElement.style.boxShadow = 'none';
    
    // 3. Container Temporário Invisível
    const container = document.createElement('div');
    container.style.position = 'fixed'; // Fixed garante que fica fora do fluxo
    container.style.top = '-10000px'; 
    container.style.left = '0px'; // Força alinhamento à esquerda
    container.style.width = '800px'; // Container ligeiramente maior que o conteúdo
    container.style.zIndex = '-9999';
    container.appendChild(clonedElement);
    document.body.appendChild(container);

    const opt = {
      margin:       5, 
      filename:     `RIT_${formData.storeName.replace(/\s+/g, '_')}_${formData.date}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        scrollY: 0,
        scrollX: 0,
        windowWidth: 800, // Largura da janela virtual
        x: 0, // Coordenada X exata
        y: 0 
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    window.html2pdf().set(opt).from(clonedElement).save().then(() => {
      setPdfGenerating(false);
      document.body.removeChild(container);
    }).catch(err => {
      console.error(err);
      setPdfGenerating(false);
      alert("Erro ao gerar PDF.");
      if(document.body.contains(container)) document.body.removeChild(container);
    });
  };

  const generateEmailLink = () => {
    const subject = `RIT - Relatório: ${formData.storeName}`;
    const recipients = [formData.timResponsibleEmail, COMPANY_REPORT_EMAIL].filter(Boolean).join(',');
    let body = `Olá,\n\nSegue o Relatório de Inspeção Técnica (RIT) realizado em ${formData.date} na loja ${formData.storeName}.\n\n(Anexei o arquivo PDF deste relatório a este e-mail)\n\nAtenciosamente,\n${formData.inspectorName}`;
    return `mailto:${recipients}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    
    if (!user) { 
      setValidationError("Aguardando conexão com o sistema. Tente novamente em instantes."); 
      return; 
    }

    if (!formData.inspectorName || !formData.storeName) { 
      setValidationError("Por favor, preencha pelo menos o Nome do Inspetor e o Nome da Loja."); 
      return; 
    }

    setLoading(true);
    try {
      const inspectionData = {
        ...formData, checklist, categoryObservations, actionPlan, photos, 
        createdAt: serverTimestamp(), userId: user.uid
      };
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'inspections'), inspectionData);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setValidationError("Erro ao salvar dados. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData(prev => ({ ...prev, observations: '', storeName: '', cnpj: '', timResponsible: '', timResponsibleRole: '', timResponsibleEmail: '' }));
    setActionPlan([]);
    setPhotos([]);
    setCategoryObservations({ electricity: '', sanitary: '', accessibility: '', fire: '', brigade: '', unsafe: '', chemicals: '', procedures: '' });
    setChecklist(prev => {
      const newChecklist = { ...prev };
      Object.keys(newChecklist).forEach(key => { newChecklist[key] = newChecklist[key].map(item => ({ ...item, status: null })); });
      return newChecklist;
    });
  };

  // --- VIEW: RELATÓRIO FINAL (Aparece após salvar) ---
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-200 p-4">
        {/* Barra de Ações Flutuante */}
        <div className="fixed top-0 left-0 right-0 bg-blue-900 text-white p-4 shadow-xl z-50 flex flex-col items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl mx-auto gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">Relatório Pronto!</h2>
                <p className="text-xs text-blue-200 hidden sm:block">Revise abaixo e baixe o arquivo.</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button 
                onClick={handleDownloadPDF}
                disabled={pdfGenerating}
                className={`bg-white text-blue-900 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm ${pdfGenerating ? 'opacity-70 cursor-wait' : ''}`}
                title="Clique para baixar o arquivo PDF"
              >
                {pdfGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <FileDown className="w-4 h-4" />}
                {pdfGenerating ? 'Gerando PDF...' : '1. Baixar Arquivo PDF'}
              </button>

              <a 
                href={generateEmailLink()}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Mail className="w-4 h-4" />
                2. Enviar E-mail
              </a>
              
              <div className="w-px h-8 bg-blue-800 mx-1 hidden sm:block"></div>

              <button 
                onClick={() => setSubmitted(false)}
                className="bg-blue-800 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                title="Voltar para editar"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button 
                onClick={resetForm}
                className="bg-blue-800 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
                title="Nova Inspeção"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Espaçamento para não ficar atrás da barra */}
        <div className="h-32"></div>

        {/* O Documento em Si (Com ID para captura) */}
        <ReportContent 
          id="report-content"
          formData={formData} 
          checklist={checklist} 
          actionPlan={actionPlan} 
          photos={photos} 
          categoryObservations={categoryObservations}
        />
        
        <div className="h-12"></div>
      </div>
    );
  }

  // --- VIEW: FORMULÁRIO DE PREENCHIMENTO ---
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg min-w-[60px] flex items-center justify-center">
              <TimLogo />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">PC&O - Safety Governance</h1>
              <p className="text-xs text-blue-200">RIT - Relatório de Inspeção Técnica - Lojas</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Identificação */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
             <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Identificação do Inspetor
            </h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Inspetor (Representante CIPAA)</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  name="inspectorName"
                  required
                  value={formData.inspectorName}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Dados da Inspeção */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Dados da Inspeção
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fields (Same as previous) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data da Inspeção</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="date" 
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Regional</label>
                <div className="relative">
                  <Map className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <select 
                    name="regional"
                    required
                    value={formData.regional}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                  >
                    <option value="">Selecione...</option>
                    <option value="TCO">TCO</option>
                    <option value="TLE">TLE</option>
                    <option value="TNE">TNE</option>
                    <option value="TNO">TNO</option>
                    <option value="TRJ">TRJ</option>
                    <option value="TSP">TSP</option>
                    <option value="TSU">TSU</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Loja</label>
                <div className="relative">
                  <Store className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    name="storeName"
                    required
                    value={formData.storeName}
                    onChange={handleInputChange}
                    placeholder="Ex: Loja Shopping Center Norte"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleInputChange}
                    placeholder="00.000.000/0000-00"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Loja</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <select 
                    name="storeType"
                    value={formData.storeType}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                  >
                    <option value="">Selecione...</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Rua">Loja de Rua</option>
                    <option value="Quiosque">Quiosque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Responsável TIM</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    name="timResponsible"
                    required
                    value={formData.timResponsible}
                    onChange={handleInputChange}
                    placeholder="Nome do responsável no local"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cargo Responsável TIM</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    name="timResponsibleRole"
                    value={formData.timResponsibleRole}
                    onChange={handleInputChange}
                    placeholder="Ex: Gerente de Loja"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail do Responsável TIM</label>
                <div className="relative">
                  <Send className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    name="timResponsibleEmail"
                    required
                    value={formData.timResponsibleEmail}
                    onChange={handleInputChange}
                    placeholder="email.responsavel@tim.com.br"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Checklist Sections */}
          <ChecklistSection 
            title={CATEGORY_TITLES.electricity} 
            icon={<Zap className="w-5 h-5 text-yellow-500" />}
            items={checklist.electricity} 
            category="electricity"
            onChange={handleStatusChange}
            observation={categoryObservations.electricity}
            onObservationChange={handleCategoryObservationChange}
            getStatusColor={getStatusColor}
          />

          <ChecklistSection 
            title={CATEGORY_TITLES.sanitary} 
            icon={<Trash2 className="w-5 h-5 text-blue-500" />} 
            items={checklist.sanitary} 
            category="sanitary"
            onChange={handleStatusChange}
            observation={categoryObservations.sanitary}
            onObservationChange={handleCategoryObservationChange}
            getStatusColor={getStatusColor}
          />

          <ChecklistSection 
            title={CATEGORY_TITLES.accessibility} 
            icon={<Accessibility className="w-5 h-5 text-purple-500" />}
            items={checklist.accessibility} 
            category="accessibility"
            onChange={handleStatusChange} 
            observation={categoryObservations.accessibility}
            onObservationChange={handleCategoryObservationChange}
            getStatusColor={getStatusColor}
          />

          <ChecklistSection 
            title={CATEGORY_TITLES.fire} 
            icon={<Flame className="w-5 h-5 text-red-500" />}
            items={checklist.fire} 
            category="fire"
            onChange={handleStatusChange} 
            observation={categoryObservations.fire}
            onObservationChange={handleCategoryObservationChange}
            getStatusColor={getStatusColor}
          />

          <ChecklistSection 
            title={CATEGORY_TITLES.brigade} 
            icon={<Siren className="w-5 h-5 text-red-600" />}
            items={checklist.brigade} 
            category="brigade"
            onChange={handleStatusChange} 
            observation={categoryObservations.brigade}
            onObservationChange={handleCategoryObservationChange}
            getStatusColor={getStatusColor}
          />

          <ChecklistSection 
            title={CATEGORY_TITLES.unsafe} 
            icon={<AlertTriangle className="w-5 h-5 text-orange-600" />}
            items={checklist.unsafe} 
            category="unsafe"
            onChange={handleStatusChange} 
            observation={categoryObservations.unsafe}
            onObservationChange={handleCategoryObservationChange}
            getStatusColor={getStatusColor}
          />

          <ChecklistSection 
            title={CATEGORY_TITLES.chemicals} 
            icon={<FlaskConical className="w-5 h-5 text-green-600" />}
            items={checklist.chemicals} 
            category="chemicals"
            onChange={handleStatusChange} 
            observation={categoryObservations.chemicals}
            onObservationChange={handleCategoryObservationChange}
            getStatusColor={getStatusColor}
          />

          <ChecklistSection 
            title={CATEGORY_TITLES.procedures} 
            icon={<FileText className="w-5 h-5 text-slate-500" />}
            items={checklist.procedures} 
            category="procedures"
            onChange={handleStatusChange} 
            observation={categoryObservations.procedures}
            onObservationChange={handleCategoryObservationChange}
            getStatusColor={getStatusColor}
          />

          {/* Observations */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Observações Adicionais / Riscos
            </h2>
            <textarea
              name="observations"
              value={formData.observations}
              onChange={handleInputChange}
              rows="4"
              placeholder="Descreva aqui detalhes das não conformidades ou sugestões de melhoria..."
              className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            ></textarea>
          </div>

          {/* PLANO DE AÇÃO */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Plano de Ação
            </h2>
            
            <div className="space-y-4">
              {actionPlan.map((action, index) => (
                <div key={action.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative animate-in fade-in slide-in-from-top-2">
                  <div className="absolute top-2 right-2">
                    <button 
                      type="button" 
                      onClick={() => removeAction(action.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">ÍTEM</label>
                      <input 
                        type="text"
                        value={action.item}
                        onChange={(e) => updateAction(action.id, 'item', e.target.value)}
                        placeholder="Qual item?"
                        className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">AÇÃO</label>
                      <input 
                        type="text"
                        value={action.action}
                        onChange={(e) => updateAction(action.id, 'action', e.target.value)}
                        placeholder="O que será feito?"
                        className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">PRAZO</label>
                      <input 
                        type="date"
                        value={action.deadline}
                        onChange={(e) => updateAction(action.id, 'deadline', e.target.value)}
                        className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">RESPONSÁVEL</label>
                      <input 
                        type="text"
                        value={action.responsible}
                        onChange={(e) => updateAction(action.id, 'responsible', e.target.value)}
                        placeholder="Quem fará?"
                        className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addAction}
                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-5 h-5" />
                Adicionar Ação
              </button>
            </div>
          </div>

          {/* REGISTRO FOTOGRÁFICO */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4" /> Registro Fotográfico (Evidências)
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200">
                  <img src={photo} alt={`Evidência ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <label className="cursor-pointer border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center aspect-square hover:bg-slate-50 hover:border-blue-400 transition-colors group">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                  onChange={handlePhotoUpload}
                />
                <div className="p-3 bg-blue-100 rounded-full mb-2 group-hover:bg-blue-200 transition-colors">
                  <ImagePlus className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs text-slate-500 font-medium">Adicionar Foto</span>
              </label>
            </div>
            
            <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded border border-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Atenção:</strong> As fotos adicionadas aqui serão salvas no sistema para histórico.
                <br/>Devido a limitações de segurança, elas <strong>NÃO</strong> são anexadas automaticamente no e-mail.
                <br/>Você precisará anexá-las manualmente no seu aplicativo de e-mail antes de enviar o relatório.
              </span>
            </div>
          </div>

          {/* Validation Message */}
          {validationError && (
            <div className="p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 shrink-0" /><span>{validationError}</span></div>
          )}

          {/* Submit Action */}
          <div className="pt-4 pb-8">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white shadow-lg flex items-center justify-center gap-3 ${loading ? 'bg-blue-400' : 'bg-blue-700 hover:bg-blue-800'}`}>{loading ? <Loader2 className="w-6 h-6 animate-spin"/> : <Send className="w-6 h-6" />} Salvar e Gerar Relatório</button></div>
        </form>
      </main>
    </div>
  );
}

// Sub-component for Checklist Sections (Compact)
function ChecklistSection({ title, icon, items, category, onChange, observation, onObservationChange, getStatusColor }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 overflow-hidden mb-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">{icon} {title}</h2>
      <div className="space-y-4">{items.map((item) => (<div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"><span className="text-slate-700 font-medium text-sm sm:text-base flex-1">{item.label}</span><div className="flex items-center gap-2 shrink-0"><button type="button" onClick={() => onChange(category, item.id, 'ok')} className={`p-2 rounded-lg border-2 w-16 flex flex-col items-center ${item.status === 'ok' ? getStatusColor('ok') : 'border-slate-200 text-slate-300'}`}><CheckCircle2 className="w-6 h-6" /><span className="text-[10px] font-bold">C</span></button><button type="button" onClick={() => onChange(category, item.id, 'nok')} className={`p-2 rounded-lg border-2 w-16 flex flex-col items-center ${item.status === 'nok' ? getStatusColor('nok') : 'border-slate-200 text-slate-300'}`}><XCircle className="w-6 h-6" /><span className="text-[10px] font-bold">NC</span></button><button type="button" onClick={() => onChange(category, item.id, 'na')} className={`p-2 rounded-lg border-2 w-16 flex flex-col items-center ${item.status === 'na' ? getStatusColor('na') : 'border-slate-200 text-slate-300'}`}><MinusCircle className="w-6 h-6" /><span className="text-[10px] font-bold">N/A</span></button></div></div>))}<div className="mt-4 pt-3 border-t border-slate-100"><label className="block text-xs font-bold text-slate-500 uppercase mb-2">OUTROS (Observações):</label><textarea value={observation} onChange={(e) => onObservationChange(category, e.target.value)} className="w-full p-3 text-sm border border-slate-200 rounded-lg outline-none resize-none bg-slate-50" rows="2" placeholder="Detalhes..."></textarea></div></div>
    </div>
  );
}