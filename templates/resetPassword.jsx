var resetPasswordTemplate = React.createClass({

    getInitialState: function() {
        return {
                error_message:'',
                success_message: '',
                formControls: {
                    email:{
                        errorMessage:'',
                        inputClassName:'',
                        errorMessageClassName:'hidden',
                        value: ''
                    }
                }
        }
    },
    
    onEmailChange: function(evt) {
        var formControls = this.state.formControls;
        formControls.email.value = evt.target.value;
        this.setState({
            formControls:formControls,
            success_message:'',
            error_message:''
        });
    },

    onFormInputBlur: function(evt) {
        var formControls = this.state.formControls;
        formControls[evt.target.id] = this.props.entity.validateFormItem(evt.target.id,evt.target.value,'resetPassword');
        this.setState({
            formControls: formControls,
            success_message:'',
            error_message:''
        });
    },

    onResetSubmit: function(evt) {
        var me = this;
        var formControls = this.props.entity.resetFormValidation(this.state.formControls);
        this.setState({
            formControls:formControls,
            success_message:'',
            error_message:''
        });
        var result = this.props.entity.validateForm(this.state.formControls,'resetPassword');
        if (result.error) {
            this.setState({
                formControls:result.formControls,
                error_message:
                result.error_message
            });
        } else {
            this.props.entity.onResetPasswordSubmit(this.state.formControls.email.value, function(result) {
                if (result.status == 'error') {
                    formControls.email.inputClassName = 'error';
                    formControls.email.errorMessageClassName = 'error';
                    formControls.email.errorMessage = result.message;
                    me.setState({formControls:formControls});
                } else {
                    if (result.status == 'ok') {
                        var formControls = me.props.entity.resetFormValidation(me.state.formControls);
                        me.setState({
                            formControls:formControls,
                            success_message:'Reset password link sent to your email address',
                            error_message:''
                        });
                    }
                }
            });
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
                            <td>Email</td>
                            <td><input type='text' id='email' onBlur={this.onFormInputBlur}
                                                              onChange={this.onEmailChange}
                                                              className={this.state.formControls.email.inputClassName}
                                                              value={this.state.formControls.email.value}/>
                                <div className={this.state.formControls.email.errorMessageClassName}>
                                    {this.state.formControls.email.errorMessage}
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
