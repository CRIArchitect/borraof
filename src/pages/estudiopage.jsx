import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCompanies } from "../hooks/usecompanies";
import { useToast } from "../context/toastcontext";
import { imageService } from "../services/imageservice";
import { errMsg } from "../services/api";
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
  const [pending, setPending] = useState(0);
  const [editor, setEditor] = useState(null);

  function adapt(data, company, extra = {}) {
    return {
      id: data.id || data.image_url,
      url: data.image_url,
      prompt: data.prompt_used || extra.prompt,
      classification: data.classification,
      company_id: company?.id,
      companyName: company?.name || extra.companyName,
      color: company?.color || extra.color,
      ratio: data.ratio || "1:1",
      seed: data.id || Date.now(),
      created_at: data.created_at,
      ...extra,
    };
  }

  async function handleGenerate(payload) {
    const company = payload.company;
    const brief = payload.prompt || payload.brief || "";
    if (!company?.id || !brief.trim()) {
      toast.error("Faltam dados", "Escolha uma empresa e descreva a imagem.");
      return;
    }
    setGenerating(true);
    setPending(payload.n || 1);
    try {
      const data = await imageService.generate(company.id, brief, { ratio: payload.ratio, n: payload.n, seed: payload.seed });
      const list = (Array.isArray(data.images) ? data.images : [data]).map((d) => adapt(d, company));
      setImages((prev) => [...list, ...prev]);
    } catch (err) {
      toast.error("Não foi possível gerar", errMsg(err));
    } finally {
      setGenerating(false);
      setPending(0);
    }
  }

  async function handleAiEdit(image, op, extraInput) {
    setBusy(true);
    try {
      if (op === "variations") {
        const data = await imageService.variations(image.prompt || "Variação visual da marca", image.company_id);
        const news = (data.images || []).map((d) => adapt(d, null, {
          companyName: image.companyName, color: image.color, prompt: image.prompt, company_id: image.company_id,
        }));
        setImages((prev) => [...news, ...prev]);
        toast.success(`${news.length} variações geradas`);
      } else if (op === "remove-bg") {
        const data = await imageService.removeBg(image.url, image.company_id);
        setImages((prev) => [adapt(data, null, {
          companyName: image.companyName, color: image.color, prompt: "Fundo removido", company_id: image.company_id,
        }), ...prev]);
        toast.success("Fundo removido");
      } else if (op === "outpaint") {
        const direction = extraInput?.direction || "all";
        const data = await imageService.outpaint(image.url, direction, image.company_id);
        setImages((prev) => [adapt(data, null, {
          companyName: image.companyName, color: image.color, prompt: `Expandido (${direction})`, company_id: image.company_id,
        }), ...prev]);
        toast.success("Imagem expandida");
      }
    } catch (err) {
      toast.error("Falha na edição", errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  function handleDownload(image) {
    const a = document.createElement("a");
    a.href = image.url;
    a.download = `borrao-${image.seed || Date.now()}.png`;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.click();
    toast.success("Imagem baixada");
  }

  function handleEdit(image) {
    setEditor({
      src: image.url, ratio: image.ratio || "1:1",
      brand: { name: image.companyName, color: image.color },
    });
  }

  function handleUpload(file, company) {
    const reader = new FileReader();
    reader.onload = () => setEditor({
      src: reader.result, ratio: "1:1",
      brand: { name: company?.name, color: company?.color },
    });
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
              subtitle="Descreva a imagem que você quer e clique em gerar. A IA cria um visual na identidade da marca em poucos segundos."
            />
          ) : (
            <motion.div className="studio-grid" variants={stagger(0.05)} initial="hidden" animate="show">
              {pending > 0 && Array.from({ length: pending }).map((_, i) => (
                <div key={`sk-${i}`} className="skeleton studio-skel" style={{ "--ar": 1 }} />
              ))}
              {images.map((im) => (
                <ImageCard key={`${im.id}-${im.seed}`} image={im} busy={busy} onEdit={handleEdit} onAiEdit={handleAiEdit} onDownload={handleDownload} />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <ImageEditor open={!!editor} source={editor} brand={editor?.brand} onClose={() => setEditor(null)} />
    </>
  );
}
