import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, FileWarning, Layers3, ImageOff,
  Clapperboard, Megaphone, Camera, Mail, Lightbulb, Target, Image as ImageIcon, Clock,
} from "lucide-react";

const PROBLEMS = [
  { icon: FileWarning, k: "Página em branco", p: "Toda peça começa do zero: redigitar tom, público e contexto antes de escrever a primeira linha." },
  { icon: Layers3, k: "Tom que escorrega", p: "Cada pessoa escreve diferente. A marca soa de um jeito no post e de outro no e-mail." },
  { icon: ImageOff, k: "Imagem trava o ritmo", p: "Visual de qualidade custa caro e demora. O conteúdo fica refém da produção." },
];

const STEPS = [
  { n: "Δ01", h: "Cadastre a marca", p: "Tom de voz, público, vocabulário que usa e o que evita, estilo visual. O DNA da marca — uma vez só." },
  { n: "Δ02", h: "Descreva o briefing", p: "Uma frase do que você quer comunicar. Sem prompt engineering, sem reescrever contexto a cada peça." },
  { n: "Δ03", h: "Receba no DNA da marca", p: "Texto e imagem prontos, no tom e na identidade certos — em segundos, não em horas." },
];

const FEATURES = [
  { icon: Clapperboard, k: "Roteiro de vídeo" },
  { icon: Megaphone, k: "Copy & anúncios" },
  { icon: Camera, k: "Legenda de Instagram" },
  { icon: Mail, k: "E-mail marketing" },
  { icon: Lightbulb, k: "Ideias de conteúdo" },
  { icon: Target, k: "CTAs de conversão" },
  { icon: ImageIcon, k: "Estúdio de imagem" },
  { icon: Clock, k: "Histórico vivo" },
];

export default function LandingPage() {
  const heroRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".lp-rev").forEach((el) => io.observe(el));

    const beam = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add("lit"); }),
      { threshold: 0.35 }
    );
    if (closeRef.current) beam.observe(closeRef.current);

    return () => { io.disconnect(); beam.disconnect(); };
  }, []);

  function onMove(e) {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <div className="lp">
      <nav className="lp-nav">
        <span className="lp-brand">Borr<span className="a">ã</span>o</span>
        <div className="lp-nav-r">
          <Link to="/login" className="lp-nav-link">Entrar</Link>
          <Link to="/register" className="lp-btn lp-btn-fill" style={{ padding: "12px 18px" }}>
            Começar <ArrowRight />
          </Link>
        </div>
      </nav>

      {/* HERO — desborrar */}
      <header className="lp-hero" ref={heroRef} onMouseMove={onMove}>
        <div className="lp-field lp-field-blur" aria-hidden><span>BORRÃO</span></div>
        <div className="lp-field lp-field-sharp" aria-hidden><span>BORRÃO</span></div>
        <div className="lp-lens" aria-hidden />

        <div className="lp-wrap">
          <div className="lp-tag">Estúdio de IA · by CRÏΔ</div>
          <h1 className="lp-h1">Do <span className="o">borrão</span> à marca.</h1>
          <p className="lp-hero-sub">
            Briefing entra, <b>conteúdo no DNA da marca</b> sai — texto e imagem no tom, no público
            e no estilo visual de cada cliente. <b>Tech de criatividade.</b>
          </p>
          <div className="lp-cta-row">
            <Link to="/register" className="lp-btn lp-btn-fill">Começar agora <ArrowRight /></Link>
            <Link to="/login" className="lp-btn">Já tenho conta</Link>
          </div>
        </div>

        <div className="lp-scroll">Passe o cursor — desborre</div>
      </header>

      {/* PROBLEMA */}
      <section className="lp-section">
        <div className="lp-wrap">
          <div className="lp-eyebrow lp-rev">O problema</div>
          <h2 className="lp-h2 lp-rev">Conteúdo bom morre na <span className="o">página em branco</span>.</h2>
          <p className="lp-lead lp-rev">
            Multiplique o "começar do zero" por cada cliente, cada formato, cada semana — e some o custo de
            produzir imagem. O ritmo trava e o DNA da marca se perde no caminho.
          </p>
          <div className="lp-grid lp-rev">
            {PROBLEMS.map((c) => (
              <div className="lp-cell" key={c.k}>
                <div className="lp-cell-k"><c.icon /> {c.k}</div>
                <p>{c.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="lp-section">
        <div className="lp-wrap">
          <div className="lp-eyebrow lp-rev">A virada</div>
          <h2 className="lp-h2 lp-rev">Três passos. <span className="o">Zero</span> retrabalho.</h2>
          <div className="lp-steps">
            {STEPS.map((s) => (
              <div className="lp-step lp-rev" key={s.n}>
                <span className="lp-step-n">{s.n}</span>
                <div>
                  <h3>{s.h}</h3>
                  <p>{s.p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="lp-section">
        <div className="lp-wrap">
          <div className="lp-eyebrow lp-rev">O que dá pra criar</div>
          <h2 className="lp-h2 lp-rev">Tudo no <span className="o">DNA</span> da marca.</h2>
          <div className="lp-grid lp-rev">
            {FEATURES.map((f) => (
              <div className="lp-cell" key={f.k}>
                <div className="lp-cell-k"><f.icon /> {f.k}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FECHAMENTO — do borrão ao foco */}
      <section className="lp-close" ref={closeRef}>
        <div className="lp-close-glow" aria-hidden />
        <div className="lp-close-beam" aria-hidden />
        <div className="lp-close-in">
          <span className="delta">Δ</span>
          <h2>Sua próxima campanha sai de um <span className="o">borrão</span> — ou de uma página em branco?</h2>
          <Link to="/register" className="lp-btn lp-btn-fill">Criar conta grátis <ArrowRight /></Link>
        </div>
      </section>

      <footer className="lp-footer">Borr<b>ã</b>o · by CRÏΔ · Grupo BMZ © {new Date().getFullYear()}</footer>
    </div>
  );
}
