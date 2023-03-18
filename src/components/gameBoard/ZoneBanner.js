import {useSelector, useDispatch} from 'react-redux';

export default function ZoneBanner ({zone, boardSide}) {

    const state = useSelector(state => state.board);

    const benchCount = Object.keys(state[boardSide]).filter(e => {
        return e.startsWith('bench') && state[boardSide][e].length
    }).length

    let count = 0;
    
    if (zone === 'Card Display' && state.mySelected.currentZone) {
        count = state[boardSide][state.mySelected.currentZone].length;
    }
    else if (zone === 'bench') {
        count = benchCount;
    }
    else if (state[boardSide][zone]) {
        count = state[boardSide][zone].length;
    }

    return (
        <div className='zone-banner'>{zone[0].toUpperCase()}{zone.slice(1)}: {count}</div>
    )
}