export default interface socket_message {
    [key: string]: string | null,
    type: string | null,
    server: string | null,
    client: string | null
}