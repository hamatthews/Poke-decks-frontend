import ZoneBanner from './ZoneBanner';
import Conditions from './Conditions';


export default function ActiveZone ({arr, socket, boardSide}) {
    return (
        <div className={'active zone ' + boardSide}>
                <Conditions {...({arr, socket, boardSide})}/>
            <ZoneBanner zone='active' {...({boardSide})}/>
        </div>
    )
}
