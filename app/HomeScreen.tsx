import { SafeAreaView } from "react-native-safe-area-context";
import { Text,Button } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
    const router = useRouter()

    const realizarLogoff = async ()=>{
        await AsyncStorage.removeItem("@user")
        router.replace('/')
    }

    return (
        <SafeAreaView>
            <Text>Seja bem-vindo, vc está logado!!!</Text>
            <Button title="Realizar logoff" onPress={realizarLogoff}/>
        </SafeAreaView>

    )
}