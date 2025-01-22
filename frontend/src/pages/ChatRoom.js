import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import apiClient from '../utils/apiClient'; // API 요청을 위한 유틸리티

function ChatRoom() {
    const { roomKey } = useParams();
    const [messages, setMessages] = useState([]); // 메시지 상태
    const [message, setMessage] = useState(''); // 입력된 메시지 상태
    const [stompClient, setStompClient] = useState(null); // WebSocket 클라이언트
    const [currentUser, setCurrentUser] = useState(null); // 로그인된 사용자 정보 상태

    // WebSocket 연결 및 실시간 메시지 수신
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await apiClient.get('/api/users/session'); // 세션에서 사용자 정보 가져오기
                setCurrentUser(response.data);
            } catch (error) {
                console.error('사용자 정보를 가져오는 중 오류 발생:', error);
            }
        };

        fetchCurrentUser();

        return () => {
            if (stompClient) {
                stompClient.disconnect(() => console.log('WebSocket 연결 종료'));
            }
        };
    }, [stompClient]);

    // WebSocket 연결
    useEffect(() => {
        if (currentUser) {
            const socket = new SockJS('/ws');
            const client = Stomp.over(socket);

            client.connect(
                { username: currentUser.username },
                () => {
                    console.log('WebSocket 연결 성공');
                    client.subscribe(`/topic/chat/${roomKey}`, (payload) => {
                        try {
                            const newMessage = JSON.parse(payload.body);
                            setMessages((prevMessages) =>
                                Array.isArray(prevMessages) ? [...prevMessages, newMessage] : [newMessage]
                            );
                        } catch (error) {
                            console.error('메시지 처리 중 오류:', error);
                        }
                    });
                },
                (error) => {
                    console.error('WebSocket 연결 실패:', error);
                }
            );

            setStompClient(client);
        }
    }, [currentUser, roomKey]);

    // 이전 메시지 로드
    useEffect(() => {
        const fetchPreviousMessages = async () => {
            try {
                const response = await apiClient.get(`/api/chats/messages/${roomKey}`);
                if (Array.isArray(response.data)) {
                    setMessages(response.data);
                } else {
                    console.error('서버에서 반환된 데이터가 배열이 아닙니다:', response.data);
                }
            } catch (error) {
                console.error('이전 메시지를 불러오는 중 오류 발생:', error);
            }
        };

        fetchPreviousMessages();
    }, [roomKey]);

    // 스크롤 자동 이동
    useEffect(() => {
        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }, [messages]);

    // 메시지 전송
    const sendMessage = () => {
        if (!stompClient || !stompClient.connected) {
            alert('WebSocket 연결이 아직 설정되지 않았습니다.');
            return;
        }
        if (message.trim() === '') {
            alert('빈 메시지는 보낼 수 없습니다.');
            return;
        }

        const chatMessage = {
            sender: currentUser.username,
            content: message,
            type: 'CHAT',
        };
        stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
        setMessage(''); // 메시지 입력창 초기화
    };

    if (!currentUser) {
        return <div>로딩 중...</div>;
    }

    return (
        <div>
            <h2>채팅방: {roomKey}</h2>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`chat-message ${
                            msg.sender === currentUser.username ? 'my-message' : 'other-message'
                        }`}
                    >
                        <strong>{msg.sender || '알 수 없음'}: </strong>
                        <span>{msg.content || '메시지 없음'}</span>
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="메시지를 입력하세요..."
            />
            <button onClick={sendMessage}>전송</button>
        </div>
    );
}

export default ChatRoom;
