interface AlertMsgConfig {
    title: string
    message: string
}

export default {
    customeError: () => {},

    customSuccess: () => {},

    customInfo: ({ title, message }: AlertMsgConfig) => {}
}