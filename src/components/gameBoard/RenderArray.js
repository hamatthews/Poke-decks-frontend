import {useSelector} from 'react-redux';

import Card from './Card';

export default function RenderArray ({zone, arr, socket, boardSide, cardDisplay}) {

    const state = useSelector(state => state.board);

    let mapArr;
    if (cardDisplay) {
        if (zone === 'deck' || zone === 'discard' || zone === 'lost' || zone === 'prize' || zone === 'hand') {
            mapArr = [...arr];
            if (zone === 'deck') {
                mapArr = mapArr.slice(0, state[boardSide].deckSearch.count)
            }
        }
        else mapArr = [...arr].reverse();
    }
    else if (!state.narrowScreen && (zone === 'hand' || zone === 'prize')) mapArr = [...arr, undefined]; 
    else mapArr = [arr[0]];

    return <>{mapArr.length !== 0 && mapArr.map((cardIndex, index) => {
        if (cardDisplay && zone !== 'deck' && zone !== 'discard' && zone !== 'prize' && zone !== 'lost' && zone !== 'hand') {
            index = arr.length - 1 - index;
        }

        const key = `${boardSide}-${zone}-${index}`;
        return <Card {...({key, boardSide, zone, arr, cardIndex, index, socket, cardDisplay})}/>})
    }</>
}