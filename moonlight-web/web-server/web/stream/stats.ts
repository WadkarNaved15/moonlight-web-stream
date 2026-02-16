import { StreamerStatsUpdate, TransportChannelId } from "../api_bindings.js"
import { BIG_BUFFER, ByteBuffer } from "./buffer.js"
import { Logger } from "./log.js"
import { DataTransportChannel, Transport } from "./transport/index.js"

export type NetworkQuality =
    | "excellent"
    | "good"
    | "fair"
    | "poor"
    | "critical";

export type StreamStatsData = {
    videoCodec: string | null
    videoWidth: number | null
    videoHeight: number | null
    videoFps: number | null
    videoPipeline: string | null
    audioPipeline: string | null
    hdrEnabled: boolean | null
    streamerRttMs: number | null
    streamerRttVarianceMs: number | null
    minHostProcessingLatencyMs: number | null
    maxHostProcessingLatencyMs: number | null
    avgHostProcessingLatencyMs: number | null
    minStreamerProcessingTimeMs: number | null
    maxStreamerProcessingTimeMs: number | null
    avgStreamerProcessingTimeMs: number | null
    browserRtt: number | null
    transport: Record<string, string>
    networkQuality: NetworkQuality | null
    packetLossPercent: number | null
    rttMs: number | null
    jitterMs: number | null
    availableIncomingBitrateMbps: number | null
    availableOutgoingBitrateMbps: number | null
    actualIncomingBitrateMbps: number | null
    actualOutgoingBitrateMbps: number | null
    freezeCount: number | null
    freezeDurationMs: number | null
}

function num(value: number | null | undefined, suffix?: string): string | null {
    if (value == null) {
        return null
    } else {
        return `${value.toFixed(2)}${suffix ?? ""}`
    }
}

export function streamStatsToText(statsData: StreamStatsData): string {
    let text = `stats:
video information: ${statsData.videoCodec}, ${statsData.videoWidth}x${statsData.videoHeight}, ${statsData.videoFps} fps
HDR: ${statsData.hdrEnabled === true ? "Enabled" : statsData.hdrEnabled === false ? "Disabled" : "Unknown"}
video pipeline: ${statsData.videoPipeline}
audio pipeline: ${statsData.audioPipeline}
streamer round trip time: ${num(statsData.streamerRttMs, "ms")} (variance: ${num(statsData.streamerRttVarianceMs, "ms")})
host processing latency min/max/avg: ${num(statsData.minHostProcessingLatencyMs, "ms")} / ${num(statsData.maxHostProcessingLatencyMs, "ms")} / ${num(statsData.avgHostProcessingLatencyMs, "ms")}
streamer processing latency min/max/avg: ${num(statsData.minStreamerProcessingTimeMs, "ms")} / ${num(statsData.maxStreamerProcessingTimeMs, "ms")} / ${num(statsData.avgStreamerProcessingTimeMs, "ms")}
streamer to browser rtt (ws only): ${num(statsData.browserRtt, "ms")}
network quality: ${statsData.networkQuality}

RTT: ${num(statsData.rttMs,"ms")}

Jitter: ${num(statsData.jitterMs,"ms")}

Packet loss:
${num(statsData.packetLossPercent,"%")}

Incoming bitrate:
${num(statsData.actualIncomingBitrateMbps," Mbps")}

Outgoing bitrate:
${num(statsData.actualOutgoingBitrateMbps," Mbps")}

Available incoming:
${num(statsData.availableIncomingBitrateMbps," Mbps")}

Available outgoing:
${num(statsData.availableOutgoingBitrateMbps," Mbps")}

Video freezes:
${statsData.freezeCount}

Freeze duration:
${num(statsData.freezeDurationMs,"ms")}`
    for (const key in statsData.transport) {
        const value = statsData.transport[key]
        let valuePretty = value

        if (typeof value == "number" && key.endsWith("Ms")) {
            valuePretty = `${num(value, "ms")}`
        }

        text += `${key}: ${valuePretty}\n`
    }

    return text
}

