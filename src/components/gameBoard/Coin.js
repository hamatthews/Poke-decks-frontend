import {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {update} from '../../redux/board';

export default function Coin () {

    const state = useSelector(state => state.board);
    const dispatch = useDispatch();

    const obverse = 'url(/coin-obverse.png)';
    const reverse = 'url(/coin-reverse.png)';

    const [face1, setFace1] = useState(obverse);
    const [face2, setFace2] = useState(reverse);
    
    let iterations;

    const flip = () => {
        const flipAnimation = [{visibility: 'visible', offset: 0}];
        iterations = Math.ceil(Math.random()*5) + 5;

        const changeState = prev => {
            if (iterations % 2 !== 0) {
                if (prev === obverse) {
                    return reverse;
                }
                else if (prev === reverse) {
                    return obverse;
                };
            }
            else if (iterations % 2 === 0) return prev;
        }

        const start = .2;
        const duration = .6;
        // This function determines when in the animation duration coin flip should start, and how long it should last.
        // it takes one argument which should be a decimal representing the duration of the coin flip
        const offsetFactor = duration => {
            return 1 / duration * 2 * iterations;
        }; 

        for (let i = 0; i < iterations; i++) {

            flipAnimation.push(...[ 
                {
                    transform: `scale(${1 + 3*(.5 - (Math.abs(.5 - (i*2)/(iterations*2))))})`,
                    borderTop: '.1px solid black',
                    offset: start + ((i*2)/offsetFactor(duration)) // 0
                },
                {
                    backgroundImage: i % 2 === 0 ? face1 : face2,
                    borderTop: '10px solid black',
                    borderBottom: 'none',
                    offset: start + ((i*2 + 1)/offsetFactor(duration)) - 0.01 // .49
                },
                {
                    transform: `scale(${1 + 3*(.5 - (Math.abs(.5 - (i*2 + 1)/(iterations*2))))}, .05)`,
                    backgroundImage: i % 2 === 0 ? face2 : face1,
                    borderTop: 'none',
                    borderBottom: '10px solid black',
                    offset: start + ((i*2 + 1)/offsetFactor(duration)) // .5
                },
                {
                    borderBottom: '.1px solid black',
                    offset: start + ((i*2 + 2)/offsetFactor(duration)) - 0.01 // .99
                },
                {
                    backgroundImage: i % 2 === 0 ? face2 : face1,
                    borderBottom: 'none',
                    offset: start + ((i*2 + 2)/offsetFactor(duration)) // 1
                }
            ]);
        };
        flipAnimation.push({transform: 'scale(1)', offset: start + duration + .01});
        flipAnimation.push({visibility: 'hidden', offset: 1});

        const message = `coin flip: ${changeState(face1) === obverse ? 'heads' : 'tails'}`;
        
        setTimeout(() => {
            setFace1(prev => changeState(prev));
            setFace2(prev => changeState(prev));    
        }, 500)

        setTimeout(() => {
            dispatch(update(['myGameLog', [...state.myGameLog, {time: Date.now(), message, messageType: 'game', hostOrOpp: state.hostOrOpp}]]));
        }, 1000);

        const coin = document.querySelector('.coin');
        coin.animate(flipAnimation, {duration: 1500, easing: 'cubic-bezier(0, .2, .5, 1)'});
    }

    useEffect(() => {
        if (state.coinFlip) {
            flip();
            dispatch(update(['coinFlip', false]));
        }
    }, [state.coinFlip]);

    return (
        <div className='coin' style={{
            visibility: 'hidden',
            boxShadow: 'inset 0 0 30px rgb(200,255,255), 0 0 10px rgb(200,255,255)',
            backgroundImage: face1
        }}></div>
    )
}
