"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { TOOLS } from '@/lib/constants';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
    const [currentIndex, setCurrentIndex] = useState(TOOLS.length);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [windowWidth, setWindowWidth] = useState(0);

    const totalTools = TOOLS.length;
    const displayTools = [...TOOLS, ...TOOLS, ...TOOLS];

    useEffect(() => {
        setWindowWidth(window.innerWidth);
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        const timer = setInterval(() => {
            setIsTransitioning(true);
            setCurrentIndex((prev) => prev + 1);
        }, 3000);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(timer);
        };
    }, []);

    useEffect(() => {
        if (currentIndex >= totalTools * 2) {
            const timeout = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(totalTools);
            }, 700);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, totalTools]);

    const isMobile = windowWidth < 768;
    const CARD_WIDTH = isMobile ? 280 : 340;
    const GAP = 24;

    return (
        <div className="relative w-full bg-white overflow-hidden flex flex-col" style={{ minHeight: 'calc(100vh - 80px)' }}>

            {/* Background knots */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-10 -right-10 md:-top-20 md:-right-20 w-[300px] h-[300px] md:w-[600px] md:h-[600px] opacity-40">
                    <Image src="/bg-knot.png" alt="" fill className="object-contain" priority />
                </div>
                <div className="absolute -bottom-10 -left-10 md:-bottom-20 md:-left-20 w-[350px] h-[350px] md:w-[700px] md:h-[700px] opacity-40">
                    <Image src="/bg-knot.png" alt="" fill className="object-contain" priority />
                </div>
            </div>

            {/* ── HERO ── */}
            <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-8 pb-4 md:pt-12 md:pb-6 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] md:text-xs font-bold mb-4 border border-indigo-100 uppercase tracking-widest">
                    <Sparkles size={12} />
                    AI-Powered Education
                </div>
                <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-gray-900 tracking-tight leading-[1.1] mb-6">
                    AI Smart <span className="text-indigo-600">Learn</span>
                </h1>
                <p className="text-gray-500 text-sm md:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-medium">
                    Transform your content with smart tools built for the next generation of educators and learners.
                </p>
                <Link
                    href="/chat"
                    className="group flex items-center gap-4 bg-gray-900 text-white pl-6 pr-2 py-2 rounded-full hover:bg-indigo-600 transition-all duration-300 shadow-xl"
                >
                    <span className="font-bold text-sm">Get Started</span>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                        <ArrowUpRight className="w-4 h-4" />
                    </div>
                </Link>
            </section>

            {/* ── CAROUSEL ── */}
            <section className="relative z-10 w-full pt-10 pb-20 overflow-hidden">
                <div
                    className="flex gap-6 items-center"
                    style={{
                        transition: isTransitioning ? 'transform 700ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                        transform: `translateX(calc(-${currentIndex * (CARD_WIDTH + GAP)}px + 50vw - ${CARD_WIDTH / 2}px))`
                    }}
                >
                    {displayTools.map((tool, index) => {
                        const Icon = tool.icon;
                        const isCentered = index === currentIndex;
                        return (
                            <Link
                                key={`${tool.href}-${index}`}
                                href={tool.href}
                                style={{ width: `${CARD_WIDTH}px` }}
                                className={`group flex-shrink-0 h-[200px] md:h-[220px] bg-white/90 backdrop-blur-md border rounded-[32px] p-6 transition-all duration-500 flex flex-col ${isCentered
                                    ? 'scale-110 border-indigo-500 shadow-2xl shadow-indigo-100 z-20 opacity-100 ring-4 ring-indigo-50'
                                    : 'scale-90 opacity-40 border-gray-200 z-10'
                                    }`}
                            >
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                                    <Icon className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h3 className={`text-base font-bold mb-1 ${isCentered ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {tool.title}
                                </h3>
                                <p className="text-gray-500 text-xs leading-snug line-clamp-2">
                                    {tool.description || "Generate high-quality learning materials instantly with AI."}
                                </p>
                                <div className={`mt-auto flex items-center gap-2 self-end ${isCentered ? 'text-indigo-600' : 'text-gray-300'}`}>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Explore</span>
                                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}