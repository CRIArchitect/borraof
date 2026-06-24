import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Sparkles, TrendingUp, Star, Plus, ArrowUpRight } from "lucide-react";

import PageHeader from "../components/layout/pageheader";
import Button from "../components/common/button";
import Skeleton from "../components/common/skeleton";
import Reveal from "../components/common/reveal";
import EmptyState from "../components/common/emptystate";
import StatCard from "../components/dashboard/statcard";

import { useAuth } from "../context/authcontext";
import { useCompanies } from "../hooks/usecompanies";
import { useGenerations } from "../hooks/usegenerations";
import { useToast } from "../context/toastcontext";

import { contentType, COLOR_PALETTE } from "../util/constants";
import { formatRelative } from "../util/formatdate";
import { stagger, item, ease } from "../lib/motion";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function firstName(name) {
  if (!name) return "por aí";
  return String(name).trim().split(/\s+/)[0];
}

function longDate() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Conta gerações por mês (últimos N meses) para a sparkline. */
function monthlySpark(generations, months = 6) {
  const now = new Date();
  const buckets = new Array(months).fill(0);
  for (const g of generations) {
    if (!g?.created_at) continue;
    const d = new Date(g.created_at);
    if (Number.isNaN(d.getTime())) continue;
    const diff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (diff >= 0 && diff < months) buckets[months - 1 - diff] += 1;
  }
  return buckets;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { companies, loading: loadingCompanies } = useCompanies();
  const { generations, loading: loadingGenerations, error: genError } = useGenerations();
  const toast = useToast();

  // Notifica erro de gerações uma única vez.
  const notified = useRef(false);
  useEffect(() => {
    if (genError && !notified.current) {
      notified.current = true;
      toast.error("Não foi possível carregar a atividade", genError);
    }
    if (!genError) notified.current = false;
  }, [genError, toast]);

  const safeGenerations = Array.isArray(generations) ? generations : [];
  const safeCompanies = Array.isArray(companies) ? companies : [];

  const monthCount = useMemo(() => {
    const now = new Date();
    return safeGenerations.filter((g) => {
      if (!g?.created_at) return false;
      const d = new Date(g.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [safeGenerations]);

  const spark = useMemo(() => monthlySpark(safeGenerations), [safeGenerations]);

  const favoriteType = useMemo(() => {
    if (!safeGenerations.length) return null;
    const tally = {};
    for (const g of safeGenerations) {
      if (!g?.type) continue;
      tally[g.type] = (tally[g.type] || 0) + 1;
    }
    const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
    if (!top) return null;
    return contentType(top[0])?.label || top[0];
  }, [safeGenerations]);

  const recent = useMemo(() => {
    return [...safeGenerations]
      .sort((a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0))
      .slice(0, 5);
  }, [safeGenerations]);

  const name = firstName(user?.name);
  const hello = greeting();

  return (
    <div className="dashboard">
      <PageHeader
        eyebrow={longDate()}
        title={
          <>
            {hello}, <span className="accent">{name}</span>.
          </>
        }
        subtitle={
          loadingCompanies || loadingGenerations
            ? "Carregando seu panorama..."
            : `${safeCompanies.length} ${safeCompanies.length === 1 ? "marca" : "marcas"} · ${safeGenerations.length} ${safeGenerations.length === 1 ? "geração" : "gerações"} no total. Vamos desborrar algo novo?`
        }
        actions={
          <Button icon={<Sparkles size={16} />} onClick={() => navigate("/app/generate")}>
            Gerar conteúdo
          </Button>
        }
      />

      {/* ── Stats ─────────────────────────────────────────── */}
      {loadingCompanies || loadingGenerations ? (
        <div className="stat-grid">
          {[0, 1, 2, 3].map((i) => (
            <div className="stat-card stat-card--skeleton" key={i}>
              <Skeleton w={34} h={34} r={10} />
              <Skeleton w="60%" h={30} r={8} style={{ marginTop: 18 }} />
              <Skeleton w="40%" h={11} r={4} style={{ marginTop: 12 }} />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className="stat-grid"
          variants={stagger(0.07)}
          initial="hidden"
          animate="show"
        >
          <StatCard icon={Building2} label="Empresas" value={safeCompanies.length} />
          <StatCard icon={Sparkles} label="Gerações no total" value={safeGenerations.length} />
          <StatCard
            icon={TrendingUp}
            label="Gerações no mês"
            value={monthCount}
            spark={spark}
            accent
          />
          <StatCard icon={Star} label="Tipo favorito" value={favoriteType || "—"} />
        </motion.div>
      )}

      {/* ── Suas marcas ───────────────────────────────────── */}
      <section className="dash-section">
        <Reveal className="dash-section-head">
          <h2 className="panel-title">
            <Building2 /> Suas marcas
          </h2>
          {!loadingCompanies && safeCompanies.length > 0 && (
            <button
              type="button"
              className="dash-section-link"
              onClick={() => navigate("/app/companies/new")}
            >
              Nova empresa <Plus size={13} />
            </button>
          )}
        </Reveal>

        {loadingCompanies ? (
          <div className="brand-strip">
            {[0, 1, 2].map((i) => (
              <div className="brand-tile brand-tile--skeleton" key={i}>
                <Skeleton w={14} h={14} r={999} />
                <Skeleton w="70%" h={13} r={4} style={{ marginTop: 14 }} />
                <Skeleton w="45%" h={10} r={4} style={{ marginTop: 8 }} />
              </div>
            ))}
          </div>
        ) : safeCompanies.length === 0 ? (
          <EmptyState
            symbol="◇"
            title="Nenhuma marca ainda"
            subtitle="Cadastre sua primeira marca para gerar conteúdo afinado com a voz dela."
            action={
              <Button icon={<Plus size={16} />} onClick={() => navigate("/app/companies/new")}>
                Criar marca
              </Button>
            }
          />
        ) : (
          <motion.div
            className="brand-strip"
            variants={stagger(0.05)}
            initial="hidden"
            animate="show"
          >
            {safeCompanies.map((c) => (
              <motion.button
                key={c.id}
                type="button"
                variants={item}
                whileHover={{ y: -4, transition: ease.springSnappy }}
                whileTap={{ scale: 0.98 }}
                className="brand-tile"
                onClick={() => navigate("/app/companies/" + c.id + "/edit")}
                aria-label={`Editar marca ${c.name}`}
              >
                <span
                  className="brand-tile-dot"
                  style={{ background: c.color || COLOR_PALETTE[0] }}
                  aria-hidden
                />
                <span className="brand-tile-name">{c.name}</span>
                <span className="brand-tile-segment">{c.segment || "Sem segmento"}</span>
              </motion.button>
            ))}

            <motion.button
              type="button"
              variants={item}
              whileHover={{ y: -4, transition: ease.springSnappy }}
              whileTap={{ scale: 0.98 }}
              className="brand-tile brand-tile--new"
              onClick={() => navigate("/app/companies/new")}
              aria-label="Criar nova empresa"
            >
              <span className="brand-tile-plus" aria-hidden>
                <Plus size={18} />
              </span>
              <span className="brand-tile-name">Nova empresa</span>
              <span className="brand-tile-segment">Adicionar marca</span>
            </motion.button>
          </motion.div>
        )}
      </section>

      {/* ── Atividade recente ─────────────────────────────── */}
      <section className="dash-section">
        <Reveal className="dash-section-head">
          <h2 className="panel-title">
            <Sparkles /> Atividade recente
          </h2>
          {!loadingGenerations && recent.length > 0 && (
            <button
              type="button"
              className="dash-section-link"
              onClick={() => navigate("/app/history")}
            >
              Ver tudo <ArrowUpRight size={13} />
            </button>
          )}
        </Reveal>

        {loadingGenerations ? (
          <div className="activity-list">
            {[0, 1, 2, 3].map((i) => (
              <div className="activity-card activity-card--skeleton" key={i}>
                <Skeleton w={36} h={36} r={10} />
                <div style={{ flex: 1 }}>
                  <Skeleton w="50%" h={13} r={4} />
                  <Skeleton w="80%" h={11} r={4} style={{ marginTop: 8 }} />
                </div>
              </div>
            ))}
          </div>
        ) : genError ? (
          <div className="alert alert-error" role="alert">
            {genError}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            symbol="✶"
            title="Tudo borrado por aqui"
            subtitle="Você ainda não gerou nenhum conteúdo. Que tal começar agora?"
            action={
              <Button icon={<Sparkles size={16} />} onClick={() => navigate("/app/generate")}>
                Gerar primeiro conteúdo
              </Button>
            }
          />
        ) : (
          <motion.div
            className="activity-list"
            variants={stagger(0.06)}
            initial="hidden"
            animate="show"
          >
            {recent.map((g) => {
              const t = contentType(g.type);
              const Icon = t?.icon || Sparkles;
              return (
                <motion.button
                  key={g.id}
                  type="button"
                  variants={item}
                  whileHover={{ x: 4, transition: ease.springSnappy }}
                  whileTap={{ scale: 0.995 }}
                  className="activity-card"
                  onClick={() => navigate("/app/history")}
                  aria-label={`Ver geração de ${g.company_name || "marca"}`}
                >
                  <span className="activity-icon" aria-hidden>
                    <Icon size={18} />
                  </span>
                  <span className="activity-body">
                    <span className="activity-top">
                      <span className="activity-company">{g.company_name || "Sem marca"}</span>
                      <span className="activity-type">{t?.label || g.type}</span>
                    </span>
                    <span className="activity-brief">{g.brief || "Sem briefing"}</span>
                  </span>
                  <span className="activity-meta">
                    <span className="activity-time">{formatRelative(g.created_at)}</span>
                    <ArrowUpRight size={15} className="activity-arrow" aria-hidden />
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </section>
    </div>
  );
}
