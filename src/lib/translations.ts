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
    es: "Documentacion",
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
    es: "Cerrar sesion",
    en: "Sign out",
  },
  anonymousMode: {
    fr: "Mode anonyme",
    es: "Modo anonimo",
    en: "Anonymous mode",
  },
  signIn: {
    fr: "Se connecter",
    es: "Iniciar sesion",
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
    es: "Eliminar conversacion",
    en: "Delete conversation",
  },
  deleteConfirmMessage: {
    fr: "Cette action est irréversible. La conversation et tous ses messages seront supprimés.",
    es: "Esta accion no se puede deshacer. Se eliminara la conversacion y todos sus mensajes.",
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
    fr: "Votre assistant intelligent. Posez vos questions.",
    es: "Tu asistente inteligente. Pregunta lo que necesites.",
    en: "Your intelligent assistant. Ask anything you need.",
  },

  // ── Suggestions ──
  sugWriteCode: {
    fr: "Écrire du code",
    es: "Escribe codigo",
    en: "Write code",
  },
  sugWriteCodePrompt: {
    fr: "Aide-moi à créer une fonction Python qui trie une liste",
    es: "Ayudame a crear una funcion en Python que ordene una lista",
    en: "Help me create a Python function that sorts a list",
  },
  sugSummarize: {
    fr: "Résumer un texte",
    es: "Resume un texto",
    en: "Summarize text",
  },
  sugSummarizePrompt: {
    fr: "Résume les points clés d'un texte long",
    es: "Resume los puntos clave de un texto largo",
    en: "Summarize the key points of a long text",
  },
  sugIdeas: {
    fr: "Générer des idées",
    es: "Genera ideas",
    en: "Generate ideas",
  },
  sugIdeasPrompt: {
    fr: "Donne-moi 5 idées innovantes pour une startup technologique",
    es: "Dame 5 ideas innovadoras para una startup tecnologica",
    en: "Give me 5 innovative ideas for a tech startup",
  },
  sugTranslate: {
    fr: "Traduire du contenu",
    es: "Traduce contenido",
    en: "Translate content",
  },
  sugTranslatePrompt: {
    fr: "Traduis ce texte de l'espagnol au français",
    es: "Traduce este texto del espanol al frances",
    en: "Translate this text from Spanish to French",
  },
  sugAnalyze: {
    fr: "Analyser des données",
    es: "Analiza datos",
    en: "Analyze data",
  },
  sugAnalyzePrompt: {
    fr: "Explique comment analyser les tendances dans un jeu de données",
    es: "Explica como analizar tendencias en un dataset",
    en: "Explain how to analyze trends in a dataset",
  },
  sugDraft: {
    fr: "Rédiger du contenu",
    es: "Redacta contenido",
    en: "Draft content",
  },
  sugDraftPrompt: {
    fr: "Rédige un email professionnel pour présenter un projet",
    es: "Escribe un email profesional para presentar un proyecto",
    en: "Write a professional email to present a project",
  },

  // ── Chat Input ──
  inputPlaceholder: {
    fr: "Écrivez votre message...",
    es: "Escribe tu mensaje...",
    en: "Type your message...",
  },
  inputLimitReached: {
    fr: "Limite quotidienne atteinte. Inscrivez-vous pour continuer.",
    es: "Limite diario alcanzado. Registrate para continuar.",
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
    es: "Limite alcanzado. Registrate para continuar.",
    en: "Limit reached. Sign up to continue.",
  },
  aiDisclaimer: {
    fr: "SYNTALYS AI peut faire des erreurs. Vérifiez les informations importantes.",
    es: "SYNTALYS AI puede cometer errores. Verifica la informacion importante.",
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
    es: "Menu",
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
    es: "Inicia sesion para acceder a todas las funciones",
    en: "Sign in to access all features",
  },
  registerSubtitle: {
    fr: "Inscrivez-vous pour débloquer tous les modèles",
    es: "Registrate para desbloquear todos los modelos",
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
    es: "Minimo 6 caracteres",
    en: "Minimum 6 characters",
  },
  yourPassword: {
    fr: "Votre mot de passe",
    es: "Tu contraseña",
    en: "Your password",
  },
  passwordTooShort: {
    fr: "Le mot de passe doit contenir au moins 6 caractères",
    es: "La contraseña debe tener al menos 6 caracteres",
    en: "Password must be at least 6 characters",
  },
  noAccount: {
    fr: "Pas de compte ?",
    es: "No tienes cuenta?",
    en: "Don't have an account?",
  },
  hasAccount: {
    fr: "Déjà un compte ?",
    es: "Ya tienes cuenta?",
    en: "Already have an account?",
  },
  register: {
    fr: "S'inscrire",
    es: "Registrate",
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
    es: "Registrate para acceder a todos los modelos",
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

  // ── Model descriptions (new TALYS generation) ──
  modelTalys20Desc: {
    fr: "Rapide, efficace et avec recherche web",
    es: "Rapido, eficiente y con busqueda web",
    en: "Fast, efficient, and with web search",
  },
  modelTalys25Desc: {
    fr: "Intelligence supérieure, analyse approfondie et raisonnement",
    es: "Mayor inteligencia, analisis profundo y razonamiento",
    en: "Higher intelligence, deep analysis, and reasoning",
  },
  modelTalys30Desc: {
    fr: "Notre modèle le plus avancé avec des capacités de dernière génération",
    es: "Nuestro modelo mas avanzado con capacidades de ultima generacion",
    en: "Our most advanced model with cutting-edge capabilities",
  },
  modelMiloDesc: {
    fr: "Génère des images à partir de texte",
    es: "Genera imagenes a partir de texto",
    en: "Generate images from text",
  },
  legacyModels: {
    fr: "Modèles anciens",
    es: "Modelos antiguos",
    en: "Legacy models",
  },

  // ── Model descriptions (legacy) ──
  modelBaseDesc: {
    fr: "Modèle de base rapide et efficace",
    es: "Modelo base rapido y eficiente",
    en: "Fast and efficient base model",
  },
  modelReasoningDesc: {
    fr: "Raisonnement avancé pour les tâches complexes",
    es: "Razonamiento avanzado para tareas complejas",
    en: "Advanced reasoning for complex tasks",
  },
  modelBetaDesc: {
    fr: "Dernier modèle avec des capacités étendues",
    es: "Ultimo modelo con capacidades ampliadas",
    en: "Latest model with expanded capabilities",
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
    es: "Nueva conversacion",
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
    es: "Que puedes hacer?",
    en: "What can you do?",
  },
  exploreUseCase1: {
    fr: "Rédiger des emails professionnels",
    es: "Redactar emails profesionales",
    en: "Draft professional emails",
  },
  exploreUseCase1Desc: {
    fr: "Créez des emails clairs et structurés pour toute situation professionnelle.",
    es: "Crea emails claros y estructurados para cualquier situacion profesional.",
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
    es: "Escribir y explicar codigo",
    en: "Write and explain code",
  },
  exploreUseCase3Desc: {
    fr: "Générez, déboguez et comprenez du code dans de nombreux langages.",
    es: "Genera, depura y comprende codigo en multiples lenguajes.",
    en: "Generate, debug and understand code in many languages.",
  },
  exploreUseCase4: {
    fr: "Traduire du contenu",
    es: "Traducir contenido",
    en: "Translate content",
  },
  exploreUseCase4Desc: {
    fr: "Traduisez des textes entre le français, l'espagnol, l'anglais et plus.",
    es: "Traduce textos entre frances, espanol, ingles y mas.",
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
    es: "Documentacion",
    en: "Documentation",
  },
  docSubtitle: {
    fr: "Guide complet pour utiliser SYNTALYS Chat AI",
    es: "Guia completa para usar SYNTALYS Chat AI",
    en: "Complete guide for using SYNTALYS Chat AI",
  },
  docGettingStarted: {
    fr: "Démarrage rapide",
    es: "Inicio rapido",
    en: "Getting started",
  },
  docGettingStartedContent: {
    fr: "Créez un compte ou utilisez le mode anonyme pour commencer à discuter avec SYNTALYS AI. Tapez votre message dans la zone de saisie et appuyez sur Entrée pour envoyer.",
    es: "Crea una cuenta o usa el modo anonimo para empezar a chatear con SYNTALYS AI. Escribe tu mensaje en el campo de texto y presiona Enter para enviar.",
    en: "Create an account or use anonymous mode to start chatting with SYNTALYS AI. Type your message in the input field and press Enter to send.",
  },
  docModels: {
    fr: "Les modèles",
    es: "Los modelos",
    en: "Models",
  },
  docModelsContent: {
    fr: "SYNTALYS AI propose trois modèles adaptés à vos besoins :",
    es: "SYNTALYS AI ofrece tres modelos adaptados a tus necesidades:",
    en: "SYNTALYS AI offers three models adapted to your needs:",
  },
  docModelBase: {
    fr: "Rapide et efficace pour les tâches quotidiennes. Disponible pour tous les utilisateurs.",
    es: "Rapido y eficiente para tareas diarias. Disponible para todos los usuarios.",
    en: "Fast and efficient for daily tasks. Available to all users.",
  },
  docModelReasoning: {
    fr: "Affiche son raisonnement étape par étape avant de répondre. Idéal pour les problèmes complexes. Nécessite un compte.",
    es: "Muestra su razonamiento paso a paso antes de responder. Ideal para problemas complejos. Requiere cuenta.",
    en: "Shows step-by-step reasoning before answering. Ideal for complex problems. Requires an account.",
  },
  docModelBeta: {
    fr: "Dernière version avec des capacités étendues en créativité, code et analyse. Nécessite un compte.",
    es: "Ultima version con capacidades ampliadas en creatividad, codigo y analisis. Requiere cuenta.",
    en: "Latest version with expanded capabilities in creativity, code and analysis. Requires an account.",
  },
  docConversations: {
    fr: "Gestion des conversations",
    es: "Gestion de conversaciones",
    en: "Conversation management",
  },
  docConversationsContent: {
    fr: "Vos conversations sont organisées dans la barre latérale par date (aujourd'hui, hier, 7 derniers jours, plus ancien). Vous pouvez renommer ou supprimer une conversation via le menu contextuel. Cliquez sur « Nouveau chat » pour démarrer une nouvelle conversation.",
    es: "Tus conversaciones se organizan en la barra lateral por fecha (hoy, ayer, ultimos 7 dias, anterior). Puedes renombrar o eliminar una conversacion desde el menu contextual. Haz clic en « Nuevo chat » para iniciar una nueva conversacion.",
    en: "Your conversations are organized in the sidebar by date (today, yesterday, last 7 days, older). You can rename or delete a conversation from the context menu. Click \"New chat\" to start a new conversation.",
  },
  docAnonymous: {
    fr: "Mode anonyme vs. Compte",
    es: "Modo anonimo vs. Cuenta",
    en: "Anonymous mode vs. Account",
  },
  docAnonymousContent: {
    fr: "En mode anonyme, vous avez accès au modèle SYNT A 1.0 avec une limite de 20 messages par jour. Vos conversations sont stockées localement dans votre navigateur. Avec un compte, vous accédez à tous les modèles, sans limite de messages, et vos conversations sont synchronisées dans le cloud.",
    es: "En modo anonimo, tienes acceso al modelo SYNT A 1.0 con un limite de 20 mensajes por dia. Tus conversaciones se guardan localmente en tu navegador. Con una cuenta, accedes a todos los modelos, sin limite de mensajes, y tus conversaciones se sincronizan en la nube.",
    en: "In anonymous mode, you have access to the SYNT A 1.0 model with a limit of 20 messages per day. Your conversations are stored locally in your browser. With an account, you access all models, with no message limit, and your conversations are synced to the cloud.",
  },
  docSettings: {
    fr: "Paramètres",
    es: "Ajustes",
    en: "Settings",
  },
  docSettingsContent: {
    fr: "Personnalisez votre expérience : choisissez le thème (clair, sombre ou système), la langue (français, espagnol, anglais), votre nom d'affichage et votre modèle par défaut. Les paramètres sont accessibles depuis l'icône dans la barre latérale.",
    es: "Personaliza tu experiencia: elige el tema (claro, oscuro o sistema), el idioma (frances, espanol, ingles), tu nombre para mostrar y tu modelo por defecto. Los ajustes se encuentran en el icono de la barra lateral.",
    en: "Customize your experience: choose the theme (light, dark or system), language (French, Spanish, English), your display name and default model. Settings are accessible from the icon in the sidebar.",
  },
  docShortcuts: {
    fr: "Raccourcis clavier",
    es: "Atajos de teclado",
    en: "Keyboard shortcuts",
  },
  docShortcutsContent: {
    fr: "Entrée : envoyer le message | Maj + Entrée : saut de ligne",
    es: "Enter: enviar mensaje | Shift + Enter: salto de linea",
    en: "Enter: send message | Shift + Enter: new line",
  },
  docFaqTitle: {
    fr: "Questions fréquentes",
    es: "Preguntas frecuentes",
    en: "FAQ",
  },
  docFaq1Q: {
    fr: "Où sont stockées mes données ?",
    es: "Donde se guardan mis datos?",
    en: "Where is my data stored?",
  },
  docFaq1A: {
    fr: "Si vous avez un compte, vos conversations sont stockées de manière sécurisée dans le cloud (Supabase). En mode anonyme, tout reste dans votre navigateur.",
    es: "Si tienes cuenta, tus conversaciones se guardan de forma segura en la nube (Supabase). En modo anonimo, todo se queda en tu navegador.",
    en: "If you have an account, your conversations are securely stored in the cloud (Supabase). In anonymous mode, everything stays in your browser.",
  },
  docFaq2Q: {
    fr: "Puis-je supprimer mon compte ?",
    es: "Puedo eliminar mi cuenta?",
    en: "Can I delete my account?",
  },
  docFaq2A: {
    fr: "Contactez-nous à hello@syntalys.ch pour toute demande de suppression de compte.",
    es: "Contactanos en hello@syntalys.ch para cualquier solicitud de eliminacion de cuenta.",
    en: "Contact us at hello@syntalys.ch for any account deletion request.",
  },
  docFaq3Q: {
    fr: "L'IA peut-elle se tromper ?",
    es: "Puede la IA equivocarse?",
    en: "Can the AI make mistakes?",
  },
  docFaq3A: {
    fr: "Oui. SYNTALYS AI peut faire des erreurs. Vérifiez toujours les informations importantes avant de les utiliser.",
    es: "Si. SYNTALYS AI puede cometer errores. Verifica siempre la informacion importante antes de usarla.",
    en: "Yes. SYNTALYS AI can make mistakes. Always verify important information before using it.",
  },

  // ── Support Page ──
  supportTitle: {
    fr: "Besoin d'aide ?",
    es: "Necesitas ayuda?",
    en: "Need help?",
  },
  supportSubtitle: {
    fr: "Notre équipe est disponible pour répondre à vos questions et résoudre vos problèmes.",
    es: "Nuestro equipo esta disponible para responder tus preguntas y resolver tus problemas.",
    en: "Our team is available to answer your questions and solve your problems.",
  },
  supportContactTitle: {
    fr: "Contactez-nous",
    es: "Contactanos",
    en: "Contact us",
  },
  supportContactDesc: {
    fr: "Envoyez-nous un email et nous vous répondrons dans les plus brefs délais.",
    es: "Envianos un email y te responderemos lo antes posible.",
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
    es: "Enlaces utiles",
    en: "Useful links",
  },
  supportViewDoc: {
    fr: "Consulter la documentation",
    es: "Consultar la documentacion",
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
    es: "Si encuentras un bug, describe el problema en detalle en tu email para que podamos resolverlo rapidamente.",
    en: "If you encounter a bug, describe the problem in detail in your email so we can resolve it quickly.",
  },

  // ── Legal Page ──
  legalTitle: {
    fr: "Mentions légales",
    es: "Informacion legal",
    en: "Legal notice",
  },
  legalInfoTitle: {
    fr: "Informations légales",
    es: "Informacion legal",
    en: "Legal information",
  },
  legalForm: {
    fr: "Forme juridique",
    es: "Forma juridica",
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
    es: "Direccion",
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
    es: "Aplicacion alojada por Vercel Inc. (San Francisco, USA). Base de datos alojada por Supabase Inc.",
    en: "Application hosted by Vercel Inc. (San Francisco, USA). Database hosted by Supabase Inc.",
  },
  legalDataTitle: {
    fr: "Protection des données",
    es: "Proteccion de datos",
    en: "Data protection",
  },
  legalDataContent: {
    fr: "Les données des utilisateurs authentifiés sont stockées de manière sécurisée dans Supabase. Les utilisateurs anonymes utilisent le stockage local du navigateur. Les messages sont traités par OpenAI pour la génération des réponses. Aucune donnée personnelle n'est partagée avec des tiers en dehors de ce traitement.",
    es: "Los datos de los usuarios autenticados se almacenan de forma segura en Supabase. Los usuarios anonimos usan el almacenamiento local del navegador. Los mensajes son procesados por OpenAI para la generacion de respuestas. Ningun dato personal se comparte con terceros fuera de este procesamiento.",
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
    es: "Este sitio utiliza el almacenamiento local del navegador para guardar tus preferencias (tema, idioma) y las sesiones anonimas. No se usan cookies de terceros con fines publicitarios.",
    en: "This site uses browser local storage to save your preferences (theme, language) and anonymous sessions. No third-party cookies are used for advertising purposes.",
  },
  legalIpTitle: {
    fr: "Propriété intellectuelle",
    es: "Propiedad intelectual",
    en: "Intellectual property",
  },
  legalIpContent: {
    fr: "L'ensemble du contenu de ce site (textes, logos, images, code) est protégé par le droit d'auteur.",
    es: "Todo el contenido de este sitio (textos, logos, imagenes, codigo) esta protegido por derechos de autor.",
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
