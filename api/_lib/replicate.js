import Replicate from "replicate";

const apiToken = process.env.REPLICATE_API_TOKEN;

if (!apiToken) {
  console.error("[Borrão] REPLICATE_API_TOKEN ausente.");
}

export const replicate = new Replicate({ auth: apiToken });

export const FLUX_MODEL = "black-forest-labs/flux-schnell";