export class StreamStats {

    private logger: Logger | null = null

    private enabled: boolean = false
    private transport: Transport | null = null
    private statsChannel: DataTransportChannel | null = null
    private updateIntervalId: number | null = null
    private lastQuality: string | null = null;

    private statsData: StreamStatsData = {
        videoCodec: null,
        videoWidth: null,
        videoHeight: null,
        videoFps: null,
        videoPipeline: null,
        audioPipeline: null,
        hdrEnabled: null,
        streamerRttMs: null,
        streamerRttVarianceMs: null,
        minHostProcessingLatencyMs: null,
        maxHostProcessingLatencyMs: null,
        avgHostProcessingLatencyMs: null,
        minStreamerProcessingTimeMs: null,
        maxStreamerProcessingTimeMs: null,
        avgStreamerProcessingTimeMs: null,
        browserRtt: null,
        transport: {},
        networkQuality: null,
        packetLossPercent: null,
        rttMs: null,
        jitterMs: null,
        availableIncomingBitrateMbps: null,
        availableOutgoingBitrateMbps: null,
        actualIncomingBitrateMbps: null,
        actualOutgoingBitrateMbps: null,
        freezeCount: null,
        freezeDurationMs: null,
    }
    private networkQualityListeners:
((quality: NetworkQuality)=>void)[] = [];

    constructor(logger?: Logger) {
        if (logger) {
            this.logger = logger
        }
    }

    addNetworkQualityListener(
        listener: (quality: NetworkQuality)=>void
    ) {
        this.networkQualityListeners.push(listener);
    }

    private emitNetworkQuality(
        quality: NetworkQuality
    ) {
        for (const listener of this.networkQualityListeners) {
            listener(quality);
        }
    }

    setTransport(transport: Transport) {
        this.transport = transport

        this.checkEnabled()
    }
    private checkEnabled() {
        if (this.enabled) {
            if (this.statsChannel) {
                this.statsChannel.removeReceiveListener(this.onRawData.bind(this))
                this.statsChannel = null
            }

            if (!this.statsChannel && this.transport) {
                const channel = this.transport.getChannel(TransportChannelId.STATS)
                if (channel.type != "data") {
                    this.logger?.debug(`Failed initialize debug transport channel because type is "${channel.type}" and not "data"`)
                    return
                }
                channel.addReceiveListener(this.onRawData.bind(this))
                this.statsChannel = channel
            }
            if (this.updateIntervalId == null) {
                this.updateIntervalId = setInterval(this.updateLocalStats.bind(this), 1000)
            }
        } else {
            if (this.updateIntervalId != null) {
                clearInterval(this.updateIntervalId)
                this.updateIntervalId = null
            }
        }
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled

        this.checkEnabled()
    }
    isEnabled(): boolean {
        return this.enabled
    }
    isConnectionPoor(): boolean {
        return (
            this.statsData.networkQuality === "poor" ||
            this.statsData.networkQuality === "critical"
        );
    }
    toggle() {
        this.setEnabled(!this.isEnabled())
    }

