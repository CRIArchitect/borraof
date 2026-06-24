import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ImagePlus } from "lucide-react";
import { useCompanies } from "../hooks/usecompanies";
import { useToast } from "../context/toastcontext";
import { imageService } from "../services/imageservice";
import { errMsg } from "../services/api";
import { resolveSrc, ratioById } from "../lib/imagegen";
import { stagger } from "../lib/motion";
import PageHeader from "../components/layout/pageheader";
import Button from "../components/common/button";
import EmptyState from "../components/common/emptystate";
import StudioControls from "../components/studio/studiocontrols";
import ImageCard from "../components/studio/imagecard";
import ImageEditor from "../components/studio/imageeditor";

export default function EstudioPage() {
  const { companies } = useCompanies();
  const toast = useToast();
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null); // { n, ratio }
  const [editor, setEditor] = useState(null); // { src, ratio, brand }

  const attach = (imgs, company) =>
    (imgs || []).map((im) => ({ ...im, companyName: company?.name || im.companyName, color: im.color || company?.color }));

  async function handleGenerate({ company, ...payload }) {
    setGenerating(true);
    setPending({ n: payload.n, ratio: payload.ratio });
    try {
      const data = await imageService.generate(payload);
      setImages((prev) => [...attach(data.images, company), ...prev]);
    } catch (err) {
      toast.error("Não foi possível gerar", errMsg(err));
    } finally {
      setGenerating(false);
      setPending(null);
    }
  }

  async function handleAiEdit(image, op) {
    setBusy(true);
    const labels = { variations: "Variações", "remove-bg": "Fundo removido", outpaint: "Imagem expandida", upscale: "Resolução aumentada" };
    try {
      const data = await imageService.edit({ op, seed: image.seed, ratio: image.ratio, color: image.color, prompt: image.prompt, company_id: image.company_id });
      const next = attach(data.images, { name: image.companyName, color: image.color });
      setImages((prev) => [...next, ...prev]);
      toast.success(labels[op] || "Pronto", op === "variations" ? `${next.length} novas variações` : undefined);
    } catch (err) {
      toast.error("Falha na edição", errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  function handleDownload(image) {
    const a = document.createElement("a");
    a.href = resolveSrc(image);
    a.download = `borrao-${String(image.ratio).replace(":", "x")}-${image.seed}.png`;
    a.click();
    toast.success("Imagem baixada");
  }

  function handleEdit(image) {
    setEditor({ src: resolveSrc(image), ratio: image.ratio, brand: { name: image.companyName, color: image.color } });
  }

  function handleUpload(file, company) {
    const reader = new FileReader();
    reader.onload = () => setEditor({ src: reader.result, ratio: "1:1", brand: { name: company?.name, color: company?.color } });
    reader.readAsDataURL(file);
  }

  if (!companies.length) {
    return (
      <>
        <PageHeader eyebrow="Estúdio" title="Estúdio de Imagem" />
        <EmptyState
          symbol="◐"
          title="Cadastre uma empresa primeiro"
          subtitle="O estúdio usa a cor e a identidade da marca para gerar e editar imagens."
          action={<Button onClick={() => navigate("/app/companies/new")}>+ Nova empresa</Button>}
        />
      </>
    );
  }

  const pendingAr = pending ? (() => { const r = ratioById(pending.ratio); return r.w / r.h; })() : 1;

  return (
    <>
      <PageHeader
        eyebrow="Estúdio"
        title="Estúdio de Imagem"
        subtitle="Gere visuais na identidade da marca, edite e exporte nos formatos de social."
      />

      <div className="studio-layout">
        <StudioControls companies={companies} generating={generating} onGenerate={handleGenerate} onUpload={handleUpload} />

        <div>
          <div className="studio-results-head">
            <span className="eyebrow">{images.length ? `${images.length} ${images.length > 1 ? "imagens" : "imagem"}` : "Resultados"}</span>
            {images.length > 0 && <Button variant="ghost" size="sm" onClick={() => setImages([])}>Limpar galeria</Button>}
          </div>

          {!images.length && !pending ? (
            <EmptyState
              symbol="◑"
              title="Nada gerado ainda"
              subtitle="Descreva a imagem que você quer, escolha o formato e clique em gerar — ou envie uma imagem própria para editar."
            />
          ) : (
            <motion.div className="studio-grid" variants={stagger(0.05)} initial="hidden" animate="show">
              {pending && Array.from({ length: pending.n }).map((_, i) => (
                <div key={`s${i}`} className="skeleton studio-skel" style={{ "--ar": pendingAr }} />
              ))}
              {images.map((im) => (
                <ImageCard
                  key={`${im.id}-${im.seed}`}
                  image={im}
                  busy={busy}
                  onEdit={handleEdit}
                  onAiEdit={handleAiEdit}
                  onDownload={handleDownload}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <ImageEditor
        open={!!editor}
        source={editor}
        brand={editor?.brand}
        onClose={() => setEditor(null)}
      />
    </>
  );
}
