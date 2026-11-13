import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Crown,
  Fish,
  Heart,
  Infinity as InfinityIcon,
  Map,
  Music,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage';
import { PenguinMilestoneBadgeId, PenguinProgress } from '../types/game';
import { penguinMusic, sfx, speakVietnamese } from '../utils/audio';
import {
  appendEndlessChunk,
  buildStageCourse,
  ICE_CHAPTERS,
  IceCollectible,
  IceFloe,
  normalizePenguinProgress,
  PENGUIN_MILESTONE_BADGES,
  PENGUIN_PHYSICS,
  PENGUIN_STAGES,
  PenguinStageConfig,
  SkyBird,
} from './penguinStages';
import { PenguinStageMap } from './PenguinStageMap';

interface PenguinIceGameProps {
  soundEnabled: boolean;
  voiceEnabled: boolean;
  isPaused: boolean;
  savedProgress?: PenguinProgress;
  onUpdateProgress?: (progress: PenguinProgress) => void;
  onRecordStars?: (starsEarned: number) => void;
  onShowVictory?: () => void;
  onComplete: (starsEarned: number) => void;
}

type ViewMode = 'title' | 'map' | 'stage' | 'endless';

const CARD_ART_URL = '/src/assets/images/game_card_penguin_ice_1794565785056.jpg';
const BACKDROP_URL = '/src/assets/images/penguin_ice_backdrop_1794565785654.jpg';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface FloatingPopup {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

interface SnowFlake {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  alpha: number;
  bokeh?: boolean;
}

interface SeaCreature {
  x: number;
  yOffset: number;
  speed: number;
  size: number;
  color: string;
  phase: number;
  kind: 'fish' | 'jelly' | 'star';
}

interface PenguinEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  grounded: boolean;
  currentFloeId: number;
  lastSafeFloeId: number;
  splashing: boolean;
  splashTimer: number;
  landSquash: number;
  landWobble: number;
  blinkTimer: number;
}

