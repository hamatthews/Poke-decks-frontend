import './background.css';

import {useState, useEffect} from 'react';

export default function Background ({page}) {
    const centeredBackground = `
    @media (max-width: 1040px) {
        .light {
            grid-template:
            ".. .."
            "cl .."
            ".. .."
            / minmax(0, 1fr) minmax(0, 1fr);
            }
    }
    `;
    const backgroundStyle = `           
    .background {
        background-color: rgb(30,0,50)!important;
        box-shadow: none !important;
    }

    .light-1 {
        width: 30px !important;
        height: 30px !important;
        opacity: 1 !important;
    }

    .light-2 {
        opacity: 1 !important;
        transform: rotate(360deg) !important;
    }

    .light-2 > .layer-b {
        background-color: rgb(30,0,50) !important;
    }

    .rect-light {
        height: 0 !important;
    }

    .rect-cutout {
        background-color: rgb(30,0,50) !important;
    }

    .light-3 {
        width: 100% !important;
        height: 10px !important;
        opacity: 1 !important;
    }

    ${page === 'gameroom' ? centeredBackground : ''} 
    `

    const [styleBlock, setStyleBlock] = useState(page === 'gameroom' ? backgroundStyle : '');
    useEffect(() => {
        setStyleBlock(backgroundStyle);
    }, [])

    return (
        <>
            <style>{styleBlock}</style>
                <div className='background'>
                    <div className='light'>
                        <div className='centered-lights'>
                            <div className='light-1'>
                            </div>
                            <div className='light-2'>
                            <div className='layer-a'></div>
                                <div className='layer-b'></div>
                                <div className='layer-c rect-light'>
                                    <div className='rect-cutout'></div>
                                </div>
                                <div className='layer-d rect-light'>
                                    <div className='rect-cutout'></div>
                                </div>
                                <div className='layer-e rect-light'>
                                    <div className='rect-cutout'></div>
                                </div>
                            </div>                            
                        </div>
                        <div className='light-3'></div>
                    </div>
                </div>
        </>
    )
}