    private buffer: ByteBuffer = BIG_BUFFER
    private onRawData(data: ArrayBuffer) {
        this.buffer.reset()
        this.buffer.putU8Array(new Uint8Array(data))

        this.buffer.flip()

        const textLength = this.buffer.getU16()
        const text = this.buffer.getUtf8Raw(textLength)

        const json: StreamerStatsUpdate = JSON.parse(text)
        this.onMessage(json)
    }
    private onMessage(msg: StreamerStatsUpdate) {
        if ("Rtt" in msg) {
            this.statsData.streamerRttMs = msg.Rtt.rtt_ms
            this.statsData.streamerRttVarianceMs = msg.Rtt.rtt_variance_ms
        } else if ("Video" in msg) {
            if (msg.Video.host_processing_latency) {
                this.statsData.minHostProcessingLatencyMs = msg.Video.host_processing_latency.min_host_processing_latency_ms
                this.statsData.maxHostProcessingLatencyMs = msg.Video.host_processing_latency.max_host_processing_latency_ms
                this.statsData.avgHostProcessingLatencyMs = msg.Video.host_processing_latency.avg_host_processing_latency_ms
            } else {
                this.statsData.minHostProcessingLatencyMs = null
                this.statsData.maxHostProcessingLatencyMs = null
                this.statsData.avgHostProcessingLatencyMs = null
            }

            this.statsData.minStreamerProcessingTimeMs = msg.Video.min_streamer_processing_time_ms
            this.statsData.maxStreamerProcessingTimeMs = msg.Video.max_streamer_processing_time_ms
            this.statsData.avgStreamerProcessingTimeMs = msg.Video.avg_streamer_processing_time_ms
        } else if ("BrowserRtt" in msg) {
            this.statsData.browserRtt = msg.BrowserRtt.rtt_ms
        }
    }

    private async updateLocalStats() {
        if (!this.transport) {
            console.debug("Cannot query stats without transport")
            return
        }


        const stats = await this.transport?.getStats()
                if (
    stats.networkQuality &&
    stats.networkQuality !== this.lastQuality
) {

    this.lastQuality = stats.networkQuality;

    this.emitNetworkQuality(stats.networkQuality as NetworkQuality);


}

if (stats.packetLossPercent !== null)
    this.statsData.packetLossPercent =
        parseFloat(stats.packetLossPercent)

if (stats.webrtcRttMs !== null)
    this.statsData.rttMs =
        parseFloat(stats.webrtcRttMs)

if (stats.webrtcJitterMs !== null)
    this.statsData.jitterMs =
        parseFloat(stats.webrtcJitterMs)

if (stats.availableIncomingBitrateMbps !== null)
    this.statsData.availableIncomingBitrateMbps =
        parseFloat(stats.availableIncomingBitrateMbps)

if (stats.availableOutgoingBitrateMbps !== null)
    this.statsData.availableOutgoingBitrateMbps =
        parseFloat(stats.availableOutgoingBitrateMbps)

if (stats.actualIncomingBitrateMbps !== null)
    this.statsData.actualIncomingBitrateMbps =
        parseFloat(stats.actualIncomingBitrateMbps)

if (stats.actualOutgoingBitrateMbps !== null)
    this.statsData.actualOutgoingBitrateMbps =
        parseFloat(stats.actualOutgoingBitrateMbps)

if (stats.freezeCount !== null)
    this.statsData.freezeCount =
        parseInt(stats.freezeCount)

if (stats.freezeDurationMs !== null)
    this.statsData.freezeDurationMs =
        parseFloat(stats.freezeDurationMs)

if (stats.networkQuality){
const quality = stats.networkQuality;

if (
    quality === "excellent" ||
    quality === "good" ||
    quality === "fair" ||
    quality === "poor" ||
    quality === "critical"
) {
    this.statsData.networkQuality = quality;
}
}
            this.statsData.transport = { ...stats }

        
    }

    setVideoInfo(codec: string, width: number, height: number, fps: number) {
        this.statsData.videoCodec = codec
        this.statsData.videoWidth = width
        this.statsData.videoHeight = height
        this.statsData.videoFps = fps
    }
    setVideoPipelineName(name: string) {
        this.statsData.videoPipeline = name
    }
    setAudioPipelineName(name: string) {
        this.statsData.audioPipeline = name
    }
    setHdrEnabled(enabled: boolean) {
        this.statsData.hdrEnabled = enabled
    }

    getCurrentStats(): StreamStatsData {
        const data = {}
        Object.assign(data, this.statsData)
        return data as StreamStatsData
    }
}