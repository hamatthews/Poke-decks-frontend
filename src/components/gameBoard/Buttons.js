import {useSelector, useDispatch} from 'react-redux';
import {update} from '../../redux/board';

import Coin from './Coin';
import StartGameBtn from './StartGameBtn';

export default function Buttons ({socket, boardSide}) {
    const state = useSelector(state => state.board);
    const dispatch = useDispatch();

    const flipPlayer = state.hostOrOpp === 'host' ? 'opp' : state.hostOrOpp === 'opp' ? 'host' : undefined; 
    
    const nextTurn = () => {
        const time = Date.now();
        const turnStartMessage = `${flipPlayer === 'opp' ? 'challenger' : 'host'}'s turn`;

        dispatch(update(['myGameLog', 
            [
                ...state.myGameLog,
                {time, message: turnStartMessage, messageType: 'game', hostOrOpp: flipPlayer},
            ]
        ]));

        const changeTurn = state.turnPlayer === 'host' ? 'opp' : state.turnPlayer === 'opp' ? 'host' : undefined
        dispatch(update(['turnPlayer', changeTurn]));
        socket.emit('updateTurn', changeTurn);
    };


    const copyRoomCode = () => {
        navigator.clipboard.writeText(state.roomId);
        alert(`Copied Room Code ${state.roomId} to clipboard`);

    }

    return (
        <div className={'buttons ' + boardSide}>
            <StartGameBtn {...({boardSide})}/>
            {(state.gamePhase[state.hostOrOpp] !== 'setup' && state.gamePhase[flipPlayer] !== 'setup') 
                && state.turnPlayer === state.hostOrOpp && <div className='next-turn-btn button-zone btn' onClick={nextTurn}>Next Turn</div>
            }
            <Coin />
            <div className='coin-btn button-zone btn' onClick={() => dispatch(update(['coinFlip', true]))}>Coin Flip</div>
            {(state.gamePhase[state.hostOrOpp] !== 'setup' && state.gamePhase[flipPlayer] !== 'setup') 
                && <div className='concede-btn button-zone btn' onClick={() => dispatch(update(['popupScreen', 'concede-prompt']))}>{state.gamePhase[flipPlayer] === 'draw' ? 'Draw' : 'Concede'}</div>
            }
            <div className='help-btn button-zone btn' onClick={() => dispatch(update(['popupScreen', 'help']))}>Help</div>
            <div className='room-id-btn button-zone btn' onClick={copyRoomCode}>Room Code: {state.roomId}</div>        
        </div>
    )
}