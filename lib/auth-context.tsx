import { createContext, useContext, useEffect, useState } from "react";
import { account } from "./appwrite";



type User = {
  $id: string;
  email: string;
  name?: string;
  emailVerification? : boolean;
}

type AuthContextType = {
    user : User | null ;
    isLoadingUser: boolean ;
    signUp: (email: string , password: string) => Promise<string | null>;
    signIn: (email: string , password: string) => Promise<string | null>;
    signOut: () => Promise<void>
};

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// AUTH COMPONENT
export function AuthProvider({children} : {children: React.ReactNode}){
const [user , setUser] = useState<User | null>(null);
const [isLoadingUser , setisLoadingUser] = useState<boolean>(true)

useEffect(()=> {
    getUser();
},[])

const getUser = async () => {
    try {
        const session = await account.get()
        setUser(session)
    }catch (error){
        setUser(null)
    } finally {
        setisLoadingUser(false)
    }
}



    const signUp = async (email: string , password: string) => {

            try{
                await account.create("unique()" ,email , password)
                await signIn(email , password)
                return null
            }catch(error){
                if (error instanceof Error){
                    return error.message
                }
        
                return "An error occured during signup"
            }  
    }
    const signIn = async (email: string , password: string) => {

            try{
                await account.createEmailPasswordSession(email , password)
                await getUser();//becuase there is a delay to setUser() when i log in (redirect/routing problem)
                return null;
            }catch(error){
                if(error instanceof Error){
                    return error.message;
                }

                return "An error eccured during sign in"
            }  
    }

    const signOut = async () => {
        try {
        await account.deleteSession("current")
        setUser(null)
    }catch (error){
        console.log(error)
    }}

    return (
        <AuthContext.Provider value= {{user , isLoadingUser, signUp , signIn , signOut }}>
            {children}
        </AuthContext.Provider>
)
}

// CUSTOM HOOOK useAuth
export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined){
        throw new Error("useAuth must be inside of the AuthProvider")
    }
    return context;
}
