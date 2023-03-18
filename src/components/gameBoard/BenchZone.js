import {useSelector, useDispatch} from 'react-redux';
import {update, clearSelected} from '../../redux/board';
import RenderArray from './RenderArray';
import ZoneBanner from './ZoneBanner';

export default function BenchZone ({benchArr, socket, boardSide}) {

    const dispatch = useDispatch();
    return (
        <div className={'bench zone ' + boardSide}>
            {benchArr.map((e, i) => {
                return <RenderArray zone={'bench' + (i + 1)} arr={e} {...({socket, boardSide})} key={`${boardSide}-bench-zone-${i}`}/>
            })}
            <ZoneBanner zone='bench' {...({boardSide})}/>
        </div>
    )
}