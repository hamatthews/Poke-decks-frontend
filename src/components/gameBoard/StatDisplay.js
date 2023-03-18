import {useSelector, useDispatch} from 'react-redux';
import {update, clearSelected} from '../../redux/board';

import CardStats from './CardStats';

export default function StatDisplay ({socket}) {
    const state = useSelector(state => state.board);
    const dispatch = useDispatch();

    const boardSide = state.mySelected.boardSide;

    const arr = state.mySelected.currentZone ? state[boardSide][state.mySelected.currentZone] : [];

    const SelectedCount = () => {
        const array = [];


        const switchCurrent = zone => {
            dispatch(update(['mySelected', {...state.mySelected, currentZone: zone}]))
        }

        for (let e in state.mySelected.cards) {
            let zone = e;
            if (zone.startsWith('bench')) zone = 'bench ' + zone[5];
            array.push(<div className='zone-count' key={`${e}-zone-counter`} onMouseDown={() => switchCurrent(e)}><span>{zone[0].toUpperCase() +  zone.slice(1)}: {state.mySelected.cards[e].length}</span></div>)
        }

        return (
            <div className='selected-count'>{array}</div>
        );
    }

    return (
        <div className={'stat-display zone top'}>
            {(state.mySelected.boardSide === 'bottom' || (state.gamePhase.host !== 'setup' && state.gamePhase.opp !== 'setup'))
            && (state.mySelected.currentZone === 'active' || state.mySelected.currentZone.startsWith('bench')) && Object.keys(state.mySelected.cards).length === 1
                ? <CardStats arr={arr} cardIndex={arr[0]} zone={state.mySelected.currentZone} cardDisplay={true} socket={socket} boardSide={boardSide}/>
                : Object.keys(state.mySelected.cards).length > 0 && <SelectedCount />
            }
        </div>
    )
}