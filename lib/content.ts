/**
 * CMS-managed content, shared by the public pages and prisma/seed.ts.
 * Once the database is seeded, the pages read from Postgres and this file
 * serves only as the seed source of truth.
 */

export const teamMembers = [
  {
    name: "Mohammed Abdoullahi",
    flag: "🇲🇱",
    role: "CEO",
    bio: "Co-founder & executive director guiding operations and deployments.",
    photo: "/mahmud.jpeg",
  },
  {
    name: "Shuaibu Shehu",
    flag: "🇳🇬",
    role: "CTO",
    bio: "Co-founder leading machine learning pipelines and low-power hardware engineering.",
    photo: "/shuaibu.jpeg",
  },
  {
    name: "Dr. Ousmane Ly",
    flag: "ML",
    role: "Clinical Research",
    bio: "Oversight of diagnostic verification protocols and trial coordination.",
    photo: "/placeholder-user.jpg",
  },
  {
    name: "Dr. Bourama Tangara",
    flag: "🇬🇭",
    role: "Community Partnerships",
    bio: "Fostering regional trust, managing clinic integrations and onboarding.",
    photo: "/placeholder-user.jpg",
  },
  {
    name: "Dr Adama Bréhima Cissouma",
    flag: "🇧🇷",
    role: "Ethics",
    bio: "Guiding data privacy compliance, model auditing, and clinical equity.",
    photo: "/placeholder-user.jpg",
  },
  {
    name: "Dr Moussa Camara",
    flag: "🇰🇪",
    role: "Field Operations",
    bio: "Leading infrastructure set-up and direct support for rural health workers.",
    photo: "/placeholder-user.jpg",
  },
  {
    name: "Dr Ibrahim Sokoré",
    flag: "🇰🇪",
    role: "Field Operations",
    bio: "Leading infrastructure set-up and direct support for rural health workers.",
    photo: "/placeholder-user.jpg",
  },
]

export const partnersList = [
  {
    initial: "A",
    name: "Addis Ababa University",
    region: "Ethiopia",
    type: "Research Partner",
    body: "Co-designing mobile camera malaria diagnostics and validating algorithmic models within local regional clinical labs.",
  },
  {
    initial: "U",
    name: "Université Cheikh Anta Diop",
    region: "Senegal",
    type: "Research Partner",
    body: "Pioneering end-to-end laparoscope embedded AI models optimized for rural clinical environments.",
  },
  {
    initial: "P",
    name: "Pan-African Health",
    region: "Regional Alliance",
    type: "Clinical Partner",
    body: "Deploying handheld and offline-first cell counters across community clinics in multiple sub-Saharan territories.",
  },
  {
    initial: "J",
    name: "Johns Hopkins",
    region: "United States",
    type: "Research Partner",
    body: "Collaborative research on deep-learning screening models specialized for highly compressed mammography scans.",
  },
  {
    initial: "W",
    name: "WHO Africa Office",
    region: "International",
    type: "Strategic Partner",
    body: "Facilitating high-level roundtable discussions on regulatory standards for open source diagnostics.",
  },
  {
    initial: "G",
    name: "Gates Foundation",
    region: "United States",
    type: "Strategic Partner",
    body: "Supporting development of low-power on-device model architectures for remote clinics.",
  },
]

export const faqList = [
  {
    category: "General",
    question: "What is CodeTherapy's mission?",
    answer:
      "We build robust, clinically-validated AI diagnostics that run locally, so world-class medical intelligence reaches every low-resource clinic. We believe high-quality healthcare is a fundamental human right, not a privilege — and we co-create with the frontline health workers who will actually use the tools.",
  },
  {
    category: "Partnerships",
    question: "How can my institution partner with CodeTherapy?",
    answer:
      "Start by submitting an inquiry describing your research focus, local clinical needs, or available testing infrastructure. From there we co-design validation protocols and offline deployment configurations with your team, then integrate, evaluate, and deploy the validated system into frontline clinics.",
  },
  {
    category: "Technical",
    question: "Are your AI models open-source?",
    answer:
      "Yes. Every diagnostic model we ship is open-source and publicly auditable. We thoroughly reject exploitative medical datasets, and we publish our weights, evaluation results, and release notes so partner institutions can verify our claims independently.",
  },
  {
    category: "General",
    question: "What regions do you currently operate in?",
    answer:
      "Our headquarters is in Bamako, Mali, with offices in Addis Ababa, Ethiopia and Lagos, Nigeria. Through our partner network we support deployments across 23 countries, concentrated in sub-Saharan Africa but extending to collaborators in India and the United States.",
  },
  {
    category: "Research",
    question: "How do you ensure ethical AI development?",
    answer:
      "Ethical courage is one of our core ideals. We build with medical institutions and clinicians inside their own clinics rather than from isolated hubs, we refuse datasets gathered without meaningful consent, and every model is open to public audit. A dedicated ethics lead oversees data privacy compliance, model auditing, and clinical equity.",
  },
  {
    category: "Careers",
    question: "Can I contribute to your research as an individual?",
    answer:
      "Absolutely. Clinicians, ML engineers, and biomedical hardware specialists all contribute to our open-source repositories. Active residency, fellowship, and core developer postings are updated weekly on our LinkedIn organizational channel — or reach out directly through our contact form.",
  },
  {
    category: "Technical",
    question: "What technologies do you use?",
    answer:
      "Our stack spans on-device machine learning, computer vision and object detection, convolutional networks for medical imaging, and edge AI with IoT sensing. Models are optimized to run offline on accessible hardware — including sub-$50 devices and mid-tier consumer smartphones.",
  },
  {
    category: "General",
    question: "How is CodeTherapy funded?",
    answer:
      "We are supported by philanthropic foundations and research grants, including the Gates Foundation and the Google AI for Social Good programme, alongside institutional research partnerships. We take no funding that would require us to close-source a diagnostic model.",
  },
]

/** Defaults for the Setting table — editable from Settings → General. */
export const settingsDefaults: Record<string, unknown> = {
  siteName: "CodeTherapy",
  siteDescription:
    "Pioneering open-source AI diagnostics designed for and with frontline health workers in underserved communities across Africa and globally.",
  siteUrl: "https://codetherapy.ml",
  primaryAccent: "#00719D",
  secondaryAccent: "#0B3C5D",
  standardLogo: "/brand/wordmark-light.png",
  darkModeLogo: "/brand/wordmark-dark.png",
  socialLinks: {
    twitter: "https://twitter.com/codetherapy",
    linkedin: "https://linkedin.com/company/codetherapy-labs",
    github: "https://github.com/CodeTherapy-ML",
    youtube: "https://youtube.com/c/codetherapy",
  },
  contactEmail: "contact@codetherapy.ml",
  notifications: {
    emailOnComment: true,
    emailOnFormSubmission: true,
    weeklyAnalyticsDigest: false,
    draftReminder7Days: true,
  },
  monthlyVisitors: 12400,
  // KPI trend badges — deltas shown on the dashboard until analytics exist.
  publishedDelta: "+3",
  draftDelta: "-1",
  projectsDelta: "0",
  visitorsDelta: "+14.2%",
  cmsVersion: "v1.4.2",
}
