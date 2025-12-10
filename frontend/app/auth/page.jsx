'use client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/services/superbaseClient'
import { ArrowBigRight, Badge, Leaf } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

function Auth() {

    const signWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_DASHBOARD_URL}`
            }
        })
        if (error) {
            console.error("Error during sign in:", error.message)
        }
    }

    return (
        <div className='min-h-screen bg-[linear-gradient(135deg,hsl(152_50%_12%)_0%,hsl(152_40%_20%)_50%,hsl(142_35%_28%)_100%)] flex flex-col items-center justify-center p-4'>

            <div className="text-center mb-8">
               
                <div className='px-4 py-1 bg-white/10 backdrop-blur-xl border border-white/20  rounded-2xl text-zinc-200 '>
                    Farm Outbreak Response & Early Signal Technology
                </div>
            </div>

            <div className="p-8 md:p-10 max-w-md w-full mx-auto rounded-2xl bg-white/10 backdrop-blur-xl shadow-xl border border-white/20">
                <h1 className="text-center text-2xl font-semibold text-white mb-1">
                    Welcome Back
                </h1>
                <p className="text-center text-gray-300 mb-6">
                    Sign in to your FOREST account
                </p>

                <Image
                    src="/farm3.jpg"
                    alt="logo"
                    width={200}
                    height={200}
                    className="w-100 h-70 md:w-100 rounded-2xl mx-auto "
                />

                <Button
                    onClick={signWithGoogle}
                    className="w-full bg-white/10 backdrop-blur-xl border border-white/20 py-2 font-bold rounded  hover:bg-white/20 mt-6">
                    Login with Google <ArrowBigRight />
                </Button>
            </div>


        </div>
    )
}

export default Auth