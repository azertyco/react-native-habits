import { DATABASE_ID, databases, HABITS_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from 'expo-router';
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ID } from "react-native-appwrite";
import { Button, SegmentedButtons, TextInput, useTheme } from "react-native-paper";


const FREQUENCIES = ["daily" , "weekly" , "monthly"];
type Frequency = (typeof FREQUENCIES)[number];

export default function AddhabitScreen() {
    const [title, setTitle] = useState<string>("");
    const [frequency, setFrequency] = useState<Frequency>("daily");
    const [description, setDescription] = useState<string>("");
    const [error , setError] = useState<string>("");
    const {user} = useAuth()
    const router = useRouter()
    const theme = useTheme()

  const handleSubmit = async () => {
    if (!user) return;


    try{
    await databases.createDocument(
      DATABASE_ID, HABITS_COLLECTION_ID , ID.unique(),
    {
      user_id: user.$id,
      title,
      description,
      frequency,
      streak : 0,
      last_completed: new Date().toISOString(),
    }
    );
      router.back()
    } catch (error){
       if (error instanceof Error){
        setError(error.message)
        return;
       }

       setError("There was an error creating the habit")
    }
  };


  return (
    <View style={styles.container}>
      <TextInput 
      label="Title" mode="outlined" 
      onChangeText={setTitle} style={styles.input}/>
      <TextInput 
      label="Description" mode="outlined" 
      onChangeText={setDescription} style={styles.input}/>

      <View style={styles.frequencyContainer}>
        <SegmentedButtons 
          onValueChange={(value)=> setFrequency(value as Frequency) }
          value={frequency}                 
          buttons ={FREQUENCIES.map((freq) => ({
            value : freq,
            label: freq.charAt(0).toUpperCase() + freq.slice(1),
          }))
          } 
          style={styles.segmentedButtons}/>
      </View>

        <Button 
        mode="contained" onPress={handleSubmit} 
        disabled={!title || !description}>
          Add habit </Button>
          {error && <Text style={{color: theme.colors.error}}>{error}</Text>}

     
    </View>
  );
}

const styles = StyleSheet.create({
  container : {
    flex : 1,
    padding : 16,
    backgroundColor : "#f5f5f5",
    justifyContent:"center",
  },
  input : {
    
  },
  frequencyContainer : {
    marginBottom: 24 ,
    marginTop : 5,
  },
  segmentedButtons : {
    marginBottom:16,
  },
})
