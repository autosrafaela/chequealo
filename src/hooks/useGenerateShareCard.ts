import { CARD_STYLES, CardStyleConfig, getStylesForProfession } from '@/types/cardStyles';

export interface ProfessionItem {
  id: string;
  profession: string;
  is_primary?: boolean;
}

export interface Professional {
  id: string;
  full_name: string;
  profession: string;
  location?: string;
  rating?: number;
  review_count?: number;
  image_url?: string;
  is_verified?: boolean;
  slug?: string | null;
  professions?: ProfessionItem[];
  services?: { service_name: string }[];
  description?: string;
  phone?: string | null;
  email?: string | null;
}

type CardFormat = 'post' | 'story';

// ─── helpers ───────────────────────────────────────────────

const getProfessionDisplay = (p: Professional): string => {
  const profs: string[] = [];
  if (p.professions?.length) {
    const sorted = [...p.professions].sort((a, b) =>
      a.is_primary && !b.is_primary ? -1 : !a.is_primary && b.is_primary ? 1 : 0
    );
    sorted.forEach(pr => {
      const t = pr.profession.trim();
      if (t && !profs.includes(t)) profs.push(t);
    });
  }
  if (!profs.length && p.profession?.trim()) {
    const skip = ['otro', 'otros', 'general', 'profesional'];
    if (!skip.includes(p.profession.toLowerCase())) profs.push(p.profession);
  }
  return profs.length ? profs.join(' • ') : 'Profesional';
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
};

const drawRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const drawCircle = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
};

// ─── subtle decorative background ─────────────────────────

const drawSubtleBackground = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  style: CardStyleConfig
) => {
  // Gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, style.bgPrimary);
  grad.addColorStop(1, style.bgSecondary);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle geometric circles
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = style.accent;
  drawCircle(ctx, w * 0.85, h * 0.12, 200);
  ctx.fill();
  drawCircle(ctx, w * 0.1, h * 0.75, 160);
  ctx.fill();
  drawCircle(ctx, w * 0.7, h * 0.65, 120);
  ctx.fill();
  ctx.globalAlpha = 1;
};

// ─── main card generator ──────────────────────────────────

