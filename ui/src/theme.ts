import { extendTheme, ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
    useSystemColorMode: true,
}

const theme = extendTheme({ config })

export default theme