import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore,collection,addDoc,getDocs,doc,updateDoc,deleteDoc } from "firebase/firestore";

//Pegar o getReactNativePersistence mesmo sem tipagem
const{getReactNativePersistence} = require("firebase/auth") as any

const firebaseConfig = {
  apiKey: "AIzaSyCwtOF2pbyOGDOBcnjVVdZ3IyT16N4ja68",
  authDomain: "aulafirebase-b25e4.firebaseapp.com",
  projectId: "aulafirebase-b25e4",
  storageBucket: "aulafirebase-b25e4.firebasestorage.app",
  messagingSenderId: "268247213641",
  appId: "1:268247213641:web:f62aaa11a4f8424fe78198"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app)

const auth = initializeAuth(app,{
  persistence:getReactNativePersistence(AsyncStorage)
})

export{auth,db,collection,addDoc,getDocs,doc,updateDoc,deleteDoc}