function drawIceFloe(
  ctx: CanvasRenderingContext2D,
  floe: IceFloe,
  camX: number,
  timeSec: number,
  waterSurfaceY: number
) {
  if (floe.sunk) return;
  const screenX = floe.x - camX;
  const sinkOffset = floe.cracking
    ? (floe.crackElapsed / floe.crackDuration) * 14 +
      Math.sin(timeSec * 32) * (floe.crackElapsed > floe.crackDuration * 0.55 ? 2.5 : 0.8)
    : 0;
  const bobOffset = Math.sin(timeSec * 1.9 + floe.bobPhase) * 2.5;
  const topY = floe.y + bobOffset + sinkOffset;
  const w = floe.width;
  const h = floe.height;

  ctx.save();

  // Deep translucent underwater iceberg root (visible through clear turquoise water)
  const rootDepth = Math.max(48, h + 32);
  const rootGrad = ctx.createLinearGradient(screenX, topY + 14, screenX, topY + rootDepth);
  if (floe.kind === 'cracked') {
    rootGrad.addColorStop(0, 'rgba(56, 189, 248, 0.58)');
    rootGrad.addColorStop(0.6, 'rgba(14, 116, 144, 0.42)');
    rootGrad.addColorStop(1, 'rgba(12, 74, 110, 0.08)');
  } else {
    rootGrad.addColorStop(0, 'rgba(34, 211, 238, 0.62)');
    rootGrad.addColorStop(0.55, 'rgba(6, 182, 212, 0.42)');
    rootGrad.addColorStop(1, 'rgba(14, 116, 144, 0.06)');
  }
  ctx.fillStyle = rootGrad;
  ctx.beginPath();
  ctx.moveTo(screenX + 6, topY + 14);
  ctx.lineTo(screenX + w - 6, topY + 14);
  ctx.lineTo(screenX + w * 0.86, topY + rootDepth * 0.72);
  ctx.lineTo(screenX + w * 0.56, topY + rootDepth);
  ctx.lineTo(screenX + w * 0.22, topY + rootDepth * 0.78);
  ctx.closePath();
  ctx.fill();

  // Waterline foam ring hugging iceberg base
  const foamY = Math.max(topY + 18, waterSurfaceY + 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.36)';
  ctx.beginPath();
  ctx.ellipse(
    screenX + w * 0.5,
    foamY,
    w * 0.52 + Math.sin(timeSec * 2.5 + floe.bobPhase) * 2,
    6,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Sculpted 3D faceted ice side wall
  const wallGrad = ctx.createLinearGradient(screenX, topY + 6, screenX, topY + h + 6);
  if (floe.kind === 'goal') {
    wallGrad.addColorStop(0, '#67E8F9');
    wallGrad.addColorStop(0.55, '#0EA5E9');
    wallGrad.addColorStop(1, '#0369A1');
  } else if (floe.kind === 'cracked') {
    wallGrad.addColorStop(0, '#BAE6FD');
    wallGrad.addColorStop(0.6, '#38BDF8');
    wallGrad.addColorStop(1, '#0369A1');
  } else if (floe.kind === 'drifting') {
    wallGrad.addColorStop(0, '#A5F3FC');
    wallGrad.addColorStop(0.6, '#06B6D4');
    wallGrad.addColorStop(1, '#0E7490');
  } else {
    wallGrad.addColorStop(0, '#A5F3FC');
    wallGrad.addColorStop(0.55, '#38BDF8');
    wallGrad.addColorStop(1, '#0284C7');
  }

  ctx.fillStyle = wallGrad;
  ctx.beginPath();
  ctx.moveTo(screenX + 3, topY + 8);
  ctx.lineTo(screenX + w - 3, topY + 8);
  ctx.lineTo(screenX + w - 8, topY + h + 2);
  ctx.quadraticCurveTo(screenX + w * 0.5, topY + h + 8, screenX + 8, topY + h + 2);
  ctx.closePath();
  ctx.fill();

  // Subtle geometric ice facets for 3D crystal depth
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.beginPath();
  ctx.moveTo(screenX + 8, topY + 14);
  ctx.lineTo(screenX + w * 0.34, topY + 14);
  ctx.lineTo(screenX + w * 0.24, topY + h);
  ctx.lineTo(screenX + 10, topY + h - 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(12, 74, 110, 0.16)';
  ctx.beginPath();
  ctx.moveTo(screenX + w * 0.62, topY + 14);
  ctx.lineTo(screenX + w - 8, topY + 14);
  ctx.lineTo(screenX + w - 11, topY + h - 1);
  ctx.lineTo(screenX + w * 0.52, topY + h + 1);
  ctx.closePath();
  ctx.fill();

  // Sunlit overhanging snow-white top cap
  const topGrad = ctx.createLinearGradient(screenX, topY - 4, screenX, topY + 20);
  topGrad.addColorStop(0, '#FFFFFF');
  topGrad.addColorStop(0.7, '#F0F9FF');
  topGrad.addColorStop(1, '#BAE6FD');

  ctx.fillStyle = topGrad;
  ctx.beginPath();
  ctx.roundRect(screenX - 1, topY, w + 2, 19, [13, 13, 9, 9]);
  ctx.fill();

  // Soft scalloped snow overhang puffs along top rim
  ctx.fillStyle = '#E0F2FE';
  const puffCount = Math.max(3, Math.floor(w / 28));
  for (let i = 0; i < puffCount; i++) {
    const px = screenX + 14 + ((w - 28) * i) / Math.max(1, puffCount - 1);
    ctx.beginPath();
    ctx.arc(px, topY + 17, 6.5, 0, Math.PI);
    ctx.fill();
  }

  ctx.lineWidth = 2;
  ctx.strokeStyle = floe.cracking ? '#F97316' : 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.roundRect(screenX - 1, topY, w + 2, 19, [13, 13, 9, 9]);
  ctx.stroke();

  // Specular snow shine strip
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.roundRect(screenX + 10, topY + 3, Math.max(18, w * 0.45), 4.5, 2.5);
  ctx.fill();

  // Drifting floe wave arrows cue
  if (floe.kind === 'drifting') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '800 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⇄', screenX + w * 0.5, topY + 32);
  }

  // Cracked ice fracture lines + countdown bar when cracking
  if (floe.kind === 'cracked') {
    ctx.strokeStyle = floe.cracking ? '#EA580C' : '#0369A1';
    ctx.lineWidth = floe.cracking ? 2.6 : 1.9;
    ctx.beginPath();
    ctx.moveTo(screenX + w * 0.25, topY + 3);
    ctx.lineTo(screenX + w * 0.38, topY + 11);
    ctx.lineTo(screenX + w * 0.31, topY + 18);
    ctx.moveTo(screenX + w * 0.68, topY + 2);
    ctx.lineTo(screenX + w * 0.57, topY + 10);
    ctx.lineTo(screenX + w * 0.65, topY + 17);
    ctx.stroke();

    if (floe.cracking) {
      const ratio = Math.max(0, 1 - floe.crackElapsed / floe.crackDuration);
      ctx.fillStyle = 'rgba(249, 115, 22, 0.28)';
      ctx.beginPath();
      ctx.roundRect(screenX + 12, topY - 11, w - 24, 6, 3);
      ctx.fill();
      ctx.fillStyle = '#F97316';
      ctx.beginPath();
      ctx.roundRect(screenX + 12, topY - 11, (w - 24) * ratio, 6, 3);
      ctx.fill();
    }
  }

  // Rolling snowball obstacle on wide solid floes
  if (floe.hasSnowball && floe.snowballOffset !== undefined) {
    const sbX = screenX + floe.snowballOffset;
    const sbY = topY - 13;
    ctx.save();
    ctx.translate(sbX, sbY);
    ctx.rotate((floe.snowballOffset / 14) * 1.2);
    const sbGrad = ctx.createRadialGradient(-4, -4, 2, 0, 0, 14);
    sbGrad.addColorStop(0, '#FFFFFF');
    sbGrad.addColorStop(0.7, '#E0F2FE');
    sbGrad.addColorStop(1, '#7DD3FC');
    ctx.fillStyle = sbGrad;
    ctx.shadowColor = 'rgba(2, 132, 199, 0.35)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#BAE6FD';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-4, -3, 2.5, 0, Math.PI * 2);
    ctx.arc(4, 3, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.restore();
  }

  // Goal Igloo + Golden Victory Flag
  if (floe.kind === 'goal') {
    const gx = screenX + w * 0.58;
    const gy = topY;

    // Snow igloo dome
    const iglooGrad = ctx.createRadialGradient(gx - 12, gy - 28, 6, gx, gy - 12, 44);
    iglooGrad.addColorStop(0, '#FFFFFF');
    iglooGrad.addColorStop(0.65, '#E0F2FE');
    iglooGrad.addColorStop(1, '#93C5FD');
    ctx.fillStyle = iglooGrad;
    ctx.beginPath();
    ctx.arc(gx, gy, 38, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Warm glowing igloo door
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(gx - 10, gy, 13, Math.PI, 0);
    ctx.closePath();
    ctx.fill();

    // Flagpole & waving golden banner
    const flagX = screenX + w * 0.28;
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(flagX, gy);
    ctx.lineTo(flagX, gy - 72);
    ctx.stroke();

    const wave = Math.sin(timeSec * 5) * 4;
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.moveTo(flagX, gy - 72);
    ctx.quadraticCurveTo(flagX + 18, gy - 70 + wave, flagX + 36, gy - 61 + wave * 0.5);
    ctx.lineTo(flagX, gy - 49);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.restore();
}

function drawCollectible(
  ctx: CanvasRenderingContext2D,
  item: IceCollectible,
  camX: number,
  timeSec: number
) {
  if (item.collected) return;
  const sx = item.x - camX;
  const sy = item.baseY + Math.sin(timeSec * 3.2 + item.phase) * 5;

  ctx.save();
  ctx.translate(sx, sy);

  // Soft aura
  ctx.fillStyle =
    item.kind === 'star' || item.kind === 'pearl'
      ? 'rgba(250, 204, 21, 0.28)'
      : item.kind === 'gift'
      ? 'rgba(244, 63, 94, 0.25)'
      : 'rgba(56, 189, 248, 0.24)';
  ctx.beginPath();
  ctx.arc(0, 0, 19, 0, Math.PI * 2);
  ctx.fill();

  if (item.kind === 'fish') {
    const tilt = Math.sin(timeSec * 4 + item.phase) * 0.14;
    ctx.rotate(tilt);
    // Tail
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-18, -7);
    ctx.lineTo(-18, 7);
    ctx.closePath();
    ctx.fill();
    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Highlight & eye
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.ellipse(-1, -3, 7, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(6, -2, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(6.8, -2, 1.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.kind === 'star') {
    ctx.rotate(Math.sin(timeSec * 2.4 + item.phase) * 0.2);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const ang = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? 15 : 7;
      const px = Math.cos(ang) * r;
      const py = Math.sin(ang) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = '#FACC15';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FEF9C3';
    ctx.stroke();
  } else if (item.kind === 'gift') {
    ctx.fillStyle = '#F43F5E';
    ctx.beginPath();
    ctx.roundRect(-12, -11, 24, 22, 5);
    ctx.fill();
    ctx.fillStyle = '#FDE047';
    ctx.fillRect(-3, -11, 6, 22);
    ctx.fillRect(-12, -3, 24, 6);
    ctx.beginPath();
    ctx.arc(-4, -13, 4, 0, Math.PI * 2);
    ctx.arc(4, -13, 4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Royal Pearl / Crown gem
    const grad = ctx.createRadialGradient(-4, -4, 2, 0, 0, 14);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.5, '#FDE047');
    grad.addColorStop(1, '#F59E0B');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FEF9C3';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();
}

function drawSkyBird(ctx: CanvasRenderingContext2D, bird: SkyBird, camX: number, timeSec: number) {
  const sx = bird.x - camX;
  const sy = bird.y;
  const wingFlap = Math.sin(timeSec * 10 + bird.wingPhase) * 10;

  ctx.save();
  ctx.translate(sx, sy);

  // Cute white/sky arctic seagull
  ctx.strokeStyle = '#E0F2FE';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-16, -wingFlap);
  ctx.quadraticCurveTo(-8, -8, 0, 0);
  ctx.quadraticCurveTo(8, -8, 16, -wingFlap);
  ctx.stroke();

  // Body
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(0, 2, 13, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7DD3FC';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Orange beak pointing left
  ctx.fillStyle = '#FB923C';
  ctx.beginPath();
  ctx.moveTo(-12, 1);
  ctx.lineTo(-20, 3);
  ctx.lineTo(-12, 5);
  ctx.closePath();
  ctx.fill();

  // Eye
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(-6, 0, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBabyPenguin(
  ctx: CanvasRenderingContext2D,
  penguin: PenguinEntity,
  currentFloe: IceFloe | undefined,
  camX: number,
  isCharging: boolean,
  chargeRatio: number,
  timeSec: number,
  waterSurfaceY: number
) {
  const sx = penguin.x - camX;
  const floeBob =
    penguin.grounded && currentFloe
      ? Math.sin(timeSec * 1.9 + currentFloe.bobPhase) * 2.5 +
        (currentFloe.cracking
          ? (currentFloe.crackElapsed / currentFloe.crackDuration) * 14 +
            Math.sin(timeSec * 32) *
              (currentFloe.crackElapsed > currentFloe.crackDuration * 0.55 ? 2.5 : 0.8)
          : 0)
      : 0;
  const sy = penguin.y + floeBob;

  // Determine active animation state
  const nearFloeEdge =
    penguin.grounded &&
    currentFloe &&
    Math.min(Math.abs(penguin.x - currentFloe.x), Math.abs(currentFloe.x + currentFloe.width - penguin.x)) < 20;
  const isBalancing =
    penguin.grounded &&
    !isCharging &&
    !penguin.splashing &&
    Boolean(nearFloeEdge || currentFloe?.cracking || currentFloe?.kind === 'drifting');

  // Dynamic ground shadow directly below penguin (scales with jump height)
  const shadowFloorY = penguin.grounded
    ? sy + 2
    : currentFloe && penguin.x >= currentFloe.x - 10 && penguin.x <= currentFloe.x + currentFloe.width + 10
    ? currentFloe.y + 2
    : waterSurfaceY + 4;
  const altitude = Math.max(0, shadowFloorY - sy);
  const shadowScale = Math.max(0.32, 1 - altitude / 220);
  if (!penguin.splashing) {
    ctx.save();
    ctx.fillStyle = `rgba(12, 74, 110, ${0.28 * shadowScale})`;
    ctx.beginPath();
    ctx.ellipse(sx, shadowFloorY, 22 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(sx, sy);

  // Subtle idle breathing / landing wobble / slipping balance / airborne pitch / water tumble
  let bodyTilt = 0;
  let breathLift = 0;
  let scaleX = 1;
  let scaleY = 1;

  if (penguin.splashing) {
    // 6. Water fall tumble
    bodyTilt = Math.sin(timeSec * 13) * 0.55 + Math.cos(timeSec * 9) * 0.25;
    scaleX = 0.96;
    scaleY = 1.04;
  } else if (isCharging) {
    // 2. Charging jump: progressive crouch + forward anticipation lean
    scaleX = 1 + chargeRatio * 0.22;
    scaleY = 1 - chargeRatio * 0.27;
    bodyTilt = chargeRatio * 0.16;
  } else if (!penguin.grounded) {
    // 3. Airborne: velocity pitch + aerodynamic stretch
    scaleX = 0.93;
    scaleY = 1.08;
    bodyTilt = Math.max(-0.26, Math.min(0.32, penguin.vy * 0.00055));
  } else if (penguin.landSquash > 0 || penguin.landWobble > 0) {
    // 4. Landing squash + playful wobble settle
    scaleX = 1 + penguin.landSquash * 0.22;
    scaleY = 1 - penguin.landSquash * 0.2;
    bodyTilt = Math.sin(timeSec * 22) * penguin.landWobble * 0.14;
  } else if (isBalancing) {
    // 5. Slipping / balancing on edge or cracking/drifting ice
    bodyTilt = Math.sin(timeSec * 11.5) * 0.12;
    breathLift = Math.abs(Math.sin(timeSec * 11.5)) * 1.5;
  } else {
    // 1. Idle: gentle breathing + subtle happy bob
    breathLift = Math.sin(timeSec * 2.8) * 1.2;
    bodyTilt = Math.sin(timeSec * 1.7) * 0.035;
  }

  ctx.rotate(bodyTilt);
  ctx.scale(scaleX, scaleY);

  // Webbed warm orange-gold feet (with happy idle tap or tucked airborne pose)
  const footBounceL =
    !penguin.grounded ? 3 : isBalancing ? Math.sin(timeSec * 14) * 2.5 : Math.max(0, Math.sin(timeSec * 3.4)) * 1.6;
  const footBounceR =
    !penguin.grounded ? 3 : isBalancing ? -Math.sin(timeSec * 14) * 2.5 : Math.max(0, -Math.sin(timeSec * 3.4)) * 1.6;

  const drawFoot = (fx: number, fy: number, rot: number) => {
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(rot);
    const footGrad = ctx.createLinearGradient(0, -4, 0, 5);
    footGrad.addColorStop(0, '#FDBA74');
    footGrad.addColorStop(1, '#EA580C');
    ctx.fillStyle = footGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 9.5, 5.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#C2410C';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  };

  drawFoot(-9.5, -3.5 - footBounceL, !penguin.grounded ? 0.35 : -0.14);
  drawFoot(10, -3.5 - footBounceR, !penguin.grounded ? 0.35 : 0.14);

  // Plump pear-shaped 3D torso (deep blue-navy silky plumage + soft Arctic rim glow)
  const torsoGrad = ctx.createRadialGradient(-7, -33 - breathLift, 5, 0, -26, 29);
  torsoGrad.addColorStop(0, '#334155');
  torsoGrad.addColorStop(0.55, '#1E293B');
  torsoGrad.addColorStop(1, '#0F172A');
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.ellipse(0, -26 - breathLift * 0.4, 23, 25.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Subtle icy rim highlight on back contour
  ctx.strokeStyle = 'rgba(186, 230, 253, 0.42)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, -26 - breathLift * 0.4, 22.2, Math.PI * 0.85, Math.PI * 1.48);
  ctx.stroke();

  // Creamy-white volume-shaded belly
  const bellyGrad = ctx.createRadialGradient(2, -26 - breathLift * 0.3, 3, 3, -22, 19);
  bellyGrad.addColorStop(0, '#FFFFFF');
  bellyGrad.addColorStop(0.78, '#F8FAFC');
  bellyGrad.addColorStop(1, '#CBD5E1');
  ctx.fillStyle = bellyGrad;
  ctx.beginPath();
  ctx.ellipse(3.2, -22 - breathLift * 0.3, 15.2, 19, 0, 0, Math.PI * 2);
  ctx.fill();

  // Expressive flipper wings according to animation state
  const idleWave = Math.sin(timeSec * 3.8) > 0.78 ? Math.sin(timeSec * 14) * 0.32 : 0.15;
  const wingL = penguin.splashing
    ? Math.sin(timeSec * 22) * 0.8 - 0.9
    : isCharging
    ? -0.65 - chargeRatio * 0.45
    : !penguin.grounded
    ? Math.sin(timeSec * 20) * 0.65 - 0.65
    : isBalancing
    ? Math.sin(timeSec * 12) * 0.55 - 0.55
    : 0.22 + idleWave * 0.5;
  const wingR = penguin.splashing
    ? -Math.sin(timeSec * 22) * 0.8 + 0.9
    : isCharging
    ? 0.65 + chargeRatio * 0.45
    : !penguin.grounded
    ? -Math.sin(timeSec * 20) * 0.65 + 0.65
    : isBalancing
    ? Math.sin(timeSec * 12) * 0.55 + 0.55
    : -0.22 - idleWave;

  const drawWing = (wx: number, wy: number, angle: number, flip: number) => {
    ctx.save();
    ctx.translate(wx, wy);
    ctx.rotate(angle);
    const wGrad = ctx.createLinearGradient(0, -2, 0, 14);
    wGrad.addColorStop(0, '#334155');
    wGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = wGrad;
    ctx.beginPath();
    ctx.ellipse(0, 7.5, 6.2, 13.5, flip * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  };

  drawWing(-20, -29 - breathLift * 0.5, wingL, 1);
  drawWing(20, -29 - breathLift * 0.5, wingR, -1);

  // Plush cozy coral-red knit scarf with twin fluttering tails
  const scarfFlutter = !penguin.grounded
    ? Math.sin(timeSec * 18) * 6 - 4
    : isCharging
    ? -2
    : Math.sin(timeSec * 3.4) * 2.2;
  const scarfY = -36 - breathLift * 0.6;

  // Back tail
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.moveTo(-12, scarfY + 2);
  ctx.quadraticCurveTo(-26, scarfY + 2 + scarfFlutter, -32, scarfY + 11 + scarfFlutter);
  ctx.lineTo(-24, scarfY + 16 + scarfFlutter);
  ctx.quadraticCurveTo(-18, scarfY + 9, -8, scarfY + 5);
  ctx.closePath();
  ctx.fill();

  // Scarf collar ring
  const scarfGrad = ctx.createLinearGradient(0, scarfY - 3, 0, scarfY + 8);
  scarfGrad.addColorStop(0, '#FB7185');
  scarfGrad.addColorStop(0.45, '#EF4444');
  scarfGrad.addColorStop(1, '#B91C1C');
  ctx.fillStyle = scarfGrad;
  ctx.beginPath();
  ctx.roundRect(-16.5, scarfY - 1, 33, 8.5, 4.5);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Cute round head (subtle head tilt in idle)
  const headY = -50 - breathLift;
  ctx.save();
  ctx.translate(0, headY);
  if (penguin.grounded && !isCharging && !isBalancing) {
    ctx.rotate(Math.sin(timeSec * 2.1) * 0.045);
  }

  const headGrad = ctx.createRadialGradient(-6, -5, 4, 0, 0, 21);
  headGrad.addColorStop(0, '#334155');
  headGrad.addColorStop(0.65, '#1E293B');
  headGrad.addColorStop(1, '#0F172A');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 19.5, 0, Math.PI * 2);
  ctx.fill();

  // Creamy heart-shaped face mask
  const faceGrad = ctx.createRadialGradient(5, 2, 2, 4.5, 2, 14);
  faceGrad.addColorStop(0, '#FFFFFF');
  faceGrad.addColorStop(0.85, '#F8FAFC');
  faceGrad.addColorStop(1, '#E2E8F0');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(-0.5, 2, 7.5, 9.2, -0.1, 0, Math.PI * 2);
  ctx.ellipse(9.5, 2, 7.5, 9.2, 0.1, 0, Math.PI * 2);
  ctx.ellipse(4.8, 5, 11, 8.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glowing rosy cheeks
  ctx.fillStyle = 'rgba(251, 113, 133, 0.62)';
  ctx.beginPath();
  ctx.ellipse(-4.5, 6.2, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.ellipse(13.2, 6.2, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sparkling large eyes with dual catchlights (or surprised wide eyes in water tumble)
  const isBlinking = !penguin.splashing && !isCharging && penguin.blinkTimer > 2.86;
  if (penguin.splashing) {
    // Surprised wide eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, -1, 4.8, 0, Math.PI * 2);
    ctx.arc(10.5, -1, 4.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(0.5, -1, 2.1, 0, Math.PI * 2);
    ctx.arc(11, -1, 2.1, 0, Math.PI * 2);
    ctx.fill();
  } else if (isBlinking) {
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0.5, -0.5, 3.6, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(10.5, -0.5, 3.6, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  } else {
    const eyeY = isCharging ? -0.2 : -1.2;
    const drawEye = (ex: number) => {
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(ex, eyeY, 3.9, 0, Math.PI * 2);
      ctx.fill();
      // Main bright catchlight
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(ex - 1.1, eyeY - 1.3, 1.45, 0, Math.PI * 2);
      ctx.fill();
      // Secondary lower sparkle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(ex + 1.2, eyeY + 1.3, 0.7, 0, Math.PI * 2);
      ctx.fill();
    };
    drawEye(0.6);
    drawEye(10.6);
  }

  // Warm orange-gold 3D rounded beak
  const beakGrad = ctx.createLinearGradient(4, 1, 17, 8);
  beakGrad.addColorStop(0, '#FBBF24');
  beakGrad.addColorStop(1, '#EA580C');
  ctx.fillStyle = beakGrad;
  ctx.beginPath();
  ctx.moveTo(4.2, 1.5);
  ctx.quadraticCurveTo(17.5, 3.8, 17, 5.2);
  ctx.quadraticCurveTo(11, 8.6, 4.2, 7.6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#C2410C';
  ctx.lineWidth = 0.9;
  ctx.stroke();

  // Cozy winter knit beanie hat with fluffy snow pom-pom
  const hatGrad = ctx.createLinearGradient(-15, -24, 15, -8);
  hatGrad.addColorStop(0, '#38BDF8');
  hatGrad.addColorStop(1, '#0284C7');
  ctx.fillStyle = hatGrad;
  ctx.beginPath();
  ctx.arc(0, -9.5, 16.5, Math.PI * 1.05, Math.PI * -0.05);
  ctx.closePath();
  ctx.fill();

  // Ribbed coral-white hat cuff
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.roundRect(-17.5, -13, 35, 6.5, 3.2);
  ctx.fill();
  ctx.strokeStyle = '#BAE6FD';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Fluffy bouncing pom-pom
  const pomBounce = !penguin.grounded
    ? -2.5
    : penguin.landWobble > 0
    ? Math.sin(timeSec * 24) * penguin.landWobble * 2.5
    : Math.sin(timeSec * 3) * 0.8;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-1, -27 + pomBounce, 5.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#E0F2FE';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

export const PenguinIceGame: React.FC<PenguinIceGameProps> = ({
  soundEnabled,
  voiceEnabled,
  isPaused,
  savedProgress,
  onUpdateProgress,
  onRecordStars,
  onShowVictory,
  onComplete,
}) => {
  const normSaved = normalizePenguinProgress(savedProgress);

  const [viewMode, setViewMode] = useState<ViewMode>('title');
  const [currentStageNum, setCurrentStageNum] = useState<number>(normSaved.unlockedStage);
  const [sfxOn, setSfxOn] = useState<boolean>(soundEnabled);
  const [musicOn, setMusicOn] = useState<boolean>(true);

  const [score, setScore] = useState<number>(0);
  const [fishCount, setFishCount] = useState<number>(0);
  const [starsCount, setStarsCount] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [distanceFloes, setDistanceFloes] = useState<number>(0);
  const [chargePct, setChargePct] = useState<number>(0);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const [stageWon, setStageWon] = useState<boolean>(false);
  const [stageLost, setStageLost] = useState<boolean>(false);
  const [endlessEnded, setEndlessEnded] = useState<boolean>(false);
  const [earnedStageStars, setEarnedStageStars] = useState<number>(3);
  const [newlyUnlockedStage, setNewlyUnlockedStage] = useState<number | null>(null);
  const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<PenguinMilestoneBadgeId[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const sizeRef = useRef({ width: 960, height: 560 });
  const prevWaterYRef = useRef<number | null>(null);

  const floesRef = useRef<IceFloe[]>([]);
  const collectiblesRef = useRef<IceCollectible[]>([]);
  const birdsRef = useRef<SkyBird[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const popupsRef = useRef<FloatingPopup[]>([]);
  const snowflakesRef = useRef<SnowFlake[]>([]);
  const seaCreaturesRef = useRef<SeaCreature[]>([]);

  const penguinRef = useRef<PenguinEntity>({
    x: 120,
    y: 300,
    vx: 0,
    vy: 0,
    grounded: true,
    currentFloeId: 1,
    lastSafeFloeId: 1,
    splashing: false,
    splashTimer: 0,
    landSquash: 0,
    landWobble: 0,
    blinkTimer: 0,
  });

  const camXRef = useRef(0);
  const isChargingRef = useRef(false);
  const chargeRatioRef = useRef(0);
  const runDoneRef = useRef(false);
  const creditedRef = useRef(false);
  const nextIdsRef = useRef({ floe: 100, item: 500, bird: 100 });

  const viewModeRef = useRef(viewMode);
  const currentStageNumRef = useRef(currentStageNum);
  const sfxOnRef = useRef(sfxOn);
  const voiceEnabledRef = useRef(voiceEnabled);
  const isPausedRef = useRef(isPaused);
  const stageWonRef = useRef(stageWon);
  const stageLostRef = useRef(stageLost);
  const endlessEndedRef = useRef(endlessEnded);
  const livesRef = useRef(lives);
  const scoreRef = useRef(score);
  const fishRef = useRef(fishCount);
  const starsRef = useRef(starsCount);
  const distRef = useRef(distanceFloes);
  const savedProgressRef = useRef(savedProgress);
  const onUpdateProgressRef = useRef(onUpdateProgress);
  const onRecordStarsRef = useRef(onRecordStars);

  viewModeRef.current = viewMode;
  currentStageNumRef.current = currentStageNum;
  sfxOnRef.current = sfxOn && soundEnabled;
  voiceEnabledRef.current = voiceEnabled;
  isPausedRef.current = isPaused;
  stageWonRef.current = stageWon;
  stageLostRef.current = stageLost;
  endlessEndedRef.current = endlessEnded;
  livesRef.current = lives;
  scoreRef.current = score;
  fishRef.current = fishCount;
  starsRef.current = starsCount;
  distRef.current = distanceFloes;
  savedProgressRef.current = savedProgress;
  onUpdateProgressRef.current = onUpdateProgress;
  onRecordStarsRef.current = onRecordStars;

  useEffect(() => {
    setSfxOn(soundEnabled);
  }, [soundEnabled]);

  const currentStageCfg: PenguinStageConfig =
    PENGUIN_STAGES.find((s) => s.stage === currentStageNum) ?? PENGUIN_STAGES[0];
  const currentChapter =
    ICE_CHAPTERS.find((c) => c.id === currentStageCfg.chapter) ?? ICE_CHAPTERS[0];

  // Background arctic adventure music lifecycle
  useEffect(() => {
    const active =
      soundEnabled &&
      musicOn &&
      !isPaused &&
      (viewMode === 'stage' || viewMode === 'endless') &&
      !stageWon &&
      !stageLost &&
      !endlessEnded;
    if (active) penguinMusic.start();
    else penguinMusic.stop();
    return () => penguinMusic.stop();
  }, [soundEnabled, musicOn, isPaused, viewMode, stageWon, stageLost, endlessEnded]);

  const showTempBanner = useCallback((msg: string) => {
    setFeedbackBanner(msg);
    window.setTimeout(() => {
      setFeedbackBanner((prev) => (prev === msg ? null : prev));
    }, 1800);
  }, []);

  const initSnowflakes = useCallback((width: number, height: number) => {
    const flakes: SnowFlake[] = [];
    for (let i = 0; i < 64; i++) {
      const bokeh = i % 4 === 0;
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: bokeh ? 3.4 + Math.random() * 2.5 : 1.4 + Math.random() * 2.2,
        vy: bokeh ? 12 + Math.random() * 14 : 20 + Math.random() * 26,
        vx: -10 + Math.random() * 18,
        alpha: bokeh ? 0.24 + Math.random() * 0.22 : 0.48 + Math.random() * 0.45,
        bokeh,
      });
    }
    snowflakesRef.current = flakes;

    if (seaCreaturesRef.current.length === 0) {
      const fishPalette = ['#F97316', '#FACC15', '#38BDF8', '#FB7185', '#34D399'];
      const creatures: SeaCreature[] = [];
      for (let i = 0; i < 10; i++) {
        creatures.push({
          x: Math.random() * Math.max(1000, width * 1.4),
          yOffset: 28 + Math.random() * 78,
          speed: (i % 2 === 0 ? 1 : -1) * (18 + Math.random() * 24),
          size: 8 + Math.random() * 7,
          color: fishPalette[i % fishPalette.length],
          phase: Math.random() * Math.PI * 2,
          kind: i % 5 === 0 ? 'jelly' : i % 7 === 0 ? 'star' : 'fish',
        });
      }
      seaCreaturesRef.current = creatures;
    }
  }, []);

  const resetStageBoard = useCallback((cfg: PenguinStageConfig) => {
    const { height } = sizeRef.current;
    const waterY = Math.round(height * 0.74);
    prevWaterYRef.current = waterY;
    const { floes, collectibles, birds } = buildStageCourse(cfg, waterY);

    floesRef.current = floes;
    collectiblesRef.current = collectibles;
    birdsRef.current = birds;
    particlesRef.current = [];
    popupsRef.current = [];

    const first = floes[0];
    penguinRef.current = {
      x: first.x + first.width * 0.5,
      y: first.y,
      vx: 0,
      vy: 0,
      grounded: true,
      currentFloeId: first.id,
      lastSafeFloeId: first.id,
      splashing: false,
      splashTimer: 0,
      landSquash: 0,
      landWobble: 0,
      blinkTimer: 0,
    };

    camXRef.current = 0;
    isChargingRef.current = false;
    chargeRatioRef.current = 0;
    runDoneRef.current = false;
    creditedRef.current = false;

    setChargePct(0);
    setScore(0);
    setFishCount(0);
    setStarsCount(0);
    setLives(3);
    setDistanceFloes(0);
    setStageWon(false);
    setStageLost(false);
    setEndlessEnded(false);
    setNewlyUnlockedStage(null);
    setNewlyEarnedBadges([]);
  }, []);

  const resetEndlessBoard = useCallback(() => {
    const { height } = sizeRef.current;
    const waterY = Math.round(height * 0.74);
    prevWaterYRef.current = waterY;

    const startFloe: IceFloe = {
      id: 1,
      baseX: 48,
      x: 48,
      y: waterY - 22,
      width: 165,
      height: 36,
      kind: 'solid',
      driftAmp: 0,
      driftSpeed: 0,
      driftPhase: 0,
      bobPhase: 0,
      cracking: false,
      crackElapsed: 0,
      crackDuration: 2.6,
      sunk: false,
      landedOnce: true,
    };

    const chunk1 = appendEndlessChunk([startFloe], waterY, 2, 1, 1);
    const chunk2 = appendEndlessChunk(chunk1.newFloes, waterY, 8, 20, 10);

    floesRef.current = [startFloe, ...chunk1.newFloes, ...chunk2.newFloes];
    collectiblesRef.current = [...chunk1.newCollectibles, ...chunk2.newCollectibles];
    birdsRef.current = [...chunk1.newBirds, ...chunk2.newBirds];
    nextIdsRef.current = { floe: 14, item: 40, bird: 20 };

    particlesRef.current = [];
    popupsRef.current = [];

    penguinRef.current = {
      x: startFloe.x + startFloe.width * 0.5,
      y: startFloe.y,
      vx: 0,
      vy: 0,
      grounded: true,
      currentFloeId: startFloe.id,
      lastSafeFloeId: startFloe.id,
      splashing: false,
      splashTimer: 0,
      landSquash: 0,
      landWobble: 0,
      blinkTimer: 0,
    };

    camXRef.current = 0;
    isChargingRef.current = false;
    chargeRatioRef.current = 0;
    runDoneRef.current = false;
    creditedRef.current = false;

    setChargePct(0);
    setScore(0);
    setFishCount(0);
    setStarsCount(0);
    setLives(3);
    setDistanceFloes(0);
    setStageWon(false);
    setStageLost(false);
    setEndlessEnded(false);
  }, []);

  // Resize observer & board init (keeps entities anchored to waterline on resize)
  useEffect(() => {
    if (viewMode !== 'stage' && viewMode !== 'endless') return;
    const arena = arenaRef.current;
    const canvas = canvasRef.current;
    if (!arena || !canvas) return;

    const updateSize = () => {
      const rect = arena.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextWaterY = Math.round(rect.height * 0.74);

      if (prevWaterYRef.current !== null && prevWaterYRef.current !== nextWaterY && floesRef.current.length > 0) {
        const dy = nextWaterY - prevWaterYRef.current;
        for (const floe of floesRef.current) floe.y += dy;
        for (const item of collectiblesRef.current) item.baseY += dy;
        for (const bird of birdsRef.current) {
          bird.baseY += dy;
          bird.y += dy;
        }
        penguinRef.current.y += dy;
        prevWaterYRef.current = nextWaterY;
      }

      sizeRef.current = { width: rect.width, height: rect.height };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      if (snowflakesRef.current.length === 0) {
        initSnowflakes(rect.width, rect.height);
      }
    };

    updateSize();
    if (viewMode === 'stage') {
      const cfg = PENGUIN_STAGES.find((s) => s.stage === currentStageNum) ?? PENGUIN_STAGES[0];
      resetStageBoard(cfg);
    } else {
      resetEndlessBoard();
    }

    const ro = new ResizeObserver(updateSize);
    ro.observe(arena);
    return () => ro.disconnect();
  }, [viewMode, currentStageNum, initSnowflakes, resetStageBoard, resetEndlessBoard]);

  // Charge & Jump controls (never auto-jumps without explicit press & release)
  const startCharge = useCallback(() => {
    if (
      (viewModeRef.current !== 'stage' && viewModeRef.current !== 'endless') ||
      isPausedRef.current ||
      stageWonRef.current ||
      stageLostRef.current ||
      endlessEndedRef.current
    ) {
      return;
    }
    const p = penguinRef.current;
    if (!p.grounded || p.splashing || runDoneRef.current) return;
    if (!isChargingRef.current) {
      isChargingRef.current = true;
      chargeRatioRef.current = 0.08;
      setChargePct(8);
    }
  }, []);

  const releaseJump = useCallback(() => {
    if (!isChargingRef.current) return;
    isChargingRef.current = false;

    const p = penguinRef.current;
    if (!p.grounded || p.splashing || runDoneRef.current) {
      chargeRatioRef.current = 0;
      setChargePct(0);
      return;
    }

    const power = Math.max(0.08, Math.min(1, chargeRatioRef.current));
    const vx = PENGUIN_PHYSICS.vxMin + power * (PENGUIN_PHYSICS.vxMax - PENGUIN_PHYSICS.vxMin);
    const vy = PENGUIN_PHYSICS.vyMin + power * (PENGUIN_PHYSICS.vyMax - PENGUIN_PHYSICS.vyMin);

    p.grounded = false;
    p.vx = vx;
    p.vy = vy;
    chargeRatioRef.current = 0;
    setChargePct(0);

    sfx.iceJump(power, sfxOnRef.current);

    // Takeoff snow puff
    for (let k = 0; k < 8; k++) {
      particlesRef.current.push({
        x: p.x + (Math.random() - 0.5) * 14,
        y: p.y,
        vx: -20 - Math.random() * 60,
        vy: -20 - Math.random() * 55,
        radius: 2.5 + Math.random() * 3,
        color: '#FFFFFF',
        alpha: 0.9,
        life: 0,
        maxLife: 0.36,
      });
    }
  }, []);

  // Keyboard support (Space / ArrowUp)
  useEffect(() => {
    if (viewMode !== 'stage' && viewMode !== 'endless') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!e.repeat) startCharge();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        releaseJump();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [viewMode, startCharge, releaseJump]);

  // Trigger stage win persistence once
  const handleStageWin = useCallback(() => {
    if (creditedRef.current) return;
    creditedRef.current = true;
    runDoneRef.current = true;

    const stageNum = currentStageNumRef.current;
    const prevNorm = normalizePenguinProgress(savedProgressRef.current);
    const finalScore = scoreRef.current + livesRef.current * 25 + 50;
    setScore(finalScore);

    const starsEarned = livesRef.current >= 3 ? 3 : livesRef.current === 2 ? 2 : 2;
    setEarnedStageStars(starsEarned);

    const updatedCompleted = prevNorm.completedStages.includes(stageNum)
      ? prevNorm.completedStages
      : [...prevNorm.completedStages, stageNum].sort((a, b) => a - b);

    const nextUnlocked =
      stageNum < 15 ? Math.min(15, Math.max(prevNorm.unlockedStage, stageNum + 1)) : 15;
    if (stageNum < 15 && nextUnlocked > prevNorm.unlockedStage) {
      setNewlyUnlockedStage(nextUnlocked);
    } else {
      setNewlyUnlockedStage(null);
    }

    const updatedStageStars = {
      ...prevNorm.stageStars,
      [stageNum]: Math.max(prevNorm.stageStars[stageNum] ?? 0, starsEarned),
    };

    const nextBadges = [...prevNorm.earnedBadges];
    const freshBadges: PenguinMilestoneBadgeId[] = [];
    for (const badge of PENGUIN_MILESTONE_BADGES) {
      if (updatedCompleted.length >= badge.requiredStages && !nextBadges.includes(badge.id)) {
        nextBadges.push(badge.id);
        freshBadges.push(badge.id);
      }
    }
    setNewlyEarnedBadges(freshBadges);

    const endlessUnlocked = prevNorm.endlessUnlocked || updatedCompleted.includes(15);

    onUpdateProgressRef.current?.({
      ...prevNorm,
      unlockedStage: nextUnlocked,
      completedStages: updatedCompleted,
      stageStars: updatedStageStars,
      highScore: Math.max(prevNorm.highScore, finalScore),
      totalFish: prevNorm.totalFish + fishRef.current,
      totalStarsCollected: prevNorm.totalStarsCollected + starsRef.current,
      earnedBadges: nextBadges,
      endlessUnlocked,
    });

    onRecordStarsRef.current?.(stageNum === 15 ? 5 : starsEarned);

    if (stageNum === 15) {
      sfx.chestOpen(sfxOnRef.current);
      speakVietnamese(
        'Hoan hô! Bé đã chinh phục Màn 15 Vương Quốc Băng Giá và mở khóa Chế độ Chơi Vô Tận!',
        voiceEnabledRef.current
      );
    } else {
      sfx.victory(sfxOnRef.current);
      speakVietnamese(
        `Tuyệt vời! Bé đã vượt qua Màn ${stageNum}!`,
        voiceEnabledRef.current
      );
    }

    setStageWon(true);
  }, []);

  const handleEndlessFinish = useCallback(() => {
    if (creditedRef.current) return;
    creditedRef.current = true;
    runDoneRef.current = true;

    const prevNorm = normalizePenguinProgress(savedProgressRef.current);
    onUpdateProgressRef.current?.({
      ...prevNorm,
      highScore: Math.max(prevNorm.highScore, scoreRef.current),
      totalFish: prevNorm.totalFish + fishRef.current,
      totalStarsCollected: prevNorm.totalStarsCollected + starsRef.current,
      endlessBestDistance: Math.max(prevNorm.endlessBestDistance, distRef.current),
      endlessBestScore: Math.max(prevNorm.endlessBestScore, scoreRef.current),
      endlessBestFish: Math.max(prevNorm.endlessBestFish, fishRef.current),
    });
    if (distRef.current >= 3 || scoreRef.current >= 40) {
      onRecordStarsRef.current?.(Math.min(5, 2 + Math.floor(distRef.current / 8)));
    }
    sfx.victory(sfxOnRef.current);
    setEndlessEnded(true);
  }, []);

  // Main 60fps physics & render loop
  useEffect(() => {
    if (viewMode !== 'stage' && viewMode !== 'endless') return;
    let rafId = 0;
    let lastTs = performance.now();

    const triggerSplash = (reasonMsg: string) => {
      const p = penguinRef.current;
      if (p.splashing || runDoneRef.current) return;
      p.splashing = true;
      p.splashTimer = 0.9;
      p.grounded = false;
      p.vx = 0;
      p.vy = 20;
      isChargingRef.current = false;
      chargeRatioRef.current = 0;
      setChargePct(0);

      sfx.waterSplash(sfxOnRef.current);
      const waterY = Math.round(sizeRef.current.height * 0.74);

      for (let k = 0; k < 18; k++) {
        const ang = -Math.PI * (0.15 + Math.random() * 0.7);
        const spd = 90 + Math.random() * 140;
        particlesRef.current.push({
          x: p.x + (Math.random() - 0.5) * 16,
          y: waterY,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          radius: 3 + Math.random() * 3.5,
          color: k % 2 === 0 ? '#E0F2FE' : '#38BDF8',
          alpha: 0.95,
          life: 0,
          maxLife: 0.55,
        });
      }

      showTempBanner(reasonMsg);
    };

    const frame = (now: number) => {
      const rawDt = (now - lastTs) / 1000;
      lastTs = now;
      const dt = Math.min(0.04, Math.max(0, rawDt));
      const timeSec = now / 1000;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const { width, height } = sizeRef.current;
      const waterSurfaceY = Math.round(height * 0.74);

      const frozen =
        isPausedRef.current ||
        stageWonRef.current ||
        stageLostRef.current ||
        endlessEndedRef.current;

      if (canvas && ctx && width > 0 && height > 0) {
        const p = penguinRef.current;

        if (!frozen) {
          // Charge progression
          if (isChargingRef.current && p.grounded && !p.splashing) {
            chargeRatioRef.current = Math.min(
              1,
              chargeRatioRef.current + dt / PENGUIN_PHYSICS.chargeDuration
            );
            setChargePct(Math.round(chargeRatioRef.current * 100));
          }

          p.blinkTimer = (p.blinkTimer + dt) % 3.1;
          if (p.landSquash > 0) {
            p.landSquash = Math.max(0, p.landSquash - dt * 5);
          }
          if (p.landWobble > 0) {
            p.landWobble = Math.max(0, p.landWobble - dt * 2.4);
          }

          // Update ice floes (drifting, cracking, snowball rolling)
          for (const floe of floesRef.current) {
            const prevFloeX = floe.x;
            if (floe.kind === 'drifting' && !floe.sunk) {
              floe.x = floe.baseX + Math.sin(timeSec * floe.driftSpeed + floe.driftPhase) * floe.driftAmp;
            }
            const floeDx = floe.x - prevFloeX;

            // Carry grounded penguin cleanly with drifting floe
            if (p.grounded && p.currentFloeId === floe.id && !floe.sunk) {
              p.x += floeDx;
              p.y = floe.y;
            }

            if (floe.cracking && !floe.sunk) {
              floe.crackElapsed += dt;
              if (floe.crackElapsed >= floe.crackDuration) {
                floe.sunk = true;
                if (p.grounded && p.currentFloeId === floe.id) {
                  p.grounded = false;
                  p.vy = 30;
                }
              }
            }

            if (floe.hasSnowball && floe.snowballOffset !== undefined && !floe.sunk) {
              const dir = floe.snowballDir ?? 1;
              const spd = floe.snowballSpeed ?? 55;
              floe.snowballOffset += dir * spd * dt;
              if (floe.snowballOffset >= floe.width - 20) {
                floe.snowballOffset = floe.width - 20;
                floe.snowballDir = -1;
              } else if (floe.snowballOffset <= 20) {
                floe.snowballOffset = 20;
                floe.snowballDir = 1;
              }

              // Gentle collision check with rolling snowball
              if (!p.splashing && !runDoneRef.current) {
                const sbX = floe.x + floe.snowballOffset;
                const sbY = floe.y - 13;
                if (Math.hypot(p.x - sbX, (p.y - 18) - sbY) < 23) {
                  triggerSplash('Úi! Quả cầu tuyết lăn trúng rồi!');
                }
              }
            }
          }

          // Update sky birds
          for (const bird of birdsRef.current) {
            bird.x = bird.baseX + Math.sin(timeSec * bird.speed * 0.7 + bird.phase) * bird.flyAmpX;
            bird.y = bird.baseY + Math.sin(timeSec * bird.speed + bird.phase) * bird.ampY;

            if (!p.splashing && !p.grounded && !runDoneRef.current) {
              if (Math.hypot(p.x - bird.x, (p.y - 24) - bird.y) < 25) {
                triggerSplash('Chú chim bay ngang qua rồi! Nhảy lại nhé!');
              }
            }
          }

          // Penguin airborne physics & swept platform collision
          if (p.splashing) {
            p.splashTimer -= dt;
            if (p.splashTimer <= 0) {
              const nextLives = Math.max(0, livesRef.current - 1);
              setLives(nextLives);

              if (nextLives <= 0) {
                if (viewModeRef.current === 'endless') {
                  handleEndlessFinish();
                } else {
                  setStageLost(true);
                }
              } else {
                // Restore penguin safely to last safe ice floe (restoring if cracked & sunk)
                const safeFloe =
                  floesRef.current.find((f) => f.id === p.lastSafeFloeId) ?? floesRef.current[0];
                safeFloe.sunk = false;
                safeFloe.cracking = false;
                safeFloe.crackElapsed = 0;

                p.splashing = false;
                p.grounded = true;
                p.currentFloeId = safeFloe.id;
                p.x = safeFloe.x + safeFloe.width * 0.5;
                p.y = safeFloe.y;
                p.vx = 0;
                p.vy = 0;
              }
            }
          } else if (!p.grounded) {
            const prevY = p.y;
            p.vy += PENGUIN_PHYSICS.gravity * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Swept downward collision against ice floe top decks
            if (p.vy >= 0) {
              for (const floe of floesRef.current) {
                if (floe.sunk) continue;
                const edgeForgiveness = 11;
                const withinX =
                  p.x >= floe.x - edgeForgiveness &&
                  p.x <= floe.x + floe.width + edgeForgiveness;
                const crossedSurface = prevY <= floe.y + 12 && p.y >= floe.y - 2;

                if (withinX && crossedSurface) {
                  p.y = floe.y;
                  p.vx = 0;
                  p.vy = 0;
                  p.grounded = true;
                  p.currentFloeId = floe.id;
                  p.landSquash = 1;
                  p.landWobble = 1;

                  if (floe.kind !== 'cracked') {
                    p.lastSafeFloeId = floe.id;
                  } else if (!floe.cracking) {
                    floe.cracking = true;
                    sfx.iceCrack(sfxOnRef.current);
                  }

                  sfx.iceLand(sfxOnRef.current);

                  // Landing snow puffs
                  for (let k = 0; k < 7; k++) {
                    particlesRef.current.push({
                      x: p.x + (Math.random() - 0.5) * 18,
                      y: p.y,
                      vx: (Math.random() - 0.5) * 90,
                      vy: -20 - Math.random() * 45,
                      radius: 2.5 + Math.random() * 2.5,
                      color: '#FFFFFF',
                      alpha: 0.9,
                      life: 0,
                      maxLife: 0.35,
                    });
                  }

                  if (!floe.landedOnce) {
                    floe.landedOnce = true;
                    setScore((s) => s + 10);
                    setDistanceFloes((d) => d + 1);
                    popupsRef.current.push({
                      x: p.x,
                      y: p.y - 52,
                      text: '+10',
                      color: '#0284C7',
                      life: 0,
                      maxLife: 0.75,
                    });
                  }

                  // Endless mode: extend world seamlessly ahead
                  if (viewModeRef.current === 'endless') {
                    const lastFloe = floesRef.current[floesRef.current.length - 1];
                    if (lastFloe && lastFloe.baseX - p.x < 1200) {
                      const chunk = appendEndlessChunk(
                        floesRef.current,
                        waterSurfaceY,
                        nextIdsRef.current.floe,
                        nextIdsRef.current.item,
                        nextIdsRef.current.bird
                      );
                      nextIdsRef.current = {
                        floe: nextIdsRef.current.floe + chunk.newFloes.length,
                        item: nextIdsRef.current.item + chunk.newCollectibles.length,
                        bird: nextIdsRef.current.bird + chunk.newBirds.length,
                      };
                      floesRef.current.push(...chunk.newFloes);
                      collectiblesRef.current.push(...chunk.newCollectibles);
                      birdsRef.current.push(...chunk.newBirds);
                    }
                  }

                  // Stage mode: check Goal Igloo landing
                  if (viewModeRef.current === 'stage' && floe.kind === 'goal') {
                    handleStageWin();
                  }

                  break;
                }
              }
            }

            // Fall into water check
            if (!p.grounded && p.y > waterSurfaceY + 12) {
              triggerSplash('Tõm xuống nước rồi! Thử nhảy lại nhé!');
            }
          }

          // Collectibles pickup check (in flight or on floe)
          for (const item of collectiblesRef.current) {
            if (item.collected) continue;
            const itemY = item.baseY + Math.sin(timeSec * 3.2 + item.phase) * 5;
            if (Math.hypot(p.x - item.x, (p.y - 22) - itemY) < 34) {
              item.collected = true;

              if (item.kind === 'fish') {
                sfx.fishCollect(sfxOnRef.current);
                setFishCount((f) => f + 1);
                setScore((s) => s + 15);
                popupsRef.current.push({
                  x: item.x,
                  y: itemY - 12,
                  text: '+1 Cá · +15',
                  color: '#EA580C',
                  life: 0,
                  maxLife: 0.85,
                });
              } else if (item.kind === 'star') {
                sfx.star(sfxOnRef.current);
                setStarsCount((st) => st + 1);
                setScore((s) => s + 25);
                popupsRef.current.push({
                  x: item.x,
                  y: itemY - 12,
                  text: '+1 Sao · +25',
                  color: '#D97706',
                  life: 0,
                  maxLife: 0.85,
                });
              } else if (item.kind === 'gift') {
                sfx.chestOpen(sfxOnRef.current);
                setFishCount((f) => f + 1);
                setStarsCount((st) => st + 1);
                setScore((s) => s + 50);
                popupsRef.current.push({
                  x: item.x,
                  y: itemY - 14,
                  text: 'Hộp quà! +50',
                  color: '#E11D48',
                  life: 0,
                  maxLife: 1.0,
                });
              } else {
                sfx.chestOpen(sfxOnRef.current);
                setStarsCount((st) => st + 2);
                setScore((s) => s + 100);
                popupsRef.current.push({
                  x: item.x,
                  y: itemY - 14,
                  text: 'Báu vật! +100',
                  color: '#D97706',
                  life: 0,
                  maxLife: 1.05,
                });
              }

              for (let k = 0; k < 12; k++) {
                const ang = (Math.PI * 2 * k) / 12;
                const spd = 50 + Math.random() * 80;
                particlesRef.current.push({
                  x: item.x,
                  y: itemY,
                  vx: Math.cos(ang) * spd,
                  vy: Math.sin(ang) * spd,
                  radius: 3 + Math.random() * 2.5,
                  color: item.kind === 'fish' ? item.color : '#FACC15',
                  alpha: 1,
                  life: 0,
                  maxLife: 0.45,
                });
              }
            }
          }

          // Smooth camera tracking keeping penguin near 22% from left for wide forward visibility
          const targetCamX = Math.max(0, p.x - width * 0.22);
          camXRef.current += (targetCamX - camXRef.current) * Math.min(1, dt * 6);

          // Swimming underwater sea creatures
          const wrapSpan = Math.max(1100, width * 1.4);
          for (const sc of seaCreaturesRef.current) {
            sc.x += sc.speed * dt;
            if (sc.speed > 0 && sc.x > wrapSpan) sc.x = -60;
            if (sc.speed < 0 && sc.x < -60) sc.x = wrapSpan;
          }

          // Snowflakes
          for (const flake of snowflakesRef.current) {
            flake.x += flake.vx * dt;
            flake.y += flake.vy * dt;
            if (flake.y > height) {
              flake.y = -4;
              flake.x = Math.random() * width;
            }
            if (flake.x < 0) flake.x = width;
            if (flake.x > width) flake.x = 0;
          }

          // Particles & popups
          particlesRef.current = particlesRef.current.filter((pt) => {
            pt.life += dt;
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt;
            pt.vy += 260 * dt;
            pt.alpha = Math.max(0, 1 - pt.life / pt.maxLife);
            return pt.life < pt.maxLife;
          });

          popupsRef.current = popupsRef.current.filter((pp) => {
            pp.life += dt;
            pp.y -= 34 * dt;
            return pp.life < pp.maxLife;
          });
        }

        // === RENDER ===
        const dpr = canvas.width / width;
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        const camX = camXRef.current;
        const stageChapter =
          viewModeRef.current === 'endless'
            ? 3
            : PENGUIN_STAGES.find((s) => s.stage === currentStageNumRef.current)?.chapter ?? 1;

        // Chapter-reactive sky lighting, sunbeams & northern lights aurora
        if (stageChapter === 1) {
          const sunGlow = ctx.createRadialGradient(width * 0.82, height * 0.14, 15, width * 0.82, height * 0.14, width * 0.55);
          sunGlow.addColorStop(0, 'rgba(254, 249, 195, 0.36)');
          sunGlow.addColorStop(0.5, 'rgba(186, 230, 253, 0.14)');
          sunGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = sunGlow;
          ctx.fillRect(0, 0, width, waterSurfaceY);
        } else if (stageChapter === 2) {
          const mistGrad = ctx.createLinearGradient(0, 0, 0, waterSurfaceY);
          mistGrad.addColorStop(0, 'rgba(129, 140, 248, 0.26)');
          mistGrad.addColorStop(0.65, 'rgba(224, 231, 255, 0.16)');
          mistGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = mistGrad;
          ctx.fillRect(0, 0, width, waterSurfaceY);
        } else {
          const nightGrad = ctx.createLinearGradient(0, 0, 0, waterSurfaceY);
          nightGrad.addColorStop(0, 'rgba(30, 27, 75, 0.34)');
          nightGrad.addColorStop(1, 'rgba(14, 116, 144, 0.12)');
          ctx.fillStyle = nightGrad;
          ctx.fillRect(0, 0, width, waterSurfaceY);

          // Animated Northern Lights Aurora ribbons
          ctx.save();
          const auroraGrad = ctx.createLinearGradient(0, 10, width, height * 0.36);
          auroraGrad.addColorStop(0, 'rgba(52, 211, 153, 0.28)');
          auroraGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.26)');
          auroraGrad.addColorStop(1, 'rgba(167, 139, 250, 0.24)');
          ctx.fillStyle = auroraGrad;
          ctx.beginPath();
          ctx.moveTo(0, height * 0.18);
          for (let ax = 0; ax <= width + 30; ax += 30) {
            const ay =
              height * 0.15 +
              Math.sin(ax * 0.008 + timeSec * 1.1) * 22 +
              Math.cos(ax * 0.015 - timeSec * 0.8) * 10;
            ctx.lineTo(ax, ay);
          }
          ctx.lineTo(width, height * 0.34);
          ctx.lineTo(0, height * 0.34);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // Parallax distant snow-capped mountain ridges
        const drawMountainLayer = (parallax: number, baseH: number, fill: string, snowFill: string, seed: number) => {
          const span = 220;
          const offset = -(camX * parallax) % span;
          ctx.save();
          ctx.fillStyle = fill;
          ctx.beginPath();
          ctx.moveTo(-span, waterSurfaceY);
          for (let x = offset - span; x <= width + span * 2; x += span) {
            const peakH = baseH + Math.sin((x - offset + seed * 90) * 0.014) * 24;
            ctx.lineTo(x + span * 0.5, waterSurfaceY - peakH);
            ctx.lineTo(x + span, waterSurfaceY - 12);
          }
          ctx.lineTo(width + span, waterSurfaceY);
          ctx.closePath();
          ctx.fill();

          // Sunlit snow caps on peaks
          ctx.fillStyle = snowFill;
          for (let x = offset - span; x <= width + span * 2; x += span) {
            const peakH = baseH + Math.sin((x - offset + seed * 90) * 0.014) * 24;
            const px = x + span * 0.5;
            const py = waterSurfaceY - peakH;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + 28, py + 24);
            ctx.lineTo(px + 8, py + 20);
            ctx.lineTo(px - 6, py + 26);
            ctx.lineTo(px - 26, py + 22);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        };

        drawMountainLayer(0.11, 118, 'rgba(147, 197, 253, 0.35)', 'rgba(255, 255, 255, 0.5)', 1);
        drawMountainLayer(0.22, 82, 'rgba(125, 211, 252, 0.42)', 'rgba(255, 255, 255, 0.65)', 3);

        // Crystal-clear turquoise arctic ocean fill below waterSurfaceY
        const waterGrad = ctx.createLinearGradient(0, waterSurfaceY - 6, 0, height);
        waterGrad.addColorStop(0, 'rgba(56, 189, 248, 0.58)');
        waterGrad.addColorStop(0.38, 'rgba(6, 182, 212, 0.78)');
        waterGrad.addColorStop(1, 'rgba(3, 105, 161, 0.94)');
        ctx.fillStyle = waterGrad;
        ctx.fillRect(0, waterSurfaceY, width, height - waterSurfaceY);

        // Underwater shimmering caustics & colorful swimming sea creatures
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, waterSurfaceY, width, height - waterSurfaceY);
        ctx.clip();

        // Sunlit water caustic rays
        for (let r = 0; r < 6; r++) {
          const rx = ((r * 210 - (camX * 0.35) % 210) + timeSec * 14) % (width + 160) - 80;
          ctx.fillStyle = 'rgba(224, 242, 254, 0.12)';
          ctx.beginPath();
          ctx.moveTo(rx, waterSurfaceY);
          ctx.lineTo(rx + 42, waterSurfaceY);
          ctx.lineTo(rx + 88, height);
          ctx.lineTo(rx + 26, height);
          ctx.closePath();
          ctx.fill();
        }

        // Swimming underwater fish, jellyfish & sea stars
        for (const sc of seaCreaturesRef.current) {
          const sx = ((sc.x - camX * 0.3) % (width + 160) + (width + 160)) % (width + 160) - 80;
          const sy = waterSurfaceY + sc.yOffset + Math.sin(timeSec * 2.2 + sc.phase) * 5;
          if (sy > height - 8) continue;

          ctx.save();
          ctx.translate(sx, sy);
          ctx.globalAlpha = 0.48;
          if (sc.speed < 0) ctx.scale(-1, 1);

          if (sc.kind === 'fish') {
            ctx.fillStyle = sc.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, sc.size, sc.size * 0.58, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(-sc.size + 2, 0);
            ctx.lineTo(-sc.size - 7, -5);
            ctx.lineTo(-sc.size - 7, 5);
            ctx.closePath();
            ctx.fill();
          } else if (sc.kind === 'jelly') {
            ctx.fillStyle = '#E0F2FE';
            ctx.beginPath();
            ctx.arc(0, 0, sc.size * 0.72, Math.PI, 0);
            ctx.fill();
            ctx.strokeStyle = 'rgba(224, 242, 254, 0.7)';
            ctx.lineWidth = 1.4;
            for (let t = -1; t <= 1; t++) {
              ctx.beginPath();
              ctx.moveTo(t * 3.5, 0);
              ctx.quadraticCurveTo(t * 4 + Math.sin(timeSec * 5 + t) * 3, 7, t * 3.5, 13);
              ctx.stroke();
            }
          } else {
            ctx.fillStyle = sc.color;
            ctx.beginPath();
            for (let pIdx = 0; pIdx < 10; pIdx++) {
              const ang = (pIdx * Math.PI) / 5;
              const rr = pIdx % 2 === 0 ? sc.size * 0.75 : sc.size * 0.35;
              const px = Math.cos(ang) * rr;
              const py = Math.sin(ang) * rr;
              if (pIdx === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }
        ctx.restore();

        // Background gentle ocean wave crest
        ctx.fillStyle = 'rgba(186, 230, 253, 0.36)';
        ctx.beginPath();
        ctx.moveTo(0, waterSurfaceY + 12);
        for (let wx = 0; wx <= width + 24; wx += 24) {
          const wy = waterSurfaceY + Math.sin((wx + camX * 0.45) * 0.03 + timeSec * 2.1) * 4;
          ctx.lineTo(wx, wy);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        // Ice Floes (with deep underwater roots + snow caps)
        for (const floe of floesRef.current) {
          const sx = floe.x - camX;
          if (sx + floe.width < -140 || sx > width + 140) continue;
          drawIceFloe(ctx, floe, camX, timeSec, waterSurfaceY);
        }

        // Collectibles
        for (const item of collectiblesRef.current) {
          const sx = item.x - camX;
          if (sx < -60 || sx > width + 60) continue;
          drawCollectible(ctx, item, camX, timeSec);
        }

        // Flying Birds
        for (const bird of birdsRef.current) {
          const sx = bird.x - camX;
          if (sx < -60 || sx > width + 60) continue;
          drawSkyBird(ctx, bird, camX, timeSec);
        }

        // Aiming parabolic dots while charging jump!
        if (isChargingRef.current && p.grounded && !p.splashing) {
          const power = Math.max(0.08, Math.min(1, chargeRatioRef.current));
          const vx = PENGUIN_PHYSICS.vxMin + power * (PENGUIN_PHYSICS.vxMax - PENGUIN_PHYSICS.vxMin);
          const vy = PENGUIN_PHYSICS.vyMin + power * (PENGUIN_PHYSICS.vyMax - PENGUIN_PHYSICS.vyMin);

          for (let step = 1; step <= 14; step++) {
            const t = step * 0.072;
            const px = p.x + vx * t - camX;
            const py = p.y + vy * t + 0.5 * PENGUIN_PHYSICS.gravity * t * t;
            if (py > waterSurfaceY + 8) break;
            ctx.save();
            ctx.globalAlpha = Math.max(0.28, 1 - step * 0.05);
            ctx.fillStyle = step % 2 === 0 ? '#FEF08A' : '#FFFFFF';
            ctx.beginPath();
            ctx.arc(px, py - 10, 4.5 - step * 0.14, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(2, 132, 199, 0.58)';
            ctx.lineWidth = 1.3;
            ctx.stroke();
            ctx.restore();
          }
        }

        // 3D Baby Penguin + Ground Shadow
        const activeFloe = floesRef.current.find((f) => f.id === p.currentFloeId);
        drawBabyPenguin(
          ctx,
          p,
          activeFloe,
          camX,
          isChargingRef.current,
          chargeRatioRef.current,
          timeSec,
          waterSurfaceY
        );

        // Foreground sparkling ocean waves & surface light glints
        ctx.fillStyle = 'rgba(56, 189, 248, 0.34)';
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let wx = 0; wx <= width + 24; wx += 24) {
          const wy =
            waterSurfaceY + 14 + Math.sin((wx + camX * 0.7) * 0.045 - timeSec * 2.7) * 5;
          ctx.lineTo(wx, wy);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();

        // Sparkling water surface highlight streaks
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.36)';
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        for (let sIdx = 0; sIdx < 7; sIdx++) {
          const rx = ((sIdx * 165 - (camX * 0.65) % 165) + timeSec * 22) % (width + 80) - 40;
          const ry = waterSurfaceY + 18 + (sIdx % 3) * 14;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx + 28, ry);
          ctx.stroke();
        }

        // Particles
        for (const pt of particlesRef.current) {
          ctx.save();
          ctx.globalAlpha = pt.alpha;
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(pt.x - camX, pt.y, pt.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Floating Score Popups
        for (const pp of popupsRef.current) {
          const alpha = Math.max(0, 1 - pp.life / pp.maxLife);
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.font = '800 16px "Baloo 2", sans-serif';
          ctx.textAlign = 'center';
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 4;
          ctx.strokeText(pp.text, pp.x - camX, pp.y);
          ctx.fillStyle = pp.color;
          ctx.fillText(pp.text, pp.x - camX, pp.y);
          ctx.restore();
        }

        // Layered falling snow (bokeh + crisp sparkles)
        for (const flake of snowflakesRef.current) {
          ctx.save();
          ctx.globalAlpha = flake.alpha;
          ctx.fillStyle = flake.bokeh ? 'rgba(224, 242, 254, 0.9)' : '#FFFFFF';
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();
      }

      rafId = window.requestAnimationFrame(frame);
    };

    rafId = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(rafId);
  }, [viewMode, handleStageWin, handleEndlessFinish, showTempBanner]);

  // === TITLE SCREEN ===
  if (viewMode === 'title') {
    return (
      <div className="bg-white rounded-3xl border border-sky-200 shadow-md overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[420px] bg-sky-100">
            <ResilientImage
              src={CARD_ART_URL}
              alt="Chim Cánh Cụt Vượt Băng – Penguin Ice Adventure"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-slate-900/10" />
          </div>

          <div className="p-6 sm:p-8 flex flex-col justify-center space-y-6 bg-gradient-to-br from-sky-50/70 via-white to-cyan-50/70">
            <div className="space-y-2">
              <p className="text-xs font-extrabold uppercase tracking-wider text-sky-700">
                Trò Chơi Phiêu Lưu Mùa Đông · 15 Màn & Chơi Vô Tận
              </p>
              <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-900 leading-tight">
                Chim Cánh Cụt Vượt Băng
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Giúp chú chim cánh cụt con đáng yêu nhảy qua các tảng băng nổi, thu thập cá sắc màu và sao vàng giữa đại dương tuyết lấp lánh!
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-sky-200/80 p-4 space-y-2">
              <div className="font-display font-extrabold text-sm text-sky-900">
                Cách chơi siêu dễ với 1 nút:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                <div className="bg-sky-50 rounded-xl px-3 py-2">
                  👆 <strong>Chạm nhanh:</strong> Nhảy một bước ngắn
                </div>
                <div className="bg-amber-50 rounded-xl px-3 py-2">
                  ⏱️ <strong>Nhấn giữ & thả:</strong> Nhảy xa qua khe rộng
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  sfx.pop(sfxOn);
                  setCurrentStageNum(normSaved.unlockedStage);
                  setViewMode('stage');
                  const cfg =
                    PENGUIN_STAGES.find((s) => s.stage === normSaved.unlockedStage) ??
                    PENGUIN_STAGES[0];
                  speakVietnamese(cfg.voiceIntro, voiceEnabled);
                }}
                className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-b from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-display font-extrabold text-lg flex items-center justify-center gap-2 shadow-md border-b-4 border-orange-700 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>BẮT ĐẦU (Màn {normSaved.unlockedStage})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sfx.tap(sfxOn);
                  setViewMode('map');
                }}
                className="py-4 px-5 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-display font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
              >
                <Map className="w-5 h-5" />
                <span>Bản đồ 15 màn</span>
              </button>
            </div>

            {normSaved.endlessUnlocked && (
              <button
                type="button"
                onClick={() => {
                  sfx.pop(sfxOn);
                  setViewMode('endless');
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-display font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <InfinityIcon className="w-5 h-5" />
                <span>Vào Chế Độ Chơi Vô Tận</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // === 15-STAGE MAP ===
  if (viewMode === 'map') {
    return (
      <PenguinStageMap
        progress={savedProgress}
        onBackTitle={() => {
          sfx.tap(sfxOn);
          setViewMode('title');
        }}
        onSelectStage={(stageNum) => {
          sfx.pop(sfxOn);
          setCurrentStageNum(stageNum);
          setViewMode('stage');
          const cfg = PENGUIN_STAGES.find((s) => s.stage === stageNum) ?? PENGUIN_STAGES[0];
          speakVietnamese(cfg.voiceIntro, voiceEnabled);
        }}
        onStartEndless={() => {
          sfx.pop(sfxOn);
          setViewMode('endless');
          speakVietnamese(
            'Chào mừng đến Biển Băng Bất Tận! Bé hãy nhảy thật xa để lập kỷ lục mới nhé!',
            voiceEnabled
          );
        }}
        onLockedTap={(reqStage) => {
          sfx.gentleOops(sfxOn);
          speakVietnamese(
            reqStage === 15
              ? 'Bé hãy hoàn thành Màn 15 để mở khóa Chế độ Vô Tận nhé!'
              : `Bé hãy hoàn thành Màn ${reqStage} để mở khóa màn tiếp theo nhé!`,
            voiceEnabled
          );
        }}
      />
    );
  }

  // === ACTIVE GAMEPLAY VIEW (FULL 85-90% VIEWPORT ADVENTURE ARENA) ===
  return (
    <div className="w-full">
      <div
        ref={arenaRef}
        className="relative w-full h-[calc(100dvh-108px)] min-h-[480px] sm:min-h-[540px] rounded-3xl overflow-hidden border border-sky-200/80 shadow-xl select-none bg-sky-200"
      >
        <ResilientImage
          src={BACKDROP_URL}
          alt="Đại dương băng tuyết kỳ thú"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        <canvas
          ref={canvasRef}
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            startCharge();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            releaseJump();
          }}
          onPointerCancel={releaseJump}
          className="relative z-10 w-full h-full block touch-none cursor-pointer"
        />

        {/* GÓC TRÊN TRÁI: BẢN ĐỒ & THÔNG TIN MÀN CHƠI SIÊU GỌN */}
        <div className="pointer-events-none absolute top-2.5 left-2.5 z-20 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              sfx.tap(sfxOn);
              setViewMode('map');
            }}
            className="pointer-events-auto inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/88 backdrop-blur-sm hover:bg-white text-slate-800 font-display font-bold text-xs shadow-sm border border-white/70 cursor-pointer whitespace-nowrap"
          >
            <Map className="w-3.5 h-3.5 text-sky-600" />
            <span>Bản đồ</span>
          </button>

          {viewMode === 'stage' ? (
            <span
              className="px-2.5 py-1.5 rounded-xl text-white font-display font-extrabold text-xs shadow-sm whitespace-nowrap"
              style={{ backgroundColor: currentChapter.accentHex }}
            >
              Màn {currentStageNum}/15 · {currentChapter.difficultyLabel}
            </span>
          ) : (
            <span className="px-2.5 py-1.5 rounded-xl bg-indigo-600/95 text-white font-display font-extrabold text-xs inline-flex items-center gap-1 shadow-sm whitespace-nowrap">
              <InfinityIcon className="w-3.5 h-3.5" />
              Vô Tận · {distanceFloes} bước
            </span>
          )}
        </div>

        {/* GÓC TRÊN PHẢI: ĐIỂM, CÁ, SAO, LƯỢT CHƠI & ÂM THANH GỌN GÀNG */}
        <div className="pointer-events-none absolute top-2.5 right-2.5 z-20 flex flex-wrap items-center justify-end gap-1.5 tabular-nums">
          <div className="flex items-center gap-1 bg-white/88 backdrop-blur-sm border border-amber-200/80 rounded-xl px-2 py-1 text-xs font-extrabold text-amber-800 shadow-sm">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>{score}</span>
          </div>

          <div className="flex items-center gap-1 bg-white/88 backdrop-blur-sm border border-sky-200/80 rounded-xl px-2 py-1 text-xs font-extrabold text-sky-800 shadow-sm">
            <Fish className="w-3.5 h-3.5 text-sky-600" />
            <span>{fishCount}</span>
          </div>

          <div className="flex items-center gap-1 bg-white/88 backdrop-blur-sm border border-amber-200/80 rounded-xl px-2 py-1 text-xs font-extrabold text-amber-700 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{starsCount}</span>
          </div>

          <div className="flex items-center gap-0.5 bg-white/88 backdrop-blur-sm border border-rose-200/80 rounded-xl px-2 py-1 shadow-sm">
            {[1, 2, 3].map((h) => (
              <Heart
                key={h}
                className={`w-3.5 h-3.5 ${
                  h <= lives ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setSfxOn((s) => !s)}
            title="Bật/tắt âm thanh hiệu ứng"
            className={`pointer-events-auto inline-flex items-center justify-center w-8 h-8 rounded-xl border shadow-sm backdrop-blur-sm cursor-pointer ${
              sfxOn && soundEnabled
                ? 'bg-white/90 text-sky-700 border-sky-200'
                : 'bg-white/75 text-slate-400 border-slate-200'
            }`}
          >
            {sfxOn && soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setMusicOn((m) => !m)}
            title="Bật/tắt nhạc nền"
            className={`pointer-events-auto inline-flex items-center justify-center w-8 h-8 rounded-xl border shadow-sm backdrop-blur-sm cursor-pointer ${
              musicOn && soundEnabled
                ? 'bg-white/90 text-emerald-700 border-emerald-200'
                : 'bg-white/75 text-slate-400 border-slate-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
          </button>

          {viewMode === 'endless' && (
            <button
              type="button"
              onClick={handleEndlessFinish}
              className="pointer-events-auto px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-display font-bold text-xs shadow-sm cursor-pointer"
            >
              Lưu kỷ lục
            </button>
          )}
        </div>

        {/* Thông báo khích lệ nhẹ nhàng */}
        {feedbackBanner && !stageWon && !stageLost && !endlessEnded && (
          <div className="pointer-events-none absolute top-14 left-1/2 -translate-x-1/2 z-20 bg-slate-900/75 backdrop-blur-xs text-white px-4 py-1.5 rounded-2xl font-display font-bold text-xs sm:text-sm shadow-md whitespace-nowrap">
            {feedbackBanner}
          </div>
        )}

        {/* MODAL CHIẾN THẮNG MÀN CHƠI */}
        {stageWon && viewMode === 'stage' && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl border border-amber-200 text-center space-y-4 my-auto">
              <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto animate-companion-bounce">
                {currentStageNum === 15 ? (
                  <Crown className="w-9 h-9 text-amber-500" />
                ) : (
                  <Sparkles className="w-9 h-9" />
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">
                  Hoàn thành {currentStageCfg.title}
                </p>
                <h2 className="font-display font-extrabold text-2xl text-slate-900">
                  {currentStageNum === 15
                    ? 'Chinh Phục Vương Quốc Băng Giá!'
                    : newlyUnlockedStage
                    ? `Tuyệt Vời! Mở Khóa Màn ${newlyUnlockedStage}!`
                    : `Hoàn Thành Màn ${currentStageNum}!`}
                </h2>
                <div className="flex items-center justify-center gap-1 pt-1">
                  {[1, 2, 3].map((idx) => (
                    <Star
                      key={idx}
                      className={`w-7 h-7 ${
                        idx <= earnedStageStars
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {newlyEarnedBadges.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 space-y-1">
                  {newlyEarnedBadges.map((bId) => {
                    const b = PENGUIN_MILESTONE_BADGES.find((x) => x.id === bId);
                    if (!b) return null;
                    return (
                      <div
                        key={bId}
                        className="flex items-center justify-center gap-2 text-sm font-extrabold text-amber-800"
                      >
                        <Award className="w-5 h-5 text-orange-500 shrink-0" />
                        <span>
                          Nhận {b.icon} {b.title}!
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-center tabular-nums bg-sky-50/70 border border-sky-200/70 rounded-2xl p-3">
                <div>
                  <div className="font-display font-extrabold text-lg text-amber-600">
                    {score}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">Điểm số</div>
                </div>
                <div>
                  <div className="font-display font-extrabold text-lg text-sky-600">
                    {fishCount} 🐟
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">Cá nhỏ</div>
                </div>
                <div>
                  <div className="font-display font-extrabold text-lg text-rose-500">
                    {starsCount} ⭐
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">Sao thưởng</div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {currentStageNum < 15 ? (
                  <button
                    type="button"
                    onClick={() => {
                      sfx.pop(sfxOn);
                      const next = currentStageNum + 1;
                      setCurrentStageNum(next);
                      const nextCfg = PENGUIN_STAGES.find((s) => s.stage === next);
                      if (nextCfg) speakVietnamese(nextCfg.voiceIntro, voiceEnabled);
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-display font-bold text-base flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <span>Chơi tiếp Màn {currentStageNum + 1}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      sfx.pop(sfxOn);
                      setViewMode('endless');
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-display font-bold text-base flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <InfinityIcon className="w-5 h-5" />
                    <span>Vào Chế Độ Chơi Vô Tận</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sfx.tap(sfxOn);
                      resetStageBoard(currentStageCfg);
                    }}
                    className="py-2.5 px-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Chơi lại</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sfx.tap(sfxOn);
                      setViewMode('map');
                    }}
                    className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Bản đồ 15 màn</span>
                  </button>
                </div>

                {currentStageNum === 15 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onShowVictory) onShowVictory();
                      else onComplete(5);
                    }}
                    className="w-full py-2.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Xem Cúp Chiến Thắng & Quà Đảo Vui Nhộn</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL HẾT LƯỢT THÂN THIỆN */}
        {stageLost && viewMode === 'stage' && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/45 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-sky-200 text-center space-y-4">
              <div className="text-5xl">🐧💦</div>
              <div className="space-y-1">
                <h2 className="font-display font-extrabold text-2xl text-slate-900">
                  Cố Lên Bé Ơi!
                </h2>
                <p className="text-sm text-slate-600">
                  Chim cánh cụt rơi xuống nước mát rồi! Mình thử nhảy lại thật khéo nhé!
                </p>
              </div>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    sfx.pop(sfxOn);
                    resetStageBoard(currentStageCfg);
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-display font-bold text-base flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Chơi lại Màn {currentStageNum}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sfx.tap(sfxOn);
                    setViewMode('map');
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-sm cursor-pointer"
                >
                  Về Bản Đồ 15 Màn
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL KẾT QUẢ CHẾ ĐỘ VÔ TẬN */}
        {endlessEnded && viewMode === 'endless' && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-indigo-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                <Trophy className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                  Kết Quả Biển Băng Vô Tận
                </p>
                <h2 className="font-display font-extrabold text-2xl text-slate-900">
                  Bé Đã Vượt {distanceFloes} Tảng Băng!
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center tabular-nums bg-indigo-50/70 border border-indigo-200/70 rounded-2xl p-3">
                <div>
                  <div className="font-display font-extrabold text-lg text-amber-600">
                    {score}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">Điểm số</div>
                </div>
                <div>
                  <div className="font-display font-extrabold text-lg text-sky-600">
                    {fishCount} 🐟
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">Cá nhỏ</div>
                </div>
                <div>
                  <div className="font-display font-extrabold text-lg text-indigo-600">
                    {distanceFloes}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">Bước băng</div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sfx.pop(sfxOn);
                    resetEndlessBoard();
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-display font-bold text-base flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Chơi lại Vô Tận</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sfx.tap(sfxOn);
                    setViewMode('map');
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-display font-bold text-sm cursor-pointer"
                >
                  Về Bản Đồ 15 Màn
                </button>
              </div>
            </div>
          </div>
        )}
        {/* NÚT NHẢY NỔI GÓC DƯỚI PHẢI + THANH LỰC NHẢY SIÊU GỌN */}
        {!stageWon && !stageLost && !endlessEnded && (
          <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-20 flex items-end justify-between gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/45 backdrop-blur-xs text-white/95 px-3 py-1.5 rounded-xl text-[11px] font-semibold">
              <span>Chạm: nhảy ngắn · Nhấn giữ hoặc Space: nhảy xa</span>
            </div>

            <div className="pointer-events-auto ml-auto flex flex-col items-stretch gap-1.5 bg-white/88 backdrop-blur-sm p-2 rounded-2xl border border-white/80 shadow-lg min-w-[195px] sm:min-w-[220px]">
              <div className="flex items-center justify-between px-1 text-[11px] font-extrabold text-slate-700">
                <span>Lực nhảy</span>
                <span className="tabular-nums text-sky-700">{chargePct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 via-amber-400 to-orange-500 transition-none rounded-full"
                  style={{ width: `${chargePct}%` }}
                />
              </div>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.currentTarget.setPointerCapture(e.pointerId);
                  startCharge();
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  releaseJump();
                }}
                onPointerCancel={releaseJump}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 active:translate-y-0.5 text-white font-display font-extrabold text-sm sm:text-base shadow-sm border-b-[3px] border-blue-800 select-none touch-none cursor-pointer transition-transform"
              >
                🐧 NHẤN GIỮ ĐỂ NHẢY
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
