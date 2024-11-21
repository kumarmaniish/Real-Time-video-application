import React, { useState, useCallback, useEffect } from "react";
import {useNavigate} from 'react-router-dom'
import {useSocket} from '../context/SocketProvider';
// import { useFetcher } from "react-router-dom";

const LobbyScreen = ()=>{

    const [email,setEmail]=useState("");
    const [room, setRoom]=useState("");

    // use socket
    const socket = useSocket();    
    const navigate = useNavigate();


    const handleSubmitForm=useCallback((e)=>{
        e.preventDefault();
        socket.emit('room:join', {email,room});
    },
    [email,room,socket]);

    
    const handleJoinRoom = useCallback((data)=> {
        const {email,room}=data;
        // console.log(email,room);
        navigate(`/room/${room}`);
    },[navigate]);

    useEffect(()=>{
        socket.on("room:join",handleJoinRoom);
        return ()=>{
            socket.off('room:join',handleJoinRoom)
        }
    },[socket,handleJoinRoom]);
    return (
        <div style={styles.container}>
      <h1 style={styles.heading}>Lobby</h1>
      <form onSubmit={handleSubmitForm} style={styles.form}>
        <label htmlFor="email" style={styles.label}>Email-ID</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <br />
        <label htmlFor="room" style={styles.label}>Room Number</label>
        <input
          type="text"
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          style={styles.input}
        />
        <br />
        <button type="submit" style={styles.button}>Join</button>
      </form>
    </div>
    )
}    
const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f0f4f8',
    },
    heading: {
      fontSize: '2rem',
      color: '#333',
      marginBottom: '20px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '400px',
    },
    label: {
      fontSize: '1rem',
      color: '#555',
      marginBottom: '10px',
      fontWeight: 'bold',
    },
    input: {
      width: '100%',
      padding: '10px',
      marginBottom: '10px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      fontSize: '1rem',
    },
    button: {
      padding: '10px 20px',
      fontSize: '1rem',
      color: '#fff',
      backgroundColor: '#007bff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
  };
  

export default LobbyScreen;