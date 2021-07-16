import * as mediasoup from 'mediasoup-client'

class MediaSoupService {
    constructor() {
        this._socket = null
        this._mediaDevice = null
        this._producer = {}
        this._stream = null
    }

    setSocket(socketInstance) {
        if (!this._socket) {
            this._socket = socketInstance
        }
    }

    setStream(stream) {
        if (!this._stream) {
            this._stream = stream
        }
    }

    async loadDevice(routerRtpCapabilities) {
        try {
            this._mediaDevice = new mediasoup.Device()
        } catch (error) {
            console.log('## 2', error, mediasoup)
            if (error.name === 'UnsupportedError') {
                console.error('browser not supported')
            }
        }
        await this._mediaDevice.load({ routerRtpCapabilities })
    }

    async stopTransmission() {
        await this._socket?.request('producerTransportClosed')
    }

    async startTransmission() {
        const serverRtpParameters = await this._socket?.request(
            'getRouterRtpCapabilities'
        )
        await this.loadDevice(serverRtpParameters)

        let data = await this._socket.request('createProducerTransport', {
            forceTcp: false,
            rtpCapabilities: this._mediaDevice.rtpCapabilities,
        })

        const transport = this._mediaDevice.createSendTransport(data)

        transport.on(
            'connect',
            async ({ dtlsParameters }, callback, errback) => {
                try {
                    const res = await this._socket.request(
                        'connectProducerTransport',
                        { dtlsParameters }
                    )
                    callback(res)
                } catch (err) {
                    errback(err)
                }
            }
        )

        transport.on(
            'produce',
            async ({ kind, rtpParameters }, callback, errback) => {
                try {
                    const { id } = await this._socket.request('produce', {
                        transportId: transport.id,
                        kind,
                        rtpParameters,
                    })
                    callback({ id })
                } catch (err) {
                    errback(err)
                }
            }
        )

        transport.on('connectionstatechange', async (state) => {
            switch (state) {
                case 'failed':
                    transport.close()
                    break

                default:
                    break
            }
        })

        if (!this._stream) {
            return console.log('there is no stream provided!')
        }

        try {
            const videoTrack = this._stream.getVideoTracks()[0]
            const audioTrack = this._stream.getAudioTracks()[0]

            const videoParams = { track: videoTrack }
            const audioParams = { track: audioTrack }

            videoParams.encodings = [
                { maxBitrate: 3000000, scaleResolutionDownBy: 1 },
                { maxBitrate: 1000000, scaleResolutionDownBy: 2 },
                { maxBitrate: 600000, scaleResolutionDownBy: 4 },
            ]

            this._producer.video = await transport.produce(videoParams)
            this._producer.audio = await transport.produce(audioParams)
        } catch (err) {
            console.error('stream error', err)
        }
    }
}

export default new MediaSoupService()
