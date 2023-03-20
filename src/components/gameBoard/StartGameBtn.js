import {useEffect} from 'react';

import {useSelector, useDispatch} from 'react-redux';
import {update} from '../../redux/board';

export default function StartGameBtn ({boardSide}) {
    const state = useSelector(state => state.board);
    const dispatch = useDispatch();

    let buttonPress;
    
    const flipPlayer = state.hostOrOpp === 'host' ? 'opp' : state.hostOrOpp === 'opp' ? 'host' : undefined; 

    buttonPress = () => {
        if (state.bottom.active[0] !== undefined
        && state.gamePhase[state.hostOrOpp] === 'setup') {
            dispatch(update(['gamePhase', {...state.gamePhase, [state.hostOrOpp]: 'ready'}]));

            if (state.gamePhase[flipPlayer] !== 'setup') {
                const time = Date.now();
                const message = `${flipPlayer === 'opp' ? 'challenger' : 'host'}'s turn`;

                dispatch(update(['myGameLog', [...state.myGameLog, {time, message, messageType: 'game', hostOrOpp: state.turnPlayer}]]));
            }

        }
        else {
            dispatch(update(['noActiveMessage', true]));
        }
    };

    const startMessage = state.gamePhase[state.hostOrOpp] !== 'setup' ?
    'Waiting...' : state[boardSide].active.length ? 'Start Game' : 'Place a Pokemon in the active zone to start';

    useEffect(() => {
        if (state.gamePhase[state.hostOrOpp] === 'setup' || state.gamePhase[flipPlayer] === 'setup') {
            if (state[boardSide].active[0] === undefined && state.gamePhase[state.hostOrOpp] !== 'setup') {
                dispatch(update(['gamePhase', {...state.gamePhase, [state.hostOrOpp]: 'setup'}]));
            }
            if (state.top.active[0] === undefined && state.gamePhase[flipPlayer] !== 'setup') {
                dispatch(update(['gamePhase', {...state.gamePhase, [flipPlayer]: 'setup'}]));
            }            
        }
    }, [state[boardSide].active, state.top.active])


    useEffect(() => {
        if (state[boardSide].active.length && state.noActiveMessage) {
            dispatch(update(['noActiveMessage', false]));
        }
    }, [state[boardSide].active])

    return (state.gamePhase.host === 'setup' || state.gamePhase.opp === 'setup') ?
    <div className='start-game button-zone btn' style={state[boardSide].active.length ? {} : {fontSize: '16px', padding: '0 12px'}} onClick={buttonPress}>{startMessage}</div> : null;
}