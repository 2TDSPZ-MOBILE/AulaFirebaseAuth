import { SafeAreaView } from "react-native-safe-area-context";
import { Text,Button } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Alert } from "react-native";
import {auth} from '../services/firebaseConfig'
import { deleteUser } from "firebase/auth";

export default function HomeScreen() {
    const router = useRouter()

    const realizarLogoff = async ()=>{
        await AsyncStorage.removeItem("@user")
        router.replace('/')
    }

    const excluirConta = () =>{
        Alert.alert(
            "Confirmar Exclusão",
            "Tem certeza que deseja excluir sua conta? Essa ação não poderá ser desfeita.",
            [
                {text:"Cancelar",style:"cancel"},
                {text:"Excluir",style:"destructive",
                    onPress:async ()=>{
                        try{
                            const user = auth.currentUser;
                            if(user){
                                await deleteUser(user)
                                await AsyncStorage.removeItem('@user')
                                Alert.alert("Conta Excluída","Sua conta foi excluída com sucesso.")
                                router.replace("/")//Redireciona para login
                            }else{
                                Alert.alert("Error","Nenhu usuário logado")
                            }
                        }catch(error){
                            console.log("Erro ao excluir conta")
                            Alert.alert("Error","Não foi possivel excluir a conta")
                        }
                    }
                }

            ]
        )
    }

    return (
        <SafeAreaView>
            <Text>Seja bem-vindo, vc está logado!!!</Text>
            <Button title="Realizar logoff" onPress={realizarLogoff}/>
            <Button title="Alterar Senha" color="orange" onPress={()=>router.push("/AlterarSenhaScreen")}/>
            <Button title="Excluir" color="red" onPress={excluirConta}/>
            
        </SafeAreaView>

    )
}