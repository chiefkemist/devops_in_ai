
import React, { useState, useEffect, useRef, useCallback } from 'react';

const ConversationalUI = () => {
	//const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState([]);
	const [input, setInput] = useState('');
	const [isConnected, setIsConnected] = useState(false);
	const eventSourceRef = useRef(null);
	const messagesEndRef = useRef(null);

	useEffect(() => {
		connectToSSE('Hello, introduce yourself');

		return () => {
			if (eventSourceRef.current) {
				eventSourceRef.current.close();
			}
		};
	}, []);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [message]);
	//useEffect(() => {
	//	messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	//}, [messages]);

	const getCsrfToken = useCallback(() => {
		return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
	}, []);

	const connectToSSE = (prompt) => {
		const url = new URL('/streaming_response', window.location.origin);
		url.searchParams.append('prompt', prompt);

		eventSourceRef.current = new EventSource(url.toString(), {
			withCredentials: true,
		});

		eventSourceRef.current.onopen = (event) => {
			console.log('SSE connection opened', event);
			setIsConnected(true);
		};

		eventSourceRef.current.onmessage = (event) => {
			console.log('Received message event:', event);
			handleServerMessage(event);
		};

		eventSourceRef.current.onerror = (error) => {
			console.error('SSE Error:', error);
			setIsConnected(false);
			eventSourceRef.current.close();
		};
	};

	const handleServerMessage = (event) => {
		try {
			let data;
			if (typeof event.data === 'string') {
				// Try to parse as JSON
				try {
					data = JSON.parse(event.data);
				} catch (jsonError) {
					// If not JSON, use as is
					data = { text: event.data };
				}
			} else {
				data = event.data;
			}

			const newMessage = {
				id: data.id || Date.now(),
				text: data.text || 'Empty message',
				sender: 'server'
			};

			setMessage(newMessage);
			//setMessages((prevMessages) => [...prevMessages, newMessage]);
			console.log('Server message added:', newMessage);
		} catch (error) {
			console.error('Error handling server message:', error);
		}
	};

	const sendMessage = (e) => {
		e.preventDefault();
		if (input.trim() === '') return;

		const newMessage = { id: Date.now(), text: input, sender: 'user' };
		setMessage(newMessage);
		//setMessages((prevMessages) => [...prevMessages, newMessage]);
		connectToSSE(input);
		setInput('');
	};

	return (
		<div className="flex flex-col h-screen max-w-2xl mx-auto p-4 bg-gray-100">
			<div className="flex-grow overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
				<div
					key={message.id}
					className={`p-3 rounded-lg max-w-xs ${message.sender === 'user' ? 'bg-blue-500 text-white ml-auto' : 'bg-white text-gray-800'}`}
				>
					{message.text}
				</div>
				{/*
				{messages.map((message) => (
					<div
						key={message.id}
						className={`p-3 rounded-lg max-w-xs ${message.sender === 'user' ? 'bg-blue-500 text-white ml-auto' : 'bg-white text-gray-800'}`}
					>
						{message.text}
					</div>
				))}
				*/}
				<div ref={messagesEndRef} />
			</div>
			<form onSubmit={sendMessage} className="flex">
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					className="flex-grow border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="Type a message..."
				/>
				<button
					type="submit"
					className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				>
					Send
				</button>
			</form>
			<div className={`text-sm mt-2 ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
				Status: {isConnected ? 'Connected' : 'Disconnected'}
			</div>
		</div>
	);
};

export default ConversationalUI;

