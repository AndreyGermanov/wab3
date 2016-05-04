var loginTemplate = React.createClass({
    getInitialState: function() {
        return {login:'',password:'',error_message:''}
    },
    onLoginChange: function(evt) {
        this.setState({login: evt.target.value});
    },
    onPasswordChange: function(evt) {
        this.setState({password: evt.target.value});
    },
    onLoginSubmit: function(evt) {
        if (this.state.login && this.state.password) {
            this.setState({error_message:''});
            this.props.entity.onLoginSubmit(this.state.login,this.state.password, function() {
                console.log('finished');
            });
        } else {
            this.setState({error_message: 'Enter login and password, please'});
        }
    },
    render: function() {
        return (
            <div align="center">
                <h3 style={{'color':'red'}}>{this.state.error_message}</h3>
                <table>
                    <tbody>
                        <tr valign='top'>
                            <td>Login</td>
                            <td><input type='text' onChange={this.onLoginChange} value={this.state.login}/></td>
                        </tr>
                        <tr valign='top'>
                            <td>Password-{this.props.guid}</td>
                            <td><input type='password' onChange={this.onPasswordChange} value={this.state.password}/></td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <input type="submit" onClick={this.onLoginSubmit} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
});
