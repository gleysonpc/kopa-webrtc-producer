import { useEffect, useRef, useState } from 'react'
import Chat from '../../components/Chat'
import mediaSoup from '../../services/mediasoupService'

import Player from '../../components/Player'

import { Layout } from './styles'
import { useAuth } from '../../contexts/auth'
import { getSocketConnection } from '../../services/socketService'

export default function Producer() {
    const [videoTracks, setVideoTracks] = useState([])
    const [audioTracks, setAudioTracks] = useState([])

    const [localStream, setLocalStream] = useState()
    const [isLive, setIsLive] = useState(false)
    const { user } = useAuth()
    const { socket } = window

    const videoElement = useRef()

    function gotStream(stream) {
        setLocalStream(stream)

        navigator.mediaDevices
            .enumerateDevices()
            .then((devices) => {
                setAudioTracks(
                    devices.filter((device) => device.kind === 'audioinput')
                )
                setVideoTracks(
                    devices.filter((device) => device.kind === 'videoinput')
                )
            })
            .catch((error) => {
                console.log(error)
                alert('Fail to get devices!')
            })
    }

    function toggleCamera(state = true) {
        const tracks = localStream.getVideoTracks()
        tracks[0].enabled = state
    }

    function toggleMicrofone(state = true) {
        const tracks = localStream.getAudioTracks()
        tracks[0].enabled = state
    }

    useEffect(() => {
        if (user.name) {
            getSocketConnection(user.name, user.room)
        }
    }, [user.name, user.room])

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ audio: true, video: true })
            .then(gotStream)
            .catch((error) => console.log(error))
    }, [])

    useEffect(() => {
        navigator.mediaDevices
            .enumerateDevices()
            .then((devices) => {
                setAudioTracks(
                    devices.filter((device) => device.kind === 'audioinput')
                )
                setVideoTracks(
                    devices.filter((device) => device.kind === 'videoinput')
                )
            })
            .catch((error) => {
                console.log(error)
                alert('Fail to get devices!')
            })
    }, [])

    useEffect(() => {
        videoElement.current.srcObject = localStream
    }, [localStream])

    function toggleIsLive() {
        if (!socket.connected) return alert('Socket não conectado!')
        if (!localStream) return alert('Nenhuma fonte de de mídia disponível!')

        if (socket.connected && localStream && !isLive) {
            mediaSoup.setSocket(socket)
            mediaSoup.setStream(localStream)
            mediaSoup.startTransmission()
            setIsLive(true)
            return
        } else {
            mediaSoup.stopTransmission()
            setIsLive(false)
        }
    }

    return (
        <Layout>
            <button onClick={() => mediaSoup.stopTransmission()} >pause</button>
            <button onClick={() => mediaSoup.resumeTransmission()}>resume</button>
            <Player
                isLive={isLive}
                toggleIsLive={toggleIsLive}
                stream={localStream}
                toggleCamera={toggleCamera}
                toggleMicrofone={toggleMicrofone}
                videoRef={videoElement}
                audioTracks={audioTracks}
                videoTracks={videoTracks}
            />
            <Chat />
        </Layout>
    )
}
