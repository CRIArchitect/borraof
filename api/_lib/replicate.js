import Replicate from "replicate";

const apiToken = process.env.REPLICATE_API_TOKEN;

if (!apiToken) {
  console.error("[Borrão] REPLICATE_API_TOKEN ausente.");
}

export const replicate = new Replicate({ auth: apiToken || "placeholder-token" });

export const FLUX_MODEL = "black-forest-labs/flux-schnell";
export const REMBG_MODEL = "lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1";
export const OUTPAINT_MODEL = "bria/expand-image";
