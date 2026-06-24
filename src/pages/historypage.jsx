import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import PageHeader from "../components/layout/pageheader";
import GenerationList from "../components/generations/generationlist";
import Skeleton from "../components/common/skeleton";
import { useGenerations } from "../hooks/usegenerations";
import { useToast } from "../context/toastcontext";
import { pageTransition, stagger } from "../lib/motion";

/**
 * HistoryPage — acervo de gerações.
 * Carrega o histórico (skeletons enquanto carrega), trata erro com toast +
 * alerta inline e delega filtros/lista/detalhe ao GenerationList.
 */
export default function HistoryPage() {
  const { generations, loading, error, reload } = useGenerations();
  const toast = useToast();
  const notified = useRef(false);

  useEffect(() => {
    if (error && !notified.current) {
      notified.current = true;
      toast.error("Erro ao carregar histórico", error);
    }
    if (!error) notified.current = false;
  }, [error, toast]);

  const count = generations.length;
  const subtitle = loading
    ? "Carregando seu acervo…"
    : count === 0
    ? "Seu acervo de conteúdos gerados."
    : `${count} ${count === 1 ? "geração arquivada" : "gerações arquivadas"}.`;

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show" exit="exit">
      <PageHeader eyebrow="Acervo" title="Histórico" subtitle={subtitle} />

      {error && !loading && (
        <div className="alert alert-error" role="alert">
          <span>{error}</span>
          <button type="button" className="btn btn-ghost btn-sm ml-auto" onClick={reload}>
            Tentar novamente
          </button>
        </div>
      )}

      {loading ? (
        <motion.div
          className="hist-list"
          variants={stagger(0.05)}
          initial="hidden"
          animate="show"
          aria-busy="true"
          aria-label="Carregando histórico"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="hist-skeleton-card" key={i}>
              <div className="hist-skeleton-row">
                <Skeleton w="46%" h={15} />
                <Skeleton w={84} h={20} r={999} />
              </div>
              <Skeleton w="100%" h={12} />
              <Skeleton w="92%" h={12} />
              <Skeleton w="70%" h={12} />
              <div className="hist-skeleton-row mt-8">
                <Skeleton w={90} h={11} />
                <Skeleton w={18} h={18} r={999} />
              </div>
            </div>
          ))}
        </motion.div>
      ) : error && count === 0 ? null : (
        <GenerationList generations={generations} />
      )}
    </motion.div>
  );
}
