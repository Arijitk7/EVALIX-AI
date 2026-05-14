import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BrainCircuit, Sparkles, ShieldCheck, Zap, Users, BarChart3,
  FileEdit, CheckCircle2, ArrowRight, ChevronDown, Mail,
  GraduationCap, Clock, Bot, Award, BookOpen, Target,
  Play, Star, Menu, X
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import logo from "../assets/pod5.png";

// Landing page style isolation
const injectStyles = () => {
  if (document.getElementById("home-styles")) return;
  const s = document.createElement("style");
  s.id = "home-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

    :root {
      --brand:#D85A30; --brand-dim:#993C1D; --brand-glow:rgba(216,90,48,.25); --brand-g2:rgba(216,90,48,.07);
      --bg-base:#0E0D0C; --bg-panel:#141311; --bg-card:#1A1917; --bg-card2:#201F1D; --bg-hover:#252320;
      --border:#252320; --border-hi:#353330;
      --txt-1:#F5F3EE; --txt-2:#C8C5BC; --txt-3:#7A7870; --txt-4:#4A4845;
      --teal:#34d399; --amber:#f59e0b;
      --r-lg:16px; --r-md:12px; --r-sm:8px; --tx:240ms cubic-bezier(.4,0,.2,1);
    }
    [data-theme='light'] {
      --brand:#C84E22; --brand-dim:#A33A16; --brand-glow:rgba(200,78,34,.2); --brand-g2:rgba(200,78,34,.06);
      --bg-base:#F7F5F2; --bg-panel:#EFEDE9; --bg-card:#FFFFFF; --bg-card2:#F0EDE8; --bg-hover:#E8E5E0;
      --border:#E2DED8; --border-hi:#CCCAC4;
      --txt-1:#1A1917; --txt-2:#3D3B37; --txt-3:#7A7870; --txt-4:#B0ADA7;
    }

    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{font-family:'DM Sans',sans-serif;background:var(--bg-base);color:var(--txt-1);-webkit-font-smoothing:antialiased;overflow-x:hidden}
    ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:var(--border-hi);border-radius:99px}

    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.6)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
    @keyframes floatCard{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-10px) rotate(1deg)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeUpStagger{from{opacity:0;transform:translateY(40px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes gradShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
    @keyframes slideRight{from{transform:translateX(-100%)}to{transform:translateX(0)}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
    @keyframes orbit{from{transform:rotate(0deg) translateX(90px) rotate(0deg)}to{transform:rotate(360deg) translateX(90px) rotate(-360deg)}}
    @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(216,90,48,.3)}50%{box-shadow:0 0 50px rgba(216,90,48,.7),0 0 80px rgba(216,90,48,.15)}}
    @keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(216,90,48,.4)}50%{box-shadow:0 0 0 8px rgba(216,90,48,.0)}}
    @keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes blobDrift{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.05)}66%{transform:translate(-20px,20px) scale(.97)}}
    @keyframes blobDrift2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-25px,15px) scale(1.04)}66%{transform:translate(20px,-15px) scale(.98)}}
    @keyframes borderSpin{to{transform:rotate(360deg)}}
    @keyframes countUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}


    /* ── Nav ── */
    .hp-nav{
      position:fixed;top:0;left:0;right:0;z-index:100;
      transition:all .35s cubic-bezier(0.17,0.84,0.44,1);
    }
    .hp-nav.scrolled{
      background:rgba(14,13,12,.88);
      backdrop-filter:blur(24px) saturate(1.6);
      -webkit-backdrop-filter:blur(24px) saturate(1.6);
      border-bottom:1px solid rgba(53,51,48,.9);
      box-shadow:0 8px 40px rgba(0,0,0,0.4);
    }
    .hp-nav-inner{
      max-width:1280px;margin:0 auto;
      padding:0 28px;height:68px;
      display:flex;align-items:center;justify-content:space-between;
    }
    .hp-brand{display:flex;align-items:center;gap:10px;text-decoration:none}
    .hp-brand-ring{
      width:36px;height:36px;border-radius:50%;
      border:2px solid var(--brand);background:var(--brand-g2);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 0 14px var(--brand-glow);
      animation:glow 3s ease infinite;
    }
    .hp-brand-name{font-family:'Syne',sans-serif;font-weight:800;font-size:17px;letter-spacing:.05em;color:#fff}
    .hp-brand-name span{color:var(--brand)}
    .hp-nav-links{display:flex;align-items:center;gap:6px}
    .hp-nav-link{
      padding:7px 14px;border-radius:var(--r-sm);font-size:14px;
      font-weight:500;color:var(--txt-2);text-decoration:none;
      transition:all var(--tx);border:1px solid transparent;background:transparent;cursor:pointer;
      font-family:'DM Sans',sans-serif;
    }
    .hp-nav-link:hover{color:#fff;background:var(--bg-card);border-color:var(--border-hi)}
    .hp-nav-cta{
      padding:8px 20px;border-radius:var(--r-sm);font-size:14px;font-weight:700;
      background:var(--brand);color:#fff;border:none;cursor:pointer;
      font-family:'Syne',sans-serif;letter-spacing:.03em;
      box-shadow:0 4px 18px -4px var(--brand-glow);
      transition:background var(--tx),transform var(--tx);
    }
    .hp-nav-cta:hover{background:var(--brand-dim);transform:translateY(-1px)}
    .hp-hamburger{display:none;background:transparent;border:1px solid var(--border-hi);padding:7px;border-radius:var(--r-sm);color:var(--txt-2);cursor:pointer}
    .hp-mobile-menu{
      display:none;position:fixed;inset:0;z-index:99;
      background:rgba(10,9,8,.97);backdrop-filter:blur(20px);
      flex-direction:column;align-items:center;justify-content:center;gap:10px;
      animation:fadeIn .2s ease;
    }
    .hp-mobile-menu.open{display:flex}
    .hp-mob-link{
      font-family:'Syne',sans-serif;font-size:22px;font-weight:700;
      color:var(--txt-2);text-decoration:none;padding:12px 32px;
      border-radius:var(--r-md);transition:all var(--tx);cursor:pointer;
    }
    .hp-mob-link:hover{color:#fff;background:var(--bg-card)}
    .hp-mob-close{
      position:absolute;top:24px;right:24px;
      background:var(--bg-card);border:1px solid var(--border-hi);
      color:var(--txt-2);width:40px;height:40px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;cursor:pointer;
    }

    /* ── Hero ── */
    .hp-hero{
      min-height:100vh;display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      padding:120px 28px 80px;position:relative;overflow:hidden;
      text-align:center;
    }
    .hero-grid-bg{
      position:absolute;inset:0;z-index:0;
      background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
      background-size:60px 60px;
      mask-image:radial-gradient(ellipse 80% 60% at 50% 0%,black 40%,transparent 100%);
    }
    .hero-glow{
      position:absolute;top:10%;left:50%;transform:translateX(-50%);
      width:600px;height:600px;border-radius:50%;
      background:radial-gradient(circle,rgba(216,90,48,.12) 0%,transparent 70%);
      pointer-events:none;z-index:0;
    }
    .hero-content{position:relative;z-index:1;max-width:860px;animation:fadeUp .9s cubic-bezier(0.17,0.84,0.44,1) forwards}
    .hero-eyebrow{
      display:inline-flex;align-items:center;gap:8px;
      padding:6px 16px;border-radius:99px;
      background:var(--brand-g2);border:1px solid rgba(216,90,48,.3);
      font-size:12px;font-weight:700;color:var(--brand);
      letter-spacing:.1em;text-transform:uppercase;margin-bottom:28px;
      font-family:'Syne',sans-serif;
    }
    .hero-title{
      font-family:'Syne',sans-serif;font-size:clamp(42px,7vw,80px);
      font-weight:800;line-height:1.06;letter-spacing:-.03em;
      color:#fff;margin-bottom:24px;
    }
    .hero-title .stroke{
      -webkit-text-stroke:2px var(--brand);
      -webkit-text-fill-color:transparent;
      color:transparent;
    }
    .hero-title .coral{
      background:linear-gradient(135deg,var(--brand),#ff8c64,var(--brand));
      background-size:200% 200%;
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      background-clip:text;animation:gradShift 4s ease infinite;
    }
    .hero-sub{
      font-size:clamp(16px,2vw,20px);color:var(--txt-2);
      line-height:1.65;max-width:620px;margin:0 auto 44px;
    }
    .hero-btns{display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap}
    .btn-primary{
      display:flex;align-items:center;gap:9px;
      padding:15px 32px;border-radius:var(--r-md);
      background:var(--brand);border:none;color:#fff;
      font-size:15px;font-weight:700;font-family:'Syne',sans-serif;
      cursor:pointer;letter-spacing:.02em;
      box-shadow:0 6px 28px -6px var(--brand-glow);
      transition:all 220ms cubic-bezier(0.34,1.56,0.64,1);
      position:relative;overflow:hidden;
    }
    .btn-primary:hover{background:var(--brand-dim);transform:translateY(-4px) scale(1.04);box-shadow:0 20px 48px -6px var(--brand-glow)}
    .btn-primary:active{transform:translateY(-1px) scale(.99)}
    .btn-secondary{
      display:flex;align-items:center;gap:9px;
      padding:15px 30px;border-radius:var(--r-md);
      background:transparent;border:1px solid var(--border-hi);
      color:var(--txt-2);font-size:15px;font-weight:600;
      font-family:'DM Sans',sans-serif;cursor:pointer;
      transition:all 220ms cubic-bezier(0.34,1.56,0.64,1);
    }
    .btn-secondary:hover{color:#fff;border-color:rgba(216,90,48,.5);background:rgba(216,90,48,.06);transform:translateY(-3px) scale(1.02)}
    .btn-secondary:active{transform:translateY(0) scale(.99)}
    .hero-scroll{
      position:absolute;bottom:36px;left:50%;transform:translateX(-50%);
      display:flex;flex-direction:column;align-items:center;gap:6px;
      color:var(--txt-4);font-size:11px;font-weight:600;letter-spacing:.1em;
      text-transform:uppercase;animation:fadeIn 2s ease forwards;
    }
    .hero-scroll svg{animation:float 2s ease infinite}

    /* Hero stats bar */
    .hero-stats{
      display:flex;align-items:center;justify-content:center;gap:0;
      margin-top:56px;background:var(--bg-card);border:1px solid var(--border-hi);
      border-radius:var(--r-lg);overflow:hidden;flex-wrap:wrap;
    }
    .hero-stat{padding:18px 36px;text-align:center;border-right:1px solid var(--border-hi)}
    .hero-stat:last-child{border-right:none}
    .hero-stat-val{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:#fff;letter-spacing:-.02em}
    .hero-stat-val span{color:var(--brand)}
    .hero-stat-label{font-size:11.5px;color:var(--txt-3);margin-top:3px;letter-spacing:.04em}

    /* ── Sections ── */
    .hp-section{max-width:1280px;margin:0 auto;padding:100px 28px}
    .section-eyebrow{
      display:inline-flex;align-items:center;gap:7px;
      font-size:11px;font-weight:700;color:var(--brand);
      letter-spacing:.14em;text-transform:uppercase;
      font-family:'Syne',sans-serif;margin-bottom:16px;
    }
    .section-title{
      font-family:'Syne',sans-serif;font-size:clamp(28px,4vw,46px);
      font-weight:800;color:#fff;letter-spacing:-.02em;
      line-height:1.1;margin-bottom:16px;
    }
    .section-sub{font-size:16px;color:var(--txt-3);line-height:1.7;max-width:520px}
    .section-center{text-align:center}
    .section-center .section-sub{margin:0 auto}

    /* ── How it works ── */
    .flow-wrap{
      display:grid;grid-template-columns:repeat(5,1fr);
      gap:0;margin-top:64px;position:relative;
    }
    .flow-step{display:flex;flex-direction:column;align-items:center;text-align:center;position:relative}
    .flow-step::after{
      content:'';position:absolute;top:28px;left:calc(50% + 28px);right:calc(-50% + 28px);
      height:1px;background:linear-gradient(90deg,var(--border-hi),transparent);
    }
    .flow-step:last-child::after{display:none}
    .flow-num{
      width:56px;height:56px;border-radius:50%;
      background:var(--bg-card2);border:1px solid var(--border-hi);
      display:flex;align-items:center;justify-content:center;
      font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--brand);
      margin-bottom:16px;position:relative;z-index:1;
      transition:all var(--tx);
    }
    .flow-step:hover .flow-num{background:var(--brand-g2);border-color:rgba(216,90,48,.5);box-shadow:0 0 20px var(--brand-glow)}
    .flow-label{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#fff;margin-bottom:6px}
    .flow-desc{font-size:12px;color:var(--txt-3);line-height:1.5;padding:0 8px}

    /* ── Features ── */
    .features-grid{
      display:grid;grid-template-columns:repeat(3,1fr);
      gap:16px;margin-top:64px;
    }
    .feat-card{
      background:var(--bg-card);border:1px solid var(--border);
      border-radius:20px;padding:28px;
      display:flex;flex-direction:column;gap:14px;
      position:relative;overflow:hidden;
      transition:all 280ms cubic-bezier(0.34,1.4,0.64,1);
      opacity:0;transform:translateY(32px);
    }
    .feat-card.in-view{opacity:1;transform:translateY(0)}
    .feat-card::before{
      content:'';position:absolute;inset:0;border-radius:20px;
      background:linear-gradient(135deg,var(--brand-g2),transparent);
      opacity:0;transition:opacity 240ms ease;
    }
    .feat-card:hover{border-color:rgba(216,90,48,.4);transform:translateY(-8px) scale(1.02);box-shadow:0 32px 64px -12px rgba(0,0,0,.7),0 0 0 1px rgba(216,90,48,.15)}
    .feat-card:hover::before{opacity:1}
    .feat-card.large{grid-column:span 2}
    .feat-icon{
      width:44px;height:44px;border-radius:12px;
      background:var(--brand-g2);border:1px solid rgba(216,90,48,.25);
      display:flex;align-items:center;justify-content:center;
      color:var(--brand);flex-shrink:0;position:relative;z-index:1;
    }
    .feat-title{font-family:'Syne',sans-serif;font-size:17px;font-weight:700;color:#fff;position:relative;z-index:1}
    .feat-desc{font-size:13.5px;color:var(--txt-3);line-height:1.65;position:relative;z-index:1}
    .feat-tag{
      display:inline-flex;align-items:center;gap:5px;
      padding:3px 10px;border-radius:5px;font-size:11px;font-weight:700;
      position:relative;z-index:1;width:fit-content;
    }
    .feat-tag.coral{background:var(--brand-g2);border:1px solid rgba(216,90,48,.3);color:var(--brand)}
    .feat-tag.teal{background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.25);color:var(--teal)}
    .feat-tag.amber{background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.25);color:var(--amber)}

    /* ── Split showcase ── */
    .showcase-wrap{
      display:grid;grid-template-columns:1fr 1fr;gap:60px;
      align-items:center;margin-top:60px;
    }
    .showcase-wrap.flip{direction:rtl}
    .showcase-wrap.flip>*{direction:ltr}
    .showcase-text{display:flex;flex-direction:column;gap:18px}
    .showcase-list{display:flex;flex-direction:column;gap:10px;margin-top:4px}
    .showcase-item{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--txt-2)}
    .showcase-item svg{color:var(--brand);flex-shrink:0}
    .showcase-visual{
      background:var(--bg-card);border:1px solid var(--border-hi);
      border-radius:var(--r-lg);padding:24px;
      position:relative;overflow:hidden;
    }
    .mock-header{display:flex;align-items:center;gap:8px;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid var(--border)}
    .mock-dot{width:10px;height:10px;border-radius:50%}
    .mock-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--txt-2);margin-left:4px}
    .mock-row{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-radius:8px;margin-bottom:8px;border:1px solid var(--border)}
    .mock-row.active{border-color:rgba(216,90,48,.35);background:var(--brand-g2)}
    .mock-name{font-size:13px;font-weight:600;color:#fff;display:flex;align-items:center;gap:8px}
    .mock-avatar{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,var(--brand-dim),var(--brand));display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;flex-shrink:0}
    .mock-score{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:var(--brand)}
    .mock-badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px}
    .mock-badge.green{background:rgba(52,211,153,.1);color:var(--teal);border:1px solid rgba(52,211,153,.2)}
    .mock-badge.yellow{background:rgba(245,158,11,.08);color:var(--amber);border:1px solid rgba(245,158,11,.2)}
    .mock-badge.coral{background:var(--brand-g2);color:var(--brand);border:1px solid rgba(216,90,48,.3)}

    /* AI Demo mock */
    .ai-mock{background:var(--bg-card);border:1px solid var(--border-hi);border-radius:var(--r-lg);padding:20px}
    .ai-msg{display:flex;gap:10px;margin-bottom:12px}
    .ai-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#0f766e,var(--teal));display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .ai-bubble{background:var(--bg-hover);border:1px solid var(--border-hi);border-radius:10px;padding:10px 14px;font-size:12.5px;color:var(--txt-2);line-height:1.55}
    .ai-bubble strong{color:#fff}
    .ai-typing{display:flex;gap:4px;align-items:center;margin-top:4px}
    .ai-typing span{width:5px;height:5px;border-radius:50%;background:var(--teal);animation:pulse 1.2s ease infinite}
    .ai-typing span:nth-child(2){animation-delay:.2s}
    .ai-typing span:nth-child(3){animation-delay:.4s}

    /* ── Roadmap ── */
    .roadmap-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:60px}
    .roadmap-card{
      background:var(--bg-card);border:1px solid var(--border);
      border-radius:20px;padding:26px;
      display:flex;flex-direction:column;gap:12px;
      transition:all 280ms cubic-bezier(0.34,1.4,0.64,1);
    }
    .roadmap-card:hover{border-color:rgba(216,90,48,.35);transform:translateY(-6px) scale(1.01);box-shadow:0 24px 48px -8px rgba(0,0,0,.5)}
    .roadmap-icon{font-size:28px;margin-bottom:4px}
    .roadmap-title{font-family:'Syne',sans-serif;font-size:17px;font-weight:700;color:#fff}
    .roadmap-desc{font-size:13px;color:var(--txt-3);line-height:1.65}
    .roadmap-tags{display:flex;flex-wrap:wrap;gap:7px;margin-top:4px}
    .roadmap-tag{font-size:10.5px;font-weight:600;padding:3px 9px;border-radius:5px;background:var(--bg-hover);border:1px solid var(--border-hi);color:var(--txt-2)}

    /* ── Tech stack ── */
    .tech-grid{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:50px}
    .tech-chip{
      display:flex;align-items:center;gap:7px;
      padding:8px 16px;border-radius:var(--r-sm);
      background:var(--bg-card);border:1px solid var(--border-hi);
      font-size:13px;font-weight:600;color:var(--txt-2);
      transition:all var(--tx);
    }
    .tech-chip:hover{border-color:var(--brand);color:#fff;background:var(--brand-g2)}
    .tech-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}

    /* ── CTA Banner ── */
    .cta-banner{
      margin:0 28px 100px;border-radius:var(--r-lg);
      background:linear-gradient(135deg,var(--bg-card) 0%,rgba(216,90,48,.08) 100%);
      border:1px solid rgba(216,90,48,.25);
      padding:64px 48px;text-align:center;position:relative;overflow:hidden;
    }
    .cta-banner::before{
      content:'';position:absolute;top:-80px;right:-80px;
      width:300px;height:300px;border-radius:50%;
      background:radial-gradient(circle,rgba(216,90,48,.12),transparent 70%);
      pointer-events:none;
    }
    .cta-title{font-family:'Syne',sans-serif;font-size:clamp(28px,4vw,44px);font-weight:800;color:#fff;letter-spacing:-.02em;margin-bottom:14px}
    .cta-sub{font-size:16px;color:var(--txt-3);max-width:500px;margin:0 auto 36px;line-height:1.7}

    /* ── Footer ── */
    .hp-footer{
      border-top:1px solid var(--border);
      background:var(--bg-panel);
      padding:60px 28px 36px;
    }
    .footer-inner{max-width:1280px;margin:0 auto}
    .footer-top{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;margin-bottom:56px}
    .footer-brand-desc{font-size:13.5px;color:var(--txt-3);line-height:1.7;margin-top:12px;max-width:280px}
    .footer-col-title{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:var(--txt-2);letter-spacing:.12em;text-transform:uppercase;margin-bottom:16px}
    .footer-link{display:block;font-size:13.5px;color:var(--txt-3);text-decoration:none;margin-bottom:10px;transition:color var(--tx);cursor:pointer}
    .footer-link:hover{color:#fff}
    .footer-bottom{display:flex;align-items:center;justify-content:space-between;padding-top:28px;border-top:1px solid var(--border);flex-wrap:wrap;gap:12px}
    .footer-copy{font-size:12.5px;color:var(--txt-4)}
    .footer-copy span{color:var(--brand)}
    .footer-socials{display:flex;gap:10px}
    .footer-social{width:34px;height:34px;border-radius:var(--r-sm);border:1px solid var(--border-hi);background:transparent;display:flex;align-items:center;justify-content:center;color:var(--txt-3);cursor:pointer;transition:all var(--tx)}
    .footer-social:hover{color:#fff;border-color:var(--brand);background:var(--brand-g2)}

    /* ── Contact ── */
    .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;margin-top:60px;align-items:start}
    .contact-form{display:flex;flex-direction:column;gap:16px}
    .cf-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .cf-label{display:block;font-size:11px;font-weight:700;color:var(--txt-3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px}
    .cf-input,.cf-textarea{
      width:100%;padding:11px 14px;
      background:var(--bg-card);border:1px solid var(--border-hi);
      border-radius:var(--r-sm);color:#fff;
      font-size:13.5px;font-family:'DM Sans',sans-serif;
      outline:none;transition:border-color var(--tx);
    }
    .cf-input::placeholder,.cf-textarea::placeholder{color:var(--txt-4)}
    .cf-input:focus,.cf-textarea:focus{border-color:var(--brand)}
    .cf-textarea{resize:vertical;height:120px;line-height:1.6}
    .cf-submit{
      padding:12px 24px;border-radius:var(--r-sm);
      background:var(--brand);border:none;color:#fff;
      font-size:14px;font-weight:700;font-family:'Syne',sans-serif;
      cursor:pointer;transition:all var(--tx);
      display:flex;align-items:center;justify-content:center;gap:8px;
      box-shadow:0 4px 18px -4px var(--brand-glow);
    }
    .cf-submit:hover{background:var(--brand-dim);transform:translateY(-1px)}
    .contact-info{display:flex;flex-direction:column;gap:20px}
    .contact-info-item{display:flex;gap:14px;align-items:flex-start}
    .ci-icon{width:40px;height:40px;border-radius:10px;background:var(--brand-g2);border:1px solid rgba(216,90,48,.25);display:flex;align-items:center;justify-content:center;color:var(--brand);flex-shrink:0}
    .ci-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#fff;margin-bottom:3px}
    .ci-val{font-size:13px;color:var(--txt-3)}

    /* Intersection observer fade */
    .reveal{opacity:0;transform:translateY(32px);transition:opacity .65s cubic-bezier(0.17,0.84,0.44,1),transform .65s cubic-bezier(0.17,0.84,0.44,1)}
    .reveal.visible{opacity:1;transform:translateY(0)}
    .reveal-l{opacity:0;transform:translateX(-32px);transition:opacity .65s cubic-bezier(0.17,0.84,0.44,1),transform .65s cubic-bezier(0.17,0.84,0.44,1)}
    .reveal-l.visible{opacity:1;transform:translateX(0)}
    .reveal-r{opacity:0;transform:translateX(32px);transition:opacity .65s cubic-bezier(0.17,0.84,0.44,1),transform .65s cubic-bezier(0.17,0.84,0.44,1)}
    .reveal-r.visible{opacity:1;transform:translateX(0)}
    .delay-1{transition-delay:.08s}.delay-2{transition-delay:.16s}.delay-3{transition-delay:.24s}
    .delay-4{transition-delay:.32s}.delay-5{transition-delay:.40s}.delay-6{transition-delay:.48s}

    /* Divider */
    .hp-divider{height:1px;background:linear-gradient(90deg,transparent,var(--border-hi),transparent);margin:0 28px}

    /* ── Responsive ── */
    @media(max-width:1024px){
      .features-grid{grid-template-columns:1fr 1fr}
      .feat-card.large{grid-column:span 1}
      .showcase-wrap,.contact-grid{grid-template-columns:1fr;gap:32px}
      .showcase-wrap.flip{direction:ltr}
      .footer-top{grid-template-columns:1fr 1fr;gap:32px}
      .flow-wrap{grid-template-columns:1fr 1fr 1fr;gap:24px}
      .flow-step::after{display:none}
      .roadmap-grid{grid-template-columns:1fr}
    }
    @media(max-width:768px){
      .hp-nav-links{display:none}
      .hp-hamburger{display:flex;align-items:center;justify-content:center}
      .hp-section{padding:70px 20px}
      .features-grid{grid-template-columns:1fr}
      .hero-stats{flex-direction:column}
      .hero-stat{border-right:none;border-bottom:1px solid var(--border-hi);width:100%;padding:14px 20px}
      .hero-stat:last-child{border-bottom:none}
      .flow-wrap{grid-template-columns:1fr 1fr}
      .cf-row{grid-template-columns:1fr}
      .cta-banner{margin:0 14px 60px;padding:40px 24px}
      .footer-top{grid-template-columns:1fr 1fr}
    }
    @media(max-width:480px){
      .hp-nav-inner{padding:0 16px}
      .hero-btns{flex-direction:column;width:100%}
      .btn-primary,.btn-secondary{width:100%;justify-content:center}
      .flow-wrap{grid-template-columns:1fr}
      .footer-top{grid-template-columns:1fr}
      .footer-bottom{flex-direction:column;text-align:center}
    }

    /* ── Light Mode ── */
    [data-theme='light'] .hp-hero{background:var(--bg-base)}
    [data-theme='light'] .hero-grid-bg{
      background-image:linear-gradient(rgba(0,0,0,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.04) 1px,transparent 1px);
    }
    [data-theme='light'] .hero-glow{background:radial-gradient(circle,rgba(200,78,34,.08) 0%,transparent 70%)}
    [data-theme='light'] .hero-title{color:var(--txt-1)}
    [data-theme='light'] .hero-title .stroke{-webkit-text-stroke-color:var(--brand);color:transparent}
    [data-theme='light'] .hero-sub{color:var(--txt-2)}
    [data-theme='light'] .hero-stat-val{color:var(--txt-1)}
    [data-theme='light'] .hp-nav.scrolled{
      background:rgba(247,245,242,.92);
      border-bottom-color:var(--border);
      box-shadow:0 4px 24px rgba(0,0,0,.06);
    }
    [data-theme='light'] .hp-brand-name{color:var(--txt-1)}
    [data-theme='light'] .hp-nav-link{color:var(--txt-2)}
    [data-theme='light'] .hp-nav-link:hover{color:var(--txt-1);background:var(--bg-card);border-color:var(--border)}
    [data-theme='light'] .section-title{color:var(--txt-1)}
    [data-theme='light'] .feat-card{background:var(--bg-card);border-color:var(--border);box-shadow:0 1px 3px rgba(0,0,0,.04)}
    [data-theme='light'] .feat-card:hover{box-shadow:0 20px 48px -12px rgba(0,0,0,.1),0 0 0 1px rgba(200,78,34,.15)}
    [data-theme='light'] .feat-title{color:var(--txt-1)}
    [data-theme='light'] .feat-desc{color:var(--txt-2)}
    [data-theme='light'] .flow-num{background:var(--bg-card);border-color:var(--border);color:var(--brand)}
    [data-theme='light'] .flow-label{color:var(--txt-1)}
    [data-theme='light'] .flow-desc{color:var(--txt-3)}
    [data-theme='light'] .showcase-visual{background:var(--bg-card);border-color:var(--border)}
    [data-theme='light'] .mock-name{color:var(--txt-1)}
    [data-theme='light'] .mock-title{color:var(--txt-2)}
    [data-theme='light'] .mock-row{border-color:var(--border)}
    [data-theme='light'] .ai-bubble{background:var(--bg-card2);border-color:var(--border);color:var(--txt-2)}
    [data-theme='light'] .ai-bubble strong{color:var(--txt-1)}
    [data-theme='light'] .roadmap-card{background:var(--bg-card);border-color:var(--border)}
    [data-theme='light'] .roadmap-card:hover{box-shadow:0 16px 40px -8px rgba(0,0,0,.08)}
    [data-theme='light'] .roadmap-title{color:var(--txt-1)}
    [data-theme='light'] .roadmap-desc{color:var(--txt-2)}
    [data-theme='light'] .roadmap-tag{background:var(--bg-card2);border-color:var(--border);color:var(--txt-2)}
    [data-theme='light'] .tech-chip{background:var(--bg-card);border-color:var(--border);color:var(--txt-2)}
    [data-theme='light'] .tech-chip:hover{color:var(--txt-1);border-color:var(--brand);background:var(--brand-g2)}
    [data-theme='light'] .cta-banner{background:linear-gradient(135deg,var(--bg-card) 0%,rgba(200,78,34,.06) 100%);border-color:rgba(200,78,34,.18)}
    [data-theme='light'] .cta-title{color:var(--txt-1)}
    [data-theme='light'] .cta-sub{color:var(--txt-2)}
    [data-theme='light'] .hp-footer{background:var(--bg-panel);border-top-color:var(--border)}
    [data-theme='light'] .footer-col-title{color:var(--txt-2)}
    [data-theme='light'] .footer-link{color:var(--txt-3)}
    [data-theme='light'] .footer-link:hover{color:var(--txt-1)}
    [data-theme='light'] .footer-copy{color:var(--txt-4)}
    [data-theme='light'] .footer-social{border-color:var(--border);color:var(--txt-3)}
    [data-theme='light'] .footer-social:hover{color:var(--txt-1);border-color:var(--brand)}
    [data-theme='light'] .cf-input,[data-theme='light'] .cf-textarea{background:var(--bg-card);border-color:var(--border);color:var(--txt-1)}
    [data-theme='light'] .cf-input::placeholder,[data-theme='light'] .cf-textarea::placeholder{color:var(--txt-4)}
    [data-theme='light'] .contact-info-item .ci-title{color:var(--txt-1)}
    [data-theme='light'] .hp-mobile-menu{background:rgba(247,245,242,.97)}
    [data-theme='light'] .hp-mob-link{color:var(--txt-2)}
    [data-theme='light'] .hp-mob-link:hover{color:var(--txt-1);background:var(--bg-card)}
  `;
  document.head.appendChild(s);
};

/* ─── Intersection Observer hook ─── */
const useReveal = () => {
  useEffect(() => {
    const cb = (entries, obs) => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
    });
    const obs = new IntersectionObserver(cb, { threshold: 0.1 });
    document.querySelectorAll(".reveal, .reveal-l, .reveal-r").forEach(el => obs.observe(el));

    // Stagger feat-cards
    const cardObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const cards = e.target.querySelectorAll(".feat-card");
          cards.forEach((c, i) => { setTimeout(() => c.classList.add("in-view"), i * 80); });
          cardObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.05 });
    const grid = document.querySelector(".features-grid");
    if (grid) cardObs.observe(grid);

    return () => { obs.disconnect(); cardObs.disconnect(); };
  }, []);
};

/* ─── Component ─── */
const Home = () => {
  injectStyles();
  useReveal();
  const navigate = useNavigate();
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formSent, setFormSent]     = useState(false);
  const [theme, setTheme]           = useState(() => localStorage.getItem("evalix-theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("evalix-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    { icon: <BrainCircuit size={20} />, title: "Multimodal AI Grading", desc: "Gemini 2.5 Pro reads student handwriting, deciphers messy cursive, diagrams, and pseudo-code — then scores against your model answer with human-level understanding.", tag: { label: "Vision AI", cls: "coral" } },
    { icon: <Zap size={20} />, title: "Instant MCQ Evaluation", desc: "Auto-graded MCQs with colour-coded correctness feedback, detailed explanations, and score analytics — delivered in milliseconds.", tag: { label: "Real-time", cls: "teal" } },
    { icon: <ShieldCheck size={20} />, title: "Bulletproof Time-Locks", desc: "Strict start/end/release timestamps ensure students can't access exams early or view results before the release window.", tag: { label: "Security", cls: "amber" } },
    { icon: <Award size={20} />, title: "Human-in-the-Loop (HITL)", desc: "Teachers retain ultimate control — override AI scores, attach personal remarks, and the total recalculates instantly.", tag: { label: "Override", cls: "coral" }, large: true },
    { icon: <Sparkles size={20} />, title: "AI Exam Generator", desc: "Paste a syllabus + past papers. Get a perfectly formatted question set with model answers, exported to Excel in one click.", tag: { label: "Generator", cls: "teal" }, large: true },
    { icon: <BarChart3 size={20} />, title: "Real-Time Analytics", desc: "Class averages, completion rates, and pending evaluations all live on the teacher dashboard.", tag: { label: "Insights", cls: "amber" } },
    { icon: <Target size={20} />, title: "Cohort-Based Routing", desc: "Assignments auto-route to the right Department, Year, and Batch — no manual distribution needed.", tag: { label: "Smart", cls: "coral" } },
    { icon: <Clock size={20} />, title: "Same-Day Results", desc: "Reduce grading turnaround from weeks to minutes. Students get constructive AI feedback before their next class.", tag: { label: "Fast", cls: "teal" } },
    { icon: <Bot size={20} />, title: "Dual AI Agents", desc: "A Vision Agent (OCR) and an Evaluator Agent work in tandem — one reads, one grades. Separate concerns, maximum accuracy.", tag: { label: "Pipeline", cls: "amber" } },
  ];

  const techStack = [
    { label: "React 19 + Vite", color: "#61DAFB" },
    { label: "Node.js + Express 5", color: "#68A063" },
    { label: "PostgreSQL + Prisma", color: "#336791" },
    { label: "Gemini 2.5 Pro", color: "#4285F4" },
    { label: "Gemini 2.5 Flash", color: "#34A853" },
    { label: "Supabase Auth", color: "#3ECF8E" },
    { label: "Supabase Storage", color: "#3ECF8E" },
    { label: "Tailwind CSS 4", color: "#38BDF8" },
    { label: "React Router v7", color: "#F44250" },
    { label: "XLSX Export", color: "#217346" },
  ];

  const roadmap = [
    { icon: "🎯", title: "UPSC Civil Services", desc: "Long-form essay evaluation against complex rubrics — analytical depth, ethical reasoning, and multidimensional perspectives.", tags: ["Essay Grading", "250-word Mains", "RAG Pipeline"] },
    { icon: "📐", title: "JEE Joint Entrance", desc: "Step-by-step derivation tracking, spatial diagram reasoning for circuit diagrams, and customizable partial marking.", tags: ["Derivation Tracking", "Diagram AI", "Partial Marks"] },
    { icon: "🧬", title: "NEET Medical Entrance", desc: "OMR + Descriptive hybrid grading, NCERT-aligned question generation, and NTA-standard mock tests.", tags: ["OMR Hybrid", "NCERT Aligned", "NTA Standard"] },
    { icon: "🏢", title: "B2B Coaching Centers", desc: "Multi-tenant architecture for large institutes — manage 10,000+ students with branch and batch-level analytics.", tags: ["Multi-tenant", "10K+ Students", "Branch Analytics"] },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", fontFamily: "'DM Sans',sans-serif", color: "var(--txt-1)" }}>

      {/* ── NAV ── */}
      <nav className={`hp-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="hp-nav-inner">
          <a className="hp-brand" onClick={() => scrollTo("hero")} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <div style={{ position: "relative", width: 42, height: 42, borderRadius: 12, overflow: "hidden", boxShadow: "0 0 20px rgba(216,90,48,0.4)", border: "1px solid rgba(255,255,255,0.15)", flexShrink: 0 }}>
              <img src={logo} alt="EVALIX AI" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <span className="hp-brand-name" style={{ fontSize: 20, letterSpacing: "-0.02em" }}>EVALIX <span style={{ color: "var(--brand)" }}>AI</span></span>
          </a>
          <div className="hp-nav-links">
            {[["Features", "features"], ["How it Works", "how"], ["Roadmap", "roadmap"], ["Tech", "tech"], ["Contact", "contact"]].map(([l, id]) => (
              <button key={id} className="hp-nav-link" onClick={() => scrollTo(id)}>{l}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="hp-nav-link" onClick={() => navigate("/auth")}>Sign In</button>
            <button className="hp-nav-cta" onClick={() => navigate("/auth")}>Get Started →</button>
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-hi)", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--txt-2)", transition: "all 220ms ease", flexShrink: 0 }}
            >
              {theme === "dark"
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
            <button className="hp-hamburger" onClick={() => setMobileOpen(true)}><Menu size={18} /></button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`hp-mobile-menu ${mobileOpen ? "open" : ""}`}>
        <button className="hp-mob-close" onClick={() => setMobileOpen(false)}><X size={18} /></button>
        {[["Features", "features"], ["How it Works", "how"], ["Roadmap", "roadmap"], ["Tech Stack", "tech"], ["Contact", "contact"]].map(([l, id]) => (
          <button key={id} className="hp-mob-link" onClick={() => scrollTo(id)}>{l}</button>
        ))}
        <button className="hp-nav-cta" style={{ marginTop: 12, padding: "14px 40px", fontSize: 16 }} onClick={() => { setMobileOpen(false); navigate("/auth"); }}>Get Started →</button>
      </div>

      {/* ── HERO ── */}
      <section id="hero" className="hp-hero">
        <div className="hero-grid-bg" />
        <div className="hero-glow" />
        {/* Ambient blob orbs for depth */}
        <div style={{ position: "absolute", top: "15%", left: "8%", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(216,90,48,0.07) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0, animation: "blobDrift 14s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "5%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0, animation: "blobDrift2 18s ease-in-out infinite" }} />
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--brand)", animation: "pulse 2s infinite" }} />
            Enterprise AI Exam Evaluation
          </div>
          <h1 className="hero-title">
            <span className="stroke">Grade</span> Smarter.<br />
            Teach <span className="coral">Faster.</span>
          </h1>
          <p className="hero-sub">
            EVALIX AI uses multimodal LLMs to read student handwriting, evaluate answers against model solutions, and deliver instant, constructive feedback — while teachers retain full control.
          </p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => navigate("/auth")}>
              <Sparkles size={17} /> Start for Free
            </button>
            <button className="btn-secondary" onClick={() => scrollTo("how")}>
              <Play size={15} /> See How It Works
            </button>
          </div>
          <div className="hero-stats">
            {[
              { val: "< 2", unit: "min", label: "Average Grading Time" },
              { val: "99", unit: "%", label: "Handwriting Accuracy" },
              { val: "10x", unit: "", label: "Faster than Manual Grading" },
              { val: "HITL", unit: "", label: "Human Override Always On" },
            ].map((s, i) => (
              <div className="hero-stat" key={i}>
                <div className="hero-stat-val">{s.val}<span>{s.unit}</span></div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-scroll">
          <span>Scroll</span>
          <ChevronDown size={16} />
        </div>
      </section>

      <div className="hp-divider" />

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: "100px 28px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="section-center reveal">
            <div className="section-eyebrow"><Zap size={12} />How It Works</div>
            <h2 className="section-title">From paper to grades in minutes</h2>
            <p className="section-sub">A fully automated pipeline that handles the entire exam lifecycle — creation to results.</p>
          </div>
          <div className="flow-wrap reveal">
            {[
              { n: "1", icon: <FileEdit size={22} />, label: "Teacher Creates Exam", desc: "Adds questions, model answers, and strict time-locks" },
              { n: "2", icon: <GraduationCap size={22} />, label: "Student Submits", desc: "Uploads handwritten sheets or selects MCQ options" },
              { n: "3", icon: <BrainCircuit size={22} />, label: "Vision Agent", desc: "Gemini reads and transcribes handwriting with near-perfect accuracy" },
              { n: "4", icon: <Bot size={22} />, label: "Evaluator Agent", desc: "Scores against model answer, generates detailed feedback" },
              { n: "5", icon: <Award size={22} />, label: "Teacher Reviews", desc: "Overrides if needed, then releases marks to students" },
            ].map((step, i) => (
              <div className="flow-step" key={i}>
                <div className="flow-num">{step.n}</div>
                <div className="flow-label">{step.label}</div>
                <div className="flow-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="hp-divider" />

      {/* ── FEATURES ── */}
      <section id="features" className="hp-section">
        <div className="reveal">
          <div className="section-eyebrow"><Sparkles size={12} />Features</div>
          <h2 className="section-title">Everything you need to<br />run modern exams</h2>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className={`feat-card reveal ${f.large ? "large" : ""}`} style={{ transitionDelay: `${i * 50}ms` }}>
              <div className="feat-icon">{f.icon}</div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
              <div className={`feat-tag ${f.tag.cls}`}>{f.tag.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="hp-divider" />

      {/* ── SHOWCASE: TEACHER ── */}
      <section style={{ padding: "100px 28px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="showcase-wrap reveal">
            <div className="showcase-text">
              <div className="section-eyebrow"><Users size={12} />For Teachers</div>
              <h2 className="section-title" style={{ fontSize: "clamp(26px,3.5vw,40px)" }}>Split-screen grading with AI superpowers</h2>
              <p style={{ fontSize: 15, color: "var(--txt-3)", lineHeight: 1.7 }}>Review student submissions, AI scores, and model answers side by side. Override with a single click — the total recalculates instantly.</p>
              <div className="showcase-list">
                {["Handwriting transcription by Vision AI", "Side-by-side student vs model answer", "One-click score override with remarks", "Auto-recalculated total score", "Batch analytics on the dashboard"].map((item, i) => (
                  <div className="showcase-item" key={i}><CheckCircle2 size={15} />{item}</div>
                ))}
              </div>
              <button className="btn-primary" style={{ marginTop: 12, width: "fit-content" }} onClick={() => navigate("/auth")}>
                Start as Teacher <ArrowRight size={15} />
              </button>
            </div>
            <div className="showcase-visual reveal">
              <div className="mock-header">
                <div className="mock-dot" style={{ background: "#ff5f57" }} />
                <div className="mock-dot" style={{ background: "#febc2e" }} />
                <div className="mock-dot" style={{ background: "#28c840" }} />
                <span className="mock-title">Submission Review</span>
              </div>
              {[
                { name: "Aryan Sharma", score: "18/20", badge: "Graded", badgeCls: "green", active: true },
                { name: "Priya Patel", score: "15/20", badge: "Graded", badgeCls: "green" },
                { name: "Rahul Verma", score: "—", badge: "AI Eval…", badgeCls: "yellow" },
                { name: "Sneha Gupta", score: "12/20", badge: "Override", badgeCls: "coral" },
              ].map((row, i) => (
                <div key={i} className={`mock-row ${row.active ? "active" : ""}`}>
                  <div className="mock-name">
                    <div className="mock-avatar">{row.name[0]}</div>
                    {row.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="mock-score">{row.score}</div>
                    <div className={`mock-badge ${row.badgeCls}`}>{row.badge}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SHOWCASE: STUDENT ── */}
      <section style={{ padding: "0 28px 100px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="showcase-wrap flip reveal">
            <div className="showcase-text">
              <div className="section-eyebrow"><GraduationCap size={12} />For Students</div>
              <h2 className="section-title" style={{ fontSize: "clamp(26px,3.5vw,40px)" }}>Instant feedback that actually helps you learn</h2>
              <p style={{ fontSize: 15, color: "var(--txt-3)", lineHeight: 1.7 }}>No more waiting weeks for results. Get a detailed breakdown of your score — question by question — with AI feedback and the model answer shown side by side.</p>
              <div className="showcase-list">
                {["Live, Upcoming & Completed assignment tabs", "MCQ results with colour-coded correctness", "Descriptive AI feedback + model answer", "Locked results until teacher-set release time", "Real-time submission status badges"].map((item, i) => (
                  <div className="showcase-item" key={i}><CheckCircle2 size={15} />{item}</div>
                ))}
              </div>
              <button className="btn-primary" style={{ marginTop: 12, width: "fit-content" }} onClick={() => navigate("/auth")}>
                Start as Student <ArrowRight size={15} />
              </button>
            </div>
            <div className="showcase-visual reveal">
              <div className="ai-mock">
                <div className="mock-header">
                  <div className="mock-dot" style={{ background: "#ff5f57" }} />
                  <div className="mock-dot" style={{ background: "#febc2e" }} />
                  <div className="mock-dot" style={{ background: "#28c840" }} />
                  <span className="mock-title">AI Feedback — Q3</span>
                </div>
                <div className="ai-msg">
                  <div className="ai-avatar"><Bot size={14} color="#fff" /></div>
                  <div className="ai-bubble">
                    <strong>Score: 7 / 10</strong><br />
                    Your answer correctly identified Newton's 2nd Law and applied F = ma accurately. However, you missed discussing the <strong>net force</strong> concept and the role of friction in the system. The diagram was partially correct.
                  </div>
                </div>
                <div style={{ padding: "10px 14px", background: "rgba(52,211,153,.07)", border: "1px solid rgba(52,211,153,.2)", borderRadius: 8, marginTop: 4 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--teal)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 6 }}>✓ Model Answer</div>
                  <div style={{ fontSize: 12.5, color: "rgba(240,253,244,.8)", lineHeight: 1.6 }}>Newton's 2nd Law states F = ma where net force accounts for all forces including friction. In this system, friction reduces the net force, therefore acceleration = (F − μmg) / m…</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="hp-divider" />

      {/* ── TECH STACK ── */}
      <section id="tech" className="hp-section section-center">
        <div className="reveal">
          <div className="section-eyebrow"><Zap size={12} />Tech Stack</div>
          <h2 className="section-title">Built on production-grade infrastructure</h2>
          <p className="section-sub">Every component selected for reliability, speed, and scale.</p>
        </div>
        <div className="tech-grid reveal">
          {techStack.map((t, i) => (
            <div className="tech-chip" key={i}>
              <div className="tech-dot" style={{ background: t.color }} />
              {t.label}
            </div>
          ))}
        </div>
      </section>

      <div className="hp-divider" />

      {/* ── ROADMAP ── */}
      <section id="roadmap" className="hp-section">
        <div className="reveal">
          <div className="section-eyebrow"><Star size={12} />Roadmap</div>
          <h2 className="section-title">Scaling to India's competitive exams</h2>
          <p className="section-sub">Our multimodal AI architecture is built to handle the most demanding high-stakes examinations in the country.</p>
        </div>
        <div className="roadmap-grid">
          {roadmap.map((r, i) => (
            <div className="roadmap-card reveal" key={i} style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="roadmap-icon">{r.icon}</div>
              <div className="roadmap-title">{r.title}</div>
              <div className="roadmap-desc">{r.desc}</div>
              <div className="roadmap-tags">{r.tags.map((t, j) => <span className="roadmap-tag" key={j}>{t}</span>)}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="hp-divider" />

      {/* ── CONTACT ── */}
      <section id="contact" className="hp-section">
        <div className="reveal">
          <div className="section-eyebrow"><Mail size={12} />Contact</div>
          <h2 className="section-title">Get in touch</h2>
          <p className="section-sub">Questions, partnership inquiries, or just want a demo? We'd love to hear from you.</p>
        </div>
        <div className="contact-grid">
          <div className="contact-form reveal">
            {formSent ? (
              <div style={{ padding: "40px 24px", textAlign: "center", background: "var(--bg-card)", border: "1px solid var(--border-hi)", borderRadius: "var(--r-lg)" }}>
                <CheckCircle2 size={40} color="var(--teal)" style={{ margin: "0 auto 14px" }} />
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Message Sent!</div>
                <div style={{ fontSize: 13.5, color: "var(--txt-3)" }}>We'll get back to you within 24 hours.</div>
              </div>
            ) : (
              <>
                <div className="cf-row">
                  <div><label className="cf-label">First Name</label><input className="cf-input" placeholder="Aryan" /></div>
                  <div><label className="cf-label">Last Name</label><input className="cf-input" placeholder="Sharma" /></div>
                </div>
                <div><label className="cf-label">Email</label><input className="cf-input" type="email" placeholder="aryan@college.edu" /></div>
                <div><label className="cf-label">Institution</label><input className="cf-input" placeholder="e.g., IIT Bombay" /></div>
                <div><label className="cf-label">Message</label><textarea className="cf-textarea" placeholder="Tell us about your use case…" /></div>
                <button className="cf-submit" onClick={() => setFormSent(true)}><Mail size={15} />Send Message</button>
              </>
            )}
          </div>
          <div className="contact-info reveal">
            {[
              { icon: <Mail size={18} />, title: "Email Us", val: "hello@evalixai.com" },
              { icon: <FaGithub size={18} />, title: "Open Source", val: "github.com/anirbanjana883/EVALIX-AI" },
              { icon: <BrainCircuit size={18} />, title: "Built for", val: "Educational institutions, coaching centres, universities" },
              { icon: <Sparkles size={18} />, title: "AI Stack", val: "Google Gemini 2.5 Pro · Gemini 2.5 Flash · Supabase" },
            ].map((item, i) => (
              <div className="contact-info-item" key={i}>
                <div className="ci-icon">{item.icon}</div>
                <div>
                  <div className="ci-title">{item.title}</div>
                  <div className="ci-val">{item.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <div className="cta-banner reveal">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-eyebrow" style={{ margin: "0 auto 20px", width: "fit-content" }}>
            <Sparkles size={12} /> Ready to transform grading?
          </div>
          <h2 className="cta-title">Start using EVALIX AI today</h2>
          <p className="cta-sub">Join educators who've already automated their grading pipeline. No credit card required.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => navigate("/auth")}>
              <Zap size={16} /> Get Started Free
            </button>
            <button className="btn-secondary" onClick={() => scrollTo("contact")}>
              Request a Demo
            </button>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="hp-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="hp-brand" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ position: "relative", width: 38, height: 38, borderRadius: 10, overflow: "hidden", boxShadow: "0 0 15px rgba(216,90,48,0.3)", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
                  <img src={logo} alt="EVALIX AI" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <span className="hp-brand-name" style={{ fontSize: 18, letterSpacing: "-0.02em" }}>EVALIX <span style={{ color: "var(--brand)" }}>AI</span></span>
              </div>
              <div className="footer-brand-desc">Enterprise-grade AI exam evaluation platform. Transforming academic grading with multimodal LLMs, automated rubrics, and Human-in-the-Loop overrides.</div>
            </div>
            <div>
              <div className="footer-col-title">Product</div>
              {["Features", "How It Works", "Roadmap", "Tech Stack"].map(l => <div key={l} className="footer-link" onClick={() => scrollTo(l.toLowerCase().replace(/ /g, ""))}>{l}</div>)}
            </div>
            <div>
              <div className="footer-col-title">Platform</div>
              {["Teacher Portal", "Student Portal", "AI Exam Generator", "Analytics"].map(l => <div key={l} className="footer-link" onClick={() => navigate("/auth")}>{l}</div>)}
            </div>
            <div>
              <div className="footer-col-title">Company</div>
              {["About", "Contact", "GitHub", "Privacy Policy"].map(l => <div key={l} className="footer-link" onClick={() => scrollTo("contact")}>{l}</div>)}
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© 2025 <span>EVALIX AI</span>. Made with 💡 and ☕ by the EVALIX AI Team.</div>
            <div className="footer-socials">
              <button className="footer-social" onClick={() => window.open("https://github.com/anirbanjana883/EVALIX-AI", "_blank")}><FaGithub size={15} /></button>
              <button className="footer-social" onClick={() => scrollTo("contact")}><Mail size={15} /></button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;