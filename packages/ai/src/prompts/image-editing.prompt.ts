export interface ImageEditPromptOptions {
  editInstruction: string;
  preservedElements?: string[];
  brandColors?: string[];
  brandName?: string;
  sourcePrompt?: string;
}

export function buildImageEditPrompt(options: ImageEditPromptOptions): string {
  const defaultPreserved = [
    "product geometry, textures, and details",
    "official brand logo and its placement",
    "brand typography and text contents",
    "overall high-contrast solid color aesthetic",
  ];

  const preserved = options.preservedElements && options.preservedElements.length > 0
    ? options.preservedElements
    : defaultPreserved;

  const colorDirective = options.brandColors && options.brandColors.length > 0
    ? `Brand Solid Colors: ${options.brandColors.join(", ")} (NEVER USE GRADIENTS).`
    : "Use crisp solid colors only (NO GRADIENTS).";

  const sourceContext = options.sourcePrompt
    ? `[ORIGINAL SCENE CONTEXT]: "${options.sourcePrompt}"\n`
    : "";

  return `[IMAGE EDITING DIRECTIVE - PRECISION BRAND PRESERVATION]
${sourceContext}[TARGET MODIFICATION INSTRUCTION]:
"${options.editInstruction}"

[STRICT PRESERVATION LOCKS]:
Maintain strict visual consistency with the original image. Do NOT alter:
${preserved.map((item) => `- ${item}`).join("\n")}

[COLOR & STYLING RULES]:
${colorDirective}
- Maintain crisp lighting and realistic ambient shadows matching the modified elements.
- Keep background surfaces clean, solid, and premium.`;
}
