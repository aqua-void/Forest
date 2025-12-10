// 'use client'
// import { UserDetailContext } from '@/context/UserDetailContext';
// import { supabase } from '@/services/superbaseClient';
// import { User } from 'lucide-react';
// import React, { use, useEffect, useState } from 'react'

// function Provider({ children }) {

//     const [user, setUser] = useState();
//     useEffect(() => {
//         CreateNewUser()
//     }, [])

//     const CreateNewUser = () => {
//         supabase.auth.getUser().then(async ({ data: { user } }) => {
//             // Check if user exists in your database
//             let { data: Users, error } = await supabase.from('Users').select('*').eq('email', user?.email)
//             // if not create a new user entry
//             if (Users?.length == 0) {
//                 const { data, error } = await supabase.from('Users').insert([
//                     {
//                         name: user?.user_metadata?.name,
//                         email: user?.email,
//                         picture: user?.user_metadata?.picture
//                     }
//                 ])
//                 setUser(data)
//                 return;
//             }
//             setUser(Users[0])
//         })
//     }


//     return (
//         <UserDetailContext.Provider value={{ user, setUser }}>
//             {children}
//         </UserDetailContext.Provider>
//     )
// }

// export default Provider


'use client'

import { UserDetailContext } from '@/context/UserDetailContext';
import { supabase } from '@/services/superbaseClient';
import { useEffect, useState } from 'react';

function Provider({ children }) {

    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                // 1️⃣ Get supabase auth user (OAuth complete)
                const { data: authData, error: getUserErr } = await supabase.auth.getUser();
                if (getUserErr) {
                    // Auth session is missing — treat as not logged in
                    console.warn('supabase.auth.getUser error:', getUserErr?.message || getUserErr);
                    setUser(null);
                    return;
                }

                const authUser = authData?.user;

                if (!authUser) {
                    setUser(null);
                    return; // no logged-in user
                }

                // 2️⃣ Fetch user from DB
                let { data: existingUsers, error } = await supabase
                    .from('Users')
                    .select('*')
                    .eq('email', authUser.email)
                    .maybeSingle();

                if (error) {
                    console.log("DB ERROR:", error);
                }

                // 3️⃣ Create if not exists
                if (!existingUsers) {
                    const { data: inserted, error: insertErr } = await supabase
                        .from('Users')
                        .insert({
                            name: authUser.user_metadata?.name,
                            email: authUser.email,
                            picture: authUser.user_metadata?.picture
                        })
                        .select()
                        .single();

                    if (!insertErr) {
                        setUser(inserted);
                    }

                    return;
                }

                // 4️⃣ Already exists
                setUser(existingUsers);
            } catch (err) {
                // Catch AuthSessionMissingError and other unexpected errors
                console.warn('loadUser() error (ignored):', err?.message || err);
                setUser(null);
            }
        };

        loadUser();

        // Listen to sign-in/sign-out events
        const { data: subscription } = supabase.auth.onAuthStateChange(() => {
            // Re-run the loader when auth state changes
            loadUser();
        });

        return () => {
            // subscription may be undefined in some edge cases — guard before calling unsubscribe
            try {
                subscription?.unsubscribe?.();
            } catch (e) {
                // ignore cleanup errors
            }
        };

    }, []);

    return (
        <UserDetailContext.Provider value={{ user, setUser }}>
            {children}
        </UserDetailContext.Provider>
    );
}

export default Provider;
