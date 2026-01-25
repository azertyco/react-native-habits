import { client, DATABASE_ID, databases, HABITS_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";
import { Button, Surface, Text } from "react-native-paper";



type Habit = {
  $id: string;
  title: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly";
  last_completed: string;
  streak: number;
  $updatedAt : string,
};


type HabitCompletion = {
  $id : string ;
  habitId : string ;
  user_id : string ;
  completionDate : string ;
}


type RealtimeResponse = {
  events: string[];
  payload?: unknown;
};

export default function Index() {
  const {signOut , user} = useAuth();
  const  [habits , setHabits] = useState<Habit[] | undefined >(undefined);
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({})

  /*useEffect(()=>{
    const channel = `databases.${DATABASE_ID}.collections.${HABITS_COLLECTION_ID}.documents`;
    const habitsSubscription = client
    .subscribe(channel, 
      (response: RealtimeResponse)=>{
        if (response.events.includes("databases.*.documents.*.create"))
          {fetchHabits();

          }else if (response.events.includes("databases.*.documents.*.update"))
          {fetchHabits();

          }else if (response.events.includes("databases.*.documents.*.delete"))
          {fetchHabits();

          }


      });
          fetchHabits();
          return () =>{
            habitsSubscription();
          }
  }, [user])*/

  useEffect(() => {
  if (!user) return;

  const channel = `databases.${DATABASE_ID}.collections.${HABITS_COLLECTION_ID}.documents`;

  const unsubscribe = client.subscribe(channel, (response : RealtimeResponse) => {
    if (
      response.events.some((event :string )=>
        event.endsWith(".create") ||
        event.endsWith(".update") ||
        event.endsWith(".delete")
      )
    ) {
      fetchHabits();
    }
  });

  fetchHabits();

  return () => {
    unsubscribe();
  };
}, [user]);




  const fetchHabits = async () =>{
    try{
      const response = await databases.listDocuments(
        DATABASE_ID , 
        HABITS_COLLECTION_ID,
        [Query.equal("user_id" , user?.$id ?? "")]
      );
      console.log(response.documents);
      setHabits(response.documents as Habit[])
    }catch(error){
      console.error(error);
    }
  }

  //HANDLING SWIPING 
    //action when swipe cards/habits to right
  const renderLeftActions = () => (
     <View style={styles.swipeActionLeft}>
      <FontAwesome name="check-circle" size={24} color="white" />
      </View>
  )

  //action when swipe cards/habits to left
  const renderRightActions = () => (
    <View style={styles.swipeActionRight}>
      <FontAwesome name="trash" size={24} color="white" />
    </View>
  )

  const handleDeleteHabit = async (habitId : string) => {
    try{
    databases.deleteDocument(DATABASE_ID,
      HABITS_COLLECTION_ID,
      habitId)

      }catch(error){
        console.error("delete error",error)
      }
  }

    const handleCompleteHabit = async (habit : Habit) => {
      if(!user) return;
      try{
        const updated = new Date(habit.$updatedAt)
        const now = new Date()
        const TimeDiffinMs = now.getTime() - updated.getTime()
        const TimeDiffinDays = TimeDiffinMs /(1000*60*60*24)
        let AddOrNot = false;
        
        switch (habit.frequency) {
          case "daily":
              AddOrNot = TimeDiffinDays>=1 ;
              console.log("_________daily____________");
              console.log(AddOrNot)
              break;
          case "weekly":
            AddOrNot = TimeDiffinDays >= 7;
            console.log("_________weekly_______");
            break;
          case "monthly":
            AddOrNot = TimeDiffinDays >= 30;
            console.log("___________monthly___");
            break;
          default:
            AddOrNot = false;
        }

        if(habit.streak == 0){
          AddOrNot = true ;
        }

        if (!AddOrNot){
          console.log("___________Cannot add streak yet, frequency limit not reached._______________");

          return;
        }

        await databases.updateDocument(
          DATABASE_ID,
          HABITS_COLLECTION_ID,
          habit.$id,
          {
            streak: habit.streak + 1,
          }
        );
        swipeableRefs.current[habit.$id]?.close()
        fetchHabits();
        console.log("yo it worked")
      }catch(error){
        console.error("Failed to update streak :", error)
      }
    }


  return (
    <View style= {styles.container}>
      <View style={styles.header}>  
        <Text variant="headlineSmall" style = {styles.title}>Today's Habits</Text>
        <Button onPress={signOut} icon ={"logout"}>Sign out</Button>
      </View>
      
      {/*had scrollview hiya li rj3at page mrb3a o dk container m9t3in */}
      <ScrollView showsVerticalScrollIndicator= {false}
      contentContainerStyle={styles.scrollContent}>
        
        {habits?.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No habits yet . Add your first Habit !</Text>
          </View>
        ):(
          habits?.map((habit , key ) => 
            <Swipeable ref={(ref)=>{
              swipeableRefs.current[habit.$id] = ref}
              }
              overshootLeft={false} 
              overshootRight={false}
              renderLeftActions={renderLeftActions} 
              renderRightActions={renderRightActions}
              //detecting direction to implement action
              onSwipeableOpen={(direction) => {
                if (direction === "right") {
                  handleDeleteHabit(habit.$id);
                  }if (direction === "left"){
                  handleCompleteHabit(habit)
                   }
                    }}
              >
              <Surface style={styles.card} elevation={1}>
              <View key={habit.$id} style={styles.cardContent}>
                <Text style={styles.cardTitle}>{habit.title}</Text>
                <Text style={styles.cardDescription}>{habit.description}</Text>

                <View style={styles.cardFooter}>
                  <View style={styles.streakBadge}>
                    <FontAwesome6 name="fire" size={18} color="#ff9800" />
                    <Text style={styles.streakText}>{habit.streak} day streak</Text>
                  </View>
                  <View style={styles.frequencyBadge}>
                    <Text style={styles.frequencyText}>{habit.frequency.charAt(0).toUpperCase() + 
                      habit.frequency.slice(1)
                      }</Text>
                  </View>
                </View>
              </View>
              </Surface>
            </Swipeable>)
        )}
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container:{
    flex: 1 ,
    padding: 16,
    backgroundColor: "#f5f5f5"
  },
  header : {
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    marginBottom: 24,
  },
  title : {
    fontWeight :"bold",
  },
  card:{
    marginBottom: 10,
    borderRadius: 18 ,
    marginLeft:2,
    marginRight:2,
    marginTop:2,

    backgroundColor: "#f7f2fa",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8 ,
    elevation: 4,
  },
  cardContent:{
    padding:20,
  },
  cardTitle:{
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#22223b"
  },
  cardDescription: {
    fontSize: 15,
    marginBottom: 16,
    color: "#6c6c80"
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignContent: "center",
    backgroundColor:"#fff3e0",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical:4,
  },
  streakText:{
    marginLeft: 6,
    color: "#ff9800",
    fontWeight: "bold",
    fontSize:14,
  },
  frequencyBadge: {
    backgroundColor:"#ede7f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical:5,
  },
  frequencyText:{
    marginLeft: 6,
    color: "#7c4dff",
    fontWeight: "bold",
    fontSize:14,
  },
  emptyState: {
    flex : 1 ,
    justifyContent: "center",
    alignItems:"center",
    fontSize: 40,

  },
  emptyStateText: {
    color : "#666666",
  },
  swipeActionRight: {
    justifyContent: "center",
    alignItems: "flex-end",
    flex:1,
    backgroundColor: "#e53935",
    borderRadius:18,
    marginBottom: 10,
    marginTop: 2,
    paddingRight: 16,
  },

  swipeActionLeft: {
    justifyContent: "center",
    alignItems: "flex-start",
    flex:1,
    backgroundColor: "#4caf50",
    borderRadius:18,
    marginBottom: 10,
    marginTop: 2,
    paddingLeft: 16,
  },

  scrollContent:{

  }

});
