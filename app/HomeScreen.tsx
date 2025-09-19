import { SafeAreaView } from "react-native-safe-area-context";
import { Alert,Text, Button, TextInput, StyleSheet, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ItemLoja from "../src/components/ItemLoja";
import { useEffect, useState } from "react";
import { deleteUser } from "firebase/auth";
import { auth, db, addDoc, collection, getDocs } from "../src/services/firebaseConfig";
import ThemeToggleButton from "../src/components/ThemeToggleButton";
import { useTheme } from "../src/context/ThemeContext";
import * as Notifications from "expo-notifications"

Notifications.setNotificationHandler({
    handleNotification:async()=>({
        shouldShowAlert:true, //SDK 52 usa Alert
        shouldPlaySound:true, //toca o som
        shouldSetBadge:false //Não altera o badge
    })
})


export default function HomeScreen() {
    const{theme,colors} = useTheme()//Vai acessar os valores do tema
    const router = useRouter()
    const [nomeProduto, setNomeProduto] = useState('')
    const[expoPushToken,setExpoPushToken]=useState<string|null>(null)

    interface Item {
        id: string,
        nomeProduto: string,
        isChecked: boolean
    }
    const [listaItems, setListaItems] = useState<Item[]>([])

    const realizarLogoff = async () => {
        await AsyncStorage.removeItem("@user")
        router.replace('/')
    }

    const excluirConta = () => {
        Alert.alert(
            "Confirmar Exclusão",
            "Tem certeza que deseja excluir sua conta? Essa ação não poderá ser desfeita.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir", style: "destructive",
                    onPress: async () => {
                        try {
                            const user = auth.currentUser;
                            if (user) {
                                await deleteUser(user)
                                await AsyncStorage.removeItem('@user')
                                Alert.alert("Conta Excluída", "Sua conta foi excluída com sucesso.")
                                router.replace("/")//Redireciona para login
                            } else {
                                Alert.alert("Error", "Nenhu usuário logado")
                            }
                        } catch (error) {
                            console.log("Erro ao excluir conta")
                            Alert.alert("Error", "Não foi possivel excluir a conta")
                        }
                    }
                }

            ]
        )
    }
    const salvarItem = async () => {
        try {
            const docRef = await addDoc(collection(db, 'items'), {
                nomeProduto: nomeProduto,
                isChecked: false
            })
            setNomeProduto('')//Limpa o Text Input
            Alert.alert("Sucesso","Produto Salvo com Sucesso.")
        } catch (e) {
            console.log("Erro ao criar o produto", e)
        }
    }

    const buscarProdutos = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'items'));
            const items: any = []

            querySnapshot.forEach((item) => {
                items.push({
                    ...item.data(),
                    id: item.id
                })
            })
            setListaItems(items)
            //console.log("Items carregados", items)
        } catch (e) {
            console.log("Erro ao carregar os items", e)
        }

    }
    //Função para disparar a notificação local
    const dispararNotificacao = async()=>{
        await Notifications.scheduleNotificationAsync({
            content:{
                title:"Promoções do dia!",
                body:"Aproveite as melhores ofertas!!"
            },
            trigger:{
                seconds:2,//aguarda 02 segundos para disparar
                repeats:false
            } as Notifications.TimeIntervalTriggerInput
        })
    }

    const registerForPushNotificationsAsync = async ():Promise<string|null> =>{
        try{
            const tokenData = await Notifications.getExpoPushTokenAsync()
            const token  = tokenData.data
            console.log("Token gerado com sucesso: ",token)
            return token
        }catch(error){
            console.log("Error ao gerar token",error)
            return null
        }
    }

    useEffect(()=>{
        (async()=>{
            //Registrar o disposito com o serviço de notificação (gerar o token)
            const token = await registerForPushNotificationsAsync()
            //Armazenar o token no estado
            setExpoPushToken(token)
        })()
    },[])


    useEffect(()=>{
        //Ficar escutando se houve recebimento de notificação
        const subscription = Notifications.addNotificationReceivedListener(notification =>{
            console.log("Notificação recebida: ", notification)
        })
        //Função de limpeza que irá ser chamada quando for desfeito
        //Remove o listener para evitar multiplas chamadas.
        return ()=>subscription.remove()
    },[])

    useEffect(()=>{
        //Solicitar a permissão das notificações do aparelho
        (async()=>{
            //Verificar o status da permissão de notificação do dispositivo
            const{status:existingStatus} = await Notifications.getPermissionsAsync()
            let finalStatus = existingStatus

            //Solicita a permissão das notificações do dispositivo
            if(existingStatus!=="granted"){
                const{status} = await Notifications.requestPermissionsAsync()
                finalStatus = status
            }
        })()
    },[])

    useEffect(() => {
        buscarProdutos()
    }, [listaItems])

    return (
        <SafeAreaView style={[styles.container,
            {backgroundColor:colors.background}
        ]}>
            <KeyboardAvoidingView //Componente que se ajuste automaticamente o layout
                style={styles.container}
                behavior={Platform.OS==='ios'?'padding':'height'}
                keyboardVerticalOffset={20}//descoloca o conteúdo em 20px
            >            
            <Text style={[{color:colors.text}]}>Seja bem-vindo, vc está logado!!!</Text>
            <ThemeToggleButton />
            <Button title="Realizar logoff" onPress={realizarLogoff} />
            <Button title="Alterar Senha" color="orange" onPress={() => router.push("/AlterarSenhaScreen")} />
            <Button title="Excluir" color="red" onPress={excluirConta} />
            <Button title="Disparar notificação" color="purple" onPress={dispararNotificacao}/>
            {expoPushToken?(
                <Text>Token gerado com sucesso:{expoPushToken}</Text>):(
                <Text>Gerando token...</Text>
                )
            }
            {listaItems.length<=0?<ActivityIndicator/>:(
                <FlatList
                    data={listaItems}
                    renderItem={({item})=>{
                        return(
                           <ItemLoja 
                            nomeProduto={item.nomeProduto}
                            isChecked={item.isChecked}
                            id={item.id}
                            />
                        )
                    }}
                />
            )}

            <TextInput
                placeholder="Digite o nome produto"
                style={styles.input}
                value={nomeProduto}
                onChangeText={(value) => setNomeProduto(value)}
                onSubmitEditing={salvarItem}
            />
        </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    input: {
        backgroundColor: 'lightgray',
        width: '90%',
        alignSelf: 'center',
        marginTop: 'auto',
        borderRadius: 10,
        paddingLeft: 20
    }
})