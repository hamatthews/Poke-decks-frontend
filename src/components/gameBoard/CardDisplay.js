import {useSelector} from 'react-redux';

import RenderArray from './RenderArray';
import ZoneBanner from './ZoneBanner';
import CardZoomBtn from './CardZoomBtn';


export default function CardDisplay ({zone, arr, socket, boardSide}) {
    const state = useSelector(state => state.board);

    const extended = zone === 'discard' || zone === 'lost' || zone === 'deck' || arr.length > 9 || state[boardSide].chatImages.length > 9;

    let mainClass = extended ? ' extended' : '';
    let cardClass = extended ? '' : ' large-card';

    return (
        <div className={'card-display zone' + mainClass}>
            {
                state.mySelected.currentZone && (state.mySelected.boardSide === 'bottom'
                || (state.gamePhase.host !== 'setup' && state.gamePhase.opp !== 'setup'
                && state.mySelected.currentZone !== 'deck'
                && state.mySelected.currentZone !== 'hand'
                && state.mySelected.currentZone !== 'prize'))
                ? <RenderArray  {...({zone, arr, socket})} boardSide={state.mySelected.boardSide} cardDisplay={true}/>
                : state[boardSide].chatImages.length
                ? state[boardSide].chatImages.map((e, i) => {
                    return <div className={'card-sized-slot card' + cardClass} style={{backgroundImage: `url(${e})`}} key={`chat-images-${i}`}>
                        <CardZoomBtn image={`url(${e})`}/>
                    </div>
                }) : null
            }
            <ZoneBanner zone='Card Display' {...({boardSide})}/>
        </div>
    )
}
