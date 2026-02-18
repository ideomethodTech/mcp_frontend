"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { TOOLS } from '@/lib/constants';
import { useEffect, useState, useRef } from 'react';

export default function DashboardPage() {
    const [currentIndex, setCurrentIndex] = useState(TOOLS.length);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const containerRef = useRef(null);

    const totalTools = TOOLS.length;
    // Duplicate tools for a smooth infinite carousel effect
    const displayTools = [...TOOLS, ...TOOLS, ...TOOLS];

    // Constants for sizing
    const BOX_WIDTH = 340;
    const GAP = 24;

    useEffect(() => {
        const timer = setInterval(() => {
            setIsTransitioning(true);
            setCurrentIndex((prev) => prev + 1);
        }, 3000);

        return () => clearInterval(timer);
    }, []);

    // Handle the seamless "snap-back" for infinite looping
    useEffect(() => {
        if (currentIndex >= totalTools * 2) {
            const timeout = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(totalTools);
            }, 700);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, totalTools]);

    return (
        <div className="bg-white min-h-[calc(100vh-64px)] max-w-full overflow-hidden flex flex-col font-sans relative">

            {/* Background Abstract Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {/* Right Top - Medium size and Hidden Halfway */}
                <div className="absolute top-[-30%] right-[-20%] w-[650px] h-[650px] opacity-85">
                    <Image
                        src="/bg-knot.png"
                        alt="background knot top"
                        width={650}
                        height={650}
                        className=""
                    />
                </div>

                {/* Left Bottom corner - Medium size and Hidden Halfway */}
                <div className="absolute bottom-[-40%] left-[-15%] w-[800px] h-[800px] opacity-85">
                    <Image
                        src="/bg-knot.png"
                        alt="background knot bottom"
                        width={800}
                        height={800}
                        className=""
                    />
                </div>
            </div>

            {/* Hero Section */}
            <section className="pt-12 pb-8 px-6 text-center max-w-5xl mx-auto w-full relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-4 drop-shadow-md">
                    AI Smart Learn
                </h1>
                <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed font-bold">
                    Transform your content with smart tools for today's educators and learners.
                </p>

                {/* Custom CTA Button */}
                <div className="flex justify-center">
                    <Link
                        href="/chat"
                        className="group flex items-center gap-4 bg-white/70 backdrop-blur-lg border border-gray-100 shadow-2xl shadow-gray-300/50 pl-6 pr-2 py-2 rounded-full hover:shadow-indigo-200 transition-all duration-300"
                    >
                        <span className="text-gray-900 font-extrabold tracking-tight text-sm">CTA Button</span>
                        <div className="w-8 h-8 bg-[#6366f1] rounded-full flex items-center justify-center text-white group-hover:rotate-45 transition-transform duration-300">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </Link>
                </div>
            </section>

            {/* Tools Section */}
            <section className="w-full px-6 pb-12 mt-auto overflow-hidden relative z-10">
                <div className="max-w-[1400px] mx-auto relative overflow-hidden">
                    <div
                        className="flex gap-6 py-8 scrollbar-hide"
                        style={{
                            transition: isTransitioning ? 'transform 700ms ease-in-out' : 'none',
                            transform: `translateX(calc(-${currentIndex * (BOX_WIDTH + GAP)}px + 50% - ${BOX_WIDTH / 2}px))`
                        }}
                    >
                        {displayTools.map((tool, index) => {
                            const Icon = tool.icon;
                            const isCentered = index === currentIndex;

                            return (
                                <Link
                                    key={`${tool.href}-${index}`}
                                    href={tool.href}
                                    className={`group flex-shrink-0 w-[280px] md:w-[340px] h-[220px] bg-white/80 backdrop-blur-xl border border-gray-200 rounded-[32px] p-6 shadow-sm transition-all duration-500 flex flex-col items-start text-left relative overflow-hidden whitespace-normal
                    ${isCentered
                                            ? 'scale-110 border-indigo-500 shadow-2xl shadow-indigo-200/50 z-20 ring-4 ring-indigo-100'
                                            : 'opacity-70 scale-95 z-10'
                                        }
                    hover:scale-110 hover:border-[#6366f1] hover:opacity-100 hover:shadow-2xl hover:z-30`}
                                >
                                    {/* Icon Background */}
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                                        <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
                                            <Icon className="w-4 h-4 text-[#6366f1]" />
                                        </div>
                                    </div>

                                    <h3 className={`text-lg font-black text-gray-900 mb-1 transition-colors ${isCentered ? 'text-[#6366f1]' : ''}`}>
                                        {tool.title}
                                    </h3>

                                    <p className="text-gray-500 text-xs font-semibold leading-relaxed mb-4 line-clamp-2">
                                        {tool.description || "Automatically generate content for your learning journey."}
                                    </p>

                                    <div className={`mt-auto self-end flex items-center gap-2 transition-colors ${isCentered ? 'text-indigo-600' : 'text-gray-400'}`}>
                                        <span className="text-[10px] font-bold tracking-widest">Explore Tool</span>
                                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}