export const generateCard = async (
  professional: Professional,
  styleName: string = 'executive',
  format: CardFormat = 'story'
): Promise<string> => {
  const style = CARD_STYLES[styleName] || CARD_STYLES.executive;
  const isPost = format === 'post';

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = 1080;
  canvas.height = isPost ? 1080 : 1920;
  const w = canvas.width;
  const h = canvas.height;

  // 1. Background
  drawSubtleBackground(ctx, w, h, style);

  // 2. Header — "✓ Chequealo.net"
  ctx.fillStyle = style.textSecondary;
  ctx.font = '600 32px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('✓ Chequealo.net', 60, 70);

  // 3. Separator line under header
  ctx.strokeStyle = style.separatorColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 100);
  ctx.lineTo(w - 60, 100);
  ctx.stroke();

  // 4. Profile section — asymmetric
  const photoSize = isPost ? 180 : 220;
  const photoX = 60;
  const photoY = isPost ? 130 : 150;
  const photoCenterX = photoX + photoSize / 2;
  const photoCenterY = photoY + photoSize / 2;

  // Photo accent ring
  drawCircle(ctx, photoCenterX, photoCenterY, photoSize / 2 + 6);
  ctx.strokeStyle = style.accent;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Photo
  if (professional.image_url) {
    try {
      const img = await loadImage(professional.image_url);
      ctx.save();
      drawCircle(ctx, photoCenterX, photoCenterY, photoSize / 2);
      ctx.clip();
      ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
      ctx.restore();
    } catch {
      drawInitials(ctx, professional.full_name, photoCenterX, photoCenterY, photoSize / 2, style);
    }
  } else {
    drawInitials(ctx, professional.full_name, photoCenterX, photoCenterY, photoSize / 2, style);
  }

  // Name + profession — to the right of photo
  const textX = photoX + photoSize + 36;
  const textMaxW = w - textX - 60;
  const nameY = photoY + (isPost ? 50 : 60);

  ctx.fillStyle = style.textPrimary;
  ctx.font = `bold ${isPost ? 44 : 52}px Arial, sans-serif`;
  ctx.textAlign = 'left';

  // Wrap name if too long
  const nameLines = wrapText(ctx, professional.full_name.toUpperCase(), textMaxW);
  nameLines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, textX, nameY + i * (isPost ? 52 : 60));
  });

  const nameEndY = nameY + (Math.min(nameLines.length, 2) - 1) * (isPost ? 52 : 60);

  // Profession
  const profDisplay = getProfessionDisplay(professional);
  ctx.fillStyle = style.accent;
  ctx.font = `500 ${isPost ? 28 : 34}px Arial, sans-serif`;
  const profLines = wrapText(ctx, profDisplay, textMaxW);
  profLines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, textX, nameEndY + (isPost ? 44 : 52) + i * (isPost ? 36 : 42));
  });

  const profEndY = nameEndY + (isPost ? 44 : 52) + (Math.min(profLines.length, 2) - 1) * (isPost ? 36 : 42);

  // Verified badge
  if (professional.is_verified) {
    const badgeY = profEndY + (isPost ? 30 : 36);
    drawRoundRect(ctx, textX, badgeY - 20, 160, 36, 18);
    ctx.fillStyle = style.accentLight;
    ctx.fill();
    ctx.fillStyle = style.accent;
    ctx.font = `bold ${isPost ? 20 : 24}px Arial, sans-serif`;
    ctx.fillText('✓ Verificado', textX + 14, badgeY + 4);
  }

  // 5. Separator
  const sep1Y = photoY + photoSize + (isPost ? 30 : 50);
  ctx.strokeStyle = style.separatorColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, sep1Y);
  ctx.lineTo(w - 60, sep1Y);
  ctx.stroke();

  // 6. Location
  let cursorY = sep1Y + (isPost ? 40 : 50);
  if (professional.location) {
    ctx.fillStyle = style.textSecondary;
    ctx.font = `400 ${isPost ? 28 : 34}px Arial, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(`📍  ${professional.location}`, 60, cursorY);
    cursorY += isPost ? 44 : 54;
  }

  // 7. Skills pills
  const skills = (professional.services || []).slice(0, 6);
  if (skills.length > 0) {
    cursorY += isPost ? 10 : 16;
    const pillH = isPost ? 38 : 44;
    const pillPadX = isPost ? 20 : 24;
    const pillGap = isPost ? 10 : 12;
    const pillFont = `500 ${isPost ? 20 : 24}px Arial, sans-serif`;
    ctx.font = pillFont;

    let rowX = 60;
    let rowY = cursorY;
    const maxRowW = w - 120;

    for (const skill of skills) {
      const name = skill.service_name.length > 22 ? skill.service_name.slice(0, 20) + '…' : skill.service_name;
      const tw = ctx.measureText(name).width;
      const pillW = tw + pillPadX * 2;

      if (rowX + pillW > 60 + maxRowW) {
        rowX = 60;
        rowY += pillH + pillGap;
      }

      drawRoundRect(ctx, rowX, rowY, pillW, pillH, pillH / 2);
      ctx.fillStyle = style.pillBg;
      ctx.fill();

      ctx.fillStyle = style.pillText;
      ctx.font = pillFont;
      ctx.textAlign = 'left';
      ctx.fillText(name, rowX + pillPadX, rowY + pillH / 2 + (isPost ? 7 : 8));

      rowX += pillW + pillGap;
    }
    cursorY = rowY + pillH + (isPost ? 20 : 28);
  }

  // 8. Rating
  cursorY += isPost ? 6 : 12;
  if (professional.rating) {
    ctx.textAlign = 'left';
    const starSize = isPost ? 30 : 36;
    ctx.font = `${starSize}px Arial, sans-serif`;
    ctx.fillStyle = '#fbbf24';
    const filled = Math.round(professional.rating);
    let stars = '';
    for (let i = 0; i < 5; i++) stars += i < filled ? '★' : '☆';
    ctx.fillText(stars, 60, cursorY);

    const starsW = ctx.measureText(stars).width;
    ctx.fillStyle = style.textPrimary;
    ctx.font = `bold ${isPost ? 32 : 38}px Arial, sans-serif`;
    ctx.fillText(professional.rating.toFixed(1), 60 + starsW + 14, cursorY);

    if (professional.review_count) {
      ctx.fillStyle = style.textSecondary;
      ctx.font = `400 ${isPost ? 24 : 28}px Arial, sans-serif`;
      const ratingW = ctx.measureText(professional.rating.toFixed(1)).width;
      ctx.fillText(`(${professional.review_count} reseñas)`, 60 + starsW + 14 + ratingW + 10, cursorY);
    }

    cursorY += isPost ? 40 : 50;
  }

  // 9. Description / CTA text
  if (professional.description) {
    cursorY += isPost ? 6 : 12;
    ctx.fillStyle = style.textSecondary;
    ctx.font = `italic 400 ${isPost ? 24 : 28}px Arial, sans-serif`;
    ctx.textAlign = 'left';
    const descLines = wrapText(ctx, `"${professional.description}"`, w - 120);
    descLines.slice(0, 3).forEach((line, i) => {
      ctx.fillText(line, 60, cursorY + i * (isPost ? 32 : 38));
    });
    cursorY += Math.min(descLines.length, 3) * (isPost ? 32 : 38) + (isPost ? 10 : 16);
  }

  // 10. Separator
  cursorY += isPost ? 10 : 16;
  ctx.strokeStyle = style.separatorColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, cursorY);
  ctx.lineTo(w - 60, cursorY);
  ctx.stroke();

  // 11. Contact icons row
  cursorY += isPost ? 36 : 50;
  const iconSize = isPost ? 44 : 52;
  const iconGap = isPost ? 24 : 30;
  const icons = ['📞', '✉️', '💬', '✓'];
  const totalIconsW = icons.length * iconSize + (icons.length - 1) * iconGap;
  let iconX = (w - totalIconsW) / 2;

  for (const icon of icons) {
    drawCircle(ctx, iconX + iconSize / 2, cursorY, iconSize / 2);
    ctx.fillStyle = style.accentLight;
    ctx.fill();
    ctx.strokeStyle = style.accent;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = style.textPrimary;
    ctx.font = `${isPost ? 22 : 26}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(icon, iconX + iconSize / 2, cursorY + (isPost ? 8 : 9));

    iconX += iconSize + iconGap;
  }

  // 12. QR + CTA section
  const qrSectionY = isPost ? h - 320 : h - 440;
  const qrBoxH = isPost ? 220 : 280;
  const qrBoxW = w - 120;
  const qrBoxX = 60;

  drawRoundRect(ctx, qrBoxX, qrSectionY, qrBoxW, qrBoxH, 20);
  ctx.fillStyle = style.accentLight;
  ctx.fill();

  // CTA text
  ctx.fillStyle = style.textPrimary;
  ctx.font = `bold ${isPost ? 32 : 40}px Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('¡Escaneá y contactame!', qrBoxX + 30, qrSectionY + (isPost ? 50 : 60));

  // Profile URL
  const displayUrl = professional.slug
    ? `chequealo.net/${professional.slug}`
    : `chequealo.net/p/${professional.id.substring(0, 8)}`;
  ctx.fillStyle = style.textSecondary;
  ctx.font = `400 ${isPost ? 22 : 26}px Arial, sans-serif`;
  ctx.fillText(displayUrl, qrBoxX + 30, qrSectionY + (isPost ? 88 : 105));

  // QR code image (Google Charts API)
  const profileUrl = professional.slug
    ? `https://chequealo.net/${professional.slug}`
    : `https://chequealo.net/professional/${professional.id}`;
  const qrSize = isPost ? 140 : 180;
  const qrX = qrBoxX + qrBoxW - qrSize - 30;
  const qrY = qrSectionY + (qrBoxH - qrSize) / 2;

  try {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(profileUrl)}&bgcolor=${style.qrBg === '#ffffff' ? 'fff' : '0f172a'}&color=${style.qrBg === '#ffffff' ? '000' : 'fff'}&margin=0`;
    const qrImg = await loadImage(qrApiUrl);
    // Draw QR background
    drawRoundRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 12);
    ctx.fillStyle = style.qrBg;
    ctx.fill();
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } catch {
    // Fallback: just show text
    ctx.fillStyle = style.textSecondary;
    ctx.font = `400 ${isPost ? 18 : 22}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('[QR]', qrX + qrSize / 2, qrY + qrSize / 2);
  }

  // 13. Footer branding
  ctx.fillStyle = style.textSecondary;
  ctx.font = `400 ${isPost ? 22 : 26}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Profesionales verificados de confianza', w / 2, h - (isPost ? 50 : 70));

  return canvas.toDataURL('image/png');
};

// ─── draw initials fallback ───────────────────────────────

const drawInitials = (
  ctx: CanvasRenderingContext2D,
  fullName: string,
  cx: number,
  cy: number,
  radius: number,
  style: CardStyleConfig
) => {
  ctx.save();
  drawCircle(ctx, cx, cy, radius);
  ctx.fillStyle = style.accentLight;
  ctx.fill();
  ctx.fillStyle = style.accent;
  ctx.font = `bold ${radius * 0.8}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  ctx.fillText(initials, cx, cy);
  ctx.restore();
};

// ─── hook ─────────────────────────────────────────────────

export const useGenerateShareCard = () => {
  const generateMultipleCards = async (
    professional: Professional,
    format: CardFormat = 'story'
  ): Promise<{ style: string; url: string; config: CardStyleConfig }[]> => {
    const suggestedStyles = getStylesForProfession(professional.profession, professional.professions);

    return Promise.all(
      suggestedStyles.map(async (styleName) => ({
        style: styleName,
        url: await generateCard(professional, styleName, format),
        config: CARD_STYLES[styleName],
      }))
    );
  };

  const generateRandomCards = async (
    professional: Professional,
    format: CardFormat = 'story',
    count: number = 3
  ): Promise<{ style: string; url: string; config: CardStyleConfig }[]> => {
    const allStyles = Object.keys(CARD_STYLES);
    const randomStyles = allStyles.sort(() => Math.random() - 0.5).slice(0, count);

    return Promise.all(
      randomStyles.map(async (styleName) => ({
        style: styleName,
        url: await generateCard(professional, styleName, format),
        config: CARD_STYLES[styleName],
      }))
    );
  };

  return { generateCard, generateMultipleCards, generateRandomCards };
};
