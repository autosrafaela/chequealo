import { CARD_STYLES, CardStyleConfig, getStylesForProfession } from '@/types/cardStyles';

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
}

type CardFormat = 'post' | 'story';

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const drawRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

const drawDecorativePattern = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  style: CardStyleConfig
) => {
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';

  switch (style.patternType) {
    case 'circles':
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 200 + 100,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      break;

    case 'lines':
      ctx.lineWidth = 2;
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 120 - 300, 0);
        ctx.lineTo(i * 120 + 300, canvas.height);
        ctx.stroke();
      }
      break;

    case 'waves':
      ctx.lineWidth = 3;
      for (let y = 100; y < canvas.height; y += 120) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < canvas.width; x += 60) {
          ctx.quadraticCurveTo(x + 30, y - 40, x + 60, y);
        }
        ctx.stroke();
      }
      break;

    case 'triangles':
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 120 + 60;
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size, y + size);
        ctx.lineTo(x + size, y + size);
        ctx.closePath();
        ctx.fill();
      }
      break;

    case 'dots':
      for (let x = 40; x < canvas.width; x += 60) {
        for (let y = 40; y < canvas.height; y += 60) {
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
  }

  ctx.globalAlpha = 1;
};

export const generateCard = async (
  professional: Professional,
  styleName: string = 'modern',
  format: CardFormat = 'story'
): Promise<string> => {
  const style = CARD_STYLES[styleName] || CARD_STYLES.modern;
  const isPost = format === 'post';
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = 1080;
  canvas.height = isPost ? 1080 : 1920;
  const w = canvas.width;
  const h = canvas.height;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, style.gradient[0]);
  gradient.addColorStop(1, style.gradient[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  // Decorative pattern
  drawDecorativePattern(ctx, canvas, style);

  // Logo "✓ Chequealo.ar" at top
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.font = 'bold 42px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('✓ Chequealo.ar', 50, 80);

  // Profile photo
  const photoSize = isPost ? 200 : 260;
  const photoX = (w - photoSize) / 2;
  const photoY = isPost ? 160 : 360;

  // Photo glow
  ctx.save();
  ctx.beginPath();
  ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + 10, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fill();
  ctx.restore();

  // Draw photo or initials
  if (professional.image_url) {
    try {
      const img = await loadImage(professional.image_url);
      ctx.save();
      ctx.beginPath();
      ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
      ctx.restore();
    } catch {
      drawInitials(ctx, professional.full_name, photoX, photoY, photoSize);
    }
  } else {
    drawInitials(ctx, professional.full_name, photoX, photoY, photoSize);
  }

  // Verified/Available badge
  ctx.save();
  ctx.beginPath();
  ctx.arc(photoX + photoSize - 15, photoY + photoSize - 15, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#10b981';
  ctx.fill();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();

  // Name
  const nameY = photoY + photoSize + (isPost ? 45 : 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${isPost ? 48 : 58}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(professional.full_name.toUpperCase(), w / 2, nameY);

  // Profession
  ctx.font = `${isPost ? 32 : 40}px Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText(professional.profession, w / 2, nameY + (isPost ? 45 : 55));

  // Rating stars
  const ratingY = nameY + (isPost ? 110 : 130);
  if (professional.rating) {
    const starSize = isPost ? 32 : 40;
    const totalStars = 5;
    const filledStars = Math.round(professional.rating);
    ctx.font = `${starSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';

    let starsText = '';
    for (let i = 0; i < totalStars; i++) {
      starsText += i < filledStars ? '★' : '☆';
    }
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(starsText, w / 2, ratingY);

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${isPost ? 36 : 44}px Arial, sans-serif`;
    const ratingText = `${professional.rating.toFixed(1)}`;
    const reviewsText = professional.review_count ? ` (${professional.review_count})` : '';
    ctx.fillText(ratingText + reviewsText, w / 2, ratingY + (isPost ? 50 : 60));
  }

  // Verified badge
  const badgesY = ratingY + (isPost ? 100 : 120);
  if (professional.is_verified) {
    const badgeWidth = 200;
    const badgeHeight = 48;
    const badgeX = w / 2 - badgeWidth / 2;

    ctx.save();
    drawRoundRect(ctx, badgeX, badgesY - badgeHeight / 2, badgeWidth, badgeHeight, 24);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${isPost ? 26 : 30}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('✓ Verificado', w / 2, badgesY + 10);
  }

  // Location
  const locationY = badgesY + (isPost ? 60 : 80);
  if (professional.location) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `${isPost ? 28 : 34}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`📍 ${professional.location}`, w / 2, locationY);
  }

  // CTA Section
  const ctaY = isPost ? h - 260 : h - 420;
  const ctaWidth = w - 140;
  const ctaHeight = isPost ? 120 : 140;
  const ctaX = (w - ctaWidth) / 2;

  ctx.save();
  drawRoundRect(ctx, ctaX, ctaY, ctaWidth, ctaHeight, 28);
  const ctaGradient = ctx.createLinearGradient(ctaX, ctaY, ctaX + ctaWidth, ctaY);
  ctaGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
  ctaGradient.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
  ctx.fillStyle = ctaGradient;
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#fff';
  ctx.font = `bold ${isPost ? 38 : 48}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('¡Contactame!', w / 2, ctaY + (isPost ? 50 : 60));

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = `${isPost ? 24 : 30}px Arial, sans-serif`;
  ctx.fillText('Tocá el link para ver mi perfil', w / 2, ctaY + (isPost ? 88 : 105));

  // Profile URL - use slug if available
  const urlY = isPost ? h - 100 : h - 200;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = `${isPost ? 26 : 30}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Ver perfil completo en:', w / 2, urlY);

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${isPost ? 32 : 38}px Arial, sans-serif`;
  const displayUrl = professional.slug
    ? `chequealo.ar/${professional.slug}`
    : `chequealo.ar/p/${professional.id.substring(0, 8)}`;
  ctx.fillText(displayUrl, w / 2, urlY + (isPost ? 42 : 50));

  // Footer branding
  if (!isPost) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '26px Arial, sans-serif';
    ctx.fillText('Profesionales verificados de confianza', w / 2, h - 80);
  }

  return canvas.toDataURL('image/png');
};

const drawInitials = (
  ctx: CanvasRenderingContext2D,
  fullName: string,
  photoX: number,
  photoY: number,
  photoSize: number
) => {
  ctx.save();
  ctx.beginPath();
  ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 72px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  ctx.fillText(initials, photoX + photoSize / 2, photoY + photoSize / 2);
  ctx.restore();
};

export const useGenerateShareCard = () => {
  const generateMultipleCards = async (
    professional: Professional,
    format: CardFormat = 'story'
  ): Promise<{ style: string; url: string; config: CardStyleConfig }[]> => {
    const suggestedStyles = getStylesForProfession(professional.profession);

    const cards = await Promise.all(
      suggestedStyles.map(async (styleName) => {
        const url = await generateCard(professional, styleName, format);
        return {
          style: styleName,
          url,
          config: CARD_STYLES[styleName],
        };
      })
    );

    return cards;
  };

  const generateRandomCards = async (
    professional: Professional,
    format: CardFormat = 'story',
    count: number = 3
  ): Promise<{ style: string; url: string; config: CardStyleConfig }[]> => {
    const allStyles = Object.keys(CARD_STYLES);
    const randomStyles = allStyles.sort(() => Math.random() - 0.5).slice(0, count);

    const cards = await Promise.all(
      randomStyles.map(async (styleName) => {
        const url = await generateCard(professional, styleName, format);
        return {
          style: styleName,
          url,
          config: CARD_STYLES[styleName],
        };
      })
    );

    return cards;
  };

  return {
    generateCard,
    generateMultipleCards,
    generateRandomCards,
  };
};
