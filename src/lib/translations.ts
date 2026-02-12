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

  // ── Model descriptions ──
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
