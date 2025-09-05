import * as Notification from "expo-notifications"
import * as Device from "expo-device"

Notification.setNotificationHandler({
    handleNotification:async()=>({
        shouldShowBanner:true,//exibe o banner
        shouldShowList:true,//mostra o histórico
        shouldPlaySound:true, //toca o som
        shouldSetBadge:false //Não altera o badge
    })
})