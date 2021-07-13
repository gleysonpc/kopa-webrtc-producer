import { Route, Switch } from 'react-router-dom'
import Producer from '../pages/Producer'
import SignIn from '../pages/SignIn'
import PrivateRoute from './PrivateRoute'

export default function Routes() {
    return (
        <Switch>
            <PrivateRoute path="/" component={Producer} exact />
            <Route path="/signin" component={SignIn} />
        </Switch>
    )
}
