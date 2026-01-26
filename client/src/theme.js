import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
    config: {
        initialColorMode: 'dark',
        useSystemColorMode: false,
    },
    colors: {
        brand: {
            100: '#E6FFFA',
            200: '#B2F5EA',
            300: '#81E6D9',
            400: '#4FD1C5',
            500: '#38B2AC',
            600: '#319795',
            700: '#2C7A7B',
            800: '#285E61',
            900: '#234E52',
        },
        jazzy: {
            neon: '#ccff00',
            purple: '#800080',
            pink: '#ff00ff',
            dark: '#0a0a0a',
            card: '#1a1a1a'
        }
    },
    styles: {
        global: {
            body: {
                bg: 'jazzy.dark',
                color: 'white',
                fontFamily: "'Inter', sans-serif"
            }
        }
    },
    components: {
        Button: {
            baseStyle: {
                _focus: { boxShadow: 'none' }
            },
            variants: {
                jazzy: {
                    bg: 'transparent',
                    border: '2px solid',
                    borderColor: 'jazzy.neon',
                    color: 'jazzy.neon',
                    _hover: {
                        bg: 'jazzy.neon',
                        color: 'jazzy.dark',
                        boxShadow: '0 0 10px #ccff00'
                    }
                }
            }
        }
    }
})

export default theme
