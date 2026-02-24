export type Locale = "fr" | "es" | "en";

export const LOCALES: { id: Locale; label: string; flag: string }[] = [
  { id: "fr", label: "Français", flag: "🇫🇷" },
  { id: "es", label: "Español", flag: "🇪🇸" },
  { id: "en", label: "English", flag: "🇬🇧" },
];

const translations = {
  // ── App Shell ──
  loading: {
    fr: "Chargement...",
    es: "Cargando...",
    en: "Loading...",
  },

  // ── Sidebar ──
  newChat: {
    fr: "Nouveau chat",
    es: "Nuevo chat",
    en: "New chat",
  },
  explore: {
    fr: "Explorer",
    es: "Explorar",
    en: "Explore",
  },
  documentation: {
    fr: "Documentation",
    es: "Documentación",
    en: "Documentation",
  },
  support: {
    fr: "Support",
    es: "Soporte",
    en: "Support",
  },
  legal: {
    fr: "Mentions légales",
    es: "Legal",
    en: "Legal",
  },
  rename: {
    fr: "Renommer",
    es: "Renombrar",
    en: "Rename",
  },
  delete: {
    fr: "Supprimer",
    es: "Eliminar",
    en: "Delete",
  },
  settings: {
    fr: "Paramètres",
    es: "Ajustes",
    en: "Settings",
  },
  signOut: {
    fr: "Déconnexion",
    es: "Cerrar sesión",
    en: "Sign out",
  },
  anonymousMode: {
    fr: "Mode anonyme",
    es: "Modo anónimo",
    en: "Anonymous mode",
  },
  signIn: {
    fr: "Se connecter",
    es: "Iniciar sesión",
    en: "Sign in",
  },
  expandSidebar: {
    fr: "Développer",
    es: "Expandir sidebar",
    en: "Expand sidebar",
  },
  collapseSidebar: {
    fr: "Réduire",
    es: "Colapsar sidebar",
    en: "Collapse sidebar",
  },

  // ── Delete confirmation ──
  deleteConversation: {
    fr: "Supprimer la conversation",
    es: "Eliminar conversación",
    en: "Delete conversation",
  },
  deleteConfirmMessage: {
    fr: "Cette action est irréversible. La conversation et tous ses messages seront supprimés.",
    es: "Esta acción no se puede deshacer. Se eliminará la conversación y todos sus mensajes.",
    en: "This action cannot be undone. The conversation and all its messages will be deleted.",
  },
  cancel: {
    fr: "Annuler",
    es: "Cancelar",
    en: "Cancel",
  },

  // ── Empty State ──
  emptyStateTitle: {
    fr: "SYNTALYS AI",
    es: "SYNTALYS AI",
    en: "SYNTALYS AI",
  },
  emptyStateSubtitle: {
    fr: "Votre assistant intelligent. Que voulez-vous accomplir ?",
    es: "Tu asistente inteligente. ¿Qué quieres lograr hoy?",
    en: "Your intelligent assistant. What do you want to accomplish?",
  },

  // ── Suggestions ──
  sugBusiness: {
    fr: "Strategie business",
    es: "Estrategia de negocio",
    en: "Business strategy",
  },
  sugBusinessPrompt: {
    fr: "Aide-moi a creer un business plan complet pour une startup tech, avec analyse de marche, projections financieres et strategie de lancement",
    es: "Ayúdame a crear un plan de negocio completo para una startup tech, con análisis de mercado, proyecciones financieras y estrategia de lanzamiento",
    en: "Help me create a complete business plan for a tech startup, including market analysis, financial projections, and go-to-market strategy",
  },
  sugIdeas: {
    fr: "Brainstorming creatif",
    es: "Lluvia de ideas",
    en: "Creative brainstorming",
  },
  sugIdeasPrompt: {
    fr: "Donne-moi 10 idees innovantes et uniques de business pour 2025 qui resolvent de vrais problemes",
    es: "Dame 10 ideas de negocio innovadoras y únicas para 2025 que resuelvan problemas reales",
    en: "Give me 10 innovative and unique business ideas for 2025 that solve real problems",
  },
  sugAnalyze: {
    fr: "Analyser et strategiser",
    es: "Analizar y diseñar estrategia",
    en: "Analyze & strategize",
  },
  sugAnalyzePrompt: {
    fr: "Aide-moi a faire une analyse SWOT de mon business et recommande des actions concretes",
    es: "Ayúdame a hacer un análisis DAFO de mi negocio y recomienda acciones concretas",
    en: "Help me do a SWOT analysis of my business and recommend concrete action items",
  },
  sugDraft: {
    fr: "Redaction pro",
    es: "Escritura profesional",
    en: "Professional writing",
  },
  sugDraftPrompt: {
    fr: "Redige un email professionnel convaincant pour presenter notre nouveau produit a des investisseurs potentiels",
    es: "Escribe un email profesional convincente para presentar nuestro nuevo producto a inversores potenciales",
    en: "Write a compelling professional email to present our new product to potential investors",
  },
  sugWriteCode: {
    fr: "Code et tech",
    es: "Código y tecnología",
    en: "Code & build",
  },
  sugWriteCodePrompt: {
    fr: "Aide-moi a construire une landing page responsive avec un design moderne en React et Tailwind CSS",
    es: "Ayúdame a construir una landing page responsive con diseño moderno usando React y Tailwind CSS",
    en: "Help me build a responsive landing page with modern design using React and Tailwind CSS",
  },
  sugMarketing: {
    fr: "Marketing digital",
    es: "Marketing digital",
    en: "Digital marketing",
  },
  sugMarketingPrompt: {
    fr: "Conçois une strategie de marketing digital complete pour le lancement d'un nouveau produit SaaS",
    es: "Diseña una estrategia de marketing digital completa para el lanzamiento de un nuevo producto SaaS",
    en: "Design a complete digital marketing strategy for launching a new SaaS product",
  },

  // ── Chat Input ──
  inputPlaceholder: {
    fr: "Écrivez votre message...",
    es: "Escribe tu mensaje...",
    en: "Type your message...",
  },
  inputLimitReached: {
    fr: "Limite quotidienne atteinte. Inscrivez-vous pour continuer.",
    es: "Límite diario alcanzado. Regístrate para continuar.",
    en: "Daily limit reached. Sign up to continue.",
  },
  sendMessage: {
    fr: "Envoyer le message",
    es: "Enviar mensaje",
    en: "Send message",
  },
  stop: {
    fr: "Arrêter",
    es: "Detener",
    en: "Stop",
  },
  limitReachedShort: {
    fr: "Limite atteinte. Inscrivez-vous pour continuer.",
    es: "Límite alcanzado. Regístrate para continuar.",
    en: "Limit reached. Sign up to continue.",
  },
  aiDisclaimer: {
    fr: "SYNTALYS AI peut faire des erreurs. Vérifiez les informations importantes.",
    es: "SYNTALYS AI puede cometer errores. Verifica la información importante.",
    en: "SYNTALYS AI can make mistakes. Verify important information.",
  },
  voiceInput: {
    fr: "Saisie vocale",
    es: "Entrada de voz",
    en: "Voice input",
  },
  voiceListening: {
    fr: "Écoute en cours...",
    es: "Escuchando...",
    en: "Listening...",
  },

  // ── Message Bubble ──
  copyMessage: {
    fr: "Copier le message",
    es: "Copiar mensaje",
    en: "Copy message",
  },
  regenerate: {
    fr: "Régénérer la réponse",
    es: "Regenerar respuesta",
    en: "Regenerate response",
  },
  regenerateWith: {
    fr: "Régénérer avec un autre modèle",
    es: "Regenerar con otro modelo",
    en: "Regenerate with another model",
  },
  readAloud: {
    fr: "Lire à voix haute",
    es: "Leer en voz alta",
    en: "Read aloud",
  },
  stopReading: {
    fr: "Arrêter la lecture",
    es: "Detener lectura",
    en: "Stop reading",
  },

  // ── Code Block ──
  copied: {
    fr: "Copié",
    es: "Copiado",
    en: "Copied",
  },
  copy: {
    fr: "Copier",
    es: "Copiar",
    en: "Copy",
  },

  // ── Chat Header ──
  menu: {
    fr: "Menu",
    es: "Menú",
    en: "Menu",
  },
  share: {
    fr: "Partager",
    es: "Compartir",
    en: "Share",
  },
  shareCopied: {
    fr: "Lien copié !",
    es: "Enlace copiado!",
    en: "Link copied!",
  },
  shareError: {
    fr: "Erreur lors du partage",
    es: "Error al compartir",
    en: "Error sharing",
  },

  // ── Auth Modal ──
  welcomeBack: {
    fr: "Bon retour",
    es: "Bienvenido de nuevo",
    en: "Welcome back",
  },
  createAccount: {
    fr: "Créer un compte",
    es: "Crear cuenta",
    en: "Create account",
  },
  signInSubtitle: {
    fr: "Connectez-vous pour accéder à toutes les fonctionnalités",
    es: "Inicia sesión para acceder a todas las funciones",
    en: "Sign in to access all features",
  },
  registerSubtitle: {
    fr: "Inscrivez-vous pour débloquer tous les modèles",
    es: "Regístrate para desbloquear todos los modelos",
    en: "Sign up to unlock all models",
  },
  nameOptional: {
    fr: "Nom (optionnel)",
    es: "Nombre (opcional)",
    en: "Name (optional)",
  },
  yourName: {
    fr: "Votre nom",
    es: "Tu nombre",
    en: "Your name",
  },
  email: {
    fr: "Email",
    es: "Email",
    en: "Email",
  },
  password: {
    fr: "Mot de passe",
    es: "Contraseña",
    en: "Password",
  },
  minChars: {
    fr: "Minimum 6 caractères",
    es: "Mínimo 6 caracteres",
    en: "Minimum 6 characters",
  },
  yourPassword: {
    fr: "Votre mot de passe",
    es: "Tu contraseña",
    en: "Your password",
  },
  passwordTooShort: {
    fr: "Le mot de passe doit contenir au moins 6 caractères",
    es: "La contraseña debe tener al menos 6 carácteres",
    en: "Password must be at least 6 characters",
  },
  noAccount: {
    fr: "Pas de compte ?",
    es: "¿No tienes cuenta?",
    en: "Don't have an account?",
  },
  hasAccount: {
    fr: "Déjà un compte ?",
    es: "¿Ya tienes cuenta?",
    en: "Already have an account?",
  },
  register: {
    fr: "S'inscrire",
    es: "Regístrate",
    en: "Sign up",
  },

  // ── Email Confirmation ──
  checkEmailTitle: {
    fr: "Vérifiez votre email",
    es: "Revisa tu correo",
    en: "Check your email",
  },
  checkEmailDesc: {
    fr: "Nous avons envoyé un lien de confirmation à :",
    es: "Hemos enviado un enlace de confirmación a:",
    en: "We sent a confirmation link to:",
  },
  checkEmailHint: {
    fr: "Cliquez sur le lien dans l'email pour activer votre compte. Vérifiez aussi vos spams.",
    es: "Haz clic en el enlace del correo para activar tu cuenta. Revisa también la carpeta de spam.",
    en: "Click the link in the email to activate your account. Check your spam folder too.",
  },
  understood: {
    fr: "Compris",
    es: "Entendido",
    en: "Got it",
  },
  backToLogin: {
    fr: "Retour à la connexion",
    es: "Volver al inicio de sesión",
    en: "Back to login",
  },
  emailConfirmedTitle: {
    fr: "Email confirmé !",
    es: "¡Correo confirmado!",
    en: "Email confirmed!",
  },
  emailConfirmedDesc: {
    fr: "Votre compte est maintenant actif. Vous pouvez commencer à utiliser SYNTALYS Chat AI.",
    es: "Tu cuenta está activa. Ya puedes empezar a usar SYNTALYS Chat AI.",
    en: "Your account is now active. You can start using SYNTALYS Chat AI.",
  },
  startChatting: {
    fr: "Commencer à discuter",
    es: "Empezar a chatear",
    en: "Start chatting",
  },

  // ── Settings Modal ──
  theme: {
    fr: "Thème",
    es: "Tema",
    en: "Theme",
  },
  themeLight: {
    fr: "Clair",
    es: "Claro",
    en: "Light",
  },
  themeDark: {
    fr: "Sombre",
    es: "Oscuro",
    en: "Dark",
  },
  themeSystem: {
    fr: "Système",
    es: "Sistema",
    en: "System",
  },
  language: {
    fr: "Langue",
    es: "Idioma",
    en: "Language",
  },
  name: {
    fr: "Nom",
    es: "Nombre",
    en: "Name",
  },
  defaultModel: {
    fr: "Modèle par défaut",
    es: "Modelo por defecto",
    en: "Default model",
  },
  saveChanges: {
    fr: "Enregistrer",
    es: "Guardar cambios",
    en: "Save changes",
  },
  allRightsReserved: {
    fr: "Tous droits réservés.",
    es: "Todos los derechos reservados.",
    en: "All rights reserved.",
  },

  // ── Model Selector ──
  registerForModels: {
    fr: "Inscrivez-vous pour accéder à tous les modèles",
    es: "Regístrate para acceder a todos los modelos",
    en: "Sign up to access all models",
  },

  // ── Date groups ──
  today: {
    fr: "Aujourd'hui",
    es: "Hoy",
    en: "Today",
  },
  yesterday: {
    fr: "Hier",
    es: "Ayer",
    en: "Yesterday",
  },
  last7Days: {
    fr: "7 derniers jours",
    es: "Últimos 7 días",
    en: "Last 7 days",
  },
  older: {
    fr: "Précédent",
    es: "Anterior",
    en: "Older",
  },

  // ── Model descriptions (role-based suite) ──
  modelExecuteDesc: {
    fr: "Rédaction, code, emails et recherche web — rapide et efficace",
    es: "Redacción, código, emails y búsqueda web — rápido y eficiente",
    en: "Writing, code, emails, and web search — fast and efficient",
  },
  modelThinkDesc: {
    fr: "Analyse approfondie, raisonnement et prise de décision stratégique",
    es: "Análisis profundo, razonamiento y toma de decisiones estratégicas",
    en: "Deep analysis, reasoning, and strategic decision-making",
  },
  modelApexDesc: {
    fr: "Création avancée, résolution complexe et intelligence maximale",
    es: "Creación avanzada, resolución compleja e inteligencia máxima",
    en: "Advanced creation, complex resolution, and maximum intelligence",
  },
  modelMiloChatDesc: {
    fr: "Assistant amical pour conversations et support du quotidien",
    es: "Asistente amigable para conversaciones y soporte del día a día",
    en: "Friendly assistant for conversations and everyday support",
  },
  modelLegacyDesc: {
    fr: "Modèle de génération précédente",
    es: "Modelo de generación anterior",
    en: "Previous generation model",
  },
  legacyModels: {
    fr: "Modèles anciens",
    es: "Modelos antiguos",
    en: "Legacy models",
  },

  // ── Engine Archive ──
  engineArchive: {
    fr: "Archive des moteurs",
    es: "Archivo de motores",
    en: "Engine Archive",
  },
  engineArchiveDesc: {
    fr: "Versions antérieures du moteur TALYS maintenues pour compatibilité et référence technique.",
    es: "Versiones anteriores del motor TALYS mantenidas por compatibilidad y referencia técnica.",
    en: "Previous versions of the TALYS engine maintained for compatibility and technical reference.",
  },
  legacyReplacedByExecute: {
    fr: "Remplacé par TALYS Execute",
    es: "Reemplazado por TALYS Execute",
    en: "Replaced by TALYS Execute",
  },
  legacyIntegratedIntoThink: {
    fr: "Intégré dans TALYS Think",
    es: "Integrado en TALYS Think",
    en: "Integrated into TALYS Think",
  },
  legacyReplacedByApex: {
    fr: "Remplacé par TALYS Apex",
    es: "Reemplazado por TALYS Apex",
    en: "Replaced by TALYS Apex",
  },
  legacyReplacedByMiloChat: {
    fr: "Remplacé par Milo Chat",
    es: "Reemplazado por Milo Chat",
    en: "Replaced by Milo Chat",
  },

  // ── Reasoning ──
  reasoning: {
    fr: "Raisonnement",
    es: "Razonamiento",
    en: "Reasoning",
  },
  reasoningThinking: {
    fr: "Réflexion en cours...",
    es: "Pensando...",
    en: "Thinking...",
  },
  viewReasoning: {
    fr: "Voir le raisonnement",
    es: "Ver razonamiento",
    en: "View reasoning",
  },
  hideReasoning: {
    fr: "Masquer le raisonnement",
    es: "Ocultar razonamiento",
    en: "Hide reasoning",
  },

  // ── Beta banner ──
  betaWarning: {
    fr: "Réponse générée par un modèle en phase bêta. Les résultats peuvent varier.",
    es: "Respuesta generada por un modelo en fase beta. Los resultados pueden variar.",
    en: "Response generated by a beta model. Results may vary.",
  },

  // ── Chat Context ──
  newConversation: {
    fr: "Nouvelle conversation",
    es: "Nueva conversación",
    en: "New conversation",
  },
  responseError: {
    fr: "Erreur dans la réponse",
    es: "Error en la respuesta",
    en: "Response error",
  },
  genericError: {
    fr: "Désolé, une erreur s'est produite. Veuillez réessayer.",
    es: "Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.",
    en: "Sorry, an error occurred. Please try again.",
  },

  // ── Streaming UX ──
  thinkingIndicator: {
    fr: "SYNTALYS AI réfléchit...",
    es: "SYNTALYS AI está pensando...",
    en: "SYNTALYS AI is thinking...",
  },
  generatingImageIndicator: {
    fr: "Création de votre image...",
    es: "Creando tu imagen...",
    en: "Creating your image...",
  },
  reconnecting: {
    fr: "Reconnexion en cours...",
    es: "Reconectando...",
    en: "Reconnecting...",
  },

  // ── Sidebar Search ──
  searchChats: {
    fr: "Rechercher...",
    es: "Buscar...",
    en: "Search...",
  },
  noSearchResults: {
    fr: "Aucun résultat trouvé",
    es: "No se encontraron resultados",
    en: "No results found",
  },

  // ── Export ──
  exportChat: {
    fr: "Exporter la conversation",
    es: "Exportar conversación",
    en: "Export conversation",
  },
  exportMarkdown: {
    fr: "Exporter en Markdown (.md)",
    es: "Exportar como Markdown (.md)",
    en: "Export as Markdown (.md)",
  },
  exportText: {
    fr: "Exporter en texte (.txt)",
    es: "Exportar como texto (.txt)",
    en: "Export as text (.txt)",
  },

  // ── Explore Page ──
  exploreTitle: {
    fr: "Explorer SYNTALYS AI",
    es: "Explorar SYNTALYS AI",
    en: "Explore SYNTALYS AI",
  },
  exploreSubtitle: {
    fr: "Découvrez les capacités de votre assistant intelligent",
    es: "Descubre las capacidades de tu asistente inteligente",
    en: "Discover the capabilities of your intelligent assistant",
  },
  exploreModelsTitle: {
    fr: "Modèles disponibles",
    es: "Modelos disponibles",
    en: "Available models",
  },
  exploreTryNow: {
    fr: "Essayer",
    es: "Probar",
    en: "Try now",
  },
  exploreRequiresAuth: {
    fr: "Compte requis",
    es: "Cuenta requerida",
    en: "Account required",
  },
  exploreUseCasesTitle: {
    fr: "Que pouvez-vous faire ?",
    es: "¿Qué puedes hacer?",
    en: "What can you do?",
  },
  exploreUseCase1: {
    fr: "Rédiger des emails professionnels",
    es: "Redactar emails profesionales",
    en: "Draft professional emails",
  },
  exploreUseCase1Desc: {
    fr: "Créez des emails clairs et structurés pour toute situation professionnelle.",
    es: "Crea emails claros y estructurados para cualquier situación profesional.",
    en: "Create clear, structured emails for any professional situation.",
  },
  exploreUseCase2: {
    fr: "Résumer des documents",
    es: "Resumir documentos",
    en: "Summarize documents",
  },
  exploreUseCase2Desc: {
    fr: "Obtenez l'essentiel d'un texte long en quelques secondes.",
    es: "Obtén lo esencial de un texto largo en segundos.",
    en: "Get the essence of a long text in seconds.",
  },
  exploreUseCase3: {
    fr: "Écrire et expliquer du code",
    es: "Escribir y explicar código",
    en: "Write and explain code",
  },
  exploreUseCase3Desc: {
    fr: "Générez, déboguez et comprenez du code dans de nombreux langages.",
    es: "Genera, depura y comprende código en múltiples lenguajes.",
    en: "Generate, debug and understand code in many languages.",
  },
  exploreUseCase4: {
    fr: "Traduire du contenu",
    es: "Traducir contenido",
    en: "Translate content",
  },
  exploreUseCase4Desc: {
    fr: "Traduisez des textes entre le français, l'espagnol, l'anglais et plus.",
    es: "Traduce textos entre francés, español, inglés y más.",
    en: "Translate text between French, Spanish, English and more.",
  },
  exploreUseCase5: {
    fr: "Analyser et brainstormer",
    es: "Analizar y generar ideas",
    en: "Analyze and brainstorm",
  },
  exploreUseCase5Desc: {
    fr: "Explorez des idées, analysez des données et générez des solutions créatives.",
    es: "Explora ideas, analiza datos y genera soluciones creativas.",
    en: "Explore ideas, analyze data and generate creative solutions.",
  },
  exploreUseCase6: {
    fr: "Aide à l'apprentissage",
    es: "Ayuda al aprendizaje",
    en: "Learning assistance",
  },
  exploreUseCase6Desc: {
    fr: "Comprenez des concepts complexes avec des explications claires et adaptées.",
    es: "Comprende conceptos complejos con explicaciones claras y adaptadas.",
    en: "Understand complex concepts with clear, adapted explanations.",
  },

  // ── Documentation Page ──
  docTitle: {
    fr: "Documentation",
    es: "Documentación",
    en: "Documentation",
  },
  docSubtitle: {
    fr: "Guide complet pour utiliser SYNTALYS Chat AI",
    es: "Guía completa para usar SYNTALYS Chat AI",
    en: "Complete guide for using SYNTALYS Chat AI",
  },
  docGettingStarted: {
    fr: "Démarrage rapide",
    es: "Inicio rápido",
    en: "Getting started",
  },
  docGettingStartedContent: {
    fr: "Créez un compte ou utilisez le mode anonyme pour commencer à discuter avec SYNTALYS AI. Tapez votre message dans la zone de saisie et appuyez sur Entrée pour envoyer.",
    es: "Crea una cuenta o usa el modo anónimo para empezar a chatear con SYNTALYS AI. Escribe tu mensaje en el campo de texto y presiona Enter para enviar.",
    en: "Create an account or use anonymous mode to start chatting with SYNTALYS AI. Type your message in the input field and press Enter to send.",
  },
  docModels: {
    fr: "Les modèles",
    es: "Los modelos",
    en: "Models",
  },
  docModelsContent: {
    fr: "SYNTALYS AI propose plusieurs modeles adaptes a vos besoins :",
    es: "SYNTALYS AI ofrece varios modelos adaptados a tus necesidades:",
    en: "SYNTALYS AI offers several models adapted to your needs:",
  },
  docModelExecute: {
    fr: "Votre moteur de production quotidien. Gratuit. Ideal pour la redaction, le code, les emails, la recherche web et les taches operationnelles. Rapide et efficace.",
    es: "Tu motor de producción diario. Gratuito. Ideal para redacción, código, emails, búsqueda web y tareas operativas. Rápido y eficiente.",
    en: "Your daily production engine. Free. Great for writing, code, emails, web search, and operational tasks. Fast and efficient.",
  },
  docModelThink: {
    fr: "Analytique premium avec raisonnement pas a pas. Ideal pour l'architecture technique, l'analyse financiere, la strategie et les decisions complexes. Necessite un compte.",
    es: "Analítico premium con razonamiento paso a paso. Ideal para arquitectura técnica, análisis financiero, estrategia y decisiones complejas. Requiere cuenta.",
    en: "Premium analytical model with step-by-step reasoning. Great for technical architecture, financial analysis, strategy, and complex decisions. Requires an account.",
  },
  docModelApex: {
    fr: "Le modele flagship. Creation avancee, resolution de problemes ambigus, design de systemes complets et intelligence strategique maximale. Necessite un compte.",
    es: "El modelo flagship. Creación avanzada, resolución de problemas ambiguos, diseño de sistemas completos e inteligencia estratégica máxima. Requiere cuenta.",
    en: "The flagship model. Advanced creation, ambiguous problem solving, complete systems design, and maximum strategic intelligence. Requires an account.",
  },
  docModelMiloChat: {
    fr: "Assistant conversationnel amical et accessible. Ideal pour le support, les FAQs, les conversations informelles et l'assistance basique. Gratuit.",
    es: "Asistente conversacional amigable y accesible. Ideal para soporte, FAQs, conversaciones informales y asistencia básica. Gratuito.",
    en: "Friendly and approachable conversational assistant. Great for support, FAQs, casual conversations, and basic assistance. Free.",
  },
  docConversations: {
    fr: "Gestion des conversations",
    es: "Gestión de conversaciones",
    en: "Conversation management",
  },
  docConversationsContent: {
    fr: "Vos conversations sont organisées dans la barre latérale par date (aujourd'hui, hier, 7 derniers jours, plus ancien). Vous pouvez renommer ou supprimer une conversation via le menu contextuel. Cliquez sur « Nouveau chat » pour démarrer une nouvelle conversation.",
    es: "Tus conversaciones se organizan en la barra lateral por fecha (hoy, ayer, últimos 7 días, anterior). Puedes renombrar o eliminar una conversación desde el menú contextual. Haz clic en « Nuevo chat » para iniciar una nueva conversación.",
    en: "Your conversations are organized in the sidebar by date (today, yesterday, last 7 days, older). You can rename or delete a conversation from the context menu. Click \"New chat\" to start a new conversation.",
  },
  docAnonymous: {
    fr: "Mode anonyme vs. Compte",
    es: "Modo anónimo vs. Cuenta",
    en: "Anonymous mode vs. Account",
  },
  docAnonymousContent: {
    fr: "En mode anonyme, vous avez acces a TALYS Execute et Milo Chat avec une limite de 20 messages par jour. Vos conversations sont stockees localement dans votre navigateur. Avec un compte, vous accedez a tous les modeles (TALYS Think, Apex), sans limite de messages, et vos conversations sont synchronisees dans le cloud.",
    es: "En modo anónimo, tienes acceso a TALYS Execute y Milo Chat con un límite de 20 mensajes por día. Tus conversaciones se guardan localmente en tu navegador. Con una cuenta, accedes a todos los modelos (TALYS Think, Apex), sin límite de mensajes, y tus conversaciones se sincronizan en la nube.",
    en: "In anonymous mode, you have access to TALYS Execute and Milo Chat with a limit of 20 messages per day. Your conversations are stored locally in your browser. With an account, you access all models (TALYS Think, Apex), with no message limit, and your conversations are synced to the cloud.",
  },
  docSettings: {
    fr: "Paramètres",
    es: "Ajustes",
    en: "Settings",
  },
  docSettingsContent: {
    fr: "Personnalisez votre expérience : choisissez le thème (clair, sombre ou système), la langue (français, espagnol, anglais), votre nom d'affichage et votre modèle par défaut. Les paramètres sont accessibles depuis l'icône dans la barre latérale.",
    es: "Personaliza tu experiencia: elige el tema (claro, oscuro o sistema), el idioma (francés, español, inglés), tu nombre para mostrar y tu modelo por defecto. Los ajustes se encuentran en el icono de la barra lateral.",
    en: "Customize your experience: choose the theme (light, dark or system), language (French, Spanish, English), your display name and default model. Settings are accessible from the icon in the sidebar.",
  },
  docShortcuts: {
    fr: "Raccourcis clavier",
    es: "Atajos de teclado",
    en: "Keyboard shortcuts",
  },
  docShortcutsContent: {
    fr: "Entrée : envoyer le message | Maj + Entrée : saut de ligne",
    es: "Enter: enviar mensaje | Shift + Enter: salto de línea",
    en: "Enter: send message | Shift + Enter: new line",
  },
  docFaqTitle: {
    fr: "Questions fréquentes",
    es: "Preguntas frecuentes",
    en: "FAQ",
  },
  docFaq1Q: {
    fr: "Où sont stockées mes données ?",
    es: "¿Dónde se guardan mis datos?",
    en: "Where is my data stored?",
  },
  docFaq1A: {
    fr: "Si vous avez un compte, vos conversations sont stockées de manière sécurisée dans le cloud (Supabase). En mode anonyme, tout reste dans votre navigateur.",
    es: "Si tienes cuenta, tus conversaciones se guardan de forma segura en la nube (Supabase). En modo anónimo, todo se queda en tu navegador.",
    en: "If you have an account, your conversations are securely stored in the cloud (Supabase). In anonymous mode, everything stays in your browser.",
  },
  docFaq2Q: {
    fr: "Puis-je supprimer mon compte ?",
    es: "¿Puedo eliminar mi cuenta?",
    en: "Can I delete my account?",
  },
  docFaq2A: {
    fr: "Contactez-nous à hello@syntalys.ch pour toute demande de suppression de compte.",
    es: "Contáctanos en hello@syntalys.ch para cualquier solicitud de eliminación de cuenta.",
    en: "Contact us at hello@syntalys.ch for any account deletion request.",
  },
  docFaq3Q: {
    fr: "L'IA peut-elle se tromper ?",
    es: "¿Puede la IA equivocarse?",
    en: "Can the AI make mistakes?",
  },
  docFaq3A: {
    fr: "Oui. SYNTALYS AI peut faire des erreurs. Vérifiez toujours les informations importantes avant de les utiliser.",
    es: "Sí. SYNTALYS AI puede cometer errores. Verifica siempre la información importante antes de usarla.",
    en: "Yes. SYNTALYS AI can make mistakes. Always verify important information before using it.",
  },

  // ── Support Page ──
  supportTitle: {
    fr: "Besoin d'aide ?",
    es: "¿Necesitas ayuda?",
    en: "Need help?",
  },
  supportSubtitle: {
    fr: "Notre équipe est disponible pour répondre à vos questions et résoudre vos problèmes.",
    es: "Nuestro equipo está disponible para responder tus preguntas y resolver tus problemas.",
    en: "Our team is available to answer your questions and solve your problems.",
  },
  supportContactTitle: {
    fr: "Contactez-nous",
    es: "Contáctanos",
    en: "Contact us",
  },
  supportContactDesc: {
    fr: "Envoyez-nous un email et nous vous répondrons dans les plus brefs délais.",
    es: "Envíanos un email y te responderemos lo antes posible.",
    en: "Send us an email and we'll get back to you as soon as possible.",
  },
  supportResponseTime: {
    fr: "Délai de réponse estimé : 24 – 48h",
    es: "Tiempo de respuesta estimado: 24 – 48h",
    en: "Estimated response time: 24 – 48h",
  },
  supportSendEmail: {
    fr: "Envoyer un email",
    es: "Enviar un email",
    en: "Send an email",
  },
  supportUsefulLinks: {
    fr: "Liens utiles",
    es: "Enlaces útiles",
    en: "Useful links",
  },
  supportViewDoc: {
    fr: "Consulter la documentation",
    es: "Consultar la documentación",
    en: "View documentation",
  },
  supportViewFaq: {
    fr: "Voir la FAQ",
    es: "Ver las preguntas frecuentes",
    en: "View FAQ",
  },
  supportBugTitle: {
    fr: "Signaler un problème",
    es: "Reportar un problema",
    en: "Report a problem",
  },
  supportBugDesc: {
    fr: "Si vous rencontrez un bug, décrivez le problème en détail dans votre email afin que nous puissions le résoudre rapidement.",
    es: "Si encuentras un bug, describe el problema en detalle en tu email para que podamos resolverlo rápidamente.",
    en: "If you encounter a bug, describe the problem in detail in your email so we can resolve it quickly.",
  },

  // ── Legal Page ──
  legalTitle: {
    fr: "Mentions légales",
    es: "Información legal",
    en: "Legal notice",
  },
  legalInfoTitle: {
    fr: "Informations légales",
    es: "Información legal",
    en: "Legal information",
  },
  legalForm: {
    fr: "Forme juridique",
    es: "Forma jurídica",
    en: "Legal form",
  },
  legalFormValue: {
    fr: "Entreprise Individuelle",
    es: "Empresa Individual",
    en: "Sole Proprietorship",
  },
  legalRepresentative: {
    fr: "Représentant légal",
    es: "Representante legal",
    en: "Legal representative",
  },
  legalAddress: {
    fr: "Adresse",
    es: "Dirección",
    en: "Address",
  },
  legalEmail: {
    fr: "E-mail",
    es: "E-mail",
    en: "E-mail",
  },
  legalVat: {
    fr: "N° IDE / TVA",
    es: "N° IDE / IVA",
    en: "VAT number",
  },
  legalHostingTitle: {
    fr: "Hébergement",
    es: "Alojamiento",
    en: "Hosting",
  },
  legalHostingContent: {
    fr: "Application hébergée par Vercel Inc. (San Francisco, USA). Base de données hébergée par Supabase Inc.",
    es: "Aplicación alojada por Vercel Inc. (San Francisco, USA). Base de datos alojada por Supabase Inc.",
    en: "Application hosted by Vercel Inc. (San Francisco, USA). Database hosted by Supabase Inc.",
  },
  legalDataTitle: {
    fr: "Protection des données",
    es: "Protección de datos",
    en: "Data protection",
  },
  legalDataContent: {
    fr: "Les données des utilisateurs authentifiés sont stockées de manière sécurisée dans Supabase. Les utilisateurs anonymes utilisent le stockage local du navigateur. Les messages sont traités par OpenAI pour la génération des réponses. Aucune donnée personnelle n'est partagée avec des tiers en dehors de ce traitement.",
    es: "Los datos de los usuarios autenticados se almacenan de forma segura en Supabase. Los usuarios anónimos usan el almacenamiento local del navegador. Los mensajes son procesados por OpenAI para la generación de respuestas. Ningún dato personal se comparte con terceros fuera de este procesamiento.",
    en: "Authenticated user data is securely stored in Supabase. Anonymous users use browser local storage. Messages are processed by OpenAI for response generation. No personal data is shared with third parties outside of this processing.",
  },
  legalAiTitle: {
    fr: "Utilisation de l'IA",
    es: "Uso de la IA",
    en: "AI usage",
  },
  legalAiContent: {
    fr: "Les réponses sont générées par intelligence artificielle et peuvent contenir des erreurs. SYNTALYS TECH ne se responsabilise pas de l'usage fait des réponses générées par l'IA.",
    es: "Las respuestas son generadas por inteligencia artificial y pueden contener errores. SYNTALYS TECH no se responsabiliza del uso que se haga de las respuestas generadas por la IA.",
    en: "Responses are generated by artificial intelligence and may contain errors. SYNTALYS TECH is not responsible for the use made of AI-generated responses.",
  },
  legalCookiesTitle: {
    fr: "Cookies et stockage local",
    es: "Cookies y almacenamiento local",
    en: "Cookies and local storage",
  },
  legalCookiesContent: {
    fr: "Ce site utilise le stockage local du navigateur pour sauvegarder vos préférences (thème, langue) et les sessions anonymes. Aucun cookie tiers n'est utilisé à des fins publicitaires.",
    es: "Este sitio utiliza el almacenamiento local del navegador para guardar tus preferencias (tema, idioma) y las sesiones anónimas. No se usan cookies de terceros con fines publicitarios.",
    en: "This site uses browser local storage to save your preferences (theme, language) and anonymous sessions. No third-party cookies are used for advertising purposes.",
  },
  legalIpTitle: {
    fr: "Propriété intellectuelle",
    es: "Propiedad intelectual",
    en: "Intellectual property",
  },
  legalIpContent: {
    fr: "L'ensemble du contenu de ce site (textes, logos, images, code) est protégé par le droit d'auteur.",
    es: "Todo el contenido de este sitio (textos, logos, imágenes, código) está protegido por derechos de autor.",
    en: "All content on this site (text, logos, images, code) is protected by copyright.",
  },

  // ── File Upload ──
  attachFile: {
    fr: "Joindre un fichier",
    es: "Adjuntar archivo",
    en: "Attach file",
  },
  attachedFiles: {
    fr: "Fichiers joints",
    es: "Archivos adjuntos",
    en: "Attached files",
  },
  processing: {
    fr: "Traitement...",
    es: "Procesando...",
    en: "Processing...",
  },
  fileTooLarge: {
    fr: "Fichier trop volumineux",
    es: "Archivo demasiado grande",
    en: "File too large",
  },

  // ── Settings: Password ──
  changePassword: {
    fr: "Changer le mot de passe",
    es: "Cambiar contraseña",
    en: "Change password",
  },
  newPassword: {
    fr: "Nouveau mot de passe",
    es: "Nueva contraseña",
    en: "New password",
  },
  confirmNewPassword: {
    fr: "Confirmer le mot de passe",
    es: "Confirmar contraseña",
    en: "Confirm password",
  },
  passwordChanged: {
    fr: "Mot de passe modifié avec succès",
    es: "Contraseña cambiada con éxito",
    en: "Password changed successfully",
  },
  passwordsNoMatch: {
    fr: "Les mots de passe ne correspondent pas",
    es: "Las contraseñas no coinciden",
    en: "Passwords do not match",
  },

  // ── Settings: Danger Zone ──
  dangerZone: {
    fr: "Zone de danger",
    es: "Zona de peligro",
    en: "Danger zone",
  },
  deleteAllChats: {
    fr: "Supprimer toutes les conversations",
    es: "Eliminar todas las conversaciones",
    en: "Delete all conversations",
  },
  deleteAllChatsDesc: {
    fr: "Supprime toutes vos conversations et messages de manière irréversible.",
    es: "Elimina todas tus conversaciones y mensajes de forma irreversible.",
    en: "Permanently delete all your conversations and messages.",
  },
  deleteAllChatsConfirm: {
    fr: "Êtes-vous sûr ? Toutes vos conversations seront supprimées définitivement.",
    es: "¿Estás seguro? Todas tus conversaciones se eliminarán permanentemente.",
    en: "Are you sure? All your conversations will be permanently deleted.",
  },
  // ── Folders ──
  newFolder: {
    fr: "Nouveau dossier",
    es: "Nueva carpeta",
    en: "New folder",
  },
  folderName: {
    fr: "Nom du dossier",
    es: "Nombre de la carpeta",
    en: "Folder name",
  },
  renameFolder: {
    fr: "Renommer le dossier",
    es: "Renombrar carpeta",
    en: "Rename folder",
  },
  deleteFolder: {
    fr: "Supprimer le dossier",
    es: "Eliminar carpeta",
    en: "Delete folder",
  },
  deleteFolderConfirm: {
    fr: "Les conversations du dossier seront déplacées hors du dossier, pas supprimées.",
    es: "Las conversaciones de la carpeta se moverán fuera, no se eliminarán.",
    en: "Conversations in this folder will be moved out, not deleted.",
  },
  moveToFolder: {
    fr: "Déplacer vers un dossier",
    es: "Mover a carpeta",
    en: "Move to folder",
  },
  removeFromFolder: {
    fr: "Retirer du dossier",
    es: "Quitar de carpeta",
    en: "Remove from folder",
  },
  noFolders: {
    fr: "Aucun dossier",
    es: "Sin carpetas",
    en: "No folders",
  },
  folderEmpty: {
    fr: "Aucune conversation",
    es: "Sin conversaciones",
    en: "No conversations",
  },

  deleteAccount: {
    fr: "Supprimer le compte",
    es: "Eliminar cuenta",
    en: "Delete account",
  },
  deleteAccountDesc: {
    fr: "Supprime votre compte, vos données et toutes vos conversations.",
    es: "Elimina tu cuenta, tus datos y todas tus conversaciones.",
    en: "Delete your account, data, and all conversations.",
  },
  deleteAccountConfirm: {
    fr: "Cette action est irréversible. Tapez \"delete\" pour confirmer la suppression de votre compte.",
    es: "Esta acción es irreversible. Escribe \"delete\" para confirmar la eliminación de tu cuenta.",
    en: "This action is irreversible. Type \"delete\" to confirm account deletion.",
  },
  typeDelete: {
    fr: "Tapez \"delete\"",
    es: "Escribe \"delete\"",
    en: "Type \"delete\"",
  },

  // ── Humanizer ──
  humanizer: {
    fr: "Humaniseur",
    es: "Humanizador",
    en: "Humanizer",
  },
  humanizerTitle: {
    fr: "Humaniseur de texte",
    es: "Humanizador de texto",
    en: "Text Humanizer",
  },
  humanizerSubtitle: {
    fr: "Collez un texte généré par IA et transformez-le en écriture naturelle et humaine.",
    es: "Pega un texto generado por IA y transfórmalo en escritura natural y humana.",
    en: "Paste AI-generated text and transform it into natural, human writing.",
  },
  humanizerPlaceholder: {
    fr: "Collez ici le texte à humaniser...",
    es: "Pega aquí el texto a humanizar...",
    en: "Paste the text to humanize here...",
  },
  humanizerButton: {
    fr: "Humaniser",
    es: "Humanizar",
    en: "Humanize",
  },
  humanizerProcessing: {
    fr: "Transformation en cours...",
    es: "Transformando...",
    en: "Transforming...",
  },
  humanizerResult: {
    fr: "Résultat",
    es: "Resultado",
    en: "Result",
  },
  humanizerCopied: {
    fr: "Texte copié !",
    es: "Texto copiado!",
    en: "Text copied!",
  },
  humanizerReset: {
    fr: "Réinitialiser",
    es: "Reiniciar",
    en: "Reset",
  },
  newLine: {
    fr: "Nouvelle ligne",
    es: "Nueva línea",
    en: "New line",
  },
  humanizerEmpty: {
    fr: "Entrez du texte ci-dessus pour commencer",
    es: "Introduce texto arriba para comenzar",
    en: "Enter text above to get started",
  },

  // ── Memory ──
  memoryTitle: {
    fr: "Mémoire de l'IA",
    es: "Memoria de la IA",
    en: "AI Memory",
  },
  memoryDesc: {
    fr: "SYNTALYS AI se souvient des informations importantes entre les conversations pour personnaliser vos réponses.",
    es: "SYNTALYS AI recuerda información importante entre conversaciones para personalizar tus respuestas.",
    en: "SYNTALYS AI remembers important information across conversations to personalize your responses.",
  },
  memoryEmpty: {
    fr: "Aucune mémoire enregistrée. L'IA commencera à se souvenir des informations importantes au fil de vos conversations.",
    es: "Sin memorias guardadas. La IA empezará a recordar información importante a medida que converses.",
    en: "No memories saved yet. The AI will start remembering important information as you chat.",
  },
  memoryClearAll: {
    fr: "Effacer toute la mémoire",
    es: "Borrar toda la memoria",
    en: "Clear all memory",
  },

  // ── Image Generation ──
  generateImage: {
    fr: "Créer une image",
    es: "Crear una imagen",
    en: "Create an image",
  },
  describeImagePlaceholder: {
    fr: "Décrivez votre image...",
    es: "Describe tu imagen...",
    en: "Describe your image...",
  },
  imageMode: {
    fr: "Mode image",
    es: "Modo imagen",
    en: "Image mode",
  },

  // ── Images Tab ──
  images: {
    fr: "Images",
    es: "Imágenes",
    en: "Images",
  },
  imagesTitle: {
    fr: "Images",
    es: "Imágenes",
    en: "Images",
  },
  imagesSubtitle: {
    fr: "Créez et retrouvez toutes vos images générées",
    es: "Crea y encuentra todas tus imágenes generadas",
    en: "Create and find all your generated images",
  },
  imagesPlaceholder: {
    fr: "Décrivez l'image que vous voulez créer...",
    es: "Describe la imagen que quieres crear...",
    en: "Describe the image you want to create...",
  },
  imagesGenerate: {
    fr: "Générer",
    es: "Generar",
    en: "Generate",
  },
  imagesGenerating: {
    fr: "Génération en cours...",
    es: "Generando...",
    en: "Generating...",
  },
  imagesGallery: {
    fr: "Mes images",
    es: "Mis imágenes",
    en: "My images",
  },
  imagesEmpty: {
    fr: "Aucune image pour l'instant. Décrivez ce que vous souhaitez créer !",
    es: "Aún no tienes imágenes. ¡Describe lo que quieres crear!",
    en: "No images yet. Describe what you want to create!",
  },
  imagesDownload: {
    fr: "Télécharger",
    es: "Descargar",
    en: "Download",
  },
  imagesDelete: {
    fr: "Supprimer",
    es: "Eliminar",
    en: "Delete",
  },
  imagesDeleteConfirm: {
    fr: "Supprimer cette image ?",
    es: "¿Eliminar esta imagen?",
    en: "Delete this image?",
  },
  imagesAttachRef: {
    fr: "Ajouter une image de référence",
    es: "Adjuntar imagen de referencia",
    en: "Attach reference image",
  },
  imagesLoginRequired: {
    fr: "Connectez-vous pour créer et sauvegarder des images",
    es: "Inicia sesión para crear y guardar imágenes",
    en: "Sign in to create and save images",
  },
  imagesLoadMore: {
    fr: "Charger plus",
    es: "Cargar más",
    en: "Load more",
  },

  // ── Conversation Branching ──
  editMessage: {
    fr: "Modifier",
    es: "Editar",
    en: "Edit",
  },
  saveAndSubmit: {
    fr: "Enregistrer",
    es: "Guardar",
    en: "Save",
  },
} as const;

export type TranslationKey = keyof typeof translations;

export function getTranslation(
  key: TranslationKey,
  locale: Locale
): string {
  return translations[key][locale];
}

export function getMessagesRemaining(locale: Locale, n: number): string {
  const templates: Record<Locale, (n: number) => string> = {
    fr: (n) => `${n} message${n !== 1 ? "s" : ""} restant${n !== 1 ? "s" : ""} aujourd'hui`,
    es: (n) => `${n} mensaje${n !== 1 ? "s" : ""} restante${n !== 1 ? "s" : ""} hoy`,
    en: (n) => `${n} message${n !== 1 ? "s" : ""} remaining today`,
  };
  return templates[locale](n);
}

export function detectBrowserLocale(): Locale {
  if (typeof window === "undefined") return "fr";
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("es")) return "es";
  if (lang.startsWith("en")) return "en";
  if (lang.startsWith("fr")) return "fr";
  return "fr"; // Default to French
}
