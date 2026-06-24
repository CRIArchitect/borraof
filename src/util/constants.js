import { Clapperboard, Megaphone, Lightbulb, Camera, Mail, Target } from "lucide-react";

export const CONTENT_TYPES = [
  { value: "roteiro", label: "Roteiro de Vídeo", icon: Clapperboard, emoji: "🎬", desc: "Estrutura cena a cena para Reels, TikTok ou YouTube." },
  { value: "copy", label: "Copy para Post", icon: Megaphone, emoji: "✍️", desc: "Texto persuasivo para feed e anúncios." },
  { value: "ideia", label: "Ideia de Conteúdo", icon: Lightbulb, emoji: "💡", desc: "Pautas e conceitos para o calendário." },
  { value: "legenda", label: "Legenda Instagram", icon: Camera, emoji: "📸", desc: "Legenda com hook, corpo e CTA." },
  { value: "email", label: "E-mail Marketing", icon: Mail, emoji: "📧", desc: "Assunto + corpo para campanhas." },
  { value: "cta", label: "CTA / Chamada", icon: Target, emoji: "🎯", desc: "Chamadas curtas de alta conversão." },
];

export const TONES = [
  "Profissional", "Descontraído", "Inspiracional",
  "Urgente", "Educativo", "Divertido", "Empático", "Autoritário",
];

export const COLOR_PALETTE = [
  "#FC4B08", "#E8FF47", "#FF6B6B", "#4ECDC4",
  "#FFB347", "#C77DFF", "#74C0FC", "#FF85A1",
  "#69DB7C", "#FFC078", "#A9E34B", "#38BDF8",
];

export const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const BRIEF_SUGGESTIONS = [
  "Lançamento de produto novo com promoção de pré-venda",
  "Post educativo respondendo a principal dúvida do cliente",
  "Bastidores da equipe para gerar conexão",
  "Prova social com depoimento de cliente",
  "Oferta relâmpago de fim de semana",
];

export function contentType(value) {
  return CONTENT_TYPES.find((t) => t.value === value);
}
