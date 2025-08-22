import { SafeAreaView } from "react-native-safe-area-context";
import { Text,Button, TextInput,StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ItemLoja from "../components/ItemLoja";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { deleteUser } from "firebase/auth";
import { auth,db,addDoc,collection,getDocs } from "../services/firebaseConfig";

export default function HomeScreen() {
    const router = useRouter()
    const[nomeProduto,setNomeProduto]=useState('')
    const[listaItems,setListaItems]=useState([])

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
    const salvarItem = async()=>{
        try{
            const docRef = await addDoc(collection(db,'items'),{
                nomeProduto:nomeProduto,
                isChecked:false
            })
            setNomeProduto('')//Limpa o Text Input
            console.log("Produto criado com o ID:",docRef.id)
        }catch(e){
            console.log("Erro ao criar o produto",e)
        }
    }

    const buscarProdutos = async()=>{
        try{
        const querySnapshot = await getDocs(collection(db,'items'));
        const items:any = []

        querySnapshot.forEach((item)=>{
            items.push({
                ...item.data(),
                id:item.id
            })
            setListaItems({
                {nomeProduto,isChecked}
            })
        })

        console.log("Items carregados",items)
    }catch(e){
        console.log("Erro ao carregar os items",e)
    }

    }
    useEffect(()=>{
        buscarProdutos()
    },[])

    return (
        <SafeAreaView style={styles.container}>
            <Text>Seja bem-vindo, vc está logado!!!</Text>
            <Button title="Realizar logoff" onPress={realizarLogoff}/>
            <Button title="Alterar Senha" color="orange" onPress={()=>router.push("/AlterarSenhaScreen")}/>
            <Button title="Excluir" color="red" onPress={excluirConta}/>
            
            <TextInput 
                placeholder="Digite o nome produto"
                style={styles.input}
                value={nomeProduto}
                onChangeText={(value)=>setNomeProduto(value)}
                onSubmitEditing={salvarItem}
            />
        </SafeAreaView>

    )
}
const styles = StyleSheet.create({
    container:{
        flex:1
    },
    input:{
        backgroundColor:'lightgray',
        width:'90%',
        alignSelf:'center',
        marginTop:10,
        borderRadius:10,
        paddingLeft:20
    }
})