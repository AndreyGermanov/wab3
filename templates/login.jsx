var loginTemplate = React.createClass({
    getInitialState: function() {
        return {
            login:'',
            password:'',
            error_message:'',
            result:'',
            remember_token:0
        }
    },
    onLoginChange: function(evt) {
        this.setState({login: evt.target.value});
    },
    onPasswordChange: function(evt) {
        this.setState({password: evt.target.value});
    },
    onRememberTokenChange: function(evt) {
        this.setState({remember_token: evt.target.checked})
    },
    onLoginSubmit: function(evt) {
        var me = this;
        if (this.state.login && this.state.password) {
            this.setState({error_message:''});
            this.props.entity.onLoginSubmit(this.state.login,this.state.password, this.state.remember_token, function(data) {
                me.setState({result:JSON.stringify(data)});
            });
        } else {
            this.setState({error_message: 'Enter login and password, please'});
        }
    },
    render: function() {
        return (
            <div align="center" style={{'width':'100%'}}>
                <h3 style={{'color':'red'}}>{this.state.error_message}</h3>
                {this.state.result}
                <table>
                    <tbody>
                        <tr valign='top'>
                            <td>Login</td>
                            <td><input type='text' onChange={this.onLoginChange} value={this.state.login}/></td>
                        </tr>
                        <tr valign='top'>
                            <td>Password</td>
                            <td><input type='password' onChange={this.onPasswordChange} value={this.state.password}/></td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <input type="checkbox" onChange={this.onRememberTokenChange} value={this.state.remember_token} />&nbsp;Remember me
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <div align="center">
                                    <input type="submit" onClick={this.onLoginSubmit} />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <br/>
                <a href='/auth/reset' style={{'cursor':'pointer','color':'blue'}}>Reset password</a>
            </div>
        )
    }
});
