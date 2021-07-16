import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/auth'
import { ContextCompose } from './contexts/contextCompose'
import Routes from './routes'
import { GlobalStyle } from './styles/global'

function App() {
    return (
        <>
            <GlobalStyle />
            <BrowserRouter>
                <ContextCompose components={[AuthProvider]}>
                    <Routes />
                </ContextCompose>
            </BrowserRouter>
        </>
    )
}

export default App
