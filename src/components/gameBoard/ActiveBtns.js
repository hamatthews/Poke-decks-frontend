import {useEffect} from 'react';

import {useSelector, useDispatch} from 'react-redux';
import {update} from '../../redux/board';

export default function ActiveBtns ({socket}) {
    const state = useSelector(state => state.board);
    const dispatch = useDispatch();

    const flipPlayer = state.hostOrOpp === 'host' ? 'opp' : state.hostOrOpp === 'opp' ? 'host' : undefined;



    return <>
        
    </>
}