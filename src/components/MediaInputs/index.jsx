import { useState } from 'react'
import {
    IoMdMic,
    IoMdMicOff,
    IoIosArrowDown,
    IoIosArrowUp,
} from 'react-icons/io'
import { IoVideocam, IoVideocamOff } from 'react-icons/io5'
import { ImPhoneHangUp } from 'react-icons/im'
import { useClickOutside } from '@mantine/hooks'

import { Container, Device, DeviceList, DeviceType } from './styles'
import { useAuth } from '../../contexts/auth'

function RenderDevices({ deviceList, deviceType, handleClose }) {
    const ref = useClickOutside(() => handleClose())

    return (
        <DeviceList ref={ref}>
            <DeviceType>{deviceType}</DeviceType>
            <ul>
                {deviceList?.map((device, index) => (
                    <li key={index}>{device?.label}</li>
                ))}
            </ul>
        </DeviceList>
    )
}

function MediaInputs({
    micDevicesList,
    camDevicesList,
    toggleCamera,
    toggleMicrofone,
}) {
    const [micActive, setMicActive] = useState(true)
    const [camActive, setCamActive] = useState(true)
    const [showMicDevices, setShowMicDevices] = useState(false)
    const [showCamDevices, setShowCamDevices] = useState(false)
    const { signOut } = useAuth()
    const { socket } = window
     
    function handleToggleCamera() {
        if (camActive) {
            setCamActive(false)
            toggleCamera(false)
        } else {
            setCamActive(true)
            toggleCamera(true)
        }
    }

    function handleToggleMicrofone() {
        if (micActive) {
            setMicActive(false)
            toggleMicrofone(false)
        } else {
            setMicActive(true)
            toggleMicrofone(true)
        }
    }

    function handleSignOut(){
        socket.disconnect()
        signOut() 
        window.location.reload()
    }

    return (
        <Container>
            <div className="device-wrapper">
                {showMicDevices && (
                    <RenderDevices
                        handleClose={() => setShowMicDevices(!showMicDevices)}
                        deviceList={micDevicesList}
                        deviceType="Microfones"
                    />
                )}

                <button
                    className="list-devices"
                    onClick={() => setShowMicDevices(!showMicDevices)}
                >
                    {showMicDevices ? (
                        <IoIosArrowUp size={20} />
                    ) : (
                        <IoIosArrowDown size={20} />
                    )}
                </button>
                <Device onClick={handleToggleMicrofone}>
                    {micActive ? (
                        <IoMdMic size={30} />
                    ) : (
                        <IoMdMicOff size={30} />
                    )}
                </Device>
            </div>

            <div className="device-wrapper">
                {showCamDevices && (
                    <RenderDevices
                        handleClose={() => setShowCamDevices(!showCamDevices)}
                        deviceList={camDevicesList}
                        deviceType="Câmeras"
                    />
                )}
                <button
                    className="list-devices"
                    onClick={() => setShowCamDevices(!showCamDevices)}
                >
                    {showCamDevices ? (
                        <IoIosArrowUp size={20} />
                    ) : (
                        <IoIosArrowDown size={20} />
                    )}
                </button>
                <Device onClick={handleToggleCamera}>
                    {camActive ? (
                        <IoVideocam size={30} />
                    ) : (
                        <IoVideocamOff size={30} />
                    )}
                </Device>
            </div>

            <div className="device-wrapper">
                <Device onClick={handleSignOut} className="hangup">
                    <ImPhoneHangUp size={25} />
                </Device>
            </div>
        </Container>
    )
}

export default MediaInputs
