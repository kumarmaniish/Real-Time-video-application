import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from 'react-player';
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

const RoomPage= ()=>{

    const socket = useSocket();
    const [remoteSockedId, setRemoteSocketId]=useState(null);
    const [myStream, setMyStream]=useState();
    const [remoteStream,setRemoteStream]=useState();


    const handleUserJoined = useCallback(({email, id})=>{
        console.log(`Email ${email} joined room`);
        setRemoteSocketId(id);
    },[]);


    const handleCallUser = useCallback(async() => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio:true,
            video:true,
        });
        const offer=await peer.getOffer();
        socket.emit("user:call",{to:remoteSockedId,offer})
        setMyStream(stream);
    }, [remoteSockedId,socket]);

    const handleIncommingCall=useCallback(async({from, offer})=>{
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
            audio:true,
            video:true,
        });
        setMyStream(stream);
        console.log(`Incomming call`,from,offer);
        const ans=await peer.getAnswer(offer);
        socket.emit('call:accepted',{to: from, ans });
    },[socket]);

    const sendStreams = useCallback(() =>{
        for(const track of myStream.getTracks()){
            peer.peer.addTrack(track,myStream);
        }
    },[myStream])

    const handleCallAccepted=useCallback(({from,ans})=>{
        peer.setLocalDescription(ans);
        console.log('call Accepted!'); 
        sendStreams();      
    },
    [sendStreams]);

    const handleNegoNeeded = useCallback(async()=>{
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed',{ offer, to:remoteSockedId});
    },[remoteSockedId,socket]);

    const handleNegoNeededIncomming=useCallback(async({from,offer})=>{
        const ans= await peer.getAnswer(offer);
        socket.emit('peer:nego:done',{to: from, ans})
    },
    [socket]);

    const handleNegoNeededFinal=useCallback(async({ans})=>{
        await peer.setLocalDescription(ans);
    },[]);

    useEffect(()=>{
        peer.peer.addEventListener('negotiationneeded',handleNegoNeeded);
        return()=>{
            peer.peer.removeEventListener('negotiationneeded',handleNegoNeeded);
        }
    },[handleNegoNeeded]);

    useEffect(()=>{
        peer.peer.addEventListener('track',async ev =>{
            const remoteStream = ev.streams;
            console.log('GOT TRACKS!!');
            setRemoteStream(remoteStream[0]);
        });
    });

    useEffect(()=>{
        socket.on('user:joined',handleUserJoined);
        socket.on('incomming: call',handleIncommingCall);
        socket.on('call:accepted',handleCallAccepted);
        socket.on('peer:nego:needed',handleNegoNeededIncomming);
        socket.on('peer:nego:final',handleNegoNeededFinal);

        return ()=>{
            socket.off('user:joined',handleUserJoined);
            socket.off('incomming: call',handleIncommingCall);
            socket.off('call:accepted',handleCallAccepted);
            socket.off('peer:nego:needed',handleNegoNeededIncomming);
            socket.off('peer:nego:final',handleNegoNeededFinal);
        }
    },[socket,handleUserJoined,handleIncommingCall,handleCallAccepted,handleNegoNeededIncomming,handleNegoNeededFinal]);

    return (
        <div>
            <h1>Room Page</h1>
            <h4>{remoteSockedId ? 'Connected' : 'No one in room'}</h4>
            {myStream && <button onClick={sendStreams}>Send Stream</button>}
            {remoteSockedId && <button onClick={handleCallUser}>CALL</button>}
            {myStream && (
                <>
                <h1>My Stream</h1>
                <ReactPlayer 
                playing
                muted
                height="100px" 
                width="200px" 
                url={myStream}/>
                </>
            )}
            {remoteStream && (
                <>
                <h1>Remote Stream</h1>
                <ReactPlayer 
                playing
                muted
                height="100px" 
                width="200px" 
                url={remoteStream}/>
                </>
            )}
        </div>
    )
}

export default RoomPage;