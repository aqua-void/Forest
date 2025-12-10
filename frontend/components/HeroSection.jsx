import React from 'react'
import { Button } from './ui/button'
import { ArrowRight, Droplets, Sprout, Leaf } from 'lucide-react'
import Image from 'next/image'

function HeroSection() {
    return (
        <section className="relative w-[98%] mx-auto h-auto py-16 px-6 rounded-3xl my-8">
            {/* Glass Effect Container */}
            <div className="
                absolute inset-0 
                backdrop-blur-2xl
                border border-white/20
                rounded-3xl
                shadow-2xl 
                overflow-hidden
            ">
                {/* Background Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03]">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-emerald-500 to-green-600 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
                </div>
                
                {/* Animated Gradient Border */}
                <div className="absolute inset-0 rounded-3xl p-[1px]">
                    <div className="
                        absolute inset-0 
                        bg-gradient-to-r from-green-500/20 via-emerald-500/10 to-green-500/20 
                        rounded-3xl 
                        bg-[length:200%_auto]
                        animate-[gradient_3s_ease_infinite]
                    "></div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left Content */}
                <div className="space-y-6">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30">
                        <Sprout className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-100">Revolutionizing Agriculture</span>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight font-bold">
                            <span className="text-white">Grow Smarter With </span>
                            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                                AI-Powered Farming
                            </span>
                        </h1>

                        <p className="text-green-100/80 text-lg md:text-xl max-w-2xl">
                            Monitor crops, detect diseases early, and make data-driven decisions for better yields with our intelligent farming platform.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-6 pt-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">95%</div>
                            <div className="text-sm text-green-200/70">Disease Accuracy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">24/7</div>
                            <div className="text-sm text-green-200/70">AI Monitoring</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">50K+</div>
                            <div className="text-sm text-green-200/70">Farmers</div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <Button className="
                            bg-gradient-to-r from-green-600 to-emerald-700 
                            text-white 
                            px-8 py-6 
                            rounded-xl 
                            text-lg 
                            hover:from-green-700 hover:to-emerald-800 
                            transition-all duration-300
                            shadow-lg shadow-green-700/30
                            hover:shadow-xl hover:shadow-green-700/40
                            border border-green-500/30
                            group
                        ">
                            <span className="flex items-center gap-2">
                                Get Started Free
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Button>
                        
                        <Button variant="outline" className="
                            px-8 py-6 
                            rounded-xl 
                            text-lg
                            backdrop-blur-sm
                            border-white/30
                            text-white
                            bg-white/10
                            hover:bg-white/10
                            transition-all duration-300
                        ">
                            <span className="flex items-center gap-2 text-white">
                                <Droplets className="h-4 w-4" />
                                Watch Demo
                            </span>
                        </Button>
                    </div>
                </div>

                {/* Right Image */}
                <div className="relative">
                    {/* Image Container with Glass Effect */}
                    <div className="
                        relative 
                        rounded-2xl 
                        overflow-hidden
                        shadow-2xl shadow-green-900/30
                        border border-white/20
                        backdrop-blur-sm
                        bg-gradient-to-br from-white/5 to-transparent
                    ">
                        <Image
                            src="/farm1.jpg"
                            alt="AI-Powered Farming Visualization"
                            width={600}
                            height={400}
                            className="w-full h-auto object-cover rounded-2xl"
                        />
                        
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 via-transparent to-transparent"></div>
                        
                        {/* Floating Elements */}
                        <div className="
                            absolute -top-3 -right-3
                            w-16 h-16 
                            rounded-full 
                            bg-gradient-to-br from-green-500/30 to-emerald-600/30
                            backdrop-blur-md
                            border border-white/20
                            flex items-center justify-center
                            shadow-lg
                            animate-[float_6s_ease-in-out_infinite]
                        ">
                            <Leaf className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    
                    {/* Floating Stats Card */}
                    <div className="
                        absolute -bottom-4 -left-4
                        bg-gradient-to-br from-white/10 to-white/5
                        backdrop-blur-xl
                        border border-white/20
                        rounded-xl p-4
                        shadow-lg shadow-green-900/20
                        max-w-[200px]
                        animate-[float_4s_ease-in-out_infinite]
                    ">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                                <Sprout className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-white">Smart Detection</div>
                                <div className="text-xs text-green-200/70">Real-time AI analysis</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <div className="
                    w-6 h-10 
                    rounded-full 
                    border-2 border-white/30 
                    flex justify-center 
                    p-1
                    backdrop-blur-sm
                ">
                    <div className="w-1 h-3 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full animate-bounce"></div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection