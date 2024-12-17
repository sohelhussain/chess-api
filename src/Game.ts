import { WebSocket } from "ws";
import {Chess} from 'chess.js'
import { GAME_OVER, INIT_GAME, MOVE } from "./Message";

export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    private board: Chess;
    private startTime: Date;
    private moveCount: number;


    constructor(player1: WebSocket, player2: WebSocket){
       this.player1 = player1;
       this.player2 = player2; 
       this.board = new Chess();
       this.startTime = new Date();
       this.moveCount = 0;
        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: 'white'
            }
        }))
        
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: 'black'
            }
        }))
    }

    makeMove(socket: WebSocket, move: {
        from: string;
        to: string;
    }){
        // validate the type of move using zod
        if(this.moveCount % 2 === 0 && socket !== this.player1){
            return;
        }
        if(this.moveCount % 2 === 1 && socket !== this.player2){
            return;
        }
        try {
            // update the board, this is looks like => //? chess.move({ from: 'g2', to: 'g3' })
            this.board.move(move);
        } catch (error) {
            console.log(error);
            return; 
        }


        // Check is the game is over
        if(this.board.isGameOver()){
            this.player1.send(JSON.stringify({
                type: GAME_OVER,
                payload:{
                    winner: this.board.turn() === 'w' ? "black" : "white"
                }
            }))
            this.player2.send(JSON.stringify({
                type: GAME_OVER,
                payload:{
                    winner: this.board.turn() === 'w' ? "black" : "white"
                }
            }))
            return;
        }

        if(this.moveCount % 2 === 0){
            this.player2.send(JSON.stringify({
                type: MOVE,
                payload: move   // move({ from: 'g2', to: 'g3' })
            }))
        }else{
            this.player1.send(JSON.stringify({
                type: MOVE,
                payload: move
            }))
        }

        // Send the updated board to the both players
        this.moveCount++;     
    }
}
