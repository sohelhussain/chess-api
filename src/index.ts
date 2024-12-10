import {WebSocketServer} from "ws";
import {GameMannager} from "./GameMannager";


const wss = new WebSocketServer({port: 8080});
const gameMannager = new GameMannager();

wss.on("connection",(ws)=>{
    gameMannager.addUser(ws);
    
    ws.on("disconnect", () => gameMannager.removeUser(ws))
});