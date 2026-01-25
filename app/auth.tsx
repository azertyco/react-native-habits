import { useAuth } from "@/lib/auth-context";
import { useRouter } from 'expo-router';
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View, } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

export default function AuthScreen() {
    const [isSignUp , setisSignUp] = useState<boolean>(false);
    const [email , setEmail] = useState<string>("")
    const [password , setPassword] = useState<string>("")
    const [error , setError] = useState<string | null>("")

    const theme = useTheme()
    const router = useRouter()

    const {signIn , signUp} = useAuth()
    


    const handleAuth = async () => {
        if (!email || !password){
            setError("PLease enter all fields")
            return;
        }
        if (password.length< 6) {
            setError("password must be at least 6 characters long")
        }

        setError(null);

        if(isSignUp){
            const error = await signUp(email,password)
            if (error){
                setError(error)
            }
        }else {
            const error = await signIn(email,password)
            if (error){
                setError(error)
                return;
            }
            router.replace("/")

        }

    }

    const handleSwitchMode = () => {
        setisSignUp((prev)=> !prev)
    }



    return (
    <KeyboardAvoidingView behavior={Platform.OS ==="android" ? "padding" : "height"}
                            style={styles.container}>
        <View style={styles.content}>

            <Text style= {styles.title} variant="headlineMedium">{
                isSignUp
            ?"Create Account"
            :"Welcome Back"}</Text>

            <TextInput 
                label="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="example@gmail.com"
                style={styles.input}
                onChangeText={setEmail}
            />

            <TextInput 
                label="Password"
                autoCapitalize="none"
                secureTextEntry={true}
                style={styles.input}
                onChangeText={setPassword}
            />

            {error && <Text style={{color: theme.colors.error}}>{error}</Text>}

            <Button mode="contained" style={styles.button}
            onPress={handleAuth}>
                {isSignUp ? "Sign up" : "Sign In"} </Button>
            <Button mode="text" onPress={handleSwitchMode}>
            {isSignUp 
                ? "Already have an account click here ! Sign in"
                : "Don't have an account ? Sign Up"
            }
            </Button>

        </View>
    </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container : {
        flex : 1 ,
        backgroundColor: "#f5f5f5"
    },
    content : {
        flex : 1 ,
        padding : 16, 
        justifyContent : "center"
    },
    title : {
        textAlign : "center" ,
        marginBottom : 24, 
    }, 
    input : {
        marginBottom : 16, 
    },
    button : {
       marginTop: 8,  
    },

})
