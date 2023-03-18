import {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {update, clearSelected} from '../../redux/board';
import RenderArray from './RenderArray';
import ZoneBanner from './ZoneBanner';

export default function Zone ({zone, arr, socket, boardSide}) {
    const state = useSelector(state => state.board);
    const dispatch = useDispatch();

    useEffect(() => {
        if (zone === 'prize' && state[boardSide].showPrize.length !== state[boardSide].prize.length) {
            dispatch(update(['showPrize', Array(state[boardSide].prize.length).fill(false), boardSide]))
        }
    })

    return (
        <div className={zone + ' zone ' + boardSide}>
            <RenderArray {...({zone, arr, socket, boardSide})}/>
            <ZoneBanner {...({zone, boardSide})}/>
        </div>
    )
}