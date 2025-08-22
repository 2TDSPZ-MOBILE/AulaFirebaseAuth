import { StyleSheet,View,Text,Pressable } from "react-native";
import {FontAwesome,MaterialIcons} from '@expo/vector-icons'

export default function ItemLoja(){
    return(
        <View style={styles.container}>
            <Pressable>
                <FontAwesome name='check-circle-o' size={24} color='black'/>
            </Pressable>
            <Text style={styles.texto}>Teclado Gamer</Text>
            <Pressable>
                <MaterialIcons name='delete' size={24} color='black'/>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flexDirection:'row',
        backgroundColor:'lightgray',
        justifyContent:'space-between',
        alignItems:'center',
        width:'90%',
        alignSelf:'center',
        marginTop:10,
        padding:10,
        borderRadius:10
    },
    texto:{
        flex:1,
        marginLeft:10,
        fontSize:17,
        fontWeight:500
    }
})