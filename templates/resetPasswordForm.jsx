var resetPasswordFormTemplate = React.createClass({

    getInitialState: function() {
        return {
                error_message:'',
                success_message: '',
                formControls: {
                    password:{
                        errorMessage:'',
                        inputClassName:'',
                        errorMessageClassName:'hidden',
                        value: ''
                    },
                    confirm_password:{
                        errorMessage:'',
                        inputClassName:'',
                        errorMessageClassName:'hidden',
                        value: ''
                    }
                }
        }
    },
    
    onPasswordChange: function(evt) {
        var formControls = this.state.formControls;
        formControls.password.value = evt.target.value;
        this.setState({
            formControls:formControls,
            success_message:'',
            error_message:''
        });
    },

    onConfirmPasswordChange: function(evt) {
        var formControls = this.state.formControls;
        formControls.confirm_password.value = evt.target.value;
        this.setState({
            formControls:formControls,
            success_message:'',
            error_message:''
        });
    },

    onFormInputBlur: function(evt) {
        var formControls = this.state.formControls;
        formControls[evt.target.id] = this.props.entity.validateFormItem(evt.target.id,evt.target.value,'resetPasswordForm');
        this.setState({
            formControls: formControls,
            success_message:'',
            error_message:''
        });
    },

    onResetSubmit: function(evt) {
        var me = this;
        var formControls = this.props.entity.resetFormValidation(this.state.formControls);
        this.setState({formControls:formControls,success_message:'',error_message:''});
        var result = this.props.entity.validateForm(this.state.formControls,'resetPasswordForm');
        if (result.error) {
            this.setState({formControls:result.formControls,error_message:result.error_message});
        } else {
            this.props.entity.onNewPasswordSubmit(this.state.formControls.password.value,
                                                    this.state.formControls.confirm_password.value,
                                                    this.props.link, function(result) {
                                                        if (result.error == 'error') {
                                                            me.setState({
                                                                formControls:result.formControls,
                                                                error_message:result.error_message,
                                                                success_message:''
                                                            });
                                                        } else {
                                                            location.assign('/auth/login');
                                                        }
                                                    }
            );
        }
    },

    render: function() {
        return (
            <div align="center" style={{'width':'100%'}}>
                <h3 style={{'color': 'blue'}}>{this.state.success_message}</h3>
                <h3 style={{'color':'red'}}>{this.state.error_message}</h3>
                <table>
                    <tbody>
                        <tr valign='top'>
                            <td>New password</td>
                            <td><input type='password' id='password' onBlur={this.onFormInputBlur}
                                                              onChange={this.onPasswordChange}
                                                              className={this.state.formControls.password.inputClassName}
                                                              value={this.state.formControls.password.value}/>
                                <div className={this.state.formControls.password.errorMessageClassName}>
                                    {this.state.formControls.password.errorMessage}
                                </div>
                            </td>
                        </tr>
                        <tr valign='top'>
                            <td>Confirm password</td>
                            <td><input type='password' id='confirm_password' onBlur={this.onFormInputBlur}
                                       onChange={this.onConfirmPasswordChange}
                                       className={this.state.formControls.confirm_password.inputClassName}
                                       value={this.state.formControls.confirm_password.value}/>
                                <div className={this.state.formControls.confirm_password.errorMessageClassName}>
                                    {this.state.formControls.confirm_password.errorMessage}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <div align="center">
                                    <input type="submit" onClick={this.onResetSubmit} />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
});
