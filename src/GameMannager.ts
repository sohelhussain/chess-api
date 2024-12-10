import {WebSocket} from 'ws'
import { INIT_GAME, MOVE } from './Message';
import { Game } from './Game';




export class GameMannager {
    private game: Game[];
    private pendingUser: WebSocket | null;
    private users: WebSocket[];



    constructor() {
        this.game = [];
        this.pendingUser = null;
        this.users = [];
    }

    addUser(socket: WebSocket){
        this.users.push(socket);
    }

    removeUser(socket: WebSocket){
        this.users = this.users.filter(user => user != socket);
    }

    private addHandler(socket: WebSocket){
        socket.on('message', data => {
            const message = JSON.parse(data.toString());


            if(message.type === INIT_GAME){
                if(this.pendingUser){
                    // start a game
                    const game = new Game(this.pendingUser, socket)
                    this.game.push(game);
                    this.pendingUser = null;
                }else{
                    // user waiting for some connect to the game, then we play each other
                    this.pendingUser = socket;
                }
            }

            if(message.type === MOVE){
                const game = this.game.find(game => game.player1 === socket || game.player2 === socket)

                if(game){
                    game.makeMove(socket, message.move)
                }
            }
        })
    }
}