export default interface socket_message {
    [key: string]: string,
    type: string,
    server: string,
    client: string
}