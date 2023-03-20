import {useState, useEffect} from 'react';

import {useSelector, useDispatch} from 'react-redux';
import {update, clearSelected} from '../../redux/board';

import CardDisplay from './CardDisplay';

export default function Chat ({socket, boardSide}) {

    const state = useSelector(state => state.board);
    const dispatch = useDispatch();

    const [messageBox, setMessageBox] = useState('');
    const [chatTab, setChatTab] = useState('all');
    const [newMessage, setNewMessage] = useState({chat: false, game: false});

    const typeMessage = e => {
        setMessageBox(e.target.value);
    }

    const submitMessage = e => {
        if (e.code && e.code === 'Enter' && !e.ctrlKey) {
            e.preventDefault();
        }
        if (e.code && e.code === 'Enter' && e.ctrlKey) {
            setMessageBox(prev => prev + '\n')
        }

        if (messageBox && (e.type === 'click'
        || e.code && e.code === 'Enter' && !e.ctrlKey)) {
            const time = Date.now();
            dispatch(update(['myGameLog', [...state.myGameLog, {time, message: messageBox, messageType: 'chat', hostOrOpp: state.hostOrOpp}]]));
            setMessageBox('');
        }
    }

    const getChatImages = e => {
        if (!e.urls) return;

        dispatch(clearSelected());
        dispatch(update(['chatImages', e.urls, boardSide]));
    }

    const FormatLog = () => {
        const chronologicalLog = [...state.myGameLog, ...state.theirGameLog].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        return chronologicalLog
        .filter(e => {
            return (
                chatTab === 'all' ? e :
                chatTab === 'chat' ? e.messageType === 'chat' :
                chatTab === 'game' ? e.messageType === 'game' :
                undefined
            )
        })
        .map((e, i, arr) => {
            let time = new Date(e.time).toLocaleTimeString();
            time = time.slice(0, -6) + time.slice(-3);

            const messageClass = e.urls && e.urls.length ? 'chat-link' : '';

            const message = e.message.split('\n').map((f, j) => {
                const optionalBreak = j > 0 ? <br /> : undefined;
                return <span key={`break + ${i}.${j}`}>{optionalBreak}{f}</span>;
            })
            
            const playerColor = e.hostOrOpp === 'host' ? 'rgb(150,150,255)' : 'rgb(255,150,150)';
            
            const messageStyle = e.message.endsWith('turn')
            ? {
                margin: '0',
                width: '100%',
                justifyContent: 'center'
            }
            : e.hostOrOpp === state.hostOrOpp ?
            {
                alignSelf: 'end'
            }
            : {
                alignSelf: 'start',
                flexDirection: 'row-reverse'
            }
            
            const bubbleStyle = e.messageType === 'chat'
            ? {
                background: playerColor,
                alignSelf: e.hostOrOpp === state.hostOrOpp ? 'end' : 'start'
            }
            : e.message.endsWith('turn') ?
            {
                width: '100%',
                margin: '20px 0',
                borderTop: `1px solid ${playerColor}`,
                color: playerColor,
                fontFamily: 'monospace',
                borderRadius: '0',
                textAlign: 'center'
            }
            : {
                color: playerColor,
                fontFamily: 'monospace',
                border: `1px solid ${playerColor}`,
                alignSelf: e.hostOrOpp === state.hostOrOpp ? 'end' : 'start',
            }

            return <div className={'chat-message'}
                style={messageStyle}
                key={'chat' + i}>
                {(!arr[i].message.endsWith('turn') && (!arr[i + 1] || arr[i + 1].time - 60000 > arr[i].time || arr[i + 1].message.endsWith('turn'))) && <>
                    <span style={{fontSize: '15px', color: 'grey', alignSelf: 'end', margin: '6px'}}>{time}</span>
                </>}
                <div className={'chat-bubble ' + messageClass} onMouseDown={() => getChatImages(e)} style={bubbleStyle}>
                    {message}
                </div>
            </div>
        })
    };

    const selectedTab = {background: 'rgba(0,0,0,.8)', color: 'white'};

    const reachBottom = e => {
        const gameLog = state.theirGameLog;

        if (gameLog[0] && e.target.scrollTop + 100 >= e.target.scrollHeight - e.target.offsetHeight) {
            setNewMessage(prev => ({
                ...prev,
                [gameLog[gameLog.length - 1].messageType]: false
            }));
    
        }
    }

    const switchTab = tab => {
        if (newMessage[tab]) setNewMessage(prev => ({...prev, [tab]: false}));
        else if (tab === 'all') setNewMessage({chat: false, game: false});
        setChatTab(tab);
    }
    useEffect(() => {
        const messageCount = state.myGameLog.length + state.theirGameLog.length;

        if (chatTab !== 'cards') document.querySelector('.chat-log').scrollTop = messageCount*200;
    }, [chatTab])

    useEffect(() => {
        if (state.mySelected.currentZone) {
            dispatch(update(['chatImages', [], boardSide]));
        }
    }, [state.mySelected])

    useEffect(() => {
        if ((chatTab === 'all' || chatTab === state.myGameLog[state.myGameLog.length - 1].messageType)) {
            const chatLogDiv = document.querySelector('.chat-log');
            chatLogDiv.scrollTop = chatLogDiv.scrollHeight;    
        }
    }, [state.myGameLog, state.theirGameLog])

    useEffect(() => {
        const gameLog = state.theirGameLog;
        const chatLogDiv = document.querySelector('.chat-log');

        if (gameLog[0] && (chatLogDiv && chatLogDiv.scrollTop + 100 <= chatLogDiv.scrollHeight - chatLogDiv.offsetHeight
        || (!newMessage[gameLog[gameLog.length - 1].messageType] && chatTab !== gameLog[gameLog.length - 1].messageType && chatTab !== 'all'))) {

            setNewMessage(prev => ({
                ...prev,
                [gameLog[gameLog.length - 1].messageType]: true
            }));
        }
    }, [state.theirGameLog]);

    return (
        <div className='chat zone'>
            <div className='chat-banner banner'>
                <div className='all-tab' style={chatTab === 'all' ? selectedTab : {}} onClick={() => switchTab('all')}>
                    {!state.narrowScreen? 'All' : 'Log'}
                    {state.narrowScreen && (newMessage.chat || newMessage.game) && <div className='new-message-bubble' />}    
                </div>
                {!state.narrowScreen ? <>
                    <div className='chat-tab'style={chatTab === 'chat' ? selectedTab : {}} onClick={() => switchTab('chat')}>
                        Chat
                        {newMessage.chat && <div className='new-message-bubble' />}
                    </div>
                    <div className='game-tab'style={chatTab === 'game' ? selectedTab : {}} onClick={() => switchTab('game')}>
                        Game
                        {newMessage.game && <div className='new-message-bubble' />}
                    </div></> 
                    : <div className='cards-tab'style={chatTab === 'cards' ? selectedTab : {}} onClick={() => switchTab('cards')}>
                        Cards
                    </div>    
            }
            </div>
            {state.narrowScreen && chatTab === 'cards' ? <CardDisplay zone={state.mySelected.currentZone} {...({socket, boardSide})} arr={state.mySelected.boardSide ? state[state.mySelected.boardSide][state.mySelected.currentZone] : []}/>
                : <>
                    <div className='chat-log-wrapper'>
                        <div className='chat-log' onScroll={e => reachBottom(e)}>
                            <FormatLog />
                        </div>
                    </div>
                    <div className='message-input-wrapper'>
                        <textarea className='message-input'
                        onChange={e => typeMessage(e)}
                        onKeyDown={e => submitMessage(e)}
                        value={messageBox}
                        />
                        <button
                        onClick={e => submitMessage(e)}
                        onKeyDown={e => submitMessage(e)}
                        className='message-submit'>Send</button>
                    </div>
                </>}
        </div>
    )
}