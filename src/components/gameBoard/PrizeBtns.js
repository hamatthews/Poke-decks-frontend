import shuffle from '../../functions/shuffle';

import {useSelector, useDispatch} from 'react-redux';
import {update, clearSelected} from '../../redux/board';

export default function PrizeBtns({index, boardSide}) {

    const state = useSelector(state => state.board);
    const dispatch = useDispatch();
    const otherSide = boardSide === 'top' ? 'bottom' : boardSide === 'bottom' ? 'top' : undefined;


    const time = Date.now();

    const toggleView = () => {
        let array = [...state[boardSide].showPrize];
        array[index] = !array[index];
        dispatch(update(['showPrize', array, boardSide]));

        const message = `${state[boardSide].showPrize[index] ? 'hid' : 'viewed'} prize card #${index + 1}`
        dispatch(update(['myGameLog', [...state.myGameLog, {time, message, hostOrOpp: state.hostOrOpp}]]));
    }

    const hideAll = () => {
        const message = 'shuffled their prize cards.'

        dispatch(update(['showPrize', Array(state[boardSide].showPrize.length).fill(false), boardSide]));
        dispatch(update(['myGameLog', [...state.myGameLog, {time, message, hostOrOpp: state.hostOrOpp}]]));
    };

    return (
        <div className='prize-btns btns'>
            <div className='view prize-btn btn' onClick={toggleView}>{state[boardSide].showPrize[index] ? 'Hide' : 'View'}</div>
            <div className='shuffle prize-btn btn' onClick={e => {dispatch(update(['prize', shuffle(state[boardSide].prize, state, dispatch, e), boardSide])); hideAll()}}>Shuffle</div>
        </div>
    )
};
