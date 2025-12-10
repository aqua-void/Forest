"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Leaf, Bot, MapPin, CloudSun, Shield, BarChart3, Zap, CheckCircle, ChevronRight, TrendingUp, Smartphone, User } from "lucide-react"
import Link from 'next/link'
import HeroSection from '@/components/HeroSection'

export default function HomePage() {


  const features = [
    {
      icon: <CloudSun className="h-8 w-8" />,
      title: "Disease Detection",
      description: "AI-powered identification of crop diseases from images",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      link:"diseasedetection"

    },
    {
      icon: <Bot className="h-8 w-8" />,
      title: "AI Farming Assistant",
      description: "24/7 AI chatbot for farming advice and solutions",
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      link:"diseasedetection"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Disease Forecast",
      description: "Predict disease outbreaks before they happen",
      color: "from-orange-500 to-amber-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      link:"forecast"
    },
  ]

  const howItWorks = [
    {
      step: "01",
      title: "Upload or Capture",
      description: "Take a photo of your crop or upload an existing image",
      icon: <Smartphone className="h-6 w-6" />
    },
    {
      step: "02",
      title: "AI Analysis",
      description: "Our AI model analyzes the image for disease patterns",
      icon: <Zap className="h-6 w-6" />
    },
    {
      step: "03",
      title: "Get Diagnosis",
      description: "Receive instant diagnosis and treatment recommendations",
      icon: <Leaf className="h-6 w-6" />
    },
    {
      step: "04",
      title: "Preventive Action",
      description: "Follow AI-guided steps to protect your crops",
      icon: <Shield className="h-6 w-6" />
    },
  ]

  return (
    <div className="min-h-screen pt-20">
      {/* Background with gradient and glass effect */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#000000] via-[#1A5319] to-[#000000]" />

        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />

        {/* Animated gradient blobs */}
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-green-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-green-600/20 to-emerald-700/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-gradient-to-r from-emerald-600/20 to-green-800/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section with glass effect */}
      <div className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-effect rounded-3xl p-8 mb-12"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Everything You Need for{' '}
                <span className="text-green-300">Smart Farming</span>
              </h2>
              <p className="text-green-100/80 max-w-2xl mx-auto">
                Our platform combines cutting-edge AI with agricultural expertise to provide
                comprehensive solutions for modern farmers.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/${feature.link}`}>
                    <Card className="h-full hover:shadow-2xl transition-all duration-300 border-white/10 bg-white/5 backdrop-blur-sm shadow-lg hover:shadow-green-500/10 hover:border-green-400/30 cursor-pointer group glass-effect">
                      <CardHeader className="pb-2">
                        <div className={`w-16 h-16 rounded-xl ${feature.bgColor}/20 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <div className={feature.iconColor}>
                            {feature.icon}
                          </div>
                        </div>
                        <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-green-100/70">
                          {feature.description}
                        </CardDescription>
                        <div className="mt-4 flex items-center text-green-300 font-medium">
                          Explore feature
                          <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* How It Works with glass effect */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="glass-effect rounded-3xl p-8"
          >
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-green-500/20 text-green-300 border-green-500/30 backdrop-blur-sm">
                Simple & Effective
              </Badge>
              <h2 className="text-3xl font-bold text-white mb-4">
                How AgriAI Works in{' '}
                <span className="text-green-300">4 Simple Steps</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-lg">
                      {step.step}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 shadow-md flex items-center justify-center mx-auto mb-4">
                      <div className="text-green-300">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-green-100/70">
                      {step.description}
                    </p>
                  </div>

                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-8 -right-4">
                      <ArrowRight className="h-8 w-8 text-green-500/50" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Disease Prediction System with glass effect */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-effect rounded-3xl p-8 w-full max-w-3xl"
            >
              <div className="flex flex-col items-center text-center">
                {/* Badge */}
                <div className="mb-6">
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 backdrop-blur-sm px-4 py-2">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Advanced Prediction
                  </Badge>
                </div>

                {/* Title */}
                <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                  Crop Disease{' '}
                  <span className="text-blue-300 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    Prediction System
                  </span>
                </h2>

                {/* Description */}
                <p className="text-green-100/80 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                  Our advanced forecasting system analyzes weather patterns, soil conditions,
                  and historical data to predict disease outbreaks 7-10 days in advance.
                </p>

                {/* Features List */}
                <div className="w-full max-w-xl mb-12">
                  <div className="space-y-5">
                    {[
                      "Real-time weather integration",
                      "Scientific disease models",
                      "7-day forecast timeline",
                      "Risk assessment & alerts",
                      "Preventive recommendations"
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-start px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group"
                      >
                        <div className="mr-4 flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          </div>
                        </div>
                        <span className="text-green-100 text-lg font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-8">
                  <Link href="/forecast">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r bg-white/10 hover:bg-white/20 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <BarChart3 className="mr-3 h-5 w-5" />
                      <span className="text-lg font-semibold">Explore Forecast System</span>
                      <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Assistant Preview with glass effect */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="glass-effect rounded-3xl p-8"
          >
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 backdrop-blur-sm">
                <Bot className="w-3 h-3 mr-1" />
                24/7 Available
              </Badge>
              <h2 className="text-3xl font-bold text-white mb-4">
                Your Personal{' '}
                <span className="text-emerald-300">AI Farming Assistant</span>
              </h2>
              <p className="text-green-100/70 max-w-2xl mx-auto">
                Get instant answers to farming questions, crop management advice,
                and personalized recommendations.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="glass-effect rounded-3xl overflow-hidden">
                <div className="grid md:grid-cols-2">
                  <div className="p-8 bg-gradient-to-br from-emerald-600/30 to-green-700/30 text-white border-r border-white/10">
                    <h3 className="text-2xl font-bold mb-4">Ask AgriAI Anything</h3>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center gap-2 text-green-100">
                        <CheckCircle className="h-5 w-5 text-emerald-300" />
                        Disease diagnosis
                      </li>
                      <li className="flex items-center gap-2 text-green-100">
                        <CheckCircle className="h-5 w-5 text-emerald-300" />
                        Treatment plans
                      </li>
                      <li className="flex items-center gap-2 text-green-100">
                        <CheckCircle className="h-5 w-5 text-emerald-300" />
                        Soil management
                      </li>
                      <li className="flex items-center gap-2 text-green-100">
                        <CheckCircle className="h-5 w-5 text-emerald-300" />
                        Market insights
                      </li>
                    </ul>
                    <Link href="/diseasedetection">
                      <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm">
                        Start Chat Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>

                  <div className="p-8">
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                          <User className="h-4 w-4 text-emerald-300" />
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                          <p className="text-green-100">My tomatoes have yellow spots. What should I do?</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-green-300" />
                        </div>
                        <div className="bg-green-500/10 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
                          <p className="text-green-100">Based on your description, it could be early blight. Please upload a photo for accurate diagnosis...</p>
                          <div className="mt-2 text-sm text-emerald-300 font-medium">
                            Ready to help with treatment options →
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer with glass effect */}
      <footer className="relative py-12 border-t border-green-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="glass-effect rounded-3xl p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Leaf className="h-8 w-8 text-green-400" />
                <span className="text-xl font-bold text-white">AgriAI</span>
              </div>
              <p className="text-green-100/70 max-w-md mx-auto mb-8">
                Empowering farmers with AI-powered agricultural solutions.
              </p>

              <div className="w-full max-w-md">
                <h4 className="font-semibold mb-4 text-white text-center">Features</h4>
                <ul className="flex flex-wrap justify-center gap-6 text-green-100/70">
                  <li><Link href="/diseasedetection" className="hover:text-white transition-colors">Disease Detection</Link></li>
                  <li><Link href="/diseasedetection" className="hover:text-white transition-colors">AI Assistant</Link></li>
                  <li><Link href="/forecast" className="hover:text-white transition-colors">Disease Forecast</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 mt-8 pt-8 text-center text-green-100/70">
              <p>© 2024 AgriAI